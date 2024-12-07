import { encodeFunctionData, numberToHex, parseEther } from "viem";
import { smartAccountABI } from "./ABIs/SmartAccount";
import { entryPointABI } from "./ABIs/EntryPoint";
import { myTokenABI } from "./ABIs/MyToken";
import { config } from "./config";
import { writeContract } from "wagmi/actions";

export const accountAddress = "your account address";
export const tkn1Address = "0x97dBc1b214d66eC151850961Fe48ADBE9987f583";
export const tkn2Address = "0x2adCAf88784BAC00247b39278892924eC68ba50f";
export const v2PairAddress = "0xfce785dd55c4733a83D56ddE2e1eCaFc63e95da6";

export interface EstimateResult {
  preVerificationGas: string;
  verificationGasLimit: string;
  callGasLimit: string;
  paymasterVerificationGasLimit?: string;
  paymasterPostOpGasLimit?: string;
}

export const increaseData = encodeFunctionData({
  abi: smartAccountABI,
  functionName: "increase",
});

export function getEncodedSwapFunctionData(
  amount: number,
  tkn1: `0x${string}`,
  tkn2: `0x${string}`
) {
  const bytecode = encodeFunctionData({
    abi: smartAccountABI,
    functionName: "swap",
    args: [
      parseEther(amount.toString()),
      0,
      accountAddress,
      tkn1,
      tkn2,
      1932298875,
    ],
  });

  return bytecode;
}

// function to fund our smartAccount to pay gas fees as our wallets do
export async function preFund(account: `0x${string}`, amount: number) {
  const balance = await writeContract(config, {
    abi: entryPointABI,
    address: "0x0000000071727De22E5E9d8BAf0edAc6f37da032",
    functionName: "depositTo",
    args: [accountAddress],
    value: parseEther(amount.toString()),
    account: account,
  });
  return balance;
}

export async function mint() {
  const result = await writeContract(config, {
    abi: smartAccountABI,
    address: accountAddress,
    functionName: "mint",
  });
  return result;
}

// Contract instances for useReadContracts hook so that we can read the needed data for our app

export const token1Contract = {
  address: tkn1Address,
  abi: myTokenABI,
} as const;

export const token2Contract = {
  address: tkn2Address,
  abi: myTokenABI,
} as const;

export const entryPoint = {
  address: "0x0000000071727De22E5E9d8BAf0edAc6f37da032",
  abi: entryPointABI,
  functionName: "getNonce",
  args: [accountAddress, BigInt(0)],
} as const;

export const entryPointBalance = {
  address: "0x0000000071727De22E5E9d8BAf0edAc6f37da032",
  abi: entryPointABI,
  functionName: "balanceOf",
  args: [accountAddress],
} as const;

export const smartAccountCounter = {
  address: accountAddress,
  abi: smartAccountABI,
  functionName: "counter",
} as const;

// Helper Pimlico function to get current gas price for our userOp
export const fetchGasPrice = async (url: string | URL) => {
  try {
    const gasPriceResponse = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "pimlico_getUserOperationGasPrice",
        params: [],
        id: 1,
      }),
    });

    if (!gasPriceResponse.ok) {
      throw new Error(`Gas price fetch failed: ${gasPriceResponse.status}`);
    }

    const gasPriceData = await gasPriceResponse.json();
    return gasPriceData.result.fast;
  } catch (error) {
    console.error("Error fetching gas price:", error);
    throw error;
  }
};

export async function estimate(callData: string, data: any) {
  const url = process.env.NEXT_PUBLIC_PIMLICO_URL as string;
  const gasPriceResponse = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "pimlico_getUserOperationGasPrice",
      params: [],
      id: 1,
    }),
  });

  if (!gasPriceResponse.ok) {
    throw new Error(`Gas price fetch failed: ${gasPriceResponse.status}`);
  }

  const gasPriceData = await gasPriceResponse.json();
  const fastGasPrice = gasPriceData.result.fast;
  const requestBody = {
    jsonrpc: "2.0",
    method: "eth_estimateUserOperationGas",
    params: [
      {
        sender: accountAddress,
        nonce: numberToHex(BigInt(data?.[4]?.result || "0x0")),
        factory: null,
        factoryData: "0x0",
        callData: callData,
        callGasLimit: "0x0",
        verificationGasLimit: "0x0",
        preVerificationGas: "0x0",
        maxPriorityFeePerGas: fastGasPrice.maxPriorityFeePerGas,
        maxFeePerGas: fastGasPrice.maxFeePerGas,
        paymaster: null,
        paymasterVerificationGasLimit: null,
        paymasterPostOpGasLimit: null,
        paymasterData: null,
        signature: "0x0",
      },
      "0x0000000071727De22E5E9d8BAf0edAc6f37da032",
    ],
    id: 1,
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      alert(`Error: ${data.error.message}`);
    }

    return data;
  } catch (error) {
    console.error("Error sending UserOperation:", error);
  }
}
