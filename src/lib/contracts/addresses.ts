import { type Address } from "viem";
import { base, baseSepolia } from "viem/chains";

/// Native (Circle-issued) USDC. Verified on-chain — see ETHSKILLS `addresses` skill.
export const USDC_BY_CHAIN: Record<number, Address> = {
  [base.id]: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  [baseSepolia.id]: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
};

/// CompetitionEscrowFactory addresses, populated from env after deploy.
export const FACTORY_BY_CHAIN: Record<number, Address | undefined> = {
  [base.id]: process.env.NEXT_PUBLIC_FACTORY_ADDRESS_BASE as Address | undefined,
  [baseSepolia.id]: process.env.NEXT_PUBLIC_FACTORY_ADDRESS_BASE_SEPOLIA as Address | undefined,
};

export const USDC_DECIMALS = 6;

export function isSupportedChain(chainId: number | undefined): boolean {
  return chainId === base.id || chainId === baseSepolia.id;
}
