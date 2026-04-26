import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase";
import { analyzeAd } from "@/lib/analyzer";

export const runtime = "nodejs";
export const maxDuration = 120;

const Body = z.object({ ad_id: z.string().uuid() });

export async function POST(req: NextRequest) {
  try {
    const { ad_id } = Body.parse(await req.json());
    const sb = supabaseAdmin();

    const { data: ad, error } = await sb
      .from("ads")
      .select("*, brands(name)")
      .eq("id", ad_id)
      .single();
    if (error) throw error;

    const analysis = await analyzeAd({
      brand: (ad as { brands: { name: string } }).brands.name,
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

    return NextResponse.json({ analysis });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
