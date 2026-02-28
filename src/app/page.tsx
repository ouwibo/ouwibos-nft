'use client';

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Share2, ShieldCheck, Zap, ExternalLink, RefreshCw, Users, CheckCircle2, ArrowRight } from 'lucide-react';
import { createThirdwebClient, getContract } from "thirdweb";
import { base } from "thirdweb/chains";
import { claimTo } from "thirdweb/extensions/erc1155";
import { TransactionButton, ConnectButton, useActiveAccount } from "thirdweb/react";
import { createWallet, inAppWallet } from "thirdweb/wallets";
import sdk from "@farcaster/frame-sdk";

import { LayoutGrid, ShoppingBag, User, Map, Info, Wallet } from 'lucide-react';
import { createThirdwebClient, getContract } from "thirdweb";
import { base } from "thirdweb/chains";
import { claimTo } from "thirdweb/extensions/erc1155";
import { TransactionButton, ConnectButton, useActiveAccount, useReadContract } from "thirdweb/react";
import { createWallet, inAppWallet } from "thirdweb/wallets";
import sdk from "@farcaster/frame-sdk";

// Initialize Thirdweb Client
const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "bdaebf7f32c0b8df548c6b9c5f800dbf",
});

const wallets = [
  createWallet("com.coinbase.wallet"),
  createWallet("io.metamask"),
  inAppWallet({
    auth: {
      options: ["google", "discord", "farcaster", "email", "passkey"],
    },
  }),
];

type Tab = 'mint' | 'market' | 'profile' | 'roadmap';

export default function OuwiboBaseApp() {
  const account = useActiveAccount();
  const isConnected = !!account;
  
  const [activeTab, setActiveTab] = useState<Tab>('mint');
  const [minted, setMinted] = useState(false);
  const [mintCount, setMintCount] = useState(1240);
  const [txHash, setTxHash] = useState<string | null>(null);
  
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const init = async () => {
      try {
        await sdk.actions.ready();
      } catch (error) {
        console.error("SDK Error", error);
      }
    };
    init();
    setMounted(true);
  }, []);

  const contract = getContract({
    client,
    chain: base,
    address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x3525fDbC54DC01121C8e12C3948187E6153Cdf25",
  });

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white font-sans pb-24 relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-base-amber rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-base-emerald rounded-full blur-[120px] animate-pulse-slow delay-700" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 px-6 py-4 backdrop-blur-md border-b border-white/5 bg-black/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-base-amber rounded-lg flex items-center justify-center font-black text-black italic">O</div>
          <h1 className="font-black tracking-tighter text-lg uppercase">OUWIBO</h1>
        </div>
        <ConnectButton client={client} theme="dark" wallets={wallets} chain={base} connectButton={{ className: "!bg-white/5 !border !border-white/10 !rounded-xl !px-4 !py-2 !text-[10px] !font-black !uppercase !text-white/80" }} />
      </header>

      <div className="max-w-md mx-auto px-6 pt-6">
        <AnimatePresence mode="wait">
          {activeTab === 'mint' && <MintView key="mint" contract={contract} isConnected={isConnected} minted={minted} setMinted={setMinted} setTxHash={setTxHash} txHash={txHash} mintCount={mintCount} setMintCount={setMintCount} account={account} />}
          {activeTab === 'market' && <MarketView key="market" />}
          {activeTab === 'profile' && <ProfileView key="profile" account={account} contract={contract} />}
          {activeTab === 'roadmap' && <RoadmapView key="roadmap" />}
        </AnimatePresence>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-6 left-6 right-6 z-50 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[28px] p-2 flex items-center justify-around shadow-2xl">
        {[
          { id: 'mint', icon: LayoutGrid, label: 'Mint' },
          { id: 'market', icon: ShoppingBag, label: 'Market' },
          { id: 'profile', icon: User, label: 'Profile' },
          { id: 'roadmap', icon: Map, label: 'Road' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all duration-300 ${activeTab === tab.id ? 'bg-base-amber text-black scale-105 shadow-lg' : 'text-white/40 hover:text-white/70'}`}
          >
            <tab.icon size={20} strokeWidth={activeTab === tab.id ? 3 : 2} />
            <span className="text-[9px] font-black uppercase tracking-widest">{tab.label}</span>
          </button>
        ))}
      </nav>
    </main>
  );
}

// --- Sub-Views ---

function MintView({ contract, isConnected, minted, setMinted, setTxHash, txHash, mintCount, setMintCount, account }: any) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col gap-6">
      <div className="relative aspect-square rounded-[40px] overflow-hidden border border-white/10 bg-black group">
        <img src="/ouwibo-nft.png" alt="NFT" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
        <div className="absolute bottom-8 left-8">
          <p className="text-base-amber text-[10px] font-black uppercase tracking-[0.3em] mb-1">Genesis Pass</p>
          <h2 className="text-3xl font-black italic tracking-tighter uppercase leading-none">Ouwibo #0</h2>
        </div>
      </div>

      <div className="bg-white/5 rounded-[32px] p-8 border border-white/5 text-center">
        <h3 className="text-4xl font-black mb-2 font-mono tracking-tighter">{mintCount.toLocaleString()}<span className="text-white/20">/6,969</span></h3>
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/30 italic">Supply Claimed</p>
      </div>

      {!minted ? (
        isConnected ? (
          <TransactionButton
            transaction={() => claimTo({ contract, to: account!.address, tokenId: 0n, quantity: 1n })}
            onTransactionConfirmed={( receipt ) => { setMinted(true); setTxHash(receipt.transactionHash); setMintCount((p: any) => p + 1); }}
            className="!w-full !bg-gradient-to-r !from-base-amber !to-orange-500 !text-black !font-black !py-8 !rounded-3xl !text-xl !uppercase !shadow-2xl active:!scale-95"
          >
            MINT GENESIS PASS
          </TransactionButton>
        ) : (
          <div className="text-center p-4 bg-white/5 rounded-2xl border border-dashed border-white/10">
            <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">Connect Wallet to Mint</p>
          </div>
        )
      ) : (
        <div className="bg-base-emerald/10 border border-base-emerald/20 rounded-3xl p-6 text-center flex flex-col gap-4">
          <CheckCircle2 size={40} className="text-base-emerald mx-auto" />
          <h3 className="text-xl font-black italic uppercase">Claimed Successfully!</h3>
          <a href={`https://basescan.org/tx/${txHash}`} target="_blank" className="text-[10px] font-bold opacity-40 hover:opacity-100 uppercase tracking-widest flex items-center justify-center gap-1">
            View on Explorer <ExternalLink size={10} />
          </a>
        </div>
      )}
    </motion.div>
  );
}

