import { Address, Hex } from 'viem'

// Define reusable types for complex structures
type PackedUserOperation = {
  sender: Address
  nonce: bigint
  initCode: Hex
  callData: Hex
  accountGasLimits: Hex
  preVerificationGas: bigint
  gasFees: Hex
  paymasterAndData: Hex
  signature: Hex
}

type MemoryUserOp = {
  sender: Address
  nonce: bigint
  verificationGasLimit: bigint
  callGasLimit: bigint
  paymasterVerificationGasLimit: bigint
  paymasterPostOpGasLimit: bigint
  preVerificationGas: bigint
  paymaster: Address
  maxFeePerGas: bigint
  maxPriorityFeePerGas: bigint
}

export const entryPointABI = [
  {
    type: "receive",
    stateMutability: "payable"
  },
  {
    type: "function",
    name: "addStake",
    inputs: [
      {
        name: "unstakeDelaySec",
        type: "uint32",
      }
    ],
    outputs: [],
    stateMutability: "payable"
  },
  {
    type: "function",
    name: "balanceOf",
    inputs: [
      { name: "account", type: "address" }
    ],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "depositTo",
    inputs: [
      { name: "account", type: "address" }
    ],
    outputs: [],
    stateMutability: "payable"
  },
  {
    type: "function",
    name: "deposits",
    inputs: [{ name: "", type: "address" }],
    outputs: [
      { name: "deposit", type: "uint256" },
      { name: "staked", type: "bool" },
      { name: "stake", type: "uint112" },
      { name: "unstakeDelaySec", type: "uint32" },
      { name: "withdrawTime", type: "uint48" }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getNonce",
    inputs: [
      { name: "sender", type: "address" },
      { name: "key", type: "uint192" }
    ],
    outputs: [{ name: "nonce", type: "uint256" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "handleOps",
    inputs: [
      {
        name: "ops",
        type: "tuple[]",
        components: [
          { name: "sender", type: "address" },
          { name: "nonce", type: "uint256" },
          { name: "initCode", type: "bytes" },
          { name: "callData", type: "bytes" },
          { name: "accountGasLimits", type: "bytes32" },
          { name: "preVerificationGas", type: "uint256" },
          { name: "gasFees", type: "bytes32" },
          { name: "paymasterAndData", type: "bytes" },
          { name: "signature", type: "bytes" }
        ]
      },
      { name: "beneficiary", type: "address" }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "getUserOpHash",
    inputs: [
      {
        name: "userOp",
        type: "tuple",
        components: [
          { name: "sender", type: "address" },
          { name: "nonce", type: "uint256" },
          { name: "initCode", type: "bytes" },
          { name: "callData", type: "bytes" },
          { name: "accountGasLimits", type: "bytes32" },
          { name: "preVerificationGas", type: "uint256" },
          { name: "gasFees", type: "bytes32" },
          { name: "paymasterAndData", type: "bytes" },
          { name: "signature", type: "bytes" }
        ]
      }
    ],
    outputs: [{ name: "", type: "bytes32" }],
    stateMutability: "view"
  },
  {
    type: "event",
    name: "UserOperationEvent",
    inputs: [
      {
        name: "userOpHash",
        type: "bytes32",
        indexed: true
      },
      {
        name: "sender",
        type: "address",
        indexed: true
      },
      {
        name: "paymaster",
        type: "address",
        indexed: true
      },
      {
        name: "nonce",
        type: "uint256",
        indexed: false
      },
      {
        name: "success",
        type: "bool",
        indexed: false
      },
      {
        name: "actualGasCost",
        type: "uint256",
        indexed: false
      },
      {
        name: "actualGasUsed",
        type: "uint256",
        indexed: false
      }
    ],
    anonymous: false
  },
  // Other events and errors...
] as const;

// Export the properly typed ABI
export default entryPointABI;