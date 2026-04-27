"use client";

import { useEffect, useRef } from "react";
import { useChainId, useSwitchChain } from "wagmi";
import { usePrivy } from "@privy-io/react-auth";
import { base, baseSepolia } from "viem/chains";

const TARGET_CHAIN_ID =
  process.env.NODE_ENV === "production" ? base.id : baseSepolia.id;

/**
 * Force the connected wallet onto Base / Base Sepolia after authentication.
 *
 * Privy's `supportedChains` restricts what the dApp will *use*, but if a user
 * connects MetaMask while it's on Polygon (or any other chain), signature
 * requests can still display the wallet's active chain in the prompt and
 * EIP-712 domain. Auto-switching post-login closes that gap.
 *
 * Renders nothing.
 */
export function ChainEnforcer() {
  const { ready, authenticated } = usePrivy();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const lastAttemptRef = useRef<number>(0);

  useEffect(() => {
    if (!ready || !authenticated) return;
    if (chainId === TARGET_CHAIN_ID) return;

    // Throttle to once per 3s per chainId change so a user-rejected switch
    // doesn't spam them with prompts.
    const now = Date.now();
    if (now - lastAttemptRef.current < 3000) return;
    lastAttemptRef.current = now;

    switchChainAsync({ chainId: TARGET_CHAIN_ID }).catch((e) => {
      console.warn("[ChainEnforcer] switchChain failed:", e);
    });
  }, [ready, authenticated, chainId, switchChainAsync]);

  return null;
}
