import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

const SOURCE_NAME = "PC Gamer";
const SOURCE_URL = "https://www.pcgamer.com/games/new-pc-games-2026/";
const OUTPUT_FILE = new URL("../src/data/pc-releases.json", import.meta.url);
const YEAR = 2026;
const MAX_RELEASES = 24;

const monthNumbers = new Map(
  [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ].map((month, index) => [month, index + 1])
);

const response = await fetch(SOURCE_URL, {
  headers: {
    "user-agent": "Dankhunter release updater (+https://github.com/andrhagman/dankhunter)"
  }
});

if (!response.ok) {
  throw new Error(`Failed to fetch ${SOURCE_URL}: ${response.status} ${response.statusText}`);
}

const html = await response.text();
const releases = parsePcGamerCalendar(html)
  .filter((release) => Date.parse(release.date) >= Date.now() - 86_400_000)
  .slice(0, MAX_RELEASES);

if (releases.length === 0) {
  throw new Error("No upcoming PC releases were parsed from the source page.");
}

const previous = await readPreviousOutput();
const updatedAt =
  previous && JSON.stringify(previous.releases) === JSON.stringify(releases)
    ? previous.updatedAt
    : new Date().toISOString();

const output = {
  updatedAt,
  sourceName: SOURCE_NAME,
  sourceUrl: SOURCE_URL,
  releases
};

await mkdir(dirname(OUTPUT_FILE.pathname), { recursive: true });
await writeFile(OUTPUT_FILE, `${JSON.stringify(output, null, 2)}\n`);

console.log(`Wrote ${releases.length} releases to ${OUTPUT_FILE.pathname}`);

function parsePcGamerCalendar(pageHtml) {
  const tables = [...pageHtml.matchAll(/<caption[^>]*>\s*Upcoming PC games in ([^<]+)<\/caption>([\s\S]*?)<\/table>/gi)];
  const releasesById = new Map();

  for (const [, monthName, tableHtml] of tables) {
    const month = monthNumbers.get(decodeHtml(monthName).trim());

    if (!month) {
      continue;
    }

    for (const rowHtml of tableHtml.match(/<tr\b[\s\S]*?<\/tr>/gi) ?? []) {
      const cells = [...rowHtml.matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)].map((match) => match[1]);

      if (cells.length < 3) {
        continue;
      }

      const dateText = cleanText(cells[0]);
      const dayMatch = dateText.match(/\b(\d{1,2})\b/);
      const confidence = dateText.includes("??") ? "window" : "confirmed";
      const day = dayMatch ? Number(dayMatch[1]) : 15;
      const title = cleanText(cells[1]).replace(/\s*\([^)]*\)\s*$/, "");
      const genre = cleanText(cells[2]);

      if (!title || !genre) {
        continue;
      }

      const release = {
        id: slugify(title),
        title,
        date: `${YEAR}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
        genre,
        platform: "PC",
        confidence,
        sourceName: SOURCE_NAME,
        sourceUrl: SOURCE_URL
      };

      releasesById.set(release.id, release);
    }
  }

  return [...releasesById.values()].sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
}

function cleanText(htmlFragment) {
  return decodeHtml(htmlFragment.replace(/<[^>]*>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function decodeHtml(value) {
  return value
    .replace(/&#(\d+);/g, (_, codepoint) => String.fromCodePoint(Number(codepoint)))
    .replace(/&#x([\da-f]+);/gi, (_, codepoint) => String.fromCodePoint(Number.parseInt(codepoint, 16)))
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&mdash;/g, "-")
    .replace(/&ndash;/g, "-");
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function readPreviousOutput() {
  try {
    return JSON.parse(await readFile(OUTPUT_FILE, "utf8"));
  } catch {
    return null;
  }
}
