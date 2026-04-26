import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ad Scanner AI",
  description: "Analyze competitors' Meta ads with a top media buyer's brain.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-zinc-100">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <header className="flex items-center justify-between mb-8">
            <a href="/" className="flex items-center gap-2">
              <span className="inline-block h-7 w-7 rounded-md bg-accent" />
              <span className="font-semibold tracking-tight">Ad Scanner AI</span>
            </a>
            <nav className="flex gap-5 text-sm text-muted">
              <a href="/" className="hover:text-zinc-200">Home</a>
              <a href="/dashboard" className="hover:text-zinc-200">Dashboard</a>
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
