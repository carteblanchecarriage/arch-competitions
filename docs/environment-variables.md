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

## Ramp Network

```
NEXT_PUBLIC_RAMP_API_KEY=
```
Powers the **off-ramp** "Withdraw to bank" button (`WithdrawButton.tsx`) — sells USDC for fiat, the reverse of funding a prize pool. Get a key from [dashboard.ramp.network](https://dashboard.ramp.network). There's no demo fallback: leave it blank and the button just shows "Bank withdrawal coming soon."

Buying USDC to fund a prize pool (on-ramp) is a separate flow handled by Privy's `useFundWallet` in `FundCompetitionPanel.tsx` — it doesn't use this key.

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
| `NEXT_PUBLIC_RAMP_API_KEY` | ✓ | ✓ |

Variables prefixed `NEXT_PUBLIC_` are bundled into the client build. All others are server-only.
