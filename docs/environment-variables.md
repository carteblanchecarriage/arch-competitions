---
title: "Environment Variables"
order: 8
description: "Every environment variable, what it does, and where it's used."
---

Copy `.env.example` to `.env.local` to get started. Never commit `.env.local`.

---

## Privy

```
NEXT_PUBLIC_PRIVY_APP_ID=
```
Your Privy app ID. Used in both browser and server. Get it from [dashboard.privy.io](https://dashboard.privy.io) → Settings → API keys.

```
PRIVY_APP_SECRET=
```
Server-only. Used to verify Privy JWTs in server actions. Never expose to the browser.

---

## Supabase

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```
Public. Used for read-only queries from the browser and server components.

```
SUPABASE_SERVICE_ROLE_KEY=
```
Server-only. Bypasses RLS. Used in all server actions that write to the database. Required for: seeding, escrow deployment, all mutations.

---

## RPC endpoints

```
NEXT_PUBLIC_BASE_RPC_URL=https://base-mainnet.g.alchemy.com/v2/YOUR_KEY
NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL=https://base-sepolia.g.alchemy.com/v2/YOUR_KEY
```
Used by the frontend to read on-chain state (escrow balance, payout status). Public endpoints work for dev but rate-limit aggressively. Use a dedicated Alchemy/Infura/QuickNode key for production.

---

## Contract addresses

```
NEXT_PUBLIC_FACTORY_ADDRESS_BASE=
NEXT_PUBLIC_FACTORY_ADDRESS_BASE_SEPOLIA=
```
Populated after running the Foundry deploy script. See `contracts/deployments/<chainId>.json` after deployment.

---

## Deployer wallet

```
DEPLOYER_PRIVATE_KEY=0x
```
Private key (with `0x` prefix) of the wallet used to deploy escrow contracts server-side when an organizer creates a competition. This wallet needs a small ETH balance for gas (~0.01 ETH on testnet, fund accordingly on mainnet).

**This wallet does not hold user funds.** It only signs the `createEscrow()` factory call. Prize USDC is deposited directly to the escrow by the organizer.

Keep this server-only and never commit it.

---

## Off-ramp (withdraw to bank)

No env var yet. `WithdrawButton.tsx` shows "Bank withdrawal coming soon" — this flow previously used Ramp Network and is moving to Fun (fun.xyz). Fun's checkout SDK (`@funkit/connect`) is in closed beta as of 2026-09; wiring it in requires requesting access from developers@fun.xyz first, and resolving a peer-dependency conflict (`@funkit/connect` requires `wagmi <=3.6.1`; this repo is on `^3.6.4`).

Buying USDC to fund a prize pool (on-ramp) is a separate flow handled by Privy's `useFundWallet` in `FundCompetitionPanel.tsx` — unaffected by this.

---

## Resend

```
RESEND_API_KEY=
```
Server-only. Get it from [resend.com](https://resend.com) → API Keys.

```
RESEND_FROM_EMAIL=
```
Server-only. The `From` header for outgoing mail, e.g. `Counterparti <notifications@counterparti.com>`. The domain must be verified in Resend (Domains → Add Domain → add the DNS records it gives you) or sends will fail.

This is for transactional email only (registration confirmations, notifications) via `getResend()` in `src/lib/resend/client.ts`. It is **not** involved in login — Privy's email login sends its own one-time passcode, so there's no password/reset flow for this app to own.

---

## Variable access summary

| Variable | Browser | Server |
|---|---|---|
| `NEXT_PUBLIC_PRIVY_APP_ID` | ✓ | ✓ |
| `PRIVY_APP_SECRET` | ✗ | ✓ |
| `NEXT_PUBLIC_SUPABASE_URL` | ✓ | ✓ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✓ | ✓ |
| `SUPABASE_SERVICE_ROLE_KEY` | ✗ | ✓ |
| `NEXT_PUBLIC_BASE_RPC_URL` | ✓ | ✓ |
| `NEXT_PUBLIC_FACTORY_ADDRESS_BASE` | ✓ | ✓ |
| `DEPLOYER_PRIVATE_KEY` | ✗ | ✓ |
| `RESEND_API_KEY` | ✗ | ✓ |
| `RESEND_FROM_EMAIL` | ✗ | ✓ |

Variables prefixed `NEXT_PUBLIC_` are bundled into the client build. All others are server-only.
