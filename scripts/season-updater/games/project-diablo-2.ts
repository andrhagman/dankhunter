import type { SeasonSourceConfig } from "../types";

export function projectDiablo2Sources(): SeasonSourceConfig[] {
  return [
    {
      id: "pd2-reset",
      game: "Project Diablo 2",
      accent: "#b95f3b",
      sourceName: "Project Diablo 2 News",
      type: "pd2-reset",
      url: "https://raw.githubusercontent.com/Project-Diablo-2/news/main/reset.json",
      autoUpdate: true
    },
    {
      id: "pd2-news",
      game: "Project Diablo 2",
      accent: "#b95f3b",
      sourceName: "Project Diablo 2 News",
      type: "json-news",
      url: "https://raw.githubusercontent.com/Project-Diablo-2/news/main/news.json",
      keywords: ["season", "launch", "reset"],
      autoUpdate: true
    }
  ];
}
