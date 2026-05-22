"use client";

import { useAccount, useReadContract, useChainId } from "wagmi";
import { erc20Abi, formatUnits } from "viem";
import { base } from "viem/chains";
import { USDC_BY_CHAIN, USDC_DECIMALS } from "@/lib/contracts/addresses";

const IS_PROD = process.env.NODE_ENV === "production";
const RAMP_API_KEY = process.env.NEXT_PUBLIC_RAMP_API_KEY ?? "";

export function WithdrawButton() {
  const { address } = useAccount();
  const chainId = useChainId();
  const usdc = USDC_BY_CHAIN[chainId];

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

  async function handleWithdraw() {
    if (!address) return;
    const { RampInstantSDK } = await import("@ramp-network/ramp-instant-sdk");
    const baseConfig = {
      hostAppName: "Arch Competitions",
      hostLogoUrl: `${window.location.origin}/logo.png`,
      offrampAsset: "BASE_USDC",
      userAddress: address,
      swapAmount: balanceBigInt.toString(),
      defaultFlow: "OFFRAMP" as const,
      enabledFlows: ["OFFRAMP" as const],
    };
    new RampInstantSDK(
      IS_PROD && RAMP_API_KEY
        ? { ...baseConfig, hostApiKey: RAMP_API_KEY }
        : { ...baseConfig, url: "https://app.demo.ramp.network" }
    ).show();
  }

  return (
    <div className="mt-4 rounded-xl border border-gray-200 bg-white p-6">
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
        <button
          onClick={handleWithdraw}
          disabled={!address}
          className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-gray-400 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Withdraw to bank
        </button>
      </div>
    </div>
  );
}
