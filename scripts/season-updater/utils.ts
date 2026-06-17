import type {
  Confidence,
  SeasonCandidate,
  SeasonSourceConfig,
  SourceHealth,
  SourceItem,
  TimelineEventType
} from "./types";

export const USER_AGENT = "Dankhunter season updater (+https://github.com/andrhagman/dankhunter)";

export async function fetchSource(url: string): Promise<Response> {
  const response = await fetch(url, {
    headers: {
      "user-agent": USER_AGENT,
      accept: "application/rss+xml, application/json, text/html;q=0.9, */*;q=0.8"
    },
    redirect: "follow"
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`${response.status} ${response.statusText}: ${body.slice(0, 160)}`);
  }

  return response;
}

export function healthFromResponse(response: Response, previous?: SourceHealth): SourceHealth {
  return {
    ok: response.ok,
    status: response.status,
    statusText: response.statusText,
    checkedAt: response.ok === previous?.ok && response.status === previous?.status
      ? previous.checkedAt
      : new Date().toISOString()
  };
}

export function failedHealth(error: unknown, previous?: SourceHealth): SourceHealth {
  return {
    ok: false,
    status: 0,
    statusText: error instanceof Error ? error.message : "Unknown error",
    checkedAt: previous?.ok === false && previous.status === 0 ? previous.checkedAt : new Date().toISOString()
  };
}

export function candidateFromItem(config: SeasonSourceConfig, item: SourceItem): SeasonCandidate | null {
  const haystack = `${item.title} ${item.body}`.toLowerCase();
  const matchedKeywords = (config.keywords ?? []).filter((keyword) => haystack.includes(keyword));

  if (matchedKeywords.length === 0 && !item.eventDate) {
    return null;
  }

  const extractedDate = item.eventDate
    ? new Date(item.eventDate)
    : extractEventDate(`${item.title} ${item.body}`, item.publishedAt);

  return {
    id: `${config.id}-${slugify(item.id || item.title)}`,
    game: config.game,
    title: item.eventTitle ?? item.title,
    detectedDate: extractedDate ? extractedDate.toISOString() : null,
    publishedAt: item.publishedAt,
    type: item.eventType ?? inferEventType(item.title, item.body),
    confidence: item.confidence ?? (extractedDate ? "confirmed" : "estimated"),
    matchedKeywords,
    sourceName: config.sourceName,
    sourceUrl: item.url || sourceUrl(config),
    summary: summarize(item.body || item.title),
    autoApplied: Boolean(config.autoUpdate && extractedDate)
  };
}

export function parseRssItems(xml: string): SourceItem[] {
  const items: SourceItem[] = [];

  for (const match of xml.matchAll(/<item\b[\s\S]*?<\/item>/gi)) {
    const raw = match[0];
    const title = decodeXml(readTag(raw, "title"));
    const link = decodeXml(readTag(raw, "link") || readTag(raw, "guid"));
    const body = decodeXml(readTag(raw, "description") || readTag(raw, "content:encoded"));
    const published = decodeXml(readTag(raw, "pubDate") || readTag(raw, "dc:date"));

    if (!title) {
      continue;
    }

    items.push({
      id: link || title,
      title: normalizeText(title),
      body: normalizeText(stripMarkup(body)),
      url: link,
      publishedAt: parseLooseDate(published)?.toISOString() ?? new Date().toISOString()
    });
  }

  return items;
}

export function extractHtmlNewsItems(html: string, url: string): SourceItem[] {
  return [...html.matchAll(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi)]
    .map((match, index) => ({
      id: `${url}-${index}`,
      title: normalizeText(stripMarkup(match[1] ?? "")),
      body: normalizeText(stripMarkup(html.slice(match.index, Math.min((match.index ?? 0) + 900, html.length)))),
      url,
      publishedAt: new Date().toISOString()
    }))
    .filter((item) => item.title.length > 3)
    .slice(0, 12);
}

