"use client";

import { useState, useEffect } from "react";
import { useAccount, useReadContract, useChainId } from "wagmi";
import { usePrivy, useFundWallet } from "@privy-io/react-auth";
import { erc20Abi, formatUnits, type Address } from "viem";
import { base, baseSepolia } from "viem/chains";
import { competitionEscrowAbi } from "@/lib/contracts/generated";
import { useFundCompetition } from "@/hooks/useFundCompetition";
import { USDC_BY_CHAIN, USDC_DECIMALS } from "@/lib/contracts/addresses";
import { Button } from "@/components/ui/Button";

function formatPool(value: bigint | undefined): string {
  if (value === undefined) return "—";
  const dollars = Number(formatUnits(value, USDC_DECIMALS));
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: dollars % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(dollars);
}

export function FundCompetitionPanel({
  escrowAddress: escrowProp,
  chainId,
  initialAmount,
}: {
  escrowAddress?: string;
  chainId?: number;
  initialAmount?: string;
}) {
  const [amount, setAmount] = useState(initialAmount ?? "");
  const { ready, authenticated, login } = usePrivy();
  const { isConnected } = useAccount();

  const escrowAddress = escrowProp as Address | undefined;

  const { data: totalContributed } = useReadContract({
    abi: competitionEscrowAbi,
    address: escrowAddress,
    functionName: "totalContributed",
    query: { enabled: !!escrowAddress, refetchInterval: 5000 },
  });

  const { fund, step, error, canFund, isBusy, isWrongNetwork, needsApproval, amountWei } =
    useFundCompetition({ escrowAddress, amount });

  const walletChainId = useChainId();
  const { address: account } = useAccount();
  const { fundWallet } = useFundWallet();

  const usdc = USDC_BY_CHAIN[walletChainId];
  const { data: usdcBalance } = useReadContract({
    abi: erc20Abi,
    address: usdc,
    functionName: "balanceOf",
    args: account ? [account] : undefined,
    query: { enabled: !!account && !!usdc, refetchInterval: 8000 },
  });

  const balance = (usdcBalance as bigint | undefined) ?? 0n;
  const shortfall = amountWei > balance ? amountWei - balance : 0n;
  const needsOnramp = shortfall > 0n;

  function handleAddFunds() {
    if (!account) return;
    const chain = walletChainId === base.id ? base : baseSepolia;
    const shortfallAmount = formatUnits(shortfall, USDC_DECIMALS);
    fundWallet({ address: account, options: { chain, asset: "USDC", amount: shortfallAmount } });
  }

  useEffect(() => {
    if (step === "done") setAmount("");
  }, [step]);

  if (!escrowAddress) {
    return (
      <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
        Escrow not yet deployed for this competition. Run{" "}
        <code className="font-mono">npm run deploy:escrows</code> to create it.
      </div>
    );
  }

  if (!ready) {
    return (
      <Button disabled className="mt-4 w-full">
        Loading…
      </Button>
    );
  }

  if (!authenticated || !isConnected) {
    return (
      <div className="mt-4 space-y-2">
        <div className="text-xs text-gray-500">
          Verified pool: {formatPool(totalContributed as bigint | undefined)}
        </div>
        <Button onClick={login} className="w-full">
          Sign in to fund
        </Button>
      </div>
    );
  }

  const formattedAmount = amount ? `$${amount}` : "$0";
  const buttonLabel = (() => {
    switch (step) {
      case "switchingChain":
        return "Switching network…";
      case "approving":
        return "Approving payment…";
      case "approveCooldown":
        return "Confirming approval…";
      case "funding":
        return "Funding…";
      case "done":
        return `Funded ${formattedAmount} ✓`;
      default:
        return needsApproval
          ? `Approve & Fund ${formattedAmount}`
          : `Fund ${formattedAmount}`;
    }
  })();

  return (
    <div className="mt-4 space-y-3">
      <div className="text-xs text-gray-500">
        Verified pool:{" "}
        <span className="font-mono text-gray-700">
          {formatPool(totalContributed as bigint | undefined)}
        </span>
      </div>

      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-sm text-gray-400">
          $
        </span>
        <input
          type="number"
          min="0"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          disabled={isBusy}
          className="w-full rounded-md border border-gray-200 bg-white py-2 pl-7 pr-3 text-sm focus:border-gray-400 focus:outline-none disabled:bg-gray-50 disabled:text-gray-400"
        />
      </div>

      {/* USDC balance + onramp */}
      <div className="flex items-center justify-between text-[11px] text-gray-400">
        <span>
          Your USDC balance:{" "}
          <span className={needsOnramp && amountWei > 0n ? "text-amber-600" : "text-gray-600"}>
            {formatUnits(balance, USDC_DECIMALS) === "0"
              ? "$0"
              : `$${Number(formatUnits(balance, USDC_DECIMALS)).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          </span>
        </span>
        {needsOnramp && amountWei > 0n && (
          <button
            type="button"
            onClick={handleAddFunds}
            className="text-[11px] font-medium text-gray-700 underline decoration-gray-300 hover:text-gray-900"
          >
            Add ${Number(formatUnits(shortfall, USDC_DECIMALS)).toFixed(2)} USDC →
          </button>
        )}
      </div>

      <div className="rounded-md border border-amber-100 bg-amber-50 px-3 py-2 text-[11px] leading-relaxed text-amber-800">
        <strong>Funds are locked once deposited.</strong> Prize money is held in
        escrow and cannot be withdrawn or returned by the organizer — only Arch
        can authorize a cancellation. This protects everyone who enters.
      </div>

      <Button onClick={fund} disabled={!canFund} className="w-full">
        {buttonLabel}
      </Button>

      {isWrongNetwork && step !== "switchingChain" && (
        <div className="text-xs text-amber-700">
          Connected to the wrong network — clicking Fund will switch you to Base Sepolia.
        </div>
      )}

      {error && (
        <div className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">{error}</div>
      )}

      {step === "done" && (
        <div className="rounded-md bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
          ✓ Contribution sent. Pool refreshes shortly.
        </div>
      )}

      <details className="text-[11px] text-gray-400">
        <summary className="cursor-pointer hover:text-gray-600">How are funds held?</summary>
        <p className="mt-2 leading-relaxed">
          Contributions are held in a verified escrow on Base, denominated in
          USDC (a regulated, fully-reserved digital dollar). Prizes pay out
          1:1 with the dollar amounts shown.
        </p>
        {escrowAddress && (
          <p className="mt-1.5 font-mono text-[10px] break-all">
            Contract:{" "}
            <a
              href={`https://${chainId === 8453 ? "" : "sepolia."}basescan.org/address/${escrowAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 underline decoration-gray-300 hover:text-gray-700"
            >
              {escrowAddress}
            </a>
          </p>
        )}
      </details>
    </div>
  );
}
