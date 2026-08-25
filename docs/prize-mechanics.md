---
title: "Prize Mechanics"
order: 7
description: "How prize pools are funded, split, distributed, and what happens when things go wrong."
---

## Fixed vs. open pools

**Fixed pool** — organizer deposits a set USDC amount at competition creation. Prize breakdown is fixed (`$5,000 first / $2,000 second / $1,000 third`).

**Open pool** — anyone can contribute to grow the pool. Prize breakdown is expressed as basis-point percentages (`[6000, 3000, 1000]` = 60/30/10%). As the pool grows, all prizes scale proportionally.

`is_open_pool` on the `competitions` table determines which type.

## Platform fee

5% on every fund flow. Hard-coded at escrow creation time — the factory owner cannot raise the fee on existing escrows.

```
fee = totalContributed * feeBps / 10_000
netPool = totalContributed - fee
prizeOf[winner_i] = netPool * prizeShareBps[i] / 10_000
```

The fee is transferred to `feeRecipient` immediately when `announceWinners()` is called on the escrow. Winner prizes are pull-based — winners must call `claimPrize()`.

## Cancellation

A competition can be cancelled in two scenarios:

1. **Organizer cancels** — before the competition goes live or within the first 24 hours. 50% of the prize pool is distributed to registered designers (as compensation for planning to submit). 50% is refunded to the organizer.

2. **Expiration** — if `expirationTimestamp` passes without `announceWinners()` being called, anyone can call `cancel()` on the escrow. All contributors can then `claimRefund()` their original deposit proportionally.

## Lapse protection — 30-day winner selection window

After the submission deadline passes, organizers have **30 days** to select winners. If no winner is announced in that window, anyone can trigger equal distribution of the full prize pool to all registered submitters.

This is the `expirationTimestamp` in the escrow contract:

```
expirationTimestamp = submissionDeadline + 30 days
```

The platform UI shows this countdown to organizers. Registered submitters can also see how long remains.

## Deadline extension rules

Organizers can extend the submission deadline with constraints:

- **Within 24h of creation**: any deadline allowed (shorten or extend)
- **After 24h**: extension only; new deadline must be ≤ original + 90 days

`original_submission_deadline` is stored on competition creation and never updated, so the cap is always calculated correctly.

## Prize claim flow (on-chain)

```
1. Organizer calls announceWinners([addr1, addr2, addr3]) on escrow
2. Escrow calculates prize amounts from pool
3. Fee sent to feeRecipient immediately
4. prizeOf[addr_i] assigned (pull model)
5. Competition status → "announced" in DB
6. Winners see "Claim Prize" button on platform
7. Winner calls claimPrize() — pulls their allocation
```

Winners need their embedded wallet connected to claim. The wallet address stored in `submitters.wallet_address` is used.

## Minimum prize pool

$100 USDC minimum to list. Below this threshold, the `publishCompetition` action will reject the publication request.
