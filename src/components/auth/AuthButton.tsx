"use client";

import { LoginButton } from "./LoginButton";
import { UserMenu } from "./UserMenu";
import { usePrivy } from "@privy-io/react-auth";

export function AuthButton() {
  const { ready, authenticated } = usePrivy();

  // Show login button immediately; swap to UserMenu once Privy confirms auth.
  // This avoids a permanent gray skeleton when Privy is slow to initialize.
  if (!ready || !authenticated) {
    return <LoginButton />;
  }

  return <UserMenu />;
}
