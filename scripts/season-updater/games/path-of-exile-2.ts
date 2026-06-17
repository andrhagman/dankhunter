import type { SeasonSourceConfig } from "../types";

export function pathOfExile2Sources(): SeasonSourceConfig[] {
  return [
    {
      id: "poe2-steam",
      game: "Path of Exile 2",
      accent: "#d4a24c",
      sourceName: "Steam News",
      type: "steam-news",
      appId: 2694490,
      keywords: ["league", "update", "patch", "launch", "release", "season"],
      autoUpdate: false
    }
  ];
}
