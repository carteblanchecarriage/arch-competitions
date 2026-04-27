"use client";

import { usePrivy } from "@privy-io/react-auth";

export function LoginButton() {
  const { login } = usePrivy();

  return (
    <button
      onClick={login}
      className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
    >
      Sign In
    </button>
  );
}
