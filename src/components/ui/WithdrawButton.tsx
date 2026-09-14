"use client";

import { useState } from "react";
import { useReadContract, useChainId } from "wagmi";
import { useWallets } from "@privy-io/react-auth";
import { erc20Abi, formatUnits } from "viem";
import { USDC_BY_CHAIN, USDC_DECIMALS } from "@/lib/contracts/addresses";

// Off-ramp (withdraw USDC to bank) is moving from Ramp Network to Fun
// (fun.xyz) — see docs/environment-variables.md. Fun's checkout SDK
// (@funkit/connect) is in closed beta as of 2026-09; wiring it in requires
// requesting access from developers@fun.xyz first. Left disabled until then
// rather than guessing at an unverified integration.

export function WithdrawButton() {
  const { wallets } = useWallets();
  const chainId = useChainId();
  const usdc = USDC_BY_CHAIN[chainId];
  const [showAddress, setShowAddress] = useState(false);

  // Always use the Privy embedded wallet so the balance reflects the current
  // logged-in user rather than whatever external wallet wagmi has connected.
  const embeddedWallet = wallets.find((w) => w.walletClientType === "privy");
  const address = embeddedWallet?.address as `0x${string}` | undefined;

  const { data: balance } = useReadContract({
    abi: erc20Abi,
    address: usdc,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address && !!usdc, refetchInterval: 10000 },
  });

  const balanceBigInt = (balance as bigint | undefined) ?? 0n;
  const hasBalance = balanceBigInt > 0n;
  const formatted = `$${Number(formatUnits(balanceBigInt, USDC_DECIMALS)).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  const shortAddr = address
    ? `${address.slice(0, 6)}…${address.slice(-4)}`
    : null;

  return (
    <div className="mt-4  border border-gray-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            USDC Balance
          </div>
          <div className="mt-1 text-lg font-semibold text-gray-900">
            {hasBalance ? formatted : "$0.00"}
          </div>
          <div className="mt-0.5 text-[11px] text-gray-400">Available to withdraw</div>
        </div>
        <span className="text-xs text-gray-400">Bank withdrawal coming soon</span>
      </div>

      {/* Wallet address — subtle reference for the user, hidden by default */}
      {shortAddr && (
        <div className="mt-4 border-t border-gray-100 pt-3">
          <button
            onClick={() => setShowAddress((v) => !v)}
            className="text-[10px] text-gray-300 hover:text-gray-400 transition-colors"
          >
            {showAddress ? "hide address" : "wallet address"}
          </button>
          {showAddress && (
            <p className="mt-1 font-mono text-[10px] break-all text-gray-400 select-all">
              {address}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
