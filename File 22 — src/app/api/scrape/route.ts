import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase";
import { fetchMetaAdsForBrand, extractAdFields } from "@/lib/apify";
import { brandNameFromDomain, detectMediaType, normalizeDomain } from "@/lib/utils";
import { transcribeRemoteMedia } from "@/lib/transcribe";
import { analyzeAd } from "@/lib/analyzer";
import type { AdAnalysis } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 300;

const Body = z.object({
  domain: z.string().min(3),
  limit: z.number().int().min(1).max(100).optional(),
  analyze: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = Body.parse(await req.json());
    const domain = normalizeDomain(body.domain);
    const brandName = brandNameFromDomain(domain);
    const sb = supabaseAdmin();

    // Upsert brand
    const { data: brand, error: brandErr } = await sb
      .from("brands")
      .upsert({ domain, name: brandName }, { onConflict: "domain" })
      .select()
      .single();
    if (brandErr) throw brandErr;

    // Fetch ads via Apify
    const rawAds = await fetchMetaAdsForBrand({
      brand: brandName,
      domain,
      limit: body.limit ?? 30,
    });

    let inserted = 0;
    let analyzed = 0;
    const errors: string[] = [];

    for (const raw of rawAds) {
      try {
        const fields = extractAdFields(raw);
        const media = detectMediaType(
          raw as unknown as Record<string, unknown>,
          !!fields.ad_copy?.trim()
        );

        let transcript: string | null = null;
        if (media.media_type === "video" && media.video_url) {
          try {
            transcript = await transcribeRemoteMedia(media.video_url);
          } catch (e) {
            errors.push(`transcribe failed: ${(e as Error).message}`);
          }
        }

        // Never persist video URLs/files; only transcript is kept.
        const adRow = {
          brand_id: brand!.id,
          external_id: fields.external_id,
          media_type: media.media_type,
          platform: fields.platform,
          ad_copy: fields.ad_copy,
          headline: fields.headline,
          cta: fields.cta,
          landing_page: fields.landing_page,
          image_url: media.image_url,
          video_url: null as string | null,
          transcript,
          raw: stripHeavy(raw),
          first_seen_at: fields.first_seen_at,
          last_seen_at: fields.last_seen_at,
        };

        const { data: ad, error: adErr } = await sb
          .from("ads")
          .upsert(adRow, { onConflict: "external_id" })
          .select()
          .single();
        if (adErr) throw adErr;
        inserted += 1;

        if (body.analyze !== false) {
          const analysis: AdAnalysis = await analyzeAd({
            brand: brandName,
            ad_copy: ad.ad_copy,
            headline: ad.headline,
            cta: ad.cta,
            landing_page: ad.landing_page,
            media_type: ad.media_type,
            transcript: ad.transcript,
          });

          const { error: anErr } = await sb.from("ad_analyses").upsert(
            {
              ad_id: ad.id,
              mass_desire: analysis.mass_desire,
              market_awareness: analysis.market_awareness,
              hook: analysis.hook,
              offer: analysis.offer,
              mechanism: analysis.mechanism,
              cta_analysis: analysis.cta_analysis,
              copy_quality: analysis.copy_quality,
              weaknesses: analysis.weaknesses,
              ad_score: analysis.ad_score,
              score_explanation: analysis.score_explanation,
              improvements: analysis.improvements,
              model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
            },
            { onConflict: "ad_id" }
          );
          if (anErr) throw anErr;
          analyzed += 1;
        }
      } catch (e) {
        errors.push((e as Error).message);
      }
    }

    await sb
      .from("brands")
      .update({ last_scraped_at: new Date().toISOString() })
      .eq("id", brand!.id);

    return NextResponse.json({
      brand,
      total: rawAds.length,
      inserted,
      analyzed,
      errors: errors.slice(0, 10),
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}

/** Drop large media arrays from raw payload before persisting to keep rows small. */
function stripHeavy(raw: unknown): unknown {
  if (!raw || typeof raw !== "object") return raw;
  const r = { ...(raw as Record<string, unknown>) };
  if (r.snapshot && typeof r.snapshot === "object") {
    const s = { ...(r.snapshot as Record<string, unknown>) };
    delete s.videos;
    delete s.images;
    r.snapshot = s;
  }
  return r;
}
