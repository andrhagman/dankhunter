import type { SeasonSourceConfig, SourceCollection } from "../types";
import { extractHtmlNewsItems, fetchSource, sourceUrl } from "../utils";

export async function collectHtmlNews(config: SeasonSourceConfig): Promise<SourceCollection> {
  const url = sourceUrl(config);
  const response = await fetchSource(url);
  const html = await response.text();

  return {
    sourceUrl: url,
    healthUrl: url,
    response,
    items: extractHtmlNewsItems(html, url)
  };
}
