/**
 * Re-downloads all photos that are missing or empty.
 * Uses generous delays to avoid Wikipedia rate limits.
 */
import { readFileSync, writeFileSync, existsSync, statSync } from "fs";
import { createWriteStream, unlinkSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import https from "https";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const PHOTOS_DIR = path.join(ROOT, "public", "photos");

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function isValidFile(p) {
  try { return existsSync(p) && statSync(p).size > 1000; } catch { return false; }
}

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = createWriteStream(destPath);
    const req = https.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; NYVotingGuide/1.0; educational project)",
        "Accept": "image/jpeg,image/png,image/*",
        "Accept-Encoding": "identity",
      }
    }, (res) => {
      if ([301, 302, 303, 307, 308].includes(res.statusCode)) {
        file.close();
        try { unlinkSync(destPath); } catch {}
        downloadFile(res.headers.location, destPath).then(resolve).catch(reject);
        return;
      }
      if (res.statusCode !== 200) {
        file.close();
        try { unlinkSync(destPath); } catch {}
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }
      res.pipe(file);
      file.on("finish", () => file.close(resolve));
      file.on("error", e => { try { unlinkSync(destPath); } catch {}; reject(e); });
    });
    req.on("error", e => { try { unlinkSync(destPath); } catch {}; reject(e); });
    req.setTimeout(20000, () => { req.destroy(); reject(new Error("timeout")); });
  });
}

async function getWikiImage(title, sizePx = 400) {
  const encoded = encodeURIComponent(title.replace(/ /g, "_"));
  try {
    const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encoded}`, {
      headers: { "User-Agent": "NYVotingGuide/1.0" }
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.thumbnail?.source) return null;
    return data.thumbnail.source.replace(/\/\d+px-/, `/${sizePx}px-`);
  } catch { return null; }
}

// Map: photo id -> Wikipedia title(s) to try, in priority order
const WIKI_MAP = {
  "zohran-mamdani-mayor":        ["Zohran Mamdani"],
  "zohran-mamdani-official":     ["Zohran Mamdani"],
  "letitia-james-ag":            ["Letitia James"],
  "letitia-james-official":      ["Letitia James"],
  "tom-dinapoli-comptroller":    ["Thomas DiNapoli"],
  "thomas-dinapoli-official":    ["Thomas DiNapoli"],
  "antonio-delgado-official":    ["Antonio Delgado (politician)", "Antonio Delgado"],
  "andrew-cuomo-ny12":           ["Andrew Cuomo"],
  "liz-krueger-sd28":            ["Liz Krueger"],
  "liz-krueger-official":        ["Liz Krueger"],
  "erik-bottcher-sd47":          ["Erik Bottcher"],
  "erik-bottcher-official":      ["Erik Bottcher"],
  "carl-heastie-ad83":           ["Carl Heastie"],
  "carl-heastie-official":       ["Carl Heastie"],
  "deborah-glick-ad66":          ["Deborah Glick"],
  "deborah-glick-official":      ["Deborah Glick"],
  "keith-powers-ad74":           ["Keith Powers (politician)", "Keith Powers"],
  "keith-powers-official":       ["Keith Powers (politician)", "Keith Powers"],
  "jumaane-williams-advocate":   ["Jumaane Williams"],
  "jumaane-williams-official":   ["Jumaane Williams"],
  "brad-hoylman-sigal-official": ["Brad Hoylman", "Brad Hoylman-Sigal"],
  "julie-menin-official":        ["Julie Menin"],
  "donovan-richards-official":   ["Donovan Richards"],
  "vanessa-gibson-official":     ["Vanessa Gibson"],
  "vito-fossella-official":      ["Vito Fossella"],
  "mark-poloncarz-official":     ["Mark Poloncarz"],
  "steve-bellone-official":      ["Steve Bellone"],
  "dan-mccoy-official":          ["Daniel McCoy (politician)", "Dan McCoy"],
};

async function main() {
  const candidatesPath = path.join(ROOT, "data", "candidates.json");
  const officialsPath  = path.join(ROOT, "data", "officials.json");
  const candidates = JSON.parse(readFileSync(candidatesPath, "utf-8"));
  const officials  = JSON.parse(readFileSync(officialsPath,  "utf-8"));

  let downloaded = 0;
  let failed = 0;

  for (const [id, titles] of Object.entries(WIKI_MAP)) {
    const destPath = path.join(PHOTOS_DIR, `${id}.jpg`);
    if (isValidFile(destPath)) {
      process.stdout.write(`  ✓ ${id}\n`);
      continue;
    }

    process.stdout.write(`  → ${id} ... `);

    // Try each title with a pause between
    let photoUrl = null;
    for (const title of titles) {
      await sleep(1200);
      photoUrl = await getWikiImage(title);
      if (photoUrl) break;
    }

    if (!photoUrl) {
      process.stdout.write(`no image found\n`);
      // Null out photo_url so the avatar fallback shows
      for (const c of candidates) if (c.id === id) c.photo_url = null;
      for (const o of officials)  if (o.id === id) o.photo_url = null;
      failed++;
      continue;
    }

    // Download with one retry on failure
    let success = false;
    for (let attempt = 1; attempt <= 2; attempt++) {
      if (attempt === 2) {
        process.stdout.write(`retry... `);
        await sleep(8000);
      }
      try {
        await downloadFile(photoUrl, destPath);
        if (isValidFile(destPath)) { success = true; break; }
        else { try { unlinkSync(destPath); } catch {} }
      } catch (e) {
        if (attempt === 1) await sleep(5000);
      }
    }

    if (success) {
      process.stdout.write(`✓\n`);
      const localPath = `/photos/${id}.jpg`;
      for (const c of candidates) if (c.id === id) c.photo_url = localPath;
      for (const o of officials)  if (o.id === id) o.photo_url = localPath;
      downloaded++;
    } else {
      process.stdout.write(`FAILED\n`);
      for (const c of candidates) if (c.id === id) c.photo_url = null;
      for (const o of officials)  if (o.id === id) o.photo_url = null;
      failed++;
    }

    await sleep(2000); // generous gap between downloads
  }

  writeFileSync(candidatesPath, JSON.stringify(candidates, null, 2));
  writeFileSync(officialsPath,  JSON.stringify(officials,  null, 2));

  console.log(`\nDownloaded: ${downloaded} | Failed: ${failed}`);
  const stillMissing = [...candidates, ...officials].filter(x => !x.photo_url).map(x => x.name);
  if (stillMissing.length) console.log("No photo (will use initials avatar):", [...new Set(stillMissing)].join(", "));
}

main().catch(console.error);
