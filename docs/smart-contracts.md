---
title: "Smart Contracts"
order: 3
description: "CompetitionEscrow and CompetitionEscrowFactory — architecture, state machine, and key functions."
---

## Overview

Two contracts, both in `contracts/src/`:

- **`CompetitionEscrowFactory`** — singleton, deploys one escrow per competition using EIP-1167 minimal proxy (clone) pattern
- **`CompetitionEscrow`** — holds USDC for one competition; manages funding, locking, winner payout, and refunds

All funds are USDC on Base (mainnet: `8453`, Sepolia testnet: `84532`).

---

## CompetitionEscrowFactory

Deployed once. The factory is `Ownable` — the platform controls fee settings and can upgrade the implementation for future competitions (existing escrows are unaffected).

### Key functions

| Function | Who | Description |
|---|---|---|
| `createEscrow(competitionId, token, prizeShareBps, submissionDeadline, expirationTimestamp)` | Organizer | Deploys a deterministic clone. Caller becomes `organizer` on the escrow. |
| `predictEscrow(organizer, competitionId)` | Anyone | Returns the address a future escrow will be deployed to, before deployment. |
| `setFee(newBps)` | Owner | Update platform fee for future escrows (max 10%). Existing escrows keep their fee snapshot. |
| `setFeeRecipient(addr)` | Owner | Update where fees flow. |
| `setImplementation(addr)` | Owner | Upgrade the implementation for future clones. |

### Salt derivation

Escrow addresses are deterministic:

```
salt = keccak256(abi.encodePacked(organizer, competitionId))
escrow = CREATE2(implementation, salt)
```

This means the escrow address is predictable before deployment — the frontend can display it to the organizer before they fund it.

---

## CompetitionEscrow

Each competition gets its own escrow clone. No proxy admin, no upgradeability — immutable after `initialize()`.

### State machine

```
Funding → Locked → Resolved
                 ↘ Cancelled
```

- **Funding** — escrow is deployed and accepting deposits
- **Locked** — organizer has called `lock()` after the submission deadline passes; no new contributions
- **Resolved** — `announceWinners()` called; prize amounts assigned; fee taken; winners can claim
- **Cancelled** — triggered if `expirationTimestamp` passes without resolution; contributors can refund

### Key functions

| Function | Who | Description |
|---|---|---|
| `fund(amount)` | Anyone | Deposit USDC. Updates `totalContributed` and `contributions[msg.sender]`. |
| `lock()` | Organizer | Move from `Funding` → `Locked`. Can only happen after `submissionDeadline`. |
| `announceWinners(winners[])` | Organizer | Move from `Locked` → `Resolved`. `winners` array must match `prizeShareBps` length. Computes prize amounts from pool, deducts platform fee (sent immediately to `feeRecipient`), assigns `prizeOf[winner]`. |
| `claimPrize()` | Winner | Pull prize. Reverts with `NothingToClaim` if not a winner. |
| `cancel()` | Anyone | Move to `Cancelled` if past `expirationTimestamp`. |
| `claimRefund()` | Contributor | Pull contribution back after cancellation. |

### Prize calculation

```
netPool = totalContributed * (10_000 - feeBps) / 10_000
prizeOf[winners[i]] = netPool * prizeShareBps[i] / 10_000
```

`prizeShareBps` is set at initialization and sums to `10_000`. Example for a three-tier competition:

```
[6000, 3000, 1000]  → 60% / 30% / 10%
```

Because shares are basis-point percentages of the final pool, open-pool competitions automatically scale all prizes as contributors add funds.

### Security properties

- **Pull payments only** — no push transfers to winners or contributors
- **Reentrancy guard** on all state-changing functions
- **Fee capped** at 10% (`MAX_FEE_BPS = 1000`)
- **Expiration rescue** — if organizer disappears, `expirationTimestamp` unlocks refunds for everyone
- **Fee snapshot** — platform fee is locked at escrow creation; factory owner changes don't affect existing escrows

---

## Deployment

Contracts are compiled and deployed with Foundry. The deployer wallet is configured via `DEPLOYER_PRIVATE_KEY` in `.env`. The escrow is deployed server-side when an organizer creates a competition via the `deployEscrow` server action.

After deployment, `escrow_address` and `chain_id` are saved to the `competitions` table.

To predict an escrow address before deployment:

```typescript
const predicted = await publicClient.readContract({
  address: FACTORY_ADDRESS,
  abi: factoryAbi,
  functionName: "predictEscrow",
  args: [organizerAddress, competitionIdHash],
});
```

---

## Addresses

Set via environment variables:

```
NEXT_PUBLIC_FACTORY_ADDRESS_BASE=0x...       # Base mainnet
NEXT_PUBLIC_FACTORY_ADDRESS_BASE_SEPOLIA=0x... # Base Sepolia (dev)
```
