import { readFile, writeFile } from "node:fs/promises";
import { allSeasonSources, collectSource } from "./season-updater/sources";
import type {
  SeasonCalendar,
  SeasonSourceConfig,
  SourceHealth,
  TimelineEvent
} from "./season-updater/types";
import {
  candidateFromItem,
  failedHealth,
  healthFromResponse,
  isLikelyLaunchCandidate,
  slugify,
  sourceUrl
} from "./season-updater/utils";

const CALENDAR_FILE = new URL("../src/data/season-calendar.json", import.meta.url);

const calendar = JSON.parse(await readFile(CALENDAR_FILE, "utf8")) as SeasonCalendar;
const previousHealth = calendar.sourceHealth ?? {};
const nextHealth: Record<string, SourceHealth> = {};
const generatedEvents: TimelineEvent[] = [];
const configs = allSeasonSources();

for (const config of configs) {
  try {
    const result = await collectSource(config);
    nextHealth[result.sourceUrl] = healthFromResponse(result.response, previousHealth[result.sourceUrl]);

    for (const item of result.items) {
      const candidate = candidateFromItem(config, item);
      if (!candidate) {
        continue;
      }

      const event = eventFromCandidate(candidate, config);
      if (event) {
        generatedEvents.push(event);
      }
    }
  } catch (error) {
    const url = sourceUrl(config);
    nextHealth[url] = failedHealth(error, previousHealth[url]);
  }
}

const sortedEvents = mergeEvents(calendar.events, generatedEvents)
  .sort((a, b) => Date.parse(a.date) - Date.parse(b.date));

const sources = [...new Set([...configs.map(sourceUrl), ...sortedEvents.map((event) => event.sourceUrl)])];
const output: SeasonCalendar = {
  ...calendar,
  updatedAt: shouldBumpUpdatedAt(calendar, sortedEvents, nextHealth) ? new Date().toISOString() : calendar.updatedAt,
  events: sortedEvents,
  sources,
  sourceHealth: nextHealth
};

await writeFile(CALENDAR_FILE, `${JSON.stringify(output, null, 2)}\n`);

console.log(`Checked ${configs.length} season feeds and generated ${generatedEvents.length} high-confidence calendar events.`);

function eventFromCandidate(candidate: NonNullable<ReturnType<typeof candidateFromItem>>, config: SeasonSourceConfig): TimelineEvent | null {
  if (!config.autoUpdate || !candidate.detectedDate || !isLikelyLaunchCandidate(candidate)) {
    return null;
  }

  const eventDate = new Date(candidate.detectedDate);
  const status = eventDate.getTime() < Date.now() ? "Live" : "Upcoming";

  return {
    id: stableEventId(candidate),
    game: candidate.game,
    title: candidate.title,
    date: candidate.detectedDate,
    type: candidate.type,
    confidence: candidate.confidence,
    status,
    note: candidate.summary,
    sourceName: candidate.sourceName,
    sourceUrl: candidate.sourceUrl,
    accent: config.accent
  };
}

function mergeEvents(existingEvents: TimelineEvent[], generatedEvents: TimelineEvent[]): TimelineEvent[] {
  const byId = new Map(existingEvents.map((event) => [event.id, event]));

  for (const generatedEvent of generatedEvents) {
    const existing = byId.get(generatedEvent.id);

    if (!existing) {
      byId.set(generatedEvent.id, generatedEvent);
      continue;
    }

    byId.set(generatedEvent.id, {
      ...existing,
      title: generatedEvent.title || existing.title,
      date: generatedEvent.date,
      confidence: generatedEvent.confidence,
      status: generatedEvent.status,
      note: generatedEvent.note || existing.note,
      sourceName: generatedEvent.sourceName,
      sourceUrl: generatedEvent.sourceUrl
    });
  }

  return [...byId.values()];
}

function stableEventId(candidate: NonNullable<ReturnType<typeof candidateFromItem>>): string {
  if (candidate.game === "Project Diablo 2") {
    const season = candidate.title.match(/season\s+(\d+)/i)?.[1];
    if (season) {
      return `pd2-season-${season}`;
    }
  }

  if (candidate.game === "Path of Exile") {
    const version = candidate.title.match(/\b(\d+\.\d+)\b/)?.[1];
    if (version) {
      return `poe-${version.replace(".", "")}`;
    }
  }

  if (candidate.game === "Path of Exile 2") {
    const version = candidate.title.match(/\b(\d+\.\d+(?:\.\d+)?)\b/)?.[1];
    if (version) {
      return `poe2-${version.replace(/\./g, "")}`;
    }
  }

  if (candidate.game === "Diablo IV") {
    const season = candidate.title.match(/season\s+(\d+)/i)?.[1];
    if (season) {
      return `diablo-iv-season-${season}`;
    }
  }

  return `${slugify(candidate.game)}-${slugify(candidate.title)}`;
}

function shouldBumpUpdatedAt(
  previousCalendar: SeasonCalendar,
  nextEvents: TimelineEvent[],
  nextSourceHealth: Record<string, SourceHealth>
): boolean {
  return (
    JSON.stringify(previousCalendar.events) !== JSON.stringify(nextEvents) ||
    JSON.stringify(previousCalendar.sourceHealth ?? {}) !== JSON.stringify(nextSourceHealth)
  );
}
