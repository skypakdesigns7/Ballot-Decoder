/**
 * Fetches remaining photos using alternative Wikipedia titles and direct URLs.
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
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; educational civic project)",
        "Accept": "image/*",
      }
    }, (res) => {
      if ([301,302,303,307,308].includes(res.statusCode)) {
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
    req.setTimeout(20000, () => { req.destroy(); reject(new Error("timeout")); });
  });
}

async function tryWiki(title) {
  const encoded = encodeURIComponent(title.replace(/ /g, "_"));
  try {
    const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encoded}`, {
      headers: { "User-Agent": "NYVotingGuide/1.0" }
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.thumbnail?.source?.replace(/\/\d+px-/, "/400px-") ?? null;
  } catch { return null; }
}

// Try multiple Wikipedia title variants for each person
const ATTEMPTS = [
  // Jamaal Bailey — NYC Council background
  { ids: ["jamaal-bailey-sd36", "jamaal-bailey-official"], name: "Jamaal Bailey", titles: [
    "Jamaal Bailey", "Jamaal T. Bailey", "Jamaal Bailey (American politician)"
  ]},
  // William Barclay
  { ids: ["william-barclay-official"], name: "William Barclay", titles: [
    "Will Barclay (politician)", "William Barclay (New York politician)", "Will Barclay"
  ]},
  // Mark Levine
  { ids: ["mark-levine-comptroller"], name: "Mark Levine", titles: [
    "Mark Levine (New York City politician)", "Mark D. Levine", "Mark Levine (comptroller)"
  ]},
  // Larry Sharpe
  { ids: ["larry-sharpe-gov"], name: "Larry Sharpe", titles: [
    "Larry Sharpe (politician)", "Larry Sharpe"
  ]},
  // Adem Bunkeddeko
  { ids: ["adem-bunkeddeko-comptroller"], name: "Adem Bunkeddeko", titles: [
    "Adem Bunkeddeko"
  ]},
  // Jeremy Zellner
  { ids: ["jeremy-zellner-sd61", "jeremy-zellner-official"], name: "Jeremy Zellner", titles: [
    "Jeremy Zellner"
  ]},
  // Diana Moreno
  { ids: ["diana-moreno-ad36", "diana-moreno-official"], name: "Diana Moreno", titles: [
    "Diana Moreno (assemblywoman)", "Diana Moreno (Queens)", "Diana Moreno"
  ]},
  // Sharon Lee entry is actually Antonio Reynoso
  { ids: ["sharon-lee-official"], name: "Antonio Reynoso", titles: [
    "Antonio Reynoso", "Antonio Reynoso (politician)"
  ]},
];

async function main() {
  const candidatesPath = path.join(ROOT, "data", "candidates.json");
  const officialsPath  = path.join(ROOT, "data", "officials.json");
  const candidates = JSON.parse(readFileSync(candidatesPath, "utf-8"));
  const officials  = JSON.parse(readFileSync(officialsPath,  "utf-8"));

  const updated = new Map();

  for (const attempt of ATTEMPTS) {
    console.log(`\n→ ${attempt.name}`);
    let photoUrl = null;

    for (const title of attempt.titles) {
      await sleep(1200);
      photoUrl = await tryWiki(title);
      if (photoUrl) { console.log(`   Found via: "${title}"`); break; }
      else console.log(`   No image for: "${title}"`);
    }

    if (!photoUrl) {
      console.log(`   ✗ No photo found for ${attempt.name}`);
      continue;
    }

    // Download once, share across all IDs
    let firstId = attempt.ids[0];
    const primaryDest = path.join(PHOTOS_DIR, `${firstId}.jpg`);
    if (!existsSync(primaryDest)) {
      await sleep(800);
      try {
        await downloadFile(photoUrl, primaryDest);
        console.log(`   ↓ Downloaded → ${firstId}.jpg`);
      } catch (e) {
        console.log(`   ✗ Download failed: ${e.message}`);
        continue;
      }
    } else {
      console.log(`   ✓ Already exists: ${firstId}.jpg`);
    }
    updated.set(firstId, `/photos/${firstId}.jpg`);

    // Copy (symlink or re-download) for additional IDs
    for (const extraId of attempt.ids.slice(1)) {
      const extraDest = path.join(PHOTOS_DIR, `${extraId}.jpg`);
      if (!existsSync(extraDest)) {
        await sleep(400);
        try {
          await downloadFile(photoUrl, extraDest);
          console.log(`   ↓ Downloaded → ${extraId}.jpg`);
        } catch (e) {
          // Just copy the first one
          const { copyFileSync } = await import("fs");
          try { copyFileSync(primaryDest, extraDest); console.log(`   📋 Copied → ${extraId}.jpg`); }
          catch {}
        }
      }
      updated.set(extraId, `/photos/${extraId}.jpg`);
    }
  }

  // Update JSON
  for (const c of candidates) if (updated.has(c.id)) c.photo_url = updated.get(c.id);
  for (const o of officials)  if (updated.has(o.id)) o.photo_url = updated.get(o.id);

  writeFileSync(candidatesPath, JSON.stringify(candidates, null, 2));
  writeFileSync(officialsPath,  JSON.stringify(officials,  null, 2));

  const cw = candidates.filter(c => c.photo_url).length;
  const ow = officials.filter(o => o.photo_url).length;
  console.log(`\nFinal: Candidates ${cw}/${candidates.length} | Officials ${ow}/${officials.length}`);

  console.log("\nStill missing:");
  candidates.filter(c => !c.photo_url).forEach(c => console.log(" C:", c.name));
  officials.filter(o => !o.photo_url).forEach(o => console.log(" O:", o.name));
}

main().catch(console.error);
