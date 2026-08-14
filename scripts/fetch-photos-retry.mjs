/**
 * Retries failed Wikipedia photo downloads with longer delays.
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { createWriteStream, unlinkSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import https from "https";
import http from "http";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const PHOTOS_DIR = path.join(ROOT, "public", "photos");

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith("https") ? https : http;
    const file = createWriteStream(destPath);
    const req = proto.get(url, {
      headers: {
        "User-Agent": "NYVotingGuide/1.0 (educational civic project; contact: public)",
        "Accept": "image/jpeg,image/*",
      }
    }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
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
      file.on("error", (e) => { try { unlinkSync(destPath); } catch {} reject(e); });
    });
    req.on("error", (e) => { try { unlinkSync(destPath); } catch {} reject(e); });
    req.setTimeout(15000, () => { req.destroy(); reject(new Error("timeout")); });
  });
}

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "NYVotingGuide/1.0 (educational civic project)" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function getWikipediaPhotoUrl(title) {
  const encoded = encodeURIComponent(title.replace(/ /g, "_"));
  try {
    const data = await fetchJson(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encoded}`
    );
    if (data.thumbnail?.source) {
      return data.thumbnail.source.replace(/\/\d+px-/, "/400px-");
    }
  } catch {}
  return null;
}

// All the entries that need Wikipedia photos
const NEED_PHOTOS = [
  // Candidates
  { id: "letitia-james-ag",           name: "Letitia James",              wiki: "Letitia James" },
  { id: "tom-dinapoli-comptroller",    name: "Thomas DiNapoli",            wiki: "Thomas DiNapoli" },
  { id: "andrew-cuomo-ny12",           name: "Andrew Cuomo",               wiki: "Andrew Cuomo" },
  { id: "liz-krueger-sd28",            name: "Liz Krueger",                wiki: "Liz Krueger" },
  { id: "jamaal-bailey-sd36",          name: "Jamaal Bailey",              wiki: "Jamaal Bailey (politician)" },
  { id: "erik-bottcher-sd47",          name: "Erik Bottcher",              wiki: "Erik Bottcher" },
  { id: "carl-heastie-ad83",           name: "Carl Heastie",               wiki: "Carl Heastie" },
  { id: "deborah-glick-ad66",          name: "Deborah Glick",              wiki: "Deborah Glick" },
  { id: "keith-powers-ad74",           name: "Keith Powers",               wiki: "Keith Powers (politician)" },
  { id: "zohran-mamdani-mayor",        name: "Zohran Mamdani",             wiki: "Zohran Mamdani" },
  { id: "jumaane-williams-advocate",   name: "Jumaane Williams",           wiki: "Jumaane Williams" },
  // Officials
  { id: "antonio-delgado-official",    name: "Antonio Delgado",            wiki: "Antonio Delgado (politician)" },
  { id: "letitia-james-official",      name: "Letitia James",              wiki: "Letitia James" },
  { id: "thomas-dinapoli-official",    name: "Thomas DiNapoli",            wiki: "Thomas DiNapoli" },
  { id: "liz-krueger-official",        name: "Liz Krueger",                wiki: "Liz Krueger" },
  { id: "jamaal-bailey-official",      name: "Jamaal Bailey",              wiki: "Jamaal Bailey (politician)" },
  { id: "erik-bottcher-official",      name: "Erik Bottcher",              wiki: "Erik Bottcher" },
  { id: "carl-heastie-official",       name: "Carl Heastie",               wiki: "Carl Heastie" },
  { id: "deborah-glick-official",      name: "Deborah Glick",              wiki: "Deborah Glick" },
  { id: "keith-powers-official",       name: "Keith Powers",               wiki: "Keith Powers (politician)" },
  { id: "zohran-mamdani-official",     name: "Zohran Mamdani",             wiki: "Zohran Mamdani" },
  { id: "mark-levine-comptroller",     name: "Mark Levine",                wiki: "Mark Levine (politician)" },
  { id: "jumaane-williams-official",   name: "Jumaane Williams",           wiki: "Jumaane Williams" },
  { id: "julie-menin-official",        name: "Julie Menin",                wiki: "Julie Menin" },
  { id: "brad-hoylman-sigal-official", name: "Brad Hoylman-Sigal",         wiki: "Brad Hoylman" },
  { id: "donovan-richards-official",   name: "Donovan Richards",           wiki: "Donovan Richards" },
  { id: "vanessa-gibson-official",     name: "Vanessa Gibson",             wiki: "Vanessa Gibson" },
  { id: "vito-fossella-official",      name: "Vito Fossella",              wiki: "Vito Fossella" },
  { id: "mark-poloncarz-official",     name: "Mark Poloncarz",             wiki: "Mark Poloncarz" },
  { id: "steve-bellone-official",      name: "Steve Bellone",              wiki: "Steve Bellone" },
  { id: "dan-mccoy-official",          name: "Daniel McCoy",               wiki: "Daniel McCoy (politician)" },
  { id: "diana-moreno-ad36",           name: "Diana Moreno",               wiki: "Diana Moreno (New York politician)" },
  { id: "diana-moreno-official",       name: "Diana Moreno",               wiki: "Diana Moreno (New York politician)" },
];

async function main() {
  const candidatesPath = path.join(ROOT, "data", "candidates.json");
  const officialsPath  = path.join(ROOT, "data", "officials.json");
  const candidates = JSON.parse(readFileSync(candidatesPath, "utf-8"));
  const officials  = JSON.parse(readFileSync(officialsPath, "utf-8"));

  const updated = new Map(); // id -> local path

  for (const entry of NEED_PHOTOS) {
    const destPath = path.join(PHOTOS_DIR, `${entry.id}.jpg`);
    if (existsSync(destPath)) {
      console.log(`  ✓ Already have ${entry.name}`);
      updated.set(entry.id, `/photos/${entry.id}.jpg`);
      continue;
    }

    console.log(`  → Fetching ${entry.name} (${entry.wiki})...`);
    await sleep(1500); // polite delay before each Wikipedia API call

    const photoUrl = await getWikipediaPhotoUrl(entry.wiki);
    if (!photoUrl) {
      console.log(`    ✗ No Wikipedia image found`);
      continue;
    }

    await sleep(800);
    try {
      await downloadFile(photoUrl, destPath);
      console.log(`    ↓ Downloaded`);
      updated.set(entry.id, `/photos/${entry.id}.jpg`);
    } catch (e) {
      console.log(`    ✗ Download failed: ${e.message}`);
      if (e.message.includes("429")) {
        console.log(`    ⏳ Rate limited — waiting 10s...`);
        await sleep(10000);
        try {
          await downloadFile(photoUrl, destPath);
          console.log(`    ↓ Retry succeeded`);
          updated.set(entry.id, `/photos/${entry.id}.jpg`);
        } catch (e2) {
          console.log(`    ✗ Retry also failed: ${e2.message}`);
        }
      }
    }
  }

  // Update JSON
  for (const c of candidates) {
    if (updated.has(c.id)) c.photo_url = updated.get(c.id);
  }
  for (const o of officials) {
    if (updated.has(o.id)) o.photo_url = updated.get(o.id);
  }

  writeFileSync(candidatesPath, JSON.stringify(candidates, null, 2));
  writeFileSync(officialsPath,  JSON.stringify(officials,  null, 2));

  const candWithPhoto = candidates.filter((c) => c.photo_url).length;
  const offWithPhoto  = officials.filter((o) => o.photo_url).length;
  console.log(`\nDone! Candidates: ${candWithPhoto}/${candidates.length} | Officials: ${offWithPhoto}/${officials.length}`);
}

main().catch(console.error);
