'use client';

import { useEffect, useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export function WalletConnector() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-9 px-4 bg-white/5 border border-white/10 rounded-xl animate-pulse flex items-center justify-center">
        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Initialising...</span>
      </div>
    );
  }

  return <ConnectButton label="Connect" showBalance={false} chainStatus="icon" accountStatus="avatar" />;
}
