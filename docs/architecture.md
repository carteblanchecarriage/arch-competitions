---
title: "Architecture Overview"
order: 1
description: "How the platform fits together — frontend, database, smart contracts, and auth."
---

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router), Tailwind CSS v4, TypeScript |
| Auth | Privy (embedded wallets, social login) |
| Database | Supabase (Postgres + RLS + Storage) |
| Smart contracts | Solidity 0.8.24, Foundry, deployed on Base |
| Token | USDC (ERC-20) on Base mainnet / Base Sepolia |
| Hosting | Vercel |

## Request Flow

```
Browser
  → Next.js App Router (server components + server actions)
  → Supabase (Postgres) for off-chain data
  → Base RPC for on-chain reads (prize pool balance, payout status)
  → CompetitionEscrow contract for prize management
```

Auth is handled entirely by Privy. Users log in via email/social and receive an embedded wallet. The Privy user ID is the bridge between the auth session and Supabase records (`organizers.privy_user_id`, `submitters.privy_user_id`).

Server actions verify the caller's Privy JWT before any mutation. Supabase writes always go through the `service_role` key (server-only) — the anon key is read-only for public data.

## Data model summary

Two types of platform users:

- **Organizers** — create and manage competitions, fund prize pools, announce winners
- **Submitters** — register for competitions, submit entries, claim prizes

A **Competition** belongs to one Organizer and has many **Entries** (one per Submitter). Each competition has a corresponding **CompetitionEscrow** contract that holds the prize pool on-chain.

## Competition lifecycle

```
draft → open → judging → announced
```

- **draft**: created but not yet funded. Escrow is deployed but empty.
- **open**: funded and accepting submissions. Prize pool locked in escrow.
- **judging**: deadline passed. Submissions closed. Organizer reviewing entries anonymously.
- **announced**: winners selected. Prize amounts assigned on-chain. Winners can claim.

Status transitions happen in the database (via server actions). The escrow contract has its own state machine (`Funding → Locked → Resolved / Cancelled`) that mirrors this loosely.

## Monorepo layout

```
/
├── src/                  Next.js application
│   ├── app/              Pages and server actions
│   ├── components/       React components
│   ├── data/             Static data layer and types
│   └── lib/              Utilities, blog/docs parsing, Privy, Supabase clients
├── contracts/            Foundry project (Solidity)
│   ├── src/              Contract source
│   └── test/             Foundry tests
├── blog/                 Markdown blog posts
├── docs/                 Markdown developer docs (this)
├── supabase/
│   └── migrations/       SQL migration files
└── visual-identity/      Design reference documents
```
