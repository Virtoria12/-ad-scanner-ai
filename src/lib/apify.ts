import { ApifyClient } from "apify-client";

export interface RawApifyAd {
  ad_archive_id?: string;
  page_id?: string;
  page_name?: string;
  publisher_platform?: string[] | string;
  start_date?: number | string;
  end_date?: number | string;
  snapshot?: Record<string, unknown>;
  link_url?: string;
  cta_text?: string;
  cta_type?: string;
  body?: { text?: string } | string;
  title?: string;
  caption?: string;
  [k: string]: unknown;
}

function getApify(): ApifyClient {
  const token = process.env.APIFY_TOKEN;
  if (!token) throw new Error("Missing APIFY_TOKEN");
  return new ApifyClient({ token });
}

/**
 * Fetch ads for a brand's website from the Meta Ad Library via Apify.
 * Uses the configured actor (defaults to a public Meta Ad Library scraper).
 */
export async function fetchMetaAdsForBrand(opts: {
  brand: string;
  domain: string;
  limit?: number;
  country?: string;
}): Promise<RawApifyAd[]> {
  const client = getApify();
  const actorId = process.env.APIFY_META_ADS_ACTOR ?? "curious_coder/facebook-ads-library-scraper";

  const limit = opts.limit ?? 30;
  const country = opts.country ?? "US";

  // Most public Meta Ad Library scrapers accept either a list of search URLs or a search term.
  const searchUrl =
    `https://www.facebook.com/ads/library/?active_status=all&ad_type=all` +
    `&country=${country}&q=${encodeURIComponent(opts.brand)}&search_type=keyword_unordered`;

  const input = {
    urls: [{ url: searchUrl }],
    searchTerms: [opts.brand],
    count: limit,
    maxResults: limit,
    activeStatus: "all",
    adType: "all",
    country,
  };

  const run = await client.actor(actorId).call(input, { waitSecs: 300 });
  const { items } = await client.dataset(run.defaultDatasetId).listItems({ limit });
  return items as unknown as RawApifyAd[];
}

export function extractAdFields(raw: RawApifyAd): {
  external_id: string | null;
  ad_copy: string | null;
  headline: string | null;
  cta: string | null;
  landing_page: string | null;
  platform: string | null;
  first_seen_at: string | null;
  last_seen_at: string | null;
} {
  const snap = (raw.snapshot ?? {}) as Record<string, unknown>;
  const body =
    typeof raw.body === "string"
      ? raw.body
      : ((raw.body as { text?: string } | undefined)?.text ?? null);
  const snapBody = (snap.body as { text?: string } | undefined)?.text ?? null;
  const ad_copy = body ?? snapBody ?? (raw.caption as string | undefined) ?? null;

  const headline =
    (snap.title as string | undefined) ??
    (raw.title as string | undefined) ??
    (snap.link_description as string | undefined) ??
    null;

  const cta =
    (raw.cta_text as string | undefined) ??
    (snap.cta_text as string | undefined) ??
    (raw.cta_type as string | undefined) ??
    null;

  const landing_page =
    (raw.link_url as string | undefined) ??
    (snap.link_url as string | undefined) ??
    null;

  const platform = Array.isArray(raw.publisher_platform)
    ? raw.publisher_platform.join(",")
    : (raw.publisher_platform as string | undefined) ?? null;

  const first_seen_at = toIso(raw.start_date);
  const last_seen_at = toIso(raw.end_date);

  return {
    external_id: (raw.ad_archive_id as string | undefined) ?? null,
    ad_copy,
    headline,
    cta,
    landing_page,
    platform,
    first_seen_at,
    last_seen_at,
  };
}

function toIso(v: number | string | undefined): string | null {
  if (v == null) return null;
  if (typeof v === "string") {
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d.toISOString();
  }
  // Apify returns unix seconds for these fields
  const ms = v < 1e12 ? v * 1000 : v;
  return new Date(ms).toISOString();
}
