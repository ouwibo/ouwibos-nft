'use client';

import { ReactNode, useState, useEffect } from 'react';
import '@rainbow-me/rainbowkit/styles.css';
import {
  RainbowKitProvider,
  darkTheme,
  getDefaultConfig,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider, http } from 'wagmi';
import { base } from 'wagmi/chains';
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { farcasterFrame } from "@farcaster/frame-wagmi-connector";

const config = getDefaultConfig({
  appName: 'OUWIBO CRYPTO',
  projectId: 'YOUR_PROJECT_ID', // Recommended: Replace with your actual WalletConnect project ID
  chains: [base],
  ssr: true,
  transports: {
    [base.id]: http(),
  },
});

// Add Farcaster Frame connector to the beginning of the list
const connectors = config.connectors;
if (!connectors.some(c => c.id === 'farcaster')) {
  (config as any).connectors = [farcasterFrame(), ...connectors];
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="relative flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <div className="absolute inset-0 bg-primary blur-3xl opacity-20 animate-pulse" />
          <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] animate-pulse">Initialising Protocol</p>
        </div>
      </div>
    );
  }

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme({
          accentColor: '#8B5CF6',
          accentColorForeground: 'white',
          borderRadius: 'large',
        })} modalSize="compact">
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
