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

export type SeasonCalendarData = {
  updatedAt: string;
  sourceName: string;
  sourceUrl: string;
  events: TimelineEvent[];
  sources?: string[];
  sourceHealth?: Record<string, SourceHealth>;
};

export type SourceHealth = {
  ok: boolean;
  status: number;
  statusText: string;
  checkedAt: string;
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

export type ReleaseData = {
  updatedAt: string;
  sourceName: string;
  sourceUrl: string;
  releases: Release[];
};
