---
title: "Database Schema"
order: 2
description: "All Supabase tables, columns, and Row Level Security policies."
---

## Connection

Two clients, both in `src/lib/supabase/`:

- **`client.ts`** — browser/server client using the `anon` key. Read-only for public data (RLS enforced).
- **Server actions** — use `supabaseAdmin()` with the `service_role` key. Bypasses RLS. Server-only.

---

## Tables

### `organizers`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `slug` | text | URL-safe identifier, unique |
| `name` | text | Display name |
| `logo` | text | Image URL |
| `description` | text | |
| `website` | text | |
| `is_verified` | boolean | Manual platform verification |
| `competitions_count` | int | Denormalized |
| `payout_completion_rate` | int | 0–100, track record |
| `privy_user_id` | text | Bridges Privy session → org |
| `wallet_address` | text | On-chain identity |

### `submitters`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `slug` | text | |
| `name` | text | |
| `type` | text | `individual` or `studio` |
| `photo` | text | Avatar URL |
| `country` | text | |
| `city` | text | |
| `bio` | text | |
| `specialties` | text[] | |
| `privy_user_id` | text | Bridges Privy session → submitter |
| `wallet_address` | text | For prize claims |

### `competitions`

Large table. Key columns:

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `slug` | text | URL path |
| `organizer_id` | uuid | FK → organizers |
| `status` | enum | `open`, `judging`, `announced` (`draft` added in migration 0009) |
| `type` | enum | `open`, `student`, `ideas`, `invite_only`, `awards` |
| `eligibility` | enum | `open_to_all`, `students_only`, `licensed_professionals`, `regional` |
| `submission_deadline` | timestamptz | |
| `original_submission_deadline` | timestamptz | Set once; deadline extensions tracked against this |
| `prize_total_amount` | numeric | Display value; source of truth is escrow balance |
| `prize_breakdown` | jsonb | `[{place, amount}]` |
| `prize_share_bps` | int[] | Mirrors on-chain basis-point splits |
| `is_open_pool` | boolean | Community-funded pool |
| `escrow_address` | text | On-chain escrow contract address |
| `chain_id` | int | `8453` = Base mainnet, `84532` = Base Sepolia |
| `results` | jsonb | Null until announced. `{winners: [...], jurySummary}` |
| `jury` | jsonb | `[{name, title, bio, photo}]` |
| `ip_terms_*` | various | Denormalized IP terms fields |

### `entries`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `competition_id` | uuid | FK → competitions |
| `submitter_id` | uuid | FK → submitters |
| `anonymous_id` | text | e.g. `E-0001`. Assigned at first submission. Used for blind jury review. |
| `title` | text | |
| `description` | text | |
| `project_url` | text | Optional external link |
| `files` | jsonb | `[{name, url, size, mimeType}]` |
| `status` | text | `draft`, `submitted`, `withdrawn` |
| `hidden_by_submitter` | boolean | Submitter can hide from public gallery |
| `submitted_at` | timestamptz | Set on first submit, preserved on re-saves |

Unique constraint: `(competition_id, submitter_id)` — one entry per submitter per competition.

### `registrations` (migration 0005)

Tracks intent to submit before an entry exists. Used for lapse-protection distributions.

| Column | Type | Notes |
|---|---|---|
| `competition_id` | uuid | |
| `submitter_id` | uuid | |
| `wallet_address` | text | Snapshot at registration time |
| `registered_at` | timestamptz | |

### `questions` (migration 0006)

Q&A between submitters and organizers, visible publicly.

| Column | Type | Notes |
|---|---|---|
| `competition_id` | uuid | |
| `submitter_id` | uuid | |
| `question` | text | |
| `answer` | text | Null until organizer responds |
| `is_public` | boolean | |

---

## Row Level Security

All tables have RLS enabled. Writes go through `service_role` only (server actions).

| Table | Public read policy |
|---|---|
| `organizers` | All rows |
| `submitters` | All rows |
| `competitions` | All rows |
| `entries` | `status = 'submitted'` only — drafts are private |
| `registrations` | None public |
| `questions` | `is_public = true` |

---

## Migrations

Applied in order via Supabase Dashboard → SQL Editor:

| File | Description |
|---|---|
| `0001_initial.sql` | Core schema: organizers, submitters, competitions |
| `0002_entries.sql` | Entries table |
| `0003_draft_status.sql` | Adds `draft` to competition status enum |
| `0004_storage_buckets.sql` | Supabase Storage bucket for entry file uploads |
| `0005_registrations.sql` | Competition registrations |
| `0006_questions.sql` | Q&A system |
| `0007_entry_visibility.sql` | `hidden_by_submitter` on entries |
| `0008_original_deadline.sql` | Deadline extension tracking |
| `0009_competition_drafts.sql` | Competition draft state |
| `0010_anonymous_judging.sql` | `anonymous_id` on entries for blind jury review |
