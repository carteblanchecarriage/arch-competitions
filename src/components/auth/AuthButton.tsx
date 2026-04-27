"use client";

import { LoginButton } from "./LoginButton";
import { UserMenu } from "./UserMenu";

let usePrivy: () => { ready: boolean; authenticated: boolean };
try {
  usePrivy = require("@privy-io/react-auth").usePrivy;
} catch {
  // Privy not available
}

export function AuthButton() {
  try {
    const { ready, authenticated } = usePrivy();

    if (!ready) {
      return <div className="h-10 w-20 animate-pulse rounded-lg bg-gray-100" />;
    }

    return authenticated ? <UserMenu /> : <LoginButton />;
  } catch {
    // Privy provider not mounted (no app ID configured)
    return null;
  }
}
