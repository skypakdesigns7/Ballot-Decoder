/**
 * Fetches remaining photos from official NY government websites.
 */
import { readFileSync, writeFileSync, existsSync } from "fs";
import { createWriteStream, unlinkSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import https from "https";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const PHOTOS_DIR = path.join(ROOT, "public", "photos");

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = createWriteStream(destPath);
    const req = https.get(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36" }
    }, (res) => {
      if ([301,302,303,307].includes(res.statusCode)) {
        file.close();
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
      file.on("error", e => { try { unlinkSync(destPath); } catch {} reject(e); });
    });
    req.on("error", e => { try { unlinkSync(destPath); } catch {} reject(e); });
    req.setTimeout(15000, () => { req.destroy(); reject(new Error("timeout")); });
  });
}

async function fetchText(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36" }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

async function scrapeAssemblyPhoto(memberPath) {
  try {
    const html = await fetchText(`https://www.nyassembly.gov/mem/${memberPath}`);
    // Look for member photo in various patterns
    const patterns = [
      /src="([^"]*\/mem\/pic\/[^"]+\.(?:jpg|png|jpeg))"/i,
      /src="([^"]*member[_-]?photo[^"]+\.(?:jpg|png|jpeg))"/i,
      /<img[^>]+class="[^"]*mem[^"]*"[^>]+src="([^"]+)"/i,
      /src="(\/mem\/pic\/[^"]+)"/i,
    ];
    for (const pat of patterns) {
      const m = html.match(pat);
      if (m) {
        const src = m[1];
        return src.startsWith("http") ? src : `https://www.nyassembly.gov${src}`;
      }
    }
  } catch (e) {
    console.log(`   scrape error: ${e.message}`);
  }
  return null;
}

async function scrapeSenatePhoto(memberPath) {
  try {
    const html = await fetchText(`https://www.nysenate.gov/senators/${memberPath}`);
    const patterns = [
      /src="([^"]*nys-senator[^"]+\.(?:jpg|png|jpeg)(?:\?[^"]*)?)" /i,
      /<img[^>]+class="[^"]*senator[^"]*"[^>]+src="([^"]+)"/i,
      /src="(https?:\/\/[^"]*senator[^"]+\.(?:jpg|png))"/i,
    ];
    for (const pat of patterns) {
      const m = html.match(pat);
      if (m) return m[1];
    }
  } catch (e) {
    console.log(`   scrape error: ${e.message}`);
  }
  return null;
}

const TARGETS = [
  // William Barclay — Assembly minority leader
  {
    ids: ["william-barclay-official"],
    name: "William Barclay",
    fetch: () => scrapeAssemblyPhoto("William-A-Barclay"),
  },
  // Diana Moreno — Assembly AD-36
  {
    ids: ["diana-moreno-ad36", "diana-moreno-official"],
    name: "Diana Moreno",
    fetch: () => scrapeAssemblyPhoto("Diana-Moreno"),
  },
  // Jeremy Zellner — State Senate SD-61
  {
    ids: ["jeremy-zellner-sd61", "jeremy-zellner-official"],
    name: "Jeremy Zellner",
    fetch: () => scrapeSenatePhoto("jeremy-zellner"),
  },
  // Adem Bunkeddeko — try his campaign/LinkedIn etc via Wikipedia fallback
  {
    ids: ["adem-bunkeddeko-comptroller"],
    name: "Adem Bunkeddeko",
    fetch: async () => {
      // Try various Wikipedia titles
      for (const title of ["Adem Bunkeddeko", "Adem Bunkeddeko (politician)"]) {
        const encoded = encodeURIComponent(title);
        try {
          const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encoded}`, {
            headers: { "User-Agent": "NYVotingGuide/1.0" }
          });
          if (res.ok) {
            const data = await res.json();
            if (data.thumbnail?.source) return data.thumbnail.source.replace(/\/\d+px-/, "/300px-");
          }
        } catch {}
        await sleep(800);
      }
      return null;
    },
  },
];

async function main() {
  const candidatesPath = path.join(ROOT, "data", "candidates.json");
  const officialsPath  = path.join(ROOT, "data", "officials.json");
  const candidates = JSON.parse(readFileSync(candidatesPath, "utf-8"));
  const officials  = JSON.parse(readFileSync(officialsPath,  "utf-8"));

  const updated = new Map();

  for (const target of TARGETS) {
    console.log(`\n→ ${target.name}`);
    await sleep(1000);

    let photoUrl = null;
    try { photoUrl = await target.fetch(); } catch (e) { console.log(`   fetch error: ${e.message}`); }

    if (!photoUrl) {
      console.log(`   ✗ No photo source found`);
      continue;
    }
    console.log(`   URL: ${photoUrl.slice(0, 80)}...`);

    const primaryId = target.ids[0];
    const primaryDest = path.join(PHOTOS_DIR, `${primaryId}.jpg`);
    if (!existsSync(primaryDest)) {
      await sleep(500);
      try {
        await downloadFile(photoUrl, primaryDest);
        console.log(`   ↓ ${primaryId}.jpg`);
      } catch (e) {
        console.log(`   ✗ Download failed: ${e.message}`);
        continue;
      }
    } else {
      console.log(`   ✓ Already exists`);
    }
    updated.set(primaryId, `/photos/${primaryId}.jpg`);

    for (const extraId of target.ids.slice(1)) {
      const extraDest = path.join(PHOTOS_DIR, `${extraId}.jpg`);
      if (!existsSync(extraDest)) {
        const { copyFileSync } = await import("fs");
        try { copyFileSync(primaryDest, extraDest); console.log(`   📋 ${extraId}.jpg`); }
        catch {}
      }
      updated.set(extraId, `/photos/${extraId}.jpg`);
    }
  }

  for (const c of candidates) if (updated.has(c.id)) c.photo_url = updated.get(c.id);
  for (const o of officials)  if (updated.has(o.id)) o.photo_url = updated.get(o.id);

  writeFileSync(candidatesPath, JSON.stringify(candidates, null, 2));
  writeFileSync(officialsPath,  JSON.stringify(officials,  null, 2));

  const cw = candidates.filter(c => c.photo_url).length;
  const ow = officials.filter(o => o.photo_url).length;
  console.log(`\nFinal: Candidates ${cw}/${candidates.length} | Officials ${ow}/${officials.length}`);
  console.log("Still missing:");
  candidates.filter(c => !c.photo_url).forEach(c => console.log(" C:", c.name));
  officials.filter(o => !o.photo_url).forEach(o => console.log(" O:", o.name));
}

main().catch(console.error);