function MarketView() {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black italic uppercase tracking-tighter">Marketplace</h2>
        <div className="px-3 py-1 bg-white/5 rounded-full border border-white/10 text-[9px] font-bold uppercase tracking-widest text-white/60">Coming Soon</div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 opacity-50 filter grayscale">
        {[1,2,3,4].map(i => (
          <div key={i} className="bg-white/5 rounded-3xl p-4 border border-white/5 flex flex-col gap-3">
            <div className="aspect-square bg-white/5 rounded-2xl flex items-center justify-center"><ShoppingBag size={24} className="opacity-20" /></div>
            <div className="space-y-2">
              <div className="h-4 bg-white/10 rounded-md w-3/4" />
              <div className="h-3 bg-white/5 rounded-md w-1/2" />
            </div>
          </div>
        ))}
      </div>
      
      <div className="bg-base-amber/10 border border-base-amber/20 rounded-3xl p-8 text-center space-y-4">
        <ShoppingBag size={40} className="text-base-amber mx-auto" />
        <h3 className="text-xl font-black italic uppercase">Secondary Market</h3>
        <p className="text-xs text-white/60 leading-relaxed font-medium italic">Pasar sekunder resmi Ouwibo sedang dalam tahap pengembangan. Segera Anda dapat menjual dan membeli koleksi antar sesama kolektor secara langsung.</p>
      </div>
    </motion.div>
  );
}

