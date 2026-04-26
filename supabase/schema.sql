-- Ad Scanner AI - Supabase schema
-- Run this in the Supabase SQL editor (or via the CLI) to provision tables.

create extension if not exists "pgcrypto";

create table if not exists brands (
  id uuid primary key default gen_random_uuid(),
  domain text unique not null,
  name text not null,
  page_id text,
  last_scraped_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists ads (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references brands(id) on delete cascade,
  external_id text unique,
  media_type text not null check (media_type in ('image', 'video', 'carousel', 'text', 'unknown')),
  platform text,
  ad_copy text,
  headline text,
  cta text,
  landing_page text,
  image_url text,
  video_url text,
  transcript text,
  raw jsonb,
  first_seen_at timestamptz,
  last_seen_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists ads_brand_id_idx on ads(brand_id);
create index if not exists ads_media_type_idx on ads(media_type);
create index if not exists ads_created_at_idx on ads(created_at desc);

create table if not exists ad_analyses (
  id uuid primary key default gen_random_uuid(),
  ad_id uuid not null unique references ads(id) on delete cascade,
  mass_desire jsonb,
  market_awareness jsonb,
  hook jsonb,
  offer jsonb,
  mechanism jsonb,
  cta_analysis jsonb,
  copy_quality jsonb,
  weaknesses jsonb,
  ad_score integer check (ad_score between 0 and 100),
  score_explanation text,
  improvements jsonb,
  model text,
  created_at timestamptz not null default now()
);

create index if not exists ad_analyses_ad_id_idx on ad_analyses(ad_id);

-- Convenience view: ad joined with its analysis
create or replace view ads_with_analysis as
select
  a.*,
  an.mass_desire,
  an.market_awareness,
  an.hook,
  an.offer,
  an.mechanism,
  an.cta_analysis,
  an.copy_quality,
  an.weaknesses,
  an.ad_score,
  an.score_explanation,
  an.improvements
from ads a
left join ad_analyses an on an.ad_id = a.id;