export function extractEventDate(text: string, publishedAt: string): Date | null {
  const normalized = normalizeText(text);
  const publishedYear = new Date(publishedAt).getUTCFullYear();
  const yearPattern = "(20\\d{2})";
  const month = "(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)";
  const day = "(\\d{1,2})(?:st|nd|rd|th)?";
  const time = "(?:\\s+at\\s+(\\d{1,2})(?::(\\d{2}))?\\s*(AM|PM)?\\s*(PDT|PST|PT|UTC|GMT)?)?";
  const monthDay = new RegExp(`${month}\\s+${day}(?:,?\\s+${yearPattern})?${time}`, "i");
  const isoLike = normalized.match(/\b(20\d{2})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}):(\d{2})Z)?\b/);

  if (isoLike) {
    return new Date(isoLike[0].length === 10 ? `${isoLike[0]}T00:00:00Z` : isoLike[0]);
  }

  const match = normalized.match(monthDay);
  if (!match) {
    return null;
  }

  const monthName = match[1] ?? "";
  const dayOfMonth = Number(match[2]);
  const year = Number(match[3] ?? publishedYear);
  let hour = Number(match[4] ?? 0);
  const minute = Number(match[5] ?? 0);
  const meridiem = match[6]?.toUpperCase();
  const zone = match[7]?.toUpperCase();

  if (meridiem === "PM" && hour < 12) {
    hour += 12;
  }
  if (meridiem === "AM" && hour === 12) {
    hour = 0;
  }

  const utcHour = zone && ["PDT", "PT"].includes(zone)
    ? hour + 7
    : zone === "PST"
      ? hour + 8
      : hour;

  return new Date(Date.UTC(year, monthIndex(monthName), dayOfMonth, utcHour, minute));
}

export function parseLooseDate(value: string | null | undefined): Date | null {
  if (!value) {
    return null;
  }

  const parsed = new Date(value.replace("Apirl", "April"));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function inferEventType(title: string, body: string): TimelineEventType {
  const text = `${title} ${body}`.toLowerCase();
  if (text.includes("expansion")) {
    return "Expansion";
  }
  if (text.includes("patch") || text.includes("update")) {
    return "Patch";
  }
  if (text.includes("launch") || text.includes("release")) {
    return "Launch";
  }
  return "Season";
}

export function sourceUrl(config: SeasonSourceConfig): string {
  if (config.type === "steam-news") {
    return `https://api.steampowered.com/ISteamNews/GetNewsForApp/v0002/?appid=${config.appId}`;
  }

  if (!config.url) {
    throw new Error(`Source ${config.id} is missing url.`);
  }

  return config.url;
}

export function summarize(value: string): string {
  const normalized = normalizeText(value);
  return normalized.length > 180 ? `${normalized.slice(0, 177)}...` : normalized;
}

export function stripMarkup(value: string): string {
  return value
    .replace(/\[\/?[^\]]+\]/g, " ")
    .replace(/<[^>]+>/g, " ");
}

export function normalizeText(value: unknown): string {
  return decodeXml(String(value ?? ""))
    .replace(/\s+/g, " ")
    .trim();
}

export function decodeXml(value: unknown): string {
  return String(value ?? "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'");
}

export function slugify(value: string): string {
  return normalizeText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function isLikelyLaunchCandidate(candidate: SeasonCandidate): boolean {
  const text = `${candidate.title} ${candidate.summary}`.toLowerCase();
  const hasLaunchSignal = /\b(launch(?:es|ed)?|begins?|starts?|available now|release(?:s|d)?|reset)\b/.test(text);
  const isOnlyLivestream = /\b(livestream|developer update|tune in|recap|roundup|showcase|sale|anniversary event)\b/.test(text);
  return hasLaunchSignal && !isOnlyLivestream;
}

export function normalizePd2Title(value: string): string {
  const normalized = normalizeText(value);
  const match = normalized.match(/Season\s+(\d+)\s+(.+?)(?:\s+Season\s+Launch\.?)?$/i);

  if (!match) {
    return normalized;
  }

  return `Season ${match[1]} - ${match[2]?.replace(/\.$/, "")}`;
}

export function cleanPd2Summary(value: string): string {
  return normalizeText(value)
    .replace(/\(Your Time:\s*$/i, "")
    .trim();
}

function readTag(raw: string, tag: string): string {
  const escapedTag = tag.replace(":", "\\:");
  const match = raw.match(new RegExp(`<${escapedTag}[^>]*>([\\s\\S]*?)<\\/${escapedTag}>`, "i"));
  return match?.[1]?.replace(/^<!\[CDATA\[|\]\]>$/g, "").trim() ?? "";
}

function monthIndex(value: string): number {
  return {
    jan: 0,
    feb: 1,
    mar: 2,
    apr: 3,
    may: 4,
    jun: 5,
    jul: 6,
    aug: 7,
    sep: 8,
    oct: 9,
    nov: 10,
    dec: 11
  }[value.slice(0, 3).toLowerCase()] ?? 0;
}
