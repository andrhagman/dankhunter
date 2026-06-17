import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

const SOURCE_NAME = "IGDB";
const SOURCE_URL = "https://www.igdb.com/discover";
const OUTPUT_FILE = new URL("../src/data/pc-releases.json", import.meta.url);
const MAX_RELEASES = 24;
const PC_PLATFORM_ID = 6;
const LOOKAHEAD_DAYS = 365;

const clientId = process.env.IGDB_CLIENT_ID;
const clientSecret = process.env.IGDB_CLIENT_SECRET;

if (!clientId || !clientSecret) {
  throw new Error(
    "Missing IGDB credentials. Set IGDB_CLIENT_ID and IGDB_CLIENT_SECRET in GitHub repository secrets."
  );
}

const accessToken = await getAccessToken(clientId, clientSecret);
const releases = await getUpcomingPcReleases(clientId, accessToken);

if (releases.length === 0) {
  throw new Error("IGDB returned no upcoming PC releases.");
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

console.log(`Wrote ${releases.length} IGDB releases to ${OUTPUT_FILE.pathname}`);

async function getAccessToken(id, secret) {
  const params = new URLSearchParams({
    client_id: id,
    client_secret: secret,
    grant_type: "client_credentials"
  });

  const response = await fetch(`https://id.twitch.tv/oauth2/token?${params}`, {
    method: "POST"
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Twitch app token: ${response.status} ${response.statusText}`);
  }

  const token = await response.json();

  if (!token.access_token) {
    throw new Error("Twitch token response did not include access_token.");
  }

  return token.access_token;
}

async function getUpcomingPcReleases(id, token) {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const maxDate = new Date(today);
  maxDate.setUTCDate(maxDate.getUTCDate() + LOOKAHEAD_DAYS);

  const query = [
    "fields date,human,status,game.name,game.slug,game.url,game.genres.name,game.category;",
    `where platform = ${PC_PLATFORM_ID}`,
    `& date >= ${Math.floor(today.getTime() / 1000)}`,
    `& date <= ${Math.floor(maxDate.getTime() / 1000)}`,
    "& game.category = 0;",
    "sort date asc;",
    `limit ${MAX_RELEASES};`
  ].join(" ");

  const response = await fetch("https://api.igdb.com/v4/release_dates", {
    method: "POST",
    headers: {
      "Client-ID": id,
      Authorization: `Bearer ${token}`,
      Accept: "application/json"
    },
    body: query
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`IGDB release_dates query failed: ${response.status} ${response.statusText}\n${body}`);
  }

  const rows = await response.json();
  const releasesById = new Map();

  for (const row of rows) {
    if (!row.date || !row.game?.name) {
      continue;
    }

    const title = normalizeTitle(row.game.name);
    const release = {
      id: row.game.slug || slugify(title),
      title,
      date: new Date(row.date * 1000).toISOString().slice(0, 10),
      genre: summarizeGenres(row.game.genres),
      platform: "PC",
      confidence: row.status ? "window" : "confirmed",
      sourceName: SOURCE_NAME,
      sourceUrl: row.game.url || SOURCE_URL
    };

    if (!releasesById.has(release.id)) {
      releasesById.set(release.id, release);
    }
  }

  return [...releasesById.values()].sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
}

function summarizeGenres(genres) {
  if (!Array.isArray(genres) || genres.length === 0) {
    return "Game";
  }

  return genres
    .map((genre) => genre.name)
    .filter(Boolean)
    .slice(0, 2)
    .join(" / ");
}

function normalizeTitle(value) {
  return value.replace(/\s+/g, " ").trim();
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
