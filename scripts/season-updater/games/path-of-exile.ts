import type { SeasonSourceConfig } from "../types";

export function pathOfExileSources(): SeasonSourceConfig[] {
  return [
    {
      id: "poe-rss",
      game: "Path of Exile",
      accent: "#b8894f",
      sourceName: "Path of Exile News",
      type: "rss",
      url: "https://www.pathofexile.com/news/rss",
      keywords: ["league", "expansion", "timeline", "launch", "season"],
      autoUpdate: true
    },
    {
      id: "poe-steam",
      game: "Path of Exile",
      accent: "#b8894f",
      sourceName: "Steam News",
      type: "steam-news",
      appId: 238960,
      keywords: ["league", "expansion", "timeline", "launch", "season"],
      autoUpdate: true
    }
  ];
}
