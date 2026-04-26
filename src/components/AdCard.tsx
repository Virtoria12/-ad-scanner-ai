"use client";

import { useState } from "react";
import AnalysisPanel from "./AnalysisPanel";
import type { AdWithAnalysis } from "@/types";

export default function AdCard({ ad }: { ad: AdWithAnalysis }) {
  const [open, setOpen] = useState(false);
  const [reanalyzing, setReanalyzing] = useState(false);
  const [adState, setAdState] = useState(ad);

  async function reanalyze() {
    setReanalyzing(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ad_id: ad.id }),
      });
      const data = await res.json();
      if (res.ok && data.analysis) {
        setAdState({ ...adState, ...data.analysis });
      }
    } finally {
      setReanalyzing(false);
    }
  }

  return (
    <article className="rounded-xl border border-border bg-surface overflow-hidden">
      <div className="grid md:grid-cols-[280px,1fr]">
        <div className="aspect-square bg-black/40 relative flex items-center justify-center text-muted text-sm">
          {adState.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={adState.image_url} alt="" className="object-cover w-full h-full" />
          ) : (
            <span>{adState.media_type}</span>
          )}
          <span className="absolute top-2 left-2 rounded bg-black/70 px-2 py-0.5 text-xs uppercase tracking-wide">
            {adState.media_type}
          </span>
          {typeof adState.ad_score === "number" && (
            <span className="absolute top-2 right-2 rounded bg-accent px-2 py-0.5 text-xs font-semibold">
              {adState.ad_score}
            </span>
          )}
        </div>

        <div className="p-4 flex flex-col gap-2 min-w-0">
          <div className="flex items-center justify-between gap-2 text-xs text-muted">
            <span>{adState.platform ?? "—"}</span>
            {adState.landing_page && (
              <a
                href={adState.landing_page}
                target="_blank"
                rel="noreferrer"
                className="hover:text-zinc-200 truncate max-w-[60%]"
              >
                {adState.landing_page}
              </a>
            )}
          </div>

          {adState.headline && (
            <h3 className="font-semibold text-zinc-100">{adState.headline}</h3>
          )}
          {adState.ad_copy && (
            <p className="text-sm text-zinc-300 line-clamp-4 whitespace-pre-line">
              {adState.ad_copy}
            </p>
          )}
          {adState.transcript && (
            <details className="text-xs text-muted">
              <summary className="cursor-pointer hover:text-zinc-300">Transcript</summary>
              <p className="mt-1 whitespace-pre-line">{adState.transcript}</p>
            </details>
          )}

          <div className="mt-auto flex items-center gap-2 pt-2">
            {adState.cta && (
              <span className="inline-block rounded bg-zinc-800 px-2 py-1 text-xs">
                CTA: {adState.cta}
              </span>
            )}
            <button
              onClick={() => setOpen((v) => !v)}
              className="ml-auto rounded-md border border-border px-3 py-1.5 text-xs hover:border-zinc-500"
            >
              {open ? "Hide analysis" : "Show analysis"}
            </button>
            <button
              onClick={reanalyze}
              disabled={reanalyzing}
              className="rounded-md border border-border px-3 py-1.5 text-xs hover:border-zinc-500 disabled:opacity-50"
            >
              {reanalyzing ? "Analyzing…" : "Re-analyze"}
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="border-t border-border p-4">
          <AnalysisPanel ad={adState} />
        </div>
      )}
    </article>
  );
}
