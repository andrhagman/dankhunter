import type { SeasonSourceConfig } from "../types";

export function diabloIvSources(): SeasonSourceConfig[] {
  return [
    {
      id: "diablo-iv-steam",
      game: "Diablo IV",
      accent: "#c94b35",
      sourceName: "Steam News",
      type: "steam-news",
      appId: 2344520,
      keywords: ["season", "expansion", "developer update", "launch", "available"],
      autoUpdate: false
    }
  ];
}
