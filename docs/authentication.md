---
title: "Authentication"
order: 4
description: "Privy embedded wallets, session flow, and how Privy user IDs bridge to database records."
---

## Provider

[Privy](https://privy.io) handles all authentication. Users never see a seed phrase or manage a wallet manually — Privy creates an embedded wallet silently and links it to their email or social login.

The Privy app is configured in `src/components/providers/Providers.tsx`. App ID is `NEXT_PUBLIC_PRIVY_APP_ID`.

## Session flow

```
1. User clicks login / sign-up
2. Privy modal opens — email, Google, or wallet
3. Privy issues a signed JWT (access token)
4. Frontend calls getAccessToken() from usePrivy()
5. Access token is passed to server actions as the first argument
6. Server action calls getPrivyServer().verifyAuthToken(token)
7. verifyAuthToken() returns { userId } — the stable Privy user ID
8. Server action looks up organizers or submitters by privy_user_id = userId
```

The Privy server client is in `src/lib/privy/server.ts`:

```typescript
import { PrivyClient } from "@privy-io/server-auth";
export function getPrivyServer() {
  return new PrivyClient(
    process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
    process.env.PRIVY_APP_SECRET!
  );
}
```

## User types

Two database user types exist: **organizers** and **submitters**. They are separate tables — a single Privy user can only be one type (enforced by unique `privy_user_id` per table). There is currently no admin user type; platform-level operations use the service role key directly.

## Creating a profile

On first login, a user has a Privy identity but no organizer/submitter record. Profile creation (`/account` page) calls the `updateProfile` server action which upserts a record in the appropriate table, setting `privy_user_id` to the verified user ID.

## Embedded wallets

Privy creates an embedded EVM wallet for each user. The wallet address is stored in the database (`organizers.wallet_address`, `submitters.wallet_address`) and used for on-chain interactions — funding escrows, claiming prizes.

The wallet is non-custodial: Privy shards the key so neither the user nor Privy alone can reconstruct it. Users can export the key if they want full custody later.

## Server action pattern

Every mutating server action follows this pattern:

```typescript
export async function someAction(accessToken: string, ...args) {
  // 1. Verify the caller
  const { userId } = await getPrivyServer().verifyAuthToken(accessToken);

  // 2. Look up their database record
  const { data: org } = await supabaseAdmin()
    .from("organizers")
    .select("id")
    .eq("privy_user_id", userId)
    .maybeSingle();

  if (!org) throw new Error("No account found.");

  // 3. Do the thing
}
```

Never trust a `userId` or record ID passed from the client. Always derive it from the verified token.

## Environment variables

```
NEXT_PUBLIC_PRIVY_APP_ID=   # Public — used in browser and server
PRIVY_APP_SECRET=           # Server-only — never expose to client
```
