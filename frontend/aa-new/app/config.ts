import { http, createConfig } from "wagmi";
import { createBundlerClient } from 'viem/account-abstraction'
import { scrollSepolia, sepolia } from "wagmi/chains";

export const config = createConfig({
  chains: [scrollSepolia],
  transports: {
    [scrollSepolia.id]: http(process.env.NEXT_PUBLIC_RPC_URL),
  },
});

export const client = createBundlerClient({
  chain: scrollSepolia,
  transport: http(process.env.NEXT_PUBLIC_RPC_URL),
})
 
export const bundlerClient = createBundlerClient({
  client,
  transport: http(process.env.NEXT_PUBLIC_PIMLICO_URL),
})

