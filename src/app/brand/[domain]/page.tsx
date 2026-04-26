"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import AdCard from "@/components/AdCard";
import Filters from "@/components/Filters";
import DomainSearch from "@/components/DomainSearch";
import type { AdWithAnalysis, Brand } from "@/types";

export default function BrandPage() {
  const params = useParams<{ domain: string }>();
  const domain = decodeURIComponent(params.domain);

  const [brand, setBrand] = useState<Brand | null>(null);
  const [allAds, setAllAds] = useState<AdWithAnalysis[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [rescanning, setRescanning] = useState(false);

  // Always fetch all ads so the stat counters reflect the full set;
  // filtering then happens client-side.
  async function load() {
    setLoading(true);
    const res = await fetch(`/api/ads?domain=${encodeURIComponent(domain)}&media_type=all`);
    const data = await res.json();
    setBrand(data.brand);
    setAllAds(data.ads ?? []);
    setLoading(false);
  }

  const stats = useMemo(() => {
    const by = (t: string) => allAds.filter((a) => a.media_type === t).length;
    return {
      total: allAds.length,
      image: by("image"),
      video: by("video"),
      carousel: by("carousel"),
      text: by("text"),
    };
  }, [allAds]);

  const ads = useMemo(
    () => (filter === "all" ? allAds : allAds.filter((a) => a.media_type === filter)),
    [allAds, filter]
  );

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domain]);

  async function rescan() {
    setRescanning(true);
    try {
      await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain, limit: 20, analyze: true }),
      });
      await load();
    } finally {
      setRescanning(false);
    }
  }

  return (
    <main>
      <div className="flex items-end justify-between gap-4 mb-6 flex-wrap">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted">Brand</div>
          <h1 className="text-2xl font-semibold">{brand?.name ?? domain}</h1>
          <div className="text-sm text-muted">{domain}</div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={rescan}
            disabled={rescanning}
            className="rounded-md border border-border bg-surface px-4 py-2 text-sm hover:border-zinc-500 disabled:opacity-50"
          >
            {rescanning ? "Re-scanning…" : "Re-scan ads"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {[
          { label: "Total ads", value: stats.total },
          { label: "Image", value: stats.image },
          { label: "Video", value: stats.video },
          { label: "Carousel", value: stats.carousel },
          { label: "Text", value: stats.text },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-surface p-4">
            <div className="text-xs uppercase tracking-wider text-muted">{s.label}</div>
            <div className="text-2xl font-semibold mt-1">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="mb-4 grid md:grid-cols-[1fr,auto] gap-3 items-center">
        <DomainSearch initial={domain} autoScrape={false} />
        <Filters value={filter} onChange={setFilter} />
      </div>

      {loading ? (
        <p className="text-muted">Loading…</p>
      ) : ads.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted">
          {allAds.length === 0
            ? "No ads found for this brand yet. Try Re-scan."
            : `No ${filter} ads. Try a different filter.`}
        </div>
      ) : (
        <div className="grid gap-4">
          {ads.map((ad) => <AdCard key={ad.id} ad={ad} />)}
        </div>
      )}
    </main>
  );
}
