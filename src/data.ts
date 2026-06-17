export type Confidence = "confirmed" | "window" | "estimated";

export type TimelineEvent = {
  id: string;
  game: string;
  title: string;
  date: string;
  type: "Season" | "Expansion" | "Patch" | "Launch";
  confidence: Confidence;
  status: "Live" | "Upcoming";
  note: string;
  sourceName: string;
  sourceUrl: string;
  accent: string;
};

export type Release = {
  id: string;
  title: string;
  date: string;
  genre: string;
  platform: string;
  confidence: Confidence;
  sourceName: string;
  sourceUrl: string;
};

export const timelineEvents: TimelineEvent[] = [
  {
    id: "diablo-iv-divine-intervention",
    game: "Diablo IV",
    title: "Season of Divine Intervention",
    date: "2026-06-17",
    type: "Season",
    confidence: "confirmed",
    status: "Live",
    note: "Live season page highlights the Wardens of Light, Divine Gifts, monster combat updates, and item journey reworks.",
    sourceName: "Blizzard",
    sourceUrl: "https://diablo4.blizzard.com/en-us/season",
    accent: "#c94b35"
  },
  {
    id: "diablo-iv-lord-of-hatred",
    game: "Diablo IV",
    title: "Lord of Hatred",
    date: "2026-04-28",
    type: "Expansion",
    confidence: "confirmed",
    status: "Live",
    note: "Expansion availability is listed on the official season page.",
    sourceName: "Blizzard",
    sourceUrl: "https://diablo4.blizzard.com/en-us/season",
    accent: "#c94b35"
  },
  {
    id: "poe2-return-ancients",
    game: "Path of Exile 2",
    title: "0.5.0 - Return of the Ancients",
    date: "2026-05-29T20:00:00Z",
    type: "Season",
    confidence: "confirmed",
    status: "Live",
    note: "Current league is live; next full release window is not announced.",
    sourceName: "aRPG Timeline",
    sourceUrl: "https://www.arpg-timeline.com/game/path-of-exile2",
    accent: "#d4a24c"
  },
  {
    id: "poe2-full-release",
    game: "Path of Exile 2",
    title: "1.0.0 - Full Release",
    date: "2026-11-15",
    type: "Launch",
    confidence: "window",
    status: "Upcoming",
    note: "Tracked as a November / December window until GGG announces a date.",
    sourceName: "aRPG Timeline",
    sourceUrl: "https://www.arpg-timeline.com/game/path-of-exile2",
    accent: "#d4a24c"
  },
  {
    id: "wow-midnight-season-2",
    game: "World of Warcraft",
    title: "Midnight Patch 12.1 & Season 2",
    date: "2026-07-15",
    type: "Season",
    confidence: "window",
    status: "Upcoming",
    note: "Blizzard roadmap places Season 2 in summer with a new zone, raid, dungeon, delves, and world boss.",
    sourceName: "Wowhead",
    sourceUrl: "https://www.wowhead.com/news/world-of-warcraft-2026-midnight-roadmap-revealed-380135",
    accent: "#3d8be9"
  },
  {
    id: "wow-midnight-1215",
    game: "World of Warcraft",
    title: "Midnight Patch 12.1.5",
    date: "2026-09-15",
    type: "Patch",
    confidence: "window",
    status: "Upcoming",
    note: "Early autumn roadmap beat with Labyrinth, a new raid, and new content systems.",
    sourceName: "Wowhead",
    sourceUrl: "https://www.wowhead.com/news/world-of-warcraft-2026-midnight-roadmap-revealed-380135",
    accent: "#3d8be9"
  },
  {
    id: "hero-siege-season-9",
    game: "Hero Siege",
    title: "Season 9 - Incarnation",
    date: "2026-04-03T13:00:00Z",
    type: "Season",
    confidence: "confirmed",
    status: "Live",
    note: "Season 9 added Incarnation, Ether Tree, Architect of Ruin, and PS5 release.",
    sourceName: "Steam News",
    sourceUrl: "https://store.steampowered.com/news/app/269210/view/528748782770193280",
    accent: "#72b35e"
  },
  {
    id: "hero-siege-next",
    game: "Hero Siege",
    title: "Next Season",
    date: "2026-09-01",
    type: "Season",
    confidence: "estimated",
    status: "Upcoming",
    note: "Community helper lists Season 9 end as TBD with an August/September estimate.",
    sourceName: "HS Helper",
    sourceUrl: "https://hero-siege-helper.vercel.app/seasons",
    accent: "#72b35e"
  }
];

export const pcReleases: Release[] = [
  {
    id: "halo-campaign-evolved",
    title: "Halo: Campaign Evolved",
    date: "2026-07-28",
    genre: "Shooter remake",
    platform: "PC",
    confidence: "confirmed",
    sourceName: "PC Gamer",
    sourceUrl: "https://www.pcgamer.com/games/new-pc-games-2026/"
  },
  {
    id: "mistfall-hunter",
    title: "Mistfall Hunter",
    date: "2026-07-29",
    genre: "PvPvE extraction RPG",
    platform: "PC",
    confidence: "confirmed",
    sourceName: "PC Gamer",
    sourceUrl: "https://www.pcgamer.com/games/new-pc-games-2026/"
  },
  {
    id: "beast-of-reincarnation",
    title: "Beast of Reincarnation",
    date: "2026-08-03",
    genre: "Post-apocalyptic action RPG",
    platform: "PC",
    confidence: "confirmed",
    sourceName: "PC Gamer",
    sourceUrl: "https://www.pcgamer.com/games/new-pc-games-2026/"
  },
  {
    id: "marvel-tokon",
    title: "Marvel Tokon: Fighting Souls",
    date: "2026-08-06",
    genre: "Tag fighter",
    platform: "PC",
    confidence: "confirmed",
    sourceName: "PC Gamer",
    sourceUrl: "https://www.pcgamer.com/games/new-pc-games-2026/"
  },
  {
    id: "blood-of-dawnwalker",
    title: "The Blood of Dawnwalker",
    date: "2026-09-03",
    genre: "Vampire action RPG",
    platform: "PC",
    confidence: "confirmed",
    sourceName: "PC Gamer",
    sourceUrl: "https://www.pcgamer.com/games/new-pc-games-2026/"
  },
  {
    id: "dawn-of-war-4",
    title: "Warhammer 40k: Dawn of War 4",
    date: "2026-09-17",
    genre: "RTS",
    platform: "PC",
    confidence: "confirmed",
    sourceName: "PC Gamer",
    sourceUrl: "https://www.pcgamer.com/games/new-pc-games-2026/"
  },
  {
    id: "silent-hill-townfall",
    title: "Silent Hill: Townfall",
    date: "2026-09-24",
    genre: "Horror",
    platform: "PC",
    confidence: "confirmed",
    sourceName: "PC Gamer",
    sourceUrl: "https://www.pcgamer.com/games/new-pc-games-2026/"
  },
  {
    id: "control-resonant",
    title: "Control Resonant",
    date: "2026-09-24",
    genre: "Action adventure",
    platform: "PC",
    confidence: "confirmed",
    sourceName: "PC Gamer",
    sourceUrl: "https://www.pcgamer.com/games/new-pc-games-2026/"
  }
];
