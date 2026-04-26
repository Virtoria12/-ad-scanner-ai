import DomainSearch from "@/components/DomainSearch";

export default function HomePage() {
  return (
    <main className="pt-12">
      <section className="max-w-2xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
          Reverse-engineer any brand&rsquo;s ads.
        </h1>
        <p className="mt-4 text-muted">
          Enter a domain. We pull their live Meta ads, transcribe the videos, and grade every
          one against a top media buyer&rsquo;s rubric — desire, awareness, hook, offer,
          mechanism, copy.
        </p>
        <div className="mt-8">
          <DomainSearch />
        </div>
        <p className="mt-3 text-xs text-muted">
          Try <code>purelynutrient.com</code> or <code>magicspoon.com</code>
        </p>
      </section>

      <section className="mt-20 grid md:grid-cols-3 gap-4">
        {[
          { t: "Mass desire & awareness", d: "Spot the underlying want and where the prospect sits on the awareness ladder." },
          { t: "Hook, offer, mechanism", d: "Decompose the parts that decide whether an ad scrolls past or scales." },
          { t: "Score & fix", d: "Get a 0–100 score and 3–5 specific changes that would lift performance." },
        ].map((c) => (
          <div key={c.t} className="rounded-xl border border-border bg-surface p-5">
            <h3 className="font-medium mb-1">{c.t}</h3>
            <p className="text-sm text-muted">{c.d}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
