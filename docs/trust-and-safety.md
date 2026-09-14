---
title: "Trust & Safety"
order: 9
description: "What the platform actually does to keep content and payouts safe — and what it doesn't cover."
---

## Content moderation

Any competition or entry can be removed from public view by an admin (`/admin`, gated by the `ADMIN_EMAILS` allowlist — see `src/lib/admin.ts`). Removal is a visibility flag (`admin_removed`), not a status change: it doesn't touch a competition's on-chain escrow, which keeps following its normal release rules regardless.

Anyone — no account required — can flag a competition via the "Report" link on its page (`src/components/ui/ReportButton.tsx`). Reports land in the **Reports** tab in `/admin`, which is the first thing you see there.

**What this doesn't cover:** moderation is reactive. Nothing scans uploaded content automatically before it goes live — it relies on someone (you, or a reporter) seeing it.

## Upload hardening

`getSignedUploadUrl` (`src/app/actions/storage.ts`) restricts uploads to an allowlist of buckets, a path format that can't be guessed or collided (`<random-uuid>/<safe-filename>`), and a per-bucket file-extension allowlist — enforced server-side, not just as a client-side `accept=` hint. SVGs are excluded platform-wide (an uploaded SVG opened directly, not via `<img>`, can execute embedded `<script>`).

**What this doesn't cover:** file *content* isn't scanned — extension/size checks stop obvious abuse (wrong file type, oversized uploads), not someone uploading disallowed content in an allowed format.

## Sanctions screening

Every wallet funding a prize pool is checked against OFAC's published list of sanctioned cryptocurrency addresses (`src/lib/sanctions.ts`, data in `src/data/sanctioned-addresses.json`) before any transaction is submitted. The list is regenerated from OFAC's live SDN feed via `npm run sync:ofac` and committed to the repo — see the script's header comment for why this is a static file rather than a live sync, and for the review-the-diff workflow.

**What this doesn't cover:** this only catches addresses OFAC has explicitly published. It has no address-clustering or indirect-exposure analysis, and it can't reach anyone who interacts with the escrow contract directly instead of through this app. It's a floor, not a substitute for real transaction monitoring (Chainalysis/TRM/Elliptic) at meaningful volume.

## Why this doc exists

None of the above makes any legal claim about compliance — see the [Terms of Service](/terms) for what's actually represented to users. This page exists so it's clear, in one place, exactly what real, concrete measures are in place today, and exactly where their edges are — rather than that being scattered across commit messages or implied by marketing copy.
