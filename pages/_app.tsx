import '../styles.css';
import '@rainbow-me/rainbowkit/styles.css';

import type { AppProps } from 'next/app';

import { WagmiProvider } from 'wagmi';
import { arbitrum, base, mainnet, optimism, polygon, sepolia } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import React from 'react';

// Add Cardona chain configuration
export const cardona = {
  id: 2442,
  name: 'Cardona',
  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: [process.env.NEXT_PUBLIC_CARDONA_RPC_URL || 'https://cardona-zkevm-rpc.public.zkevm-test.net'] },
  },
  blockExplorers: {
    default: { name: 'CardonaScan', url: 'https://cardona-zkevm.polygonscan.com' },
  },
  testnet: true,
};

const config = getDefaultConfig({
  appName: 'CrossChain PSI',
  projectId: 'YOUR_PROJECT_ID', // Replace with your actual project ID from WalletConnect
  chains: [
    mainnet,
    polygon,
    optimism,
    arbitrum,
    base,
    sepolia,
    cardona, // Include Cardona in the chains array
  ],
  ssr: true,
});

const queryClient = new QueryClient();

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <Component {...pageProps} />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default MyApp;
