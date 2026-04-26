import { z } from "zod";
import { openai, CHAT_MODEL } from "./openai";
import type { AdAnalysis } from "@/types";

/**
 * The system prompt encodes well-known copywriting frameworks as an
 * original analysis rubric. It does not reproduce copyrighted text from
 * any specific book; it uses widely understood marketing concepts
 * (mass desire, awareness levels, mechanism, hook taxonomy) reformulated
 * in our own language for evaluation.
 */
const SYSTEM_PROMPT = `You are a senior direct-response media buyer and copy chief.
You evaluate paid social ads against a rigorous, original rubric inspired by
classic direct-response principles (without quoting any book):

- Mass Desire: the underlying human want the ad taps into. Strong ads channel
  an existing, urgent desire rather than trying to create one.
- Market Awareness: where the prospect sits on the journey from "doesn't know
  they have a problem" to "knows the product and wants this brand". Ads must
  meet prospects at their current awareness.
- Hook: the first 2-5 seconds / first line. Categorize as problem, curiosity,
  claim, story, or mechanism. Strong hooks create a pattern interrupt and a
  reason to keep reading/watching.
- Offer: what the prospect gets, at what price, with what risk reversal,
  bonuses, urgency, and proof. Clarity and perceived value matter more than
  cleverness.
- Mechanism: the specific reason the product works. Unique mechanisms beat
  generic benefit claims because they make the promise believable.
- CTA Clarity: is the next action obvious, single, and friction-free? Vague,
  multi-action, or buried CTAs leak conversions.
- Copy Quality: emotional vs logical balance, simple vs complex language,
  clarity vs confusion. Reward concrete specifics, punish vague hype.
- Weaknesses: the 2-5 specific things that are dragging the ad down. Be blunt
  and concrete (e.g. "headline buries the benefit behind a brand name", not
  "needs better headline").

You are blunt, specific, and prescriptive. Never quote any book.

Return ONLY a JSON object that matches the requested schema. No prose.`;

const SCHEMA_DESCRIPTION = `Return JSON with EXACTLY these keys:
{
  "mass_desire": {
    "desire": string,
    "strength": "weak" | "medium" | "strong",
    "stronger_angle": string
  },
  "market_awareness": {
    "level": "unaware" | "problem aware" | "solution aware" | "product aware" | "most aware",
    "matches_ad": boolean,
    "fix": string
  },
  "hook": {
    "hook": string,
    "type": "problem" | "curiosity" | "claim" | "story" | "mechanism",
    "rating": integer 1..10,
    "better_hooks": [string, string, string]
  },
  "offer": {
    "offer": string,
    "clarity": "weak" | "medium" | "strong",
    "strength": "weak" | "medium" | "strong",
    "improvement": string
  },
  "mechanism": {
    "mechanism": string,
    "uniqueness": "unique" | "generic",
    "better_angle": string
  },
  "cta_analysis": {
    "cta": string,                                  // the actual CTA text (or "" if none)
    "clarity": "weak" | "medium" | "strong",
    "improvement": string
  },
  "copy_quality": {
    "emotional_vs_logical": "emotional" | "logical" | "balanced",
    "simple_vs_complex": "simple" | "complex" | "balanced",
    "clarity": "clear" | "confusing" | "mixed",
    "improvements": [string, ...]
  },
  "weaknesses": [string, ...],                       // 2 to 5 specific weaknesses
  "ad_score": integer 0..100,
  "score_explanation": string,
  "improvements": [string, string, string, ...]    // 3 to 5 items
}`;

const StrengthSchema = z.enum(["weak", "medium", "strong"]);

const AnalysisSchema = z.object({
  mass_desire: z.object({
    desire: z.string(),
    strength: StrengthSchema,
    stronger_angle: z.string(),
  }),
  market_awareness: z.object({
    level: z.enum([
      "unaware",
      "problem aware",
      "solution aware",
      "product aware",
      "most aware",
    ]),
    matches_ad: z.boolean(),
    fix: z.string(),
  }),
  hook: z.object({
    hook: z.string(),
    type: z.enum(["problem", "curiosity", "claim", "story", "mechanism"]),
    rating: z.number().int().min(1).max(10),
    better_hooks: z.array(z.string()).min(3).max(3),
  }),
  offer: z.object({
    offer: z.string(),
    clarity: StrengthSchema,
    strength: StrengthSchema,
    improvement: z.string(),
  }),
  mechanism: z.object({
    mechanism: z.string(),
    uniqueness: z.enum(["unique", "generic"]),
    better_angle: z.string(),
  }),
  cta_analysis: z.object({
    cta: z.string(),
    clarity: StrengthSchema,
    improvement: z.string(),
  }),
  copy_quality: z.object({
    emotional_vs_logical: z.enum(["emotional", "logical", "balanced"]),
    simple_vs_complex: z.enum(["simple", "complex", "balanced"]),
    clarity: z.enum(["clear", "confusing", "mixed"]),
    improvements: z.array(z.string()).min(1),
  }),
  weaknesses: z.array(z.string()).min(2).max(5),
  ad_score: z.number().int().min(0).max(100),
  score_explanation: z.string(),
  improvements: z.array(z.string()).min(3).max(5),
});

export interface AnalyzerInput {
  brand: string;
  ad_copy: string | null;
  headline: string | null;
  cta: string | null;
  landing_page: string | null;
  media_type: "image" | "video" | "carousel" | "text" | "unknown";
  transcript: string | null;
}

export async function analyzeAd(input: AnalyzerInput): Promise<AdAnalysis> {
  const userPayload = {
    brand: input.brand,
    media_type: input.media_type,
    primary_text: input.ad_copy ?? "",
    headline: input.headline ?? "",
    cta: input.cta ?? "",
    landing_page: input.landing_page ?? "",
    transcript: input.transcript ?? "",
  };

  const completion = await openai().chat.completions.create({
    model: CHAT_MODEL,
    temperature: 0.4,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content:
          `Analyze the following ad. ${SCHEMA_DESCRIPTION}\n\n` +
          `AD DATA:\n${JSON.stringify(userPayload, null, 2)}`,
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(raw);
  return AnalysisSchema.parse(parsed);
}
