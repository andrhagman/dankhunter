import type { SeasonSourceConfig, SourceCollection } from "../types";
import {
  cleanPd2Summary,
  fetchSource,
  normalizePd2Title,
  normalizeText,
  parseLooseDate,
  sourceUrl,
  stripMarkup,
  slugify
} from "../utils";

type Pd2ResetResponse = {
  resetTitle?: string;
  resetTime?: string;
  resetSummary?: string;
  resetContent?: string | null;
  resetLink?: string;
};

type Pd2NewsItem = {
  date?: string;
  title?: string;
  summary?: string;
  content?: string;
  link?: string;
};

export async function collectProjectDiablo2Reset(config: SeasonSourceConfig): Promise<SourceCollection> {
  const url = sourceUrl(config);
  const response = await fetchSource(url);
  const json = (await response.json()) as Pd2ResetResponse;

  return {
    sourceUrl: url,
    healthUrl: url,
    response,
    items: [
      {
        id: "pd2-reset",
        title: normalizeText(json.resetTitle ?? "Project Diablo 2 season reset"),
        body: cleanPd2Summary([json.resetSummary, json.resetContent].filter(Boolean).join(" ")),
        url: json.resetLink ?? url,
        publishedAt: json.resetTime ?? new Date().toISOString(),
        eventDate: json.resetTime,
        eventTitle: normalizePd2Title(json.resetTitle ?? "Project Diablo 2 Season"),
        eventType: "Season",
        confidence: "confirmed"
      }
    ]
  };
}

export async function collectProjectDiablo2News(config: SeasonSourceConfig): Promise<SourceCollection> {
  const url = sourceUrl(config);
  const response = await fetchSource(url);
  const json = (await response.json()) as Pd2NewsItem[];

  return {
    sourceUrl: url,
    healthUrl: url,
    response,
    items: json.map((item, index) => ({
      id: `${config.id}-${index}-${slugify(item.title ?? "news")}`,
      title: normalizeText(item.title ?? ""),
      body: normalizeText(stripMarkup([item.summary, item.content].filter(Boolean).join(" "))),
      url: item.link ?? url,
      publishedAt: parseLooseDate(item.date)?.toISOString() ?? new Date().toISOString()
    }))
  };
}