function ProfileView({ account, contract }: any) {
  // In a real app, you would use useOwnedNFTs from thirdweb
  const { data: balance, isLoading } = useReadContract({
    contract,
    method: "function balanceOf(address account, uint256 id) view returns (uint256)",
    params: [account?.address || "0x0000000000000000000000000000000000000000", 0n],
  });

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col gap-8">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="w-24 h-24 bg-gradient-to-br from-base-amber to-orange-500 rounded-[32px] flex items-center justify-center p-1 shadow-2xl">
          <div className="w-full h-full bg-[#0a0a0a] rounded-[30px] flex items-center justify-center overflow-hidden">
             {account ? <div className="text-4xl">🦊</div> : <User size={40} className="text-white/20" />}
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-black italic uppercase tracking-tighter">My Collection</h2>
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">{account ? `${account.address.slice(0,6)}...${account.address.slice(-4)}` : 'Wallet Not Connected'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="bg-white/5 rounded-[32px] p-6 border border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center">
              <Zap size={20} className="text-base-amber" />
            </div>
            <div>
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Genesis Pass</p>
              <p className="font-bold text-lg italic tracking-tight uppercase">Ouwibo Genesis</p>
            </div>
          </div>
          <div className="text-right">
             <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Balance</p>
             <p className="text-2xl font-black text-base-amber">{isLoading ? '...' : (balance?.toString() || '0')}</p>
          </div>
        </div>

        <div className="bg-white/5 rounded-[32px] p-6 border border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-4 text-white/30 italic">
            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center">
              <RefreshCw size={20} className="opacity-20" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest">Activity History</p>
              <p className="text-xs">No recent transactions</p>
            </div>
          </div>
        </div>
      </div>
      
      {!account && (
         <div className="mt-4">
            <ConnectButton client={client} theme="dark" wallets={wallets} chain={base} connectButton={{ className: "!w-full !bg-white/5 !border !border-white/10 !rounded-3xl !py-4 !font-black !uppercase" }} />
         </div>
      )}
    </motion.div>
  );
}

function RoadmapView() {
  const steps = [
    { phase: "Q1 2026", title: "Genesis Launch", status: "Active", desc: "Peluncuran 6,969 Genesis Pass di jaringan Base.", color: "base-amber" },
    { phase: "Q2 2026", title: "Airdrop Portal", status: "Upcoming", desc: "Snapshot holder dan distribusi insentif ekosistem.", color: "base-emerald" },
    { phase: "Q3 2026", title: "Social DAO", status: "Planning", desc: "Integrasi voting Farcaster untuk pemegang NFT.", color: "blue-500" },
    { phase: "Q4 2026", title: "Metaverse Integration", status: "Planning", desc: "Avatar 3D dan interoperabilitas aset lintas platform.", color: "purple-500" },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col gap-8">
      <div>
        <h2 className="text-2xl font-black italic uppercase tracking-tighter">Ouwibo Roadmap</h2>
        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1 italic">Strategi Ekosistem 2026</p>
      </div>

      <div className="space-y-4 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-white/5">
        {steps.map((step, i) => (
          <div key={i} className="flex gap-6 relative">
            <div className={`w-10 h-10 rounded-2xl bg-black border ${step.status === 'Active' ? 'border-base-amber shadow-[0_0_15px_rgba(251,191,36,0.2)]' : 'border-white/10'} flex-shrink-0 flex items-center justify-center z-10 bg-black`}>
               <div className={`w-3 h-3 rounded-full ${step.status === 'Active' ? 'bg-base-amber animate-pulse' : 'bg-white/10'}`} />
            </div>
            <div className="flex flex-col gap-1 bg-white/[0.02] border border-white/5 rounded-3xl p-5 w-full hover:bg-white/5 transition-colors group">
              <div className="flex items-center justify-between mb-1">
                <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-md ${step.status === 'Active' ? 'bg-base-amber text-black' : 'bg-white/10 text-white/60'}`}>{step.phase}</span>
                <span className="text-[9px] font-bold text-white/30 uppercase italic">{step.status}</span>
              </div>
              <h3 className="font-black italic uppercase tracking-tight text-lg group-hover:text-base-amber transition-colors">{step.title}</h3>
              <p className="text-xs text-white/50 leading-relaxed italic">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-br from-white/5 to-transparent border border-white/10 rounded-[32px] p-8">
        <h3 className="text-lg font-black uppercase italic mb-4">Tokenomics</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
            <p className="text-[9px] font-bold text-white/30 uppercase mb-1">Reserve</p>
            <p className="text-xl font-black text-base-emerald italic">40%</p>
          </div>
          <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
            <p className="text-[9px] font-bold text-white/30 uppercase mb-1">Community</p>
            <p className="text-xl font-black text-base-amber italic">60%</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}