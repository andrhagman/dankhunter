import type { SeasonSourceConfig } from "../types";

export function lastEpochSources(): SeasonSourceConfig[] {
  return [
    {
      id: "last-epoch-steam",
      game: "Last Epoch",
      accent: "#8bbdd9",
      sourceName: "Steam News",
      type: "steam-news",
      appId: 899770,
      keywords: ["season", "roadmap", "expansion", "launch", "release"],
      autoUpdate: false
    }
  ];
}
