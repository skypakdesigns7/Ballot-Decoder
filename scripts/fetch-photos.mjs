/**
 * Fetches photos for all candidates and officials.
 * Sources (in priority order):
 *   1. Congress bioguide (for federal legislators)
 *   2. Wikipedia REST API summary thumbnail
 * Downloads to /public/photos/{id}.jpg and updates photo_url in JSON files.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { createWriteStream } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import https from "https";
import http from "http";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const PHOTOS_DIR = path.join(ROOT, "public", "photos");

if (!existsSync(PHOTOS_DIR)) mkdirSync(PHOTOS_DIR, { recursive: true });

// Bioguide IDs for Congress members
const BIOGUIDE = {
  "nick-lalota-ny01":             "L000599",
  "tom-suozzi-ny03":              "S001201",
  "laura-gillen-ny04":            "G000597",
  "gregory-meeks-ny05":           "M001137",
  "grace-meng-ny06":              "M001188",
  "nydia-velazquez-ny07":         "V000081",
  "hakeem-jeffries-ny08":         "J000294",
  "yvette-clarke-ny09":           "C001067",
  "dan-goldman-ny10":             "G000596",
  "nicole-malliotakis-ny11":      "M001211",
  "adriano-espaillat-ny13":       "E000297",
  "alexandria-ocasio-cortez-ny14":"O000172",
  "ritchie-torres-ny15":          "T000486",
  "george-latimer-ny16":          "L000601",
  "pat-ryan-ny17":                "R000616",
  "josh-riley-ny18":              "R000617",
  "paul-tonko-ny20":              "T000469",
  "john-mannion-ny22":            "M001226",
  "joe-morelle-ny25":             "M001206",
  "tim-kennedy-ny26":             "K000395",
  "chuck-schumer-senate":         "S000148",
  "kirsten-gillibrand-senate":    "G000555",
  // Officials
  "chuck-schumer-official":       "S000148",
  "kirsten-gillibrand-official":  "G000555",
  "nick-lalota-official":         "L000599",
  "tom-suozzi-official":          "S001201",
  "laura-gillen-official":        "G000597",
  "gregory-meeks-official":       "M001137",
  "grace-meng-official":          "M001188",
  "nydia-velazquez-official":     "V000081",
  "hakeem-jeffries-official":     "J000294",
  "yvette-clarke-official":       "C001067",
  "dan-goldman-official":         "G000596",
  "nicole-malliotakis-official":  "M001211",
  "adriano-espaillat-official":   "E000297",
  "alexandria-ocasio-cortez-official": "O000172",
  "ritchie-torres-official":      "T000486",
  "george-latimer-official":      "L000601",
  "pat-ryan-official":            "R000616",
  "josh-riley-official":          "R000617",
  "paul-tonko-official":          "T000469",
  "john-mannion-official":        "M001226",
  "joe-morelle-official":         "M001206",
  "tim-kennedy-official":         "K000395",
};

// Wikipedia search title overrides (when name alone is ambiguous)
const WIKI_TITLE = {
  "kathy-hochul-gov":             "Kathy Hochul",
  "kathy-hochul-official":        "Kathy Hochul",
  "antonio-delgado-official":     "Antonio Delgado (politician)",
  "letitia-james-ag":             "Letitia James",
  "letitia-james-official":       "Letitia James",
  "thomas-dinapoli-official":     "Thomas DiNapoli",
  "tom-dinapoli-comptroller":     "Thomas DiNapoli",
  "adem-bunkeddeko-comptroller":  "Adem Bunkeddeko",
  "bruce-blakeman-gov":           "Bruce Blakeman",
  "bruce-blakeman-official":      "Bruce Blakeman",
  "larry-sharpe-gov":             "Larry Sharpe",
  "andrea-stewart-cousins-sd35":  "Andrea Stewart-Cousins",
  "andrea-stewart-cousins-official": "Andrea Stewart-Cousins",
  "liz-krueger-sd28":             "Liz Krueger",
  "liz-krueger-official":         "Liz Krueger",
  "jamaal-bailey-sd36":           "Jamaal Bailey (politician)",
  "jamaal-bailey-official":       "Jamaal Bailey (politician)",
  "erik-bottcher-sd47":           "Erik Bottcher",
  "erik-bottcher-official":       "Erik Bottcher",
  "jeremy-zellner-sd61":          "Jeremy Zellner",
  "jeremy-zellner-official":      "Jeremy Zellner",
  "carl-heastie-ad83":            "Carl Heastie",
  "carl-heastie-official":        "Carl Heastie",
  "william-barclay-official":     "William Barclay (politician)",
  "deborah-glick-ad66":           "Deborah Glick",
  "deborah-glick-official":       "Deborah Glick",
  "keith-powers-ad74":            "Keith Powers (politician)",
  "keith-powers-official":        "Keith Powers (politician)",
  "diana-moreno-ad36":            "Diana Moreno (politician)",
  "diana-moreno-official":        "Diana Moreno (politician)",
  "zohran-mamdani-mayor":         "Zohran Mamdani",
  "zohran-mamdani-official":      "Zohran Mamdani",
  "jumaane-williams-advocate":    "Jumaane Williams",
  "jumaane-williams-official":    "Jumaane Williams",
  "mark-levine-comptroller":      "Mark Levine (politician)",
  "julie-menin-official":         "Julie Menin",
  "brad-hoylman-sigal-official":  "Brad Hoylman",
  "sharon-lee-official":          "Antonio Reynoso (politician)",
  "donovan-richards-official":    "Donovan Richards",
  "vanessa-gibson-official":      "Vanessa Gibson",
  "vito-fossella-official":       "Vito Fossella",
  "mark-poloncarz-official":      "Mark Poloncarz",
  "steve-bellone-official":       "Steve Bellone",
  "dan-mccoy-official":           "Daniel McCoy (politician)",
  "george-conway-ny12":           "George Conway",
  "andrew-cuomo-ny12":            "Andrew Cuomo",
  "justin-brannan-ny11":          "Justin Brannan",
  "rob-ortt-official":            "Rob Ortt",
  "george-latimer-westchester-official": "George Latimer",
};

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith("https") ? https : http;
    const file = createWriteStream(destPath);
    proto.get(url, { headers: { "User-Agent": "NYVotingGuide/1.0 (civic-educational-project)" } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close();
        downloadFile(res.headers.location, destPath).then(resolve).catch(reject);
        return;
      }
      if (res.statusCode !== 200) {
        file.close();
        reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        return;
      }
      res.pipe(file);
      file.on("finish", () => file.close(resolve));
      file.on("error", reject);
    }).on("error", reject);
  });
}

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "NYVotingGuide/1.0 (civic-educational-project)" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

async function getBioguidePhotoUrl(bioguideId) {
  const letter = bioguideId[0].toUpperCase();
  return `https://bioguide.congress.gov/bioguide/photo/${letter}/${bioguideId}.jpg`;
}

async function getWikipediaPhotoUrl(title) {
  const encoded = encodeURIComponent(title.replace(/ /g, "_"));
  try {
    const data = await fetchJson(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encoded}`
    );
    if (data.thumbnail?.source) {
      // Get a larger version — replace width param
      return data.thumbnail.source.replace(/\/\d+px-/, "/400px-");
    }
  } catch (e) {
    // ignore
  }
  return null;
}

async function processEntity(entity, type) {
  const id = entity.id;
  const destPath = path.join(PHOTOS_DIR, `${id}.jpg`);

  // Skip if already downloaded
  if (existsSync(destPath)) {
    console.log(`  ✓ Already have ${id}`);
    return `/photos/${id}.jpg`;
  }

  let photoUrl = null;

  // Try bioguide first (most reliable for Congress)
  if (BIOGUIDE[id]) {
    photoUrl = await getBioguidePhotoUrl(BIOGUIDE[id]);
  }

  // Try Wikipedia
  if (!photoUrl) {
    const wikiTitle = WIKI_TITLE[id] || entity.name;
    photoUrl = await getWikipediaPhotoUrl(wikiTitle);
  }

  if (!photoUrl) {
    console.log(`  ✗ No photo found for ${entity.name} (${id})`);
    return null;
  }

  try {
    await downloadFile(photoUrl, destPath);
    console.log(`  ↓ Downloaded ${entity.name} (${id})`);
    return `/photos/${id}.jpg`;
  } catch (e) {
    console.log(`  ✗ Download failed for ${entity.name}: ${e.message}`);
    // Clean up partial file
    try { require("fs").unlinkSync(destPath); } catch {}
    return null;
  }
}

async function main() {
  const candidatesPath = path.join(ROOT, "data", "candidates.json");
  const officialsPath = path.join(ROOT, "data", "officials.json");

  const candidates = JSON.parse(readFileSync(candidatesPath, "utf-8"));
  const officials = JSON.parse(readFileSync(officialsPath, "utf-8"));

  console.log(`\nFetching photos for ${candidates.length} candidates...`);
  for (const c of candidates) {
    const url = await processEntity(c, "candidate");
    if (url) c.photo_url = url;
    await sleep(300); // be polite to APIs
  }

  console.log(`\nFetching photos for ${officials.length} officials...`);
  for (const o of officials) {
    const url = await processEntity(o, "official");
    if (url) o.photo_url = url;
    await sleep(300);
  }

  writeFileSync(candidatesPath, JSON.stringify(candidates, null, 2));
  writeFileSync(officialsPath, JSON.stringify(officials, null, 2));

  const candWithPhoto = candidates.filter((c) => c.photo_url).length;
  const offWithPhoto = officials.filter((o) => o.photo_url).length;

  console.log(`\nDone!`);
  console.log(`Candidates with photos: ${candWithPhoto}/${candidates.length}`);
  console.log(`Officials with photos:  ${offWithPhoto}/${officials.length}`);
}

main().catch(console.error);
