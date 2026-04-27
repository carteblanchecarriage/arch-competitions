import {
  createUseReadContract,
  createUseWriteContract,
  createUseSimulateContract,
  createUseWatchContractEvent,
} from 'wagmi/codegen'

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// CompetitionEscrow
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const competitionEscrowAbi = [
  { type: 'constructor', inputs: [], stateMutability: 'nonpayable' },
  {
    type: 'function',
    inputs: [{ name: 'winners', internalType: 'address[]', type: 'address[]' }],
    name: 'announceWinners',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'cancel',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'claimPrize',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'claimRefund',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'contributor', internalType: 'address', type: 'address' }],
    name: 'contributions',
    outputs: [{ name: 'amount', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'expirationTimestamp',
    outputs: [{ name: '', internalType: 'uint64', type: 'uint64' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'feeBps',
    outputs: [{ name: '', internalType: 'uint16', type: 'uint16' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'feeRecipient',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'amount', internalType: 'uint256', type: 'uint256' }],
    name: 'fund',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_token', internalType: 'address', type: 'address' },
      { name: '_organizer', internalType: 'address', type: 'address' },
      { name: '_feeRecipient', internalType: 'address', type: 'address' },
      { name: '_feeBps', internalType: 'uint16', type: 'uint16' },
      { name: '_prizeShareBps', internalType: 'uint16[]', type: 'uint16[]' },
      { name: '_submissionDeadline', internalType: 'uint64', type: 'uint64' },
      { name: '_expirationTimestamp', internalType: 'uint64', type: 'uint64' },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'lock',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'organizer',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'winner', internalType: 'address', type: 'address' }],
    name: 'prizeOf',
    outputs: [{ name: 'amount', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'prizeShareBps',
    outputs: [{ name: '', internalType: 'uint16', type: 'uint16' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'prizeTierCount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'state',
    outputs: [
      { name: '', internalType: 'enum CompetitionEscrow.State', type: 'uint8' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'submissionDeadline',
    outputs: [{ name: '', internalType: 'uint64', type: 'uint64' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'token',
    outputs: [{ name: '', internalType: 'contract IERC20', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalContributed',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'by', internalType: 'address', type: 'address', indexed: true },
    ],
    name: 'Cancelled',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'contributor',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Funded',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'version',
        internalType: 'uint64',
        type: 'uint64',
        indexed: false,
      },
    ],
    name: 'Initialized',
  },
  { type: 'event', anonymous: false, inputs: [], name: 'Locked' },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'winner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'PrizeClaimed',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'contributor',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Refunded',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'winners',
        internalType: 'address[]',
        type: 'address[]',
        indexed: false,
      },
      {
        name: 'platformFee',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'winnerShare',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'WinnersAnnounced',
  },
  { type: 'error', inputs: [], name: 'EmptyShares' },
  { type: 'error', inputs: [], name: 'InvalidInitialization' },
  { type: 'error', inputs: [], name: 'InvalidState' },
  { type: 'error', inputs: [], name: 'NoFunds' },
  { type: 'error', inputs: [], name: 'NotInitializing' },
  { type: 'error', inputs: [], name: 'NotOrganizer' },
  { type: 'error', inputs: [], name: 'NothingToClaim' },
  { type: 'error', inputs: [], name: 'NothingToRefund' },
  { type: 'error', inputs: [], name: 'ReentrancyGuardReentrantCall' },
  {
    type: 'error',
    inputs: [{ name: 'token', internalType: 'address', type: 'address' }],
    name: 'SafeERC20FailedOperation',
  },
  { type: 'error', inputs: [], name: 'SharesMustSumTo10000' },
  { type: 'error', inputs: [], name: 'TooEarly' },
  { type: 'error', inputs: [], name: 'WinnerCountMismatch' },
  { type: 'error', inputs: [], name: 'ZeroAddress' },
  { type: 'error', inputs: [], name: 'ZeroAmount' },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// CompetitionEscrowFactory
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const competitionEscrowFactoryAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: '_implementation', internalType: 'address', type: 'address' },
      { name: '_feeRecipient', internalType: 'address', type: 'address' },
      { name: '_feeBps', internalType: 'uint16', type: 'uint16' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'MAX_FEE_BPS',
    outputs: [{ name: '', internalType: 'uint16', type: 'uint16' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'competitionId', internalType: 'bytes32', type: 'bytes32' },
      { name: 'token', internalType: 'address', type: 'address' },
      { name: 'prizeShareBps', internalType: 'uint16[]', type: 'uint16[]' },
      { name: 'submissionDeadline', internalType: 'uint64', type: 'uint64' },
      { name: 'expirationTimestamp', internalType: 'uint64', type: 'uint64' },
    ],
    name: 'createEscrow',
    outputs: [{ name: 'escrow', internalType: 'address', type: 'address' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'feeBps',
    outputs: [{ name: '', internalType: 'uint16', type: 'uint16' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'feeRecipient',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'implementation',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'organizer', internalType: 'address', type: 'address' },
      { name: 'competitionId', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'predictEscrow',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newBps', internalType: 'uint16', type: 'uint16' }],
    name: 'setFee',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'newRecipient', internalType: 'address', type: 'address' },
    ],
    name: 'setFeeRecipient',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'escrow',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'organizer',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'competitionId',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'token',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'feeBps',
        internalType: 'uint16',
        type: 'uint16',
        indexed: false,
      },
      {
        name: 'prizeShareBps',
        internalType: 'uint16[]',
        type: 'uint16[]',
        indexed: false,
      },
      {
        name: 'submissionDeadline',
        internalType: 'uint64',
        type: 'uint64',
        indexed: false,
      },
      {
        name: 'expirationTimestamp',
        internalType: 'uint64',
        type: 'uint64',
        indexed: false,
      },
    ],
    name: 'EscrowCreated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'newRecipient',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'FeeRecipientUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'newBps',
        internalType: 'uint16',
        type: 'uint16',
        indexed: false,
      },
    ],
    name: 'FeeUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnershipTransferred',
  },
  { type: 'error', inputs: [], name: 'DeadlinesInvalid' },
  { type: 'error', inputs: [], name: 'FailedDeployment' },
  { type: 'error', inputs: [], name: 'FeeTooHigh' },
  {
    type: 'error',
    inputs: [
      { name: 'balance', internalType: 'uint256', type: 'uint256' },
      { name: 'needed', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'InsufficientBalance',
  },
  {
    type: 'error',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'OwnableInvalidOwner',
  },
  {
    type: 'error',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'OwnableUnauthorizedAccount',
  },
  { type: 'error', inputs: [], name: 'ZeroAddress' },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// React
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link competitionEscrowAbi}__
 */
export const useReadCompetitionEscrow = /*#__PURE__*/ createUseReadContract({
  abi: competitionEscrowAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link competitionEscrowAbi}__ and `functionName` set to `"contributions"`
 */
export const useReadCompetitionEscrowContributions =
  /*#__PURE__*/ createUseReadContract({
    abi: competitionEscrowAbi,
    functionName: 'contributions',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link competitionEscrowAbi}__ and `functionName` set to `"expirationTimestamp"`
 */
export const useReadCompetitionEscrowExpirationTimestamp =
  /*#__PURE__*/ createUseReadContract({
    abi: competitionEscrowAbi,
    functionName: 'expirationTimestamp',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link competitionEscrowAbi}__ and `functionName` set to `"feeBps"`
 */
export const useReadCompetitionEscrowFeeBps =
  /*#__PURE__*/ createUseReadContract({
    abi: competitionEscrowAbi,
    functionName: 'feeBps',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link competitionEscrowAbi}__ and `functionName` set to `"feeRecipient"`
 */
export const useReadCompetitionEscrowFeeRecipient =
  /*#__PURE__*/ createUseReadContract({
    abi: competitionEscrowAbi,
    functionName: 'feeRecipient',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link competitionEscrowAbi}__ and `functionName` set to `"organizer"`
 */
export const useReadCompetitionEscrowOrganizer =
  /*#__PURE__*/ createUseReadContract({
    abi: competitionEscrowAbi,
    functionName: 'organizer',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link competitionEscrowAbi}__ and `functionName` set to `"prizeOf"`
 */
export const useReadCompetitionEscrowPrizeOf =
  /*#__PURE__*/ createUseReadContract({
    abi: competitionEscrowAbi,
    functionName: 'prizeOf',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link competitionEscrowAbi}__ and `functionName` set to `"prizeShareBps"`
 */
export const useReadCompetitionEscrowPrizeShareBps =
  /*#__PURE__*/ createUseReadContract({
    abi: competitionEscrowAbi,
    functionName: 'prizeShareBps',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link competitionEscrowAbi}__ and `functionName` set to `"prizeTierCount"`
 */
export const useReadCompetitionEscrowPrizeTierCount =
  /*#__PURE__*/ createUseReadContract({
    abi: competitionEscrowAbi,
    functionName: 'prizeTierCount',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link competitionEscrowAbi}__ and `functionName` set to `"state"`
 */
export const useReadCompetitionEscrowState =
  /*#__PURE__*/ createUseReadContract({
    abi: competitionEscrowAbi,
    functionName: 'state',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link competitionEscrowAbi}__ and `functionName` set to `"submissionDeadline"`
 */
export const useReadCompetitionEscrowSubmissionDeadline =
  /*#__PURE__*/ createUseReadContract({
    abi: competitionEscrowAbi,
    functionName: 'submissionDeadline',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link competitionEscrowAbi}__ and `functionName` set to `"token"`
 */
export const useReadCompetitionEscrowToken =
  /*#__PURE__*/ createUseReadContract({
    abi: competitionEscrowAbi,
    functionName: 'token',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link competitionEscrowAbi}__ and `functionName` set to `"totalContributed"`
 */
export const useReadCompetitionEscrowTotalContributed =
  /*#__PURE__*/ createUseReadContract({
    abi: competitionEscrowAbi,
    functionName: 'totalContributed',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link competitionEscrowAbi}__
 */
export const useWriteCompetitionEscrow = /*#__PURE__*/ createUseWriteContract({
  abi: competitionEscrowAbi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link competitionEscrowAbi}__ and `functionName` set to `"announceWinners"`
 */
export const useWriteCompetitionEscrowAnnounceWinners =
  /*#__PURE__*/ createUseWriteContract({
    abi: competitionEscrowAbi,
    functionName: 'announceWinners',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link competitionEscrowAbi}__ and `functionName` set to `"cancel"`
 */
export const useWriteCompetitionEscrowCancel =
  /*#__PURE__*/ createUseWriteContract({
    abi: competitionEscrowAbi,
    functionName: 'cancel',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link competitionEscrowAbi}__ and `functionName` set to `"claimPrize"`
 */
export const useWriteCompetitionEscrowClaimPrize =
  /*#__PURE__*/ createUseWriteContract({
    abi: competitionEscrowAbi,
    functionName: 'claimPrize',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link competitionEscrowAbi}__ and `functionName` set to `"claimRefund"`
 */
export const useWriteCompetitionEscrowClaimRefund =
  /*#__PURE__*/ createUseWriteContract({
    abi: competitionEscrowAbi,
    functionName: 'claimRefund',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link competitionEscrowAbi}__ and `functionName` set to `"fund"`
 */
export const useWriteCompetitionEscrowFund =
  /*#__PURE__*/ createUseWriteContract({
    abi: competitionEscrowAbi,
    functionName: 'fund',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link competitionEscrowAbi}__ and `functionName` set to `"initialize"`
 */
export const useWriteCompetitionEscrowInitialize =
  /*#__PURE__*/ createUseWriteContract({
    abi: competitionEscrowAbi,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link competitionEscrowAbi}__ and `functionName` set to `"lock"`
 */
export const useWriteCompetitionEscrowLock =
  /*#__PURE__*/ createUseWriteContract({
    abi: competitionEscrowAbi,
    functionName: 'lock',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link competitionEscrowAbi}__
 */
export const useSimulateCompetitionEscrow =
  /*#__PURE__*/ createUseSimulateContract({ abi: competitionEscrowAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link competitionEscrowAbi}__ and `functionName` set to `"announceWinners"`
 */
export const useSimulateCompetitionEscrowAnnounceWinners =
  /*#__PURE__*/ createUseSimulateContract({
    abi: competitionEscrowAbi,
    functionName: 'announceWinners',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link competitionEscrowAbi}__ and `functionName` set to `"cancel"`
 */
export const useSimulateCompetitionEscrowCancel =
  /*#__PURE__*/ createUseSimulateContract({
    abi: competitionEscrowAbi,
    functionName: 'cancel',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link competitionEscrowAbi}__ and `functionName` set to `"claimPrize"`
 */
export const useSimulateCompetitionEscrowClaimPrize =
  /*#__PURE__*/ createUseSimulateContract({
    abi: competitionEscrowAbi,
    functionName: 'claimPrize',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link competitionEscrowAbi}__ and `functionName` set to `"claimRefund"`
 */
export const useSimulateCompetitionEscrowClaimRefund =
  /*#__PURE__*/ createUseSimulateContract({
    abi: competitionEscrowAbi,
    functionName: 'claimRefund',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link competitionEscrowAbi}__ and `functionName` set to `"fund"`
 */
export const useSimulateCompetitionEscrowFund =
  /*#__PURE__*/ createUseSimulateContract({
    abi: competitionEscrowAbi,
    functionName: 'fund',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link competitionEscrowAbi}__ and `functionName` set to `"initialize"`
 */
export const useSimulateCompetitionEscrowInitialize =
  /*#__PURE__*/ createUseSimulateContract({
    abi: competitionEscrowAbi,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link competitionEscrowAbi}__ and `functionName` set to `"lock"`
 */
export const useSimulateCompetitionEscrowLock =
  /*#__PURE__*/ createUseSimulateContract({
    abi: competitionEscrowAbi,
    functionName: 'lock',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link competitionEscrowAbi}__
 */
export const useWatchCompetitionEscrowEvent =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: competitionEscrowAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link competitionEscrowAbi}__ and `eventName` set to `"Cancelled"`
 */
export const useWatchCompetitionEscrowCancelledEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: competitionEscrowAbi,
    eventName: 'Cancelled',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link competitionEscrowAbi}__ and `eventName` set to `"Funded"`
 */
export const useWatchCompetitionEscrowFundedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: competitionEscrowAbi,
    eventName: 'Funded',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link competitionEscrowAbi}__ and `eventName` set to `"Initialized"`
 */
export const useWatchCompetitionEscrowInitializedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: competitionEscrowAbi,
    eventName: 'Initialized',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link competitionEscrowAbi}__ and `eventName` set to `"Locked"`
 */
export const useWatchCompetitionEscrowLockedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: competitionEscrowAbi,
    eventName: 'Locked',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link competitionEscrowAbi}__ and `eventName` set to `"PrizeClaimed"`
 */
export const useWatchCompetitionEscrowPrizeClaimedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: competitionEscrowAbi,
    eventName: 'PrizeClaimed',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link competitionEscrowAbi}__ and `eventName` set to `"Refunded"`
 */
export const useWatchCompetitionEscrowRefundedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: competitionEscrowAbi,
    eventName: 'Refunded',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link competitionEscrowAbi}__ and `eventName` set to `"WinnersAnnounced"`
 */
export const useWatchCompetitionEscrowWinnersAnnouncedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: competitionEscrowAbi,
    eventName: 'WinnersAnnounced',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link competitionEscrowFactoryAbi}__
 */
export const useReadCompetitionEscrowFactory =
  /*#__PURE__*/ createUseReadContract({ abi: competitionEscrowFactoryAbi })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link competitionEscrowFactoryAbi}__ and `functionName` set to `"MAX_FEE_BPS"`
 */
export const useReadCompetitionEscrowFactoryMaxFeeBps =
  /*#__PURE__*/ createUseReadContract({
    abi: competitionEscrowFactoryAbi,
    functionName: 'MAX_FEE_BPS',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link competitionEscrowFactoryAbi}__ and `functionName` set to `"feeBps"`
 */
export const useReadCompetitionEscrowFactoryFeeBps =
  /*#__PURE__*/ createUseReadContract({
    abi: competitionEscrowFactoryAbi,
    functionName: 'feeBps',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link competitionEscrowFactoryAbi}__ and `functionName` set to `"feeRecipient"`
 */
export const useReadCompetitionEscrowFactoryFeeRecipient =
  /*#__PURE__*/ createUseReadContract({
    abi: competitionEscrowFactoryAbi,
    functionName: 'feeRecipient',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link competitionEscrowFactoryAbi}__ and `functionName` set to `"implementation"`
 */
export const useReadCompetitionEscrowFactoryImplementation =
  /*#__PURE__*/ createUseReadContract({
    abi: competitionEscrowFactoryAbi,
    functionName: 'implementation',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link competitionEscrowFactoryAbi}__ and `functionName` set to `"owner"`
 */
export const useReadCompetitionEscrowFactoryOwner =
  /*#__PURE__*/ createUseReadContract({
    abi: competitionEscrowFactoryAbi,
    functionName: 'owner',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link competitionEscrowFactoryAbi}__ and `functionName` set to `"predictEscrow"`
 */
export const useReadCompetitionEscrowFactoryPredictEscrow =
  /*#__PURE__*/ createUseReadContract({
    abi: competitionEscrowFactoryAbi,
    functionName: 'predictEscrow',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link competitionEscrowFactoryAbi}__
 */
export const useWriteCompetitionEscrowFactory =
  /*#__PURE__*/ createUseWriteContract({ abi: competitionEscrowFactoryAbi })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link competitionEscrowFactoryAbi}__ and `functionName` set to `"createEscrow"`
 */
export const useWriteCompetitionEscrowFactoryCreateEscrow =
  /*#__PURE__*/ createUseWriteContract({
    abi: competitionEscrowFactoryAbi,
    functionName: 'createEscrow',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link competitionEscrowFactoryAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useWriteCompetitionEscrowFactoryRenounceOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: competitionEscrowFactoryAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link competitionEscrowFactoryAbi}__ and `functionName` set to `"setFee"`
 */
export const useWriteCompetitionEscrowFactorySetFee =
  /*#__PURE__*/ createUseWriteContract({
    abi: competitionEscrowFactoryAbi,
    functionName: 'setFee',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link competitionEscrowFactoryAbi}__ and `functionName` set to `"setFeeRecipient"`
 */
export const useWriteCompetitionEscrowFactorySetFeeRecipient =
  /*#__PURE__*/ createUseWriteContract({
    abi: competitionEscrowFactoryAbi,
    functionName: 'setFeeRecipient',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link competitionEscrowFactoryAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useWriteCompetitionEscrowFactoryTransferOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: competitionEscrowFactoryAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link competitionEscrowFactoryAbi}__
 */
export const useSimulateCompetitionEscrowFactory =
  /*#__PURE__*/ createUseSimulateContract({ abi: competitionEscrowFactoryAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link competitionEscrowFactoryAbi}__ and `functionName` set to `"createEscrow"`
 */
export const useSimulateCompetitionEscrowFactoryCreateEscrow =
  /*#__PURE__*/ createUseSimulateContract({
    abi: competitionEscrowFactoryAbi,
    functionName: 'createEscrow',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link competitionEscrowFactoryAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useSimulateCompetitionEscrowFactoryRenounceOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: competitionEscrowFactoryAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link competitionEscrowFactoryAbi}__ and `functionName` set to `"setFee"`
 */
export const useSimulateCompetitionEscrowFactorySetFee =
  /*#__PURE__*/ createUseSimulateContract({
    abi: competitionEscrowFactoryAbi,
    functionName: 'setFee',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link competitionEscrowFactoryAbi}__ and `functionName` set to `"setFeeRecipient"`
 */
export const useSimulateCompetitionEscrowFactorySetFeeRecipient =
  /*#__PURE__*/ createUseSimulateContract({
    abi: competitionEscrowFactoryAbi,
    functionName: 'setFeeRecipient',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link competitionEscrowFactoryAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useSimulateCompetitionEscrowFactoryTransferOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: competitionEscrowFactoryAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link competitionEscrowFactoryAbi}__
 */
export const useWatchCompetitionEscrowFactoryEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: competitionEscrowFactoryAbi,
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link competitionEscrowFactoryAbi}__ and `eventName` set to `"EscrowCreated"`
 */
export const useWatchCompetitionEscrowFactoryEscrowCreatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: competitionEscrowFactoryAbi,
    eventName: 'EscrowCreated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link competitionEscrowFactoryAbi}__ and `eventName` set to `"FeeRecipientUpdated"`
 */
export const useWatchCompetitionEscrowFactoryFeeRecipientUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: competitionEscrowFactoryAbi,
    eventName: 'FeeRecipientUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link competitionEscrowFactoryAbi}__ and `eventName` set to `"FeeUpdated"`
 */
export const useWatchCompetitionEscrowFactoryFeeUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: competitionEscrowFactoryAbi,
    eventName: 'FeeUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link competitionEscrowFactoryAbi}__ and `eventName` set to `"OwnershipTransferred"`
 */
export const useWatchCompetitionEscrowFactoryOwnershipTransferredEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: competitionEscrowFactoryAbi,
    eventName: 'OwnershipTransferred',
  })
