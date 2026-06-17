export type Confidence = "confirmed" | "window" | "estimated";
export type TimelineEventType = "Season" | "Expansion" | "Patch" | "Launch";
export type TimelineEventStatus = "Live" | "Upcoming";
export type SourceType = "rss" | "steam-news" | "pd2-reset" | "json-news" | "html-news";

export type SeasonCalendar = {
  updatedAt: string;
  sourceName: string;
  sourceUrl: string;
  events: TimelineEvent[];
  sources?: string[];
  sourceHealth?: Record<string, SourceHealth>;
};

export type TimelineEvent = {
  id: string;
  game: string;
  title: string;
  date: string;
  type: TimelineEventType;
  confidence: Confidence;
  status: TimelineEventStatus;
  note: string;
  sourceName: string;
  sourceUrl: string;
  accent: string;
};

export type SourceHealth = {
  ok: boolean;
  status: number;
  statusText: string;
  checkedAt: string;
};

export type SeasonCandidate = {
  id: string;
  game: string;
  title: string;
  detectedDate: string | null;
  publishedAt: string;
  type: TimelineEventType;
  confidence: Confidence;
  matchedKeywords: string[];
  sourceName: string;
  sourceUrl: string;
  summary: string;
  autoApplied: boolean;
};

export type SeasonSourceConfig = {
  id: string;
  game: string;
  accent: string;
  sourceName: string;
  type: SourceType;
  url?: string;
  appId?: number;
  keywords?: string[];
  autoUpdate: boolean;
};

export type SourceItem = {
  id: string;
  title: string;
  body: string;
  url: string;
  publishedAt: string;
  eventDate?: string;
  eventTitle?: string;
  eventType?: TimelineEventType;
  confidence?: Confidence;
};

export type SourceCollection = {
  sourceUrl: string;
  healthUrl: string;
  response: Response;
  items: SourceItem[];
};
