import type { SeasonSourceConfig } from "../types";

export function heroSiegeSources(): SeasonSourceConfig[] {
  return [
    {
      id: "hero-siege-steam",
      game: "Hero Siege",
      accent: "#72b35e",
      sourceName: "Steam News",
      type: "steam-news",
      appId: 269210,
      keywords: ["season", "patch", "launch", "release"],
      autoUpdate: false
    }
  ];
}
