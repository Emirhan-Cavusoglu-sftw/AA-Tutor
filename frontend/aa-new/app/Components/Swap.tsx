"use client";
import { useEffect, useState } from "react";
import {
  tkn1Address,
  tkn2Address,
  accountAddress,
  EstimateResult,
  getEncodedSwapFunctionData,
} from "../helper";
import { formatEther, numberToHex } from "viem";

export default function Swap({
  data,
  isLoading,
}: {
  data: any;
  isLoading: any;
}) {
  const [sellAmount, setSellAmount] = useState("");
  const [buyAmount, setBuyAmount] = useState(0);
  const [isReversed, setIsReversed] = useState(false);
  const [token1, setToken1] = useState<`0x${string}`>(tkn1Address);
  const [token2, setToken2] = useState<`0x${string}`>(tkn2Address);
  const [callDataa, setCallData] = useState("");
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [isRefetching, setisRefetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [estimateResult, setEstimateResult] = useState<EstimateResult | null>(
    null
  );

  useEffect(() => {
    if (sellAmount && !isNaN(parseFloat(sellAmount))) {
      const encodedData = getEncodedSwapFunctionData(
        parseFloat(sellAmount),
        token1,
        token2
      );
      setCallData(encodedData);
    } else {
      setCallData("");
    }
  }, [sellAmount, token1, token2]);
  const [gaspricedata, setGaspricedata] = useState<{
    result: { fast: { maxFeePerGas: string } };
  } | null>(null);

  // function to switch the token1 and token2
  const handleSwitchDirection = () => {
    setSellAmount("");
    setBuyAmount(0);
    setIsReversed((prev) => {
      if (!prev) {
        setToken1(tkn2Address);
        setToken2(tkn1Address);
      } else {
        setToken1(tkn1Address);
        setToken2(tkn2Address);
      }
      return !prev;
    });
  };

  // function to handle tokens amount that we want to sell and buy
  const handleSellChange = async (value: any) => {
    if (!data || isLoading) {
      console.error("Balance data is not ready yet.");
      return;
    }

    setSellAmount(value);

    const balance1 = parseFloat(
      formatEther((data?.[0]?.result as bigint) || BigInt(0))
    );
    const balance2 = parseFloat(
      formatEther((data?.[1]?.result as bigint) || BigInt(0))
    );

    if (value === "" || isNaN(value)) {
      setBuyAmount(0);
      return;
    }

    const sell = parseFloat(value);

    const k = balance1 * balance2;

    if (sell >= 0) {
      if (!isReversed && sell <= balance1) {
        const newX = balance1 + sell;
        const newY = k / newX;
        const buy = balance2 - newY;
        setBuyAmount(Number(buy.toFixed(4)));
      } else if (isReversed && sell <= balance2) {
        const newY = balance2 + sell;
        const newX = k / newY;
        const buy = balance1 - newX;
        setBuyAmount(Number(buy.toFixed(4)));
      } else {
        setBuyAmount(0);
      }
    }
  };

  async function estimate(callData: string) {
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
    setGaspricedata(gasPriceData);
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
        setError(data.error.message);
        setEstimateResult(null);
      } else {
        setEstimateResult(data.result);
        setError(null);
      }

      return data;
    } catch (error) {
      console.error("Error sending UserOperation:", error);
      setEstimateResult(null);
    }
  }

  async function handleSwap() {
    setisRefetching(true);
    setError(null);

    const url = process.env.NEXT_PUBLIC_PIMLICO_URL as string;

    try {
      const estimateResult = await estimate(callDataa);

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
        method: "eth_sendUserOperation",
        params: [
          {
            sender: accountAddress,
            nonce: numberToHex(BigInt(data?.[4]?.result || "0x0")),
            factory: null,
            factoryData: null,
            callData: callDataa,
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

  return (
    <div className="w-full flex flex-col items-center gap-6">
      {/* Swap Section */}
      <div className="w-96 bg-gray-800 p-6 flex flex-col items-center rounded-lg relative">
        {isRefetching && (
          <div className="absolute inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center rounded-lg z-10">
            <p className="text-white text-lg font-semibold animate-pulse">
              Processing...
            </p>
          </div>
        )}

        <h2 className="text-xl font-bold mb-4 text-center">Swap</h2>

        <div className="mb-4">
          <label className="block text-sm mb-2 font-semibold">
            {isReversed ? "Sell TKN2" : "Sell TKN1"}
          </label>
          <div className="flex items-center bg-gray-700 rounded-lg px-3 py-2">
            <input
              type="number"
              placeholder="0"
              step={0.1}
              className="flex-1 bg-transparent text-white focus:outline-none"
              value={sellAmount}
              onChange={(e) => handleSellChange(e.target.value)}
              disabled={isRefetching}
            />
            <span className="text-gray-400 ml-2">
              {isReversed ? "TKN2" : "TKN1"}
            </span>
          </div>
        </div>

        <button
          className=" mb-4 px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 focus:outline-none flex items-center justify-center gap-2"
          onClick={handleSwitchDirection}
          disabled={isRefetching}
        >
          ↕ Switch
        </button>

        <div className="mb-4">
          <label className="block text-sm mb-2 font-semibold">
            {isReversed ? "Buy TKN1" : "Buy TKN2"}
          </label>
          <div className="flex items-center bg-gray-700 rounded-lg px-3 py-2">
            <input
              type="text"
              placeholder="0"
              className="flex-1 bg-transparent text-gray-400 focus:outline-none cursor-not-allowed"
              value={buyAmount}
              readOnly
            />
            <span className="text-gray-400 ml-2">
              {isReversed ? "TKN1" : "TKN2"}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <button
            className="w-full px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 focus:outline-none"
            onClick={handleSwap}
            disabled={isRefetching}
          >
            Swap
          </button>
        </div>
      </div>

      {/* Estimate Results Section */}
      <div className="w-[1000px] bg-gray-800 p-2 items-center justify-center flex flex-col rounded-lg mt-6">
        <button
          className="px-4 py-2 mb-4 bg-purple-600 rounded-lg hover:bg-purple-700 focus:outline-none"
          onClick={() => estimate(callDataa)}
        >
          Estimate Results
        </button>
        {estimateResult ? (
          <div className="font-semibold gap-2 justify-between flex text-center">
            <p>
              PreVerification Gas:{" "}
              {parseInt(estimateResult.preVerificationGas, 16)}
            </p>
            <p>
              Verification Gas Limit:{" "}
              {parseInt(estimateResult.verificationGasLimit, 16)}
            </p>
            <p>Call Gas Limit: {parseInt(estimateResult.callGasLimit, 16)}</p>
            <p>
              Max Fee Per Gas:{" "}
              {gaspricedata
                ? parseInt(gaspricedata.result.fast.maxFeePerGas, 16)
                : "Loading..."}
            </p>
          </div>
        ) : (
          error && (
            <div className="text-red-500 font-semibold">Error: {error}</div>
          )
        )}
        <h2 className="mt-4 text-lg font-semibold text-center text-white">
          Transaction Link:{" "}
          {transactionHash ? (
            <a
              href={`https://sepolia.scrollscan.com/tx/${transactionHash}`}
              className="text-blue-600 hover:text-blue-800 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              See The Transaction
            </a>
          ) : (
            <span className="text-gray-400 italic">No transaction yet</span>
          )}
        </h2>
      </div>
    </div>
  );
}
