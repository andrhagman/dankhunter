import type { SeasonSourceConfig } from "../types";

export function worldOfWarcraftSources(): SeasonSourceConfig[] {
  return [
    {
      id: "wow-retail-wowhead",
      game: "World of Warcraft Retail",
      accent: "#3d8be9",
      sourceName: "Wowhead Retail RSS",
      type: "rss",
      url: "https://www.wowhead.com/news/rss/retail",
      keywords: ["season", "patch", "roadmap", "launch", "midnight"],
      autoUpdate: false
    },
    {
      id: "wow-classic-wowhead",
      game: "WoW Classic Anniversary",
      accent: "#66b47a",
      sourceName: "Wowhead Classic RSS",
      type: "rss",
      url: "https://www.wowhead.com/news/rss/classic",
      keywords: ["classic", "season", "phase", "roadmap", "launch", "anniversary", "mists"],
      autoUpdate: false
    }
  ];
}
