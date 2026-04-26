# Ad Scanner AI

Reverse-engineer any brand's Meta ads with the eye of a top media buyer.

Enter a domain → the app fetches the brand's live ads from the Meta Ad Library
(via Apify), transcribes the videos (without storing the files), and grades
every ad against a copywriting rubric: **mass desire, market awareness, hook,
offer, mechanism, CTA clarity, copy quality, weaknesses, score, and 3–5
specific improvements.**

The analysis system is built from widely understood direct-response principles
expressed in our own language — it does not quote or reproduce text from any
copyrighted source.

## Stack

- **Next.js 14** (App Router) + **TypeScript** + **Tailwind**
- **Supabase** (Postgres) for storage
- **Apify** (Meta Ad Library scraper actor) for ad fetching
- **OpenAI** for analysis (`gpt-4o-mini` by default) and transcription (`whisper-1`)

## Project structure

```
.
├── README.md
├── package.json
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── supabase/
│   └── schema.sql                # Postgres schema (run in Supabase)
└── src/
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx              # Landing + domain search
    │   ├── globals.css
    │   ├── dashboard/page.tsx    # Saved brands list
    │   ├── brand/[domain]/page.tsx  # Per-brand stats + ad gallery + analysis
    │   └── api/
    │       ├── scrape/route.ts   # POST: fetch + store + analyze ads
    │       ├── analyze/route.ts  # POST: re-analyze a single ad
    │       ├── ads/route.ts      # GET: ads for a domain (with filters)
    │       └── brands/route.ts   # GET: list/search saved brands
    ├── components/
    │   ├── DomainSearch.tsx
    │   ├── AdCard.tsx
    │   ├── AnalysisPanel.tsx
    │   └── Filters.tsx
    ├── lib/
    │   ├── supabase.ts           # Browser + service-role clients
    │   ├── apify.ts              # Meta Ad Library fetch + field extraction
    │   ├── openai.ts             # Shared OpenAI client
    │   ├── transcribe.ts         # Whisper transcription (no file persistence)
    │   ├── analyzer.ts           # The copywriting rubric + Zod-validated output
    │   └── utils.ts              # Domain normalization, media type detection
    └── types/
        └── index.ts              # Shared types
```

## Setup

### 1. Install

```bash
npm install
```

### 2. Provision Supabase

1. Create a project at <https://supabase.com>.
2. Open the SQL editor and run `supabase/schema.sql`.
3. Copy the project URL, anon key, and service-role key.

### 3. Get API keys

- **OpenAI** — <https://platform.openai.com/api-keys>
- **Apify** — <https://console.apify.com/account/integrations>. The default
  actor is `curious_coder/facebook-ads-library-scraper` but any Meta Ad Library
  scraper that accepts `searchTerms` / `urls` and returns `ad_archive_id`,
  `snapshot`, etc. will work — set `APIFY_META_ADS_ACTOR` accordingly.

### 4. Environment

Copy `.env.example` to `.env.local` and fill it in:

```bash
cp .env.example .env.local
```

```dotenv
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-4o-mini
OPENAI_TRANSCRIBE_MODEL=whisper-1
APIFY_TOKEN=...
APIFY_META_ADS_ACTOR=curious_coder/facebook-ads-library-scraper
```

### 5. Run

```bash
npm run dev
```

Open <http://localhost:3000>, drop in a domain (e.g. `purelynutrient.com`),
and the app will scrape, transcribe, and analyze.

## How analysis works

For each ad, the analyzer sends the brand name, primary text, headline, CTA,
landing page, media type, and (for video) transcript to the chat model with a
strict JSON schema. The output is validated with Zod and stored in
`ad_analyses` keyed by `ad_id`.

The rubric covers:

| Section | What it answers |
|---|---|
| **Mass desire** | Which pre-existing want is the ad channeling? How strong? Stronger angle? |
| **Market awareness** | unaware / problem aware / solution aware / product aware / most aware — and does the ad meet the prospect there? |
| **Hook** | The first 2–5 seconds, classified as problem / curiosity / claim / story / mechanism, scored 1–10, plus 3 alternatives. |
| **Offer** | What is being offered, how clear, how strong, and how to improve. |
| **Mechanism** | The "why it works" — unique vs generic, with a sharper angle. |
| **CTA clarity** | Is the next action obvious, single, and friction-free? Plus a fix. |
| **Copy quality** | Emotional vs logical, simple vs complex, clear vs confusing, plus fixes. |
| **Weaknesses** | 2–5 concrete, specific things dragging the ad down. |
| **Ad score** | 0–100 with explanation. |
| **Improvements** | 3–5 prescriptive changes. |

## Video handling

Video files are **never** persisted. The transcription pipeline streams the
remote MP4 into Whisper and discards it; only the resulting text transcript is
stored in `ads.transcript`.

## API

All routes are under `/api`.

| Route | Method | Body / Query | Purpose |
|---|---|---|---|
| `/api/scrape` | POST | `{ domain, limit?, analyze? }` | Fetch ads via Apify, store, transcribe videos, analyze. |
| `/api/analyze` | POST | `{ ad_id }` | Re-run analysis for one ad. |
| `/api/ads` | GET | `?domain=&media_type=` | List ads + analyses for a domain. |
| `/api/brands` | GET | `?q=` | Search/list saved brands. |

## Notes on copyright

This project is **inspired by** classic direct-response copywriting frameworks
(mass desire, awareness ladder, mechanism, etc.). The analysis prompt is
written from scratch in our own language. No copyrighted text from any book is
included, quoted, or distributed.
