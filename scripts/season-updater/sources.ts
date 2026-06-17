import { diabloIvSources } from "./games/diablo-iv";
import { escapeFromTarkovSources } from "./games/escape-from-tarkov";
import { heroSiegeSources } from "./games/hero-siege";
import { lastEpochSources } from "./games/last-epoch";
import { pathOfExile2Sources } from "./games/path-of-exile-2";
import { pathOfExileSources } from "./games/path-of-exile";
import { projectDiablo2Sources } from "./games/project-diablo-2";
import { worldOfWarcraftSources } from "./games/world-of-warcraft";
import { collectHtmlNews } from "./sources/html-news";
import { collectProjectDiablo2News, collectProjectDiablo2Reset } from "./sources/project-diablo-2";
import { collectRss } from "./sources/rss";
import { collectSteamNews } from "./sources/steam";
import type { SeasonSourceConfig, SourceCollection } from "./types";

export function allSeasonSources(): SeasonSourceConfig[] {
  return [
    ...pathOfExileSources(),
    ...pathOfExile2Sources(),
    ...diabloIvSources(),
    ...lastEpochSources(),
    ...heroSiegeSources(),
    ...projectDiablo2Sources(),
    ...worldOfWarcraftSources(),
    ...escapeFromTarkovSources()
  ];
}

export function collectSource(config: SeasonSourceConfig): Promise<SourceCollection> {
  switch (config.type) {
    case "steam-news":
      return collectSteamNews(config);
    case "rss":
      return collectRss(config);
    case "pd2-reset":
      return collectProjectDiablo2Reset(config);
    case "json-news":
      return collectProjectDiablo2News(config);
    case "html-news":
      return collectHtmlNews(config);
    default:
      return assertNever(config.type);
  }
}

function assertNever(value: never): never {
  throw new Error(`Unhandled source type: ${value}`);
}
