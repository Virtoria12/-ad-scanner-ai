export type MediaType = "image" | "video" | "carousel" | "text" | "unknown";

export type AwarenessLevel =
  | "unaware"
  | "problem aware"
  | "solution aware"
  | "product aware"
  | "most aware";

export type HookType = "problem" | "curiosity" | "claim" | "story" | "mechanism";

export type Strength = "weak" | "medium" | "strong";

export interface Brand {
  id: string;
  domain: string;
  name: string;
  page_id: string | null;
  last_scraped_at: string | null;
  created_at: string;
}

export interface Ad {
  id: string;
  brand_id: string;
  external_id: string | null;
  media_type: MediaType;
  platform: string | null;
  ad_copy: string | null;
  headline: string | null;
  cta: string | null;
  landing_page: string | null;
  image_url: string | null;
  video_url: string | null;
  transcript: string | null;
  raw: unknown;
  first_seen_at: string | null;
  last_seen_at: string | null;
  created_at: string;
}

export interface MassDesire {
  desire: string;
  strength: Strength;
  stronger_angle: string;
}

export interface MarketAwareness {
  level: AwarenessLevel;
  matches_ad: boolean;
  fix: string;
}

export interface HookAnalysis {
  hook: string;
  type: HookType;
  rating: number; // 1-10
  better_hooks: string[]; // 3 alternatives
}

export interface OfferAnalysis {
  offer: string;
  clarity: Strength;
  strength: Strength;
  improvement: string;
}

export interface MechanismAnalysis {
  mechanism: string;
  uniqueness: "unique" | "generic";
  better_angle: string;
}

export interface CtaAnalysis {
  cta: string;
  clarity: Strength;
  improvement: string;
}

export interface CopyQuality {
  emotional_vs_logical: "emotional" | "logical" | "balanced";
  simple_vs_complex: "simple" | "complex" | "balanced";
  clarity: "clear" | "confusing" | "mixed";
  improvements: string[];
}

export interface AdAnalysis {
  mass_desire: MassDesire;
  market_awareness: MarketAwareness;
  hook: HookAnalysis;
  offer: OfferAnalysis;
  mechanism: MechanismAnalysis;
  cta_analysis: CtaAnalysis;
  copy_quality: CopyQuality;
  weaknesses: string[]; // 2-5 specific weaknesses
  ad_score: number; // 0-100
  score_explanation: string;
  improvements: string[]; // 3-5 actionable items
}

export interface AdWithAnalysis extends Ad {
  mass_desire: MassDesire | null;
  market_awareness: MarketAwareness | null;
  hook: HookAnalysis | null;
  offer: OfferAnalysis | null;
  mechanism: MechanismAnalysis | null;
  cta_analysis: CtaAnalysis | null;
  copy_quality: CopyQuality | null;
  weaknesses: string[] | null;
  ad_score: number | null;
  score_explanation: string | null;
  improvements: string[] | null;
}
