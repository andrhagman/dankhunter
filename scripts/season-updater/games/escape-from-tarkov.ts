import type { SeasonSourceConfig } from "../types";

export function escapeFromTarkovSources(): SeasonSourceConfig[] {
  return [
    {
      id: "tarkov-news",
      game: "Escape from Tarkov",
      accent: "#9a8c65",
      sourceName: "Escape from Tarkov News",
      type: "html-news",
      url: "https://www.escapefromtarkov.com/news",
      keywords: ["wipe", "season", "patch", "update", "release"],
      autoUpdate: false
    }
  ];
}
