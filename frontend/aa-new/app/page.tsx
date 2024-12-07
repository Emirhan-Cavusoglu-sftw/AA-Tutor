"use client";
import Image from "next/image";
import {
  useAccount,
  useReadContract,
  useReadContracts,
  useWriteContract,
} from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  increaseData,
  accountAddress,
  v2PairAddress,
  EstimateResult,
  token1Contract,
  token2Contract,
  entryPoint,
  preFund,
  entryPointBalance,
  fetchGasPrice,
  smartAccountCounter,
  mint,
  estimate,
} from "./helper";
import { formatEther, numberToHex, stringToHex, Abi } from "viem";
import { useEffect, useState } from "react";
import Swap from "./Components/Swap";

export default function Home() {
  const [sellAmount, setSellAmount] = useState("");
  const [buyAmount, setBuyAmount] = useState(0);
  const [isReversed, setIsReversed] = useState(false);
  const [callDataa, setCallData] = useState("");
  const [isRefetching, setisRefetching] = useState(false);
  const account = useAccount();
  const [fundAmount, setfundAmount] = useState(0);
  const [gaspricedata, setGaspricedata] = useState<{
    result: { fast: { maxFeePerGas: string } };
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);

  // fethcing balance,nonce from token1,token2,EntryPoint
  const { data, refetch, isError, isLoading } = useReadContracts({
    contracts: [
      {
        ...token1Contract,
        functionName: "balanceOf",
        args: [v2PairAddress],
      },
      {
        ...token2Contract,
        functionName: "balanceOf",
        args: [v2PairAddress],
      },
      {
        ...token1Contract,
        functionName: "balanceOf",
        args: [accountAddress],
      },
      {
        ...token2Contract,
        functionName: "balanceOf",
        args: [accountAddress],
      },
      {
        ...entryPoint,
      },
      {
        ...entryPointBalance,
      },
      {
        ...smartAccountCounter,
      },
    ],
  });

  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 5000);

    return () => clearInterval(interval);
  }, [refetch]);

  useEffect(() => {
    if (transactionHash) {
      console.log("Updated Transaction Hash:", transactionHash);
    }
  }, [transactionHash]);

  async function handleFund(e: React.ChangeEvent<HTMLInputElement>) {
    setfundAmount(Number(e.target.value));
  }

  // function to increase the counter. We are sending a rpc request to the pimlico bundler pasing the user operation data
  async function increase() {
    setisRefetching(true);
    setError(null);

    const url = process.env.NEXT_PUBLIC_PIMLICO_URL as string;
    try {
      // Estimate the callGasLimit,verificationGasLimit,preVerificationGas before sending the user operation
      const estimateResult = await estimate(increaseData, data);
      // Fetching the fast gas price here to pass it to the user operation
      const fastGasPrice = await fetchGasPrice(url);

      const requestBody = {
        jsonrpc: "2.0",
        method: "eth_sendUserOperation",
        params: [
          {
            sender: accountAddress,
            nonce: numberToHex(BigInt(data?.[4]?.result || "0x0")),
            factory: null,
            factoryData: null,
            callData: increaseData,
            callGasLimit: estimateResult.result.callGasLimit,
            verificationGasLimit: estimateResult?.result.verificationGasLimit,
            preVerificationGas: estimateResult?.result.preVerificationGas,
            maxPriorityFeePerGas: fastGasPrice.maxPriorityFeePerGas,
            maxFeePerGas: fastGasPrice.maxFeePerGas,
            paymaster: null,
            paymasterVerificationGasLimit: "0x0",
            paymasterPostOpGasLimit: "0x0",
            paymasterData: null,
            signature: "0x0",
          },
          "0x0000000071727De22E5E9d8BAf0edAc6f37da032",
        ],
        id: 1,
      };

      const sendUserOp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!sendUserOp.ok) {
        throw new Error(`Swap failed: ${sendUserOp.status}`);
      }

      const sendUserOpData = await sendUserOp.json();

      if (sendUserOpData.error) {
        console.error(
          "Error in sendUserOpDataeration:",
          sendUserOpData.error.message
        );
        alert(`Error: ${sendUserOpData.error.message}`);
        setisRefetching(false);
        return;
      }

      console.log("sendUserOpData", sendUserOpData);
      const userOpHash = sendUserOpData.result;

      const checkReceipt = async () => {
        const receiptResponse = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            jsonrpc: "2.0",
            method: "eth_getUserOperationReceipt",
            params: [userOpHash],
            id: 1,
          }),
        });

        if (!receiptResponse.ok) {
          throw new Error(`Receipt check failed: ${receiptResponse.status}`);
        }

        const receiptData = await receiptResponse.json();
        if (receiptData.result && receiptData.result.success) {
          setTransactionHash(receiptData.result?.receipt?.transactionHash);
          clearInterval(receiptInterval);
          setisRefetching(false);
          alert("Transaction successful!");
        }
      };

      const receiptInterval = setInterval(async () => {
        try {
          await checkReceipt();
        } catch (error) {
          console.error("Error checking receipt:", error);
        }
      }, 5000);
    } catch (error) {
      console.error("Error in handleSwap:", error);
      setError(error instanceof Error ? error.message : String(error));
      setisRefetching(false);
    }
  }

  console.log("data", data);

  return isLoading ? (
    <div className="text-2xl">Loading</div>
  ) : (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center gap-10 justify-center relative">
      {isRefetching && (
        <div className="absolute inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
          <p className="text-white text-2xl font-semibold animate-pulse">
            Processing...
          </p>
        </div>
      )}

      <div className="absolute top-4 right-4">
        <ConnectButton />
      </div>

      <div className="flex items-start justify-center gap-10 mt-4 w-full px-10">
        {/* Fund and Balances Section */}
        <div className="w-96 h-[200px] bg-gray-800 p-6 rounded-lg flex flex-col gap-2 justify-between">
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="0.1"
              step="0.1"
              className="flex-1 px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none"
              onChange={handleFund}
            />
            <button
              className="px-4 py-2 bg-slate-300 text-black font-bold rounded-lg"
              onClick={() =>
                preFund(account.address as `0x${string}`, fundAmount)
              }
            >
              Fund
            </button>
          </div>

          <div>
            <button
              className="p-1 bg-slate-300 text-black font-bold rounded-lg"
              onClick={() => mint()}
            >
              Mint tokens
            </button>
            <h2 className="text-lg">
              Tkn1 balance:{" "}
              <strong>
                {data?.[2]?.result
                  ? Number(formatEther(data?.[2]?.result as bigint)).toFixed(4)
                  : "Loading..."}
              </strong>
            </h2>
            <h2 className="text-lg">
              Tkn2 balance:{" "}
              <strong>
                {data?.[3]?.result
                  ? Number(formatEther(data?.[3]?.result as bigint)).toFixed(4)
                  : "Loading..."}
              </strong>
            </h2>
            <h2 className="text-lg">
              Account Contract balance:{" "}
              <strong>
                {data?.[5]?.result
                  ? Number(formatEther(data?.[5]?.result as bigint)).toFixed(4)
                  : "Loading..."}
              </strong>
            </h2>
          </div>
        </div>

        {/* Counter Section */}
        <div className="w-96 h-[200px] bg-gray-800 p-6 rounded-lg flex flex-col items-center justify-center">
          <span className="text-lg font-semibold text-gray-300">
            Counter:{" "}
            {data?.[6]?.result
              ? parseInt(data[6].result as string, 16)
              : "Loading..."}
          </span>
          <button
            onClick={increase}
            className="mt-4 px-6 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 focus:outline-none"
          >
            Increase
          </button>
        </div>
      </div>

      {/* Swap Component */}
      <Swap data={data} isLoading={isLoading} />
    </div>
  );
}
