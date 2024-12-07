export const smartAccountABI = [
  {
    "type": "function",
    "name": "counter",
    "inputs": [],
    "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "increase",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "mint",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "swap",
    "inputs": [
      { "name": "amountIn", "type": "uint256", "internalType": "uint256" },
      {
        "name": "amountOutMin",
        "type": "uint256",
        "internalType": "uint256"
      },
      { "name": "to", "type": "address", "internalType": "address" },
      { "name": "token1", "type": "address", "internalType": "address" },
      { "name": "token2", "type": "address", "internalType": "address" },
      { "name": "deadline", "type": "uint256", "internalType": "uint256" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "tkn1",
    "inputs": [],
    "outputs": [
      { "name": "", "type": "address", "internalType": "contract MyToken" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "tkn2",
    "inputs": [],
    "outputs": [
      { "name": "", "type": "address", "internalType": "contract MyToken" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "univ2Router",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "contract UniswapV2Router"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "validateUserOp",
    "inputs": [
      {
        "name": "userOp",
        "type": "tuple",
        "internalType": "struct PackedUserOperation",
        "components": [
          { "name": "sender", "type": "address", "internalType": "address" },
          { "name": "nonce", "type": "uint256", "internalType": "uint256" },
          { "name": "initCode", "type": "bytes", "internalType": "bytes" },
          { "name": "callData", "type": "bytes", "internalType": "bytes" },
          {
            "name": "accountGasLimits",
            "type": "bytes32",
            "internalType": "bytes32"
          },
          {
            "name": "preVerificationGas",
            "type": "uint256",
            "internalType": "uint256"
          },
          { "name": "gasFees", "type": "bytes32", "internalType": "bytes32" },
          {
            "name": "paymasterAndData",
            "type": "bytes",
            "internalType": "bytes"
          },
          { "name": "signature", "type": "bytes", "internalType": "bytes" }
        ]
      },
      { "name": "userOpHash", "type": "bytes32", "internalType": "bytes32" },
      {
        "name": "missingAccountFunds",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "validationData",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "nonpayable"
  }
]