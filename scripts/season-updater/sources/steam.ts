import type { SeasonSourceConfig, SourceCollection } from "../types";
import { fetchSource, normalizeText, sourceUrl, stripMarkup } from "../utils";

type SteamNewsItem = {
  gid?: string;
  title?: string;
  contents?: string;
  url?: string;
  date?: number;
};

type SteamNewsResponse = {
  appnews?: {
    newsitems?: SteamNewsItem[];
  };
};

export async function collectSteamNews(config: SeasonSourceConfig): Promise<SourceCollection> {
  if (!config.appId) {
    throw new Error(`Steam source ${config.id} is missing appId.`);
  }

  const url = `${sourceUrl(config)}&count=8&maxlength=0&format=json&feeds=steam_community_announcements`;
  const response = await fetchSource(url);
  const json = (await response.json()) as SteamNewsResponse;

  return {
    sourceUrl: sourceUrl(config),
    healthUrl: url,
    response,
    items: (json.appnews?.newsitems ?? []).map((item) => ({
      id: item.gid ?? normalizeText(item.title),
      title: normalizeText(item.title),
      body: normalizeText(stripMarkup(item.contents ?? "")),
      url: item.url ?? sourceUrl(config),
      publishedAt: item.date ? new Date(item.date * 1000).toISOString() : new Date().toISOString()
    }))
  };
}
