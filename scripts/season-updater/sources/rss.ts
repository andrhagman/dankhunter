import type { SeasonSourceConfig, SourceCollection } from "../types";
import { fetchSource, parseRssItems, sourceUrl } from "../utils";

export async function collectRss(config: SeasonSourceConfig): Promise<SourceCollection> {
  const url = sourceUrl(config);
  const response = await fetchSource(url);
  const xml = await response.text();

  return {
    sourceUrl: url,
    healthUrl: url,
    response,
    items: parseRssItems(xml)
  };
}
