-- arch-competitions initial schema
-- Apply via Supabase Dashboard → SQL Editor → paste & run.
-- Public-readable schema; mutations gated by service_role until auth bridge lands.

create extension if not exists pgcrypto;

-- Enums match src/data/types.ts
create type competition_status as enum ('open', 'judging', 'announced');
create type competition_type as enum ('open', 'student', 'ideas', 'invite_only', 'awards');
create type eligibility_type as enum ('open_to_all', 'students_only', 'licensed_professionals', 'regional');
create type ip_terms_type as enum ('retain_all', 'non_exclusive_license', 'winning_license', 'winning_transfer', 'custom');

-- ───────────────────────────── organizers ─────────────────────────────

create table organizers (
  id                       uuid primary key default gen_random_uuid(),
  slug                     text unique not null,
  name                     text not null,
  logo                     text,
  description              text not null default '',
  website                  text,
  is_verified              boolean not null default false,
  competitions_count       int not null default 0,
  payout_completion_rate   int not null default 100, -- 0-100
  privy_user_id            text unique,              -- bridges Privy → org account
  wallet_address           text,                     -- on-chain identity
  created_at               timestamptz not null default now()
);

-- ───────────────────────────── submitters ─────────────────────────────

create table submitters (
  id               uuid primary key default gen_random_uuid(),
  slug             text unique not null,
  name             text not null,
  type             text not null check (type in ('individual', 'studio')),
  photo            text,
  country          text not null,
  city             text,
  bio              text not null default '',
  specialties      text[] not null default '{}',
  website          text,
  year_established int,
  privy_user_id    text unique,
  wallet_address   text,
  created_at       timestamptz not null default now()
);

-- ──────────────────────────── competitions ────────────────────────────

create table competitions (
  id                       uuid primary key default gen_random_uuid(),
  slug                     text unique not null,
  organizer_id             uuid not null references organizers(id) on delete restrict,

  title                    text not null,
  short_description        text not null default '',
  brief                    text not null default '',
  design_objectives        text[] not null default '{}',
  site_context             text,
  background               text,

  type                     competition_type not null,
  status                   competition_status not null default 'open',
  eligibility              eligibility_type not null default 'open_to_all',
  tags                     text[] not null default '{}',
  location                 text,
  region                   text,
  language                 text not null default 'en',

  hero_image               text,
  thumbnail_image          text,

  registration_deadline    timestamptz,
  submission_deadline      timestamptz not null,
  judging_start            timestamptz,
  judging_end              timestamptz,
  announcement_date        timestamptz,

  -- Prize pool (UI/display values; on-chain state comes from the escrow contract)
  prize_total_amount       numeric(20, 2) not null default 0,
  prize_currency           text not null default 'USD',
  prize_breakdown          jsonb not null default '[]'::jsonb, -- [{place, amount, recipient_name?}]
  prize_share_bps          int[] not null default '{}',         -- mirrors on-chain shares
  is_open_pool             boolean not null default false,
  contributor_count        int not null default 0,
  platform_fee_percent     numeric(5, 2) not null default 5.00,
  net_to_winners           numeric(20, 2) not null default 0,
  funding_status           text not null default 'funded'
                             check (funding_status in ('funded', 'partially_funded', 'paid_out')),
  paid_out_date            timestamptz,

  -- Linkage to on-chain escrow
  chain_id                 int,    -- 84532 = Base Sepolia, 8453 = Base mainnet
  escrow_address           text,   -- 0x... CompetitionEscrow clone
  competition_id_hash      text,   -- bytes32 used as factory salt

  -- JSONB blobs for nested config that doesn't need its own queryability
  jury                     jsonb not null default '[]'::jsonb,
  evaluation_criteria      jsonb not null default '[]'::jsonb,
  deliverables             jsonb not null default '[]'::jsonb,

  -- IP terms (denormalized for now — small object, simpler than another table)
  ip_terms_type            ip_terms_type not null default 'retain_all',
  ip_terms_summary         text not null default '',
  ip_terms_full            text not null default '',
  ip_terms_applies_to_all  boolean not null default false,
  ip_terms_is_default      boolean not null default true,
  ip_terms_warning_level   text not null default 'none'
                             check (ip_terms_warning_level in ('none', 'info', 'caution')),

  results                  jsonb,                          -- post-competition; null until announced
  updates                  jsonb not null default '[]'::jsonb, -- lifecycle updates feed

  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

-- Indexes for the browse page filters
create index idx_competitions_status   on competitions(status);
create index idx_competitions_type     on competitions(type);
create index idx_competitions_organizer on competitions(organizer_id);
create index idx_competitions_deadline on competitions(submission_deadline);
create index idx_competitions_chain    on competitions(chain_id, escrow_address);

-- updated_at trigger
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger competitions_set_updated_at
  before update on competitions
  for each row execute function set_updated_at();

-- ─────────────────────────────── RLS ──────────────────────────────────
-- Public read everywhere — off-chain content is the public site.
-- No write policies yet; mutations require service_role until Privy → JWT bridge.

alter table organizers   enable row level security;
alter table submitters   enable row level security;
alter table competitions enable row level security;

create policy "public read organizers"   on organizers   for select using (true);
create policy "public read submitters"   on submitters   for select using (true);
create policy "public read competitions" on competitions for select using (true);
