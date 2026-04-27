"use client";

import { useCallback, useState } from "react";
import {
  useAccount,
  useChainId,
  usePublicClient,
  useReadContract,
  useSwitchChain,
  useWriteContract,
} from "wagmi";
import { erc20Abi, parseUnits, type Address } from "viem";
import { baseSepolia } from "viem/chains";
import { competitionEscrowAbi } from "@/lib/contracts/generated";
import { USDC_BY_CHAIN, USDC_DECIMALS, isSupportedChain } from "@/lib/contracts/addresses";
import { parseEscrowError } from "@/lib/contracts/errors";

/**
 * Step machine for the fund flow. Drives button label + disabled state.
 *
 * idle             → user hasn't submitted yet
 * switchingChain   → asking wallet to switch network (covers wrong-network case)
 * approving        → approval tx sent, waiting for tx hash + confirmation
 * approveCooldown  → confirmation in; sleeping while allowance refetch propagates
 * funding          → fund() tx sent, waiting for confirmation
 * done             → success
 * error            → failure; `error` field carries the message
 */
export type FundStep =
  | "idle"
  | "switchingChain"
  | "approving"
  | "approveCooldown"
  | "funding"
  | "done"
  | "error";

const APPROVE_COOLDOWN_MS = 4000;

interface UseFundCompetitionArgs {
  escrowAddress: Address | undefined;
  /** Human-readable USDC amount, e.g. "100" for 100 USDC. Empty string disables. */
  amount: string;
}

export function useFundCompetition({ escrowAddress, amount }: UseFundCompetitionArgs) {
  const { address: account } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();

  const [step, setStep] = useState<FundStep>("idle");
  const [error, setError] = useState<string | null>(null);

  const usdc = USDC_BY_CHAIN[chainId];
  const amountWei = (() => {
    if (!amount) return 0n;
    try {
      return parseUnits(amount, USDC_DECIMALS);
    } catch {
      return 0n;
    }
  })();

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    abi: erc20Abi,
    address: usdc,
    functionName: "allowance",
    args: account && escrowAddress ? [account, escrowAddress] : undefined,
    query: { enabled: !!account && !!usdc && !!escrowAddress },
  });

  const isWrongNetwork = !isSupportedChain(chainId);
  const needsApproval = (allowance ?? 0n) < amountWei;
  const isBusy =
    step === "switchingChain" ||
    step === "approving" ||
    step === "approveCooldown" ||
    step === "funding";
  const canFund = !!account && !!usdc && !!escrowAddress && amountWei > 0n && !isBusy;

  const fund = useCallback(async () => {
    if (!account || !usdc || !escrowAddress || amountWei === 0n || !publicClient) return;

    setError(null);
    try {
      if (isWrongNetwork) {
        setStep("switchingChain");
        await switchChainAsync({ chainId: baseSepolia.id });
      }

      if (needsApproval) {
        setStep("approving");
        const approveHash = await writeContractAsync({
          abi: erc20Abi,
          address: usdc,
          functionName: "approve",
          args: [escrowAddress, amountWei],
          chainId: baseSepolia.id, // refuse to submit on a different chain
        });
        await publicClient.waitForTransactionReceipt({ hash: approveHash });

        // Cover the gap between confirmation and allowance cache refresh.
        setStep("approveCooldown");
        await new Promise((r) => setTimeout(r, APPROVE_COOLDOWN_MS));
        await refetchAllowance();
      }

      setStep("funding");
      const fundHash = await writeContractAsync({
        abi: competitionEscrowAbi,
        address: escrowAddress,
        functionName: "fund",
        args: [amountWei],
        chainId: baseSepolia.id,
      });
      await publicClient.waitForTransactionReceipt({ hash: fundHash });

      setStep("done");
    } catch (e) {
      setError(parseEscrowError(e));
      setStep("error");
    }
  }, [
    account,
    usdc,
    escrowAddress,
    amountWei,
    publicClient,
    isWrongNetwork,
    needsApproval,
    switchChainAsync,
    writeContractAsync,
    refetchAllowance,
  ]);

  const reset = useCallback(() => {
    setStep("idle");
    setError(null);
  }, []);

  return {
    fund,
    reset,
    step,
    error,
    canFund,
    isBusy,
    isWrongNetwork,
    needsApproval,
    amountWei,
  };
}
