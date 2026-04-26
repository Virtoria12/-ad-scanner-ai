import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { normalizeDomain } from "@/lib/utils";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const domain = searchParams.get("domain");
  const mediaType = searchParams.get("media_type");
  const limit = Math.min(Number(searchParams.get("limit") ?? 60), 200);

  if (!domain) {
    return NextResponse.json({ error: "domain query param required" }, { status: 400 });
  }

  const sb = supabaseAdmin();
  const { data: brand, error: brandErr } = await sb
    .from("brands")
    .select("*")
    .eq("domain", normalizeDomain(domain))
    .maybeSingle();
  if (brandErr) return NextResponse.json({ error: brandErr.message }, { status: 500 });
  if (!brand) return NextResponse.json({ brand: null, ads: [] });

  let q = sb
    .from("ads_with_analysis")
    .select("*")
    .eq("brand_id", brand.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (mediaType && mediaType !== "all") {
    q = q.eq("media_type", mediaType);
  }

  const { data: ads, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ brand, ads: ads ?? [] });
}
