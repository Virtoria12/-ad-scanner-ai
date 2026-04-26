import type { AdWithAnalysis } from "@/types";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <h4 className="text-xs uppercase tracking-wider text-muted mb-2">{title}</h4>
      <div className="text-sm leading-relaxed text-zinc-200">{children}</div>
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-200">
      {children}
    </span>
  );
}

export default function AnalysisPanel({ ad }: { ad: AdWithAnalysis }) {
  if (!ad.mass_desire) {
    return (
      <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted">
        No analysis yet for this ad.
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between rounded-lg border border-border bg-surface p-4">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted">Ad score</div>
          <div className="text-3xl font-semibold text-zinc-100">{ad.ad_score ?? "—"}</div>
        </div>
        <p className="ml-6 text-sm text-zinc-300 max-w-sm">{ad.score_explanation}</p>
      </div>

      <Section title="Mass desire">
        <div className="flex items-center gap-2 mb-1">
          <Pill>{ad.mass_desire.strength}</Pill>
          <span className="font-medium">{ad.mass_desire.desire}</span>
        </div>
        <p className="text-zinc-400">Stronger angle: {ad.mass_desire.stronger_angle}</p>
      </Section>

      <Section title="Market awareness">
        <div className="flex items-center gap-2 mb-1">
          <Pill>{ad.market_awareness?.level}</Pill>
          <Pill>{ad.market_awareness?.matches_ad ? "matches" : "mismatch"}</Pill>
        </div>
        <p className="text-zinc-400">{ad.market_awareness?.fix}</p>
      </Section>

      <Section title="Hook">
        <div className="flex items-center gap-2 mb-1">
          <Pill>{ad.hook?.type}</Pill>
          <Pill>{ad.hook?.rating}/10</Pill>
        </div>
        <p className="mb-2">&ldquo;{ad.hook?.hook}&rdquo;</p>
        <ul className="list-disc pl-5 text-zinc-400">
          {ad.hook?.better_hooks.map((h, i) => <li key={i}>{h}</li>)}
        </ul>
      </Section>

      <Section title="Offer">
        <div className="flex items-center gap-2 mb-1">
          <Pill>clarity: {ad.offer?.clarity}</Pill>
          <Pill>strength: {ad.offer?.strength}</Pill>
        </div>
        <p className="mb-1">{ad.offer?.offer}</p>
        <p className="text-zinc-400">Improvement: {ad.offer?.improvement}</p>
      </Section>

      <Section title="Mechanism">
        <div className="flex items-center gap-2 mb-1">
          <Pill>{ad.mechanism?.uniqueness}</Pill>
        </div>
        <p className="mb-1">{ad.mechanism?.mechanism}</p>
        <p className="text-zinc-400">Better angle: {ad.mechanism?.better_angle}</p>
      </Section>

      <Section title="CTA clarity">
        <div className="flex items-center gap-2 mb-1">
          <Pill>{ad.cta_analysis?.clarity}</Pill>
          {ad.cta_analysis?.cta && <Pill>&ldquo;{ad.cta_analysis.cta}&rdquo;</Pill>}
        </div>
        <p className="text-zinc-400">{ad.cta_analysis?.improvement}</p>
      </Section>

      <Section title="Copy quality">
        <div className="flex flex-wrap gap-2 mb-2">
          <Pill>{ad.copy_quality?.emotional_vs_logical}</Pill>
          <Pill>{ad.copy_quality?.simple_vs_complex}</Pill>
          <Pill>{ad.copy_quality?.clarity}</Pill>
        </div>
        <ul className="list-disc pl-5 text-zinc-400">
          {ad.copy_quality?.improvements.map((s, i) => <li key={i}>{s}</li>)}
        </ul>
      </Section>

      {ad.weaknesses && ad.weaknesses.length > 0 && (
        <Section title="What's weak">
          <ul className="list-disc pl-5 space-y-1 text-zinc-300">
            {ad.weaknesses.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </Section>
      )}

      <Section title="Actionable improvements">
        <ol className="list-decimal pl-5 space-y-1">
          {ad.improvements?.map((s, i) => <li key={i}>{s}</li>)}
        </ol>
      </Section>
    </div>
  );
}
