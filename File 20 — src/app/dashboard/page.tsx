"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DomainSearch from "@/components/DomainSearch";
import type { Brand } from "@/types";

export default function DashboardPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(async () => {
      setLoading(true);
      const res = await fetch(`/api/brands${q ? `?q=${encodeURIComponent(q)}` : ""}`);
      const data = await res.json();
      setBrands(data.brands ?? []);
      setLoading(false);
    }, 200);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <main>
      <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>

      <div className="grid md:grid-cols-[1fr,280px] gap-4 mb-6">
        <DomainSearch />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search saved brands…"
          className="rounded-lg bg-surface border border-border px-4 py-3 text-zinc-100 placeholder:text-muted focus:outline-none focus:border-accent"
        />
      </div>

      {loading ? (
        <p className="text-muted">Loading…</p>
      ) : brands.length === 0 ? (
        <p className="text-muted">No brands yet. Scan one above.</p>
      ) : (
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {brands.map((b) => (
            <li key={b.id}>
              <Link
                href={`/brand/${encodeURIComponent(b.domain)}`}
                className="block rounded-xl border border-border bg-surface p-4 hover:border-zinc-500"
              >
                <div className="font-medium">{b.name}</div>
                <div className="text-sm text-muted">{b.domain}</div>
                {b.last_scraped_at && (
                  <div className="mt-2 text-xs text-muted">
                    Last scanned {new Date(b.last_scraped_at).toLocaleString()}
                  </div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
