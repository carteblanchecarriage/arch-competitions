import { BaseError, ContractFunctionRevertedError, UserRejectedRequestError } from "viem";

/// Maps Solidity custom-error names from CompetitionEscrow / Factory to UI strings.
const ESCROW_ERRORS: Record<string, string> = {
  InvalidState: "This action isn't valid in the current competition state.",
  NotOrganizer: "Only the competition organizer can do this.",
  ZeroAmount: "Amount must be greater than zero.",
  ZeroAddress: "A required address is missing or invalid.",
  EmptyShares: "Prize structure is missing.",
  SharesMustSumTo10000: "Prize splits must sum to 100%.",
  WinnerCountMismatch: "Number of winners must match the prize structure.",
  NoFunds: "No funds in the prize pool.",
  NothingToClaim: "Nothing to claim.",
  NothingToRefund: "Nothing to refund.",
  TooEarly: "Too early — wait until the expiration date to do this.",
  FeeTooHigh: "Platform fee exceeds the maximum cap.",
  DeadlinesInvalid: "Deadlines are out of order or in the past.",
};

/// Convert any error from a contract call into a user-readable message.
export function parseEscrowError(e: unknown): string {
  if (!(e instanceof Error)) return "Unknown error";

  if (e instanceof BaseError) {
    if (e.walk((err) => err instanceof UserRejectedRequestError)) {
      return "Transaction rejected.";
    }
    const reverted = e.walk((err) => err instanceof ContractFunctionRevertedError);
    if (reverted instanceof ContractFunctionRevertedError) {
      const name = reverted.data?.errorName;
      if (name && ESCROW_ERRORS[name]) return ESCROW_ERRORS[name];
      return reverted.shortMessage || e.shortMessage;
    }
    return e.shortMessage || e.message;
  }

  if (e.message.toLowerCase().includes("rejected")) return "Transaction rejected.";
  return e.message;
}
