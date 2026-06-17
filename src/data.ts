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
