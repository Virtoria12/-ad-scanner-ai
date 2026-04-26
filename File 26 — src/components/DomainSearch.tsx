"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { normalizeDomain } from "@/lib/utils";

export default function DomainSearch({
  initial = "",
  autoScrape = true,
}: {
  initial?: string;
  autoScrape?: boolean;
}) {
  const router = useRouter();
  const [domain, setDomain] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!domain.trim()) return;
    const d = normalizeDomain(domain);
    setLoading(true);
    setStatus(null);

    if (autoScrape) {
      setStatus("Fetching ads from Meta Ad Library and analyzing…");
      try {
        const res = await fetch("/api/scrape", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ domain: d, limit: 20, analyze: true }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Scrape failed");
        setStatus(`Done — ${data.inserted} ads, ${data.analyzed} analyzed.`);
      } catch (err) {
        setStatus(`Error: ${(err as Error).message}`);
        setLoading(false);
        return;
      }
    }

    router.push(`/brand/${encodeURIComponent(d)}`);
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex gap-2">
        <input
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="purelynutrient.com"
          className="flex-1 rounded-lg bg-surface border border-border px-4 py-3 text-zinc-100 placeholder:text-muted focus:outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-accent px-5 py-3 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? "Scanning…" : "Scan ads"}
        </button>
      </div>
      {status && <p className="mt-2 text-sm text-muted">{status}</p>}
    </form>
  );
}
