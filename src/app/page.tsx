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
    <main className="min-h-screen bg-[#051923] text-white font-sans pb-24 relative overflow-hidden">
      {/* Bikini Bottom Background Layer */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Sea Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0077be] via-[#005f8d] to-[#002b4e]" />
        
        {/* Animated Bubbles */}
        {[...Array(12)].map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full bg-white/20 blur-[1px] animate-bubble"
            style={{
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 20 + 5}px`,
              height: `${Math.random() * 20 + 5}px`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${Math.random() * 5 + 5}s`
            }}
          />
        ))}

        {/* Bikini Bottom Flower Clouds (Stylized) */}
        <div className="absolute top-10 left-10 w-32 h-32 text-bikini-pink/20 animate-flower opacity-30">
           <svg viewBox="0 0 100 100" fill="currentColor">
             <path d="M50 0 C60 20 100 20 100 50 C100 80 60 80 50 100 C40 80 0 80 0 50 C0 20 40 20 50 0" />
           </svg>
        </div>
        <div className="absolute top-40 right-20 w-48 h-48 text-bikini-yellow/10 animate-flower opacity-20" style={{ animationDelay: '2s' }}>
           <svg viewBox="0 0 100 100" fill="currentColor">
             <path d="M50 0 C60 20 100 20 100 50 C100 80 60 80 50 100 C40 80 0 80 0 50 C0 20 40 20 50 0" />
           </svg>
        </div>

        {/* Sand at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-[#F4E4BC] skew-y-2 translate-y-16 blur-xl opacity-20" />
      </div>

      {/* OpenSea Style Header */}
      <header className="sticky top-0 z-50 px-4 sm:px-8 py-4 backdrop-blur-xl border-b border-white/10 bg-black/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-opensea-blue rounded-xl flex items-center justify-center shadow-lg transform -rotate-6">
            <ShoppingBag className="text-white" size={24} />
          </div>
          <div className="hidden sm:block">
            <h1 className="font-black tracking-tight text-xl">OUWIBO SEA</h1>
            <p className="text-[8px] font-bold text-opensea-blue uppercase tracking-widest">Base Marketplace</p>
          </div>
        </div>

        <div className="flex-1 max-w-xs mx-4 hidden md:block">
           <div className="relative">
              <input type="text" placeholder="Search items, collections..." className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-2 text-sm focus:outline-none focus:border-opensea-blue transition-all" />
              <LayoutGrid className="absolute left-3 top-2.5 text-white/30" size={16} />
           </div>
        </div>

        <ConnectButton 
          client={client} 
          theme="dark" 
          wallets={wallets} 
          chain={base} 
          connectButton={{ 
            className: "!bg-opensea-blue hover:!bg-opensea-dark !text-white !font-bold !px-6 !py-2.5 !rounded-xl !transition-all !shadow-lg !shadow-opensea-blue/20",
            label: "Wallet"
          }} 
        />
      </header>

      <div className="relative z-10 max-w-4xl mx-auto px-4 pt-8">
        <AnimatePresence mode="wait">
          {activeTab === 'mint' && <MintView key="mint" contract={contract} isConnected={isConnected} minted={minted} setMinted={setMinted} setTxHash={setTxHash} txHash={txHash} mintCount={mintCount} setMintCount={setMintCount} account={account} />}
          {activeTab === 'market' && <MarketView key="market" />}
          {activeTab === 'profile' && <ProfileView key="profile" account={account} contract={contract} />}
          {activeTab === 'roadmap' && <RoadmapView key="roadmap" />}
        </AnimatePresence>
      </div>

      {/* OpenSea Style Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#04111D]/90 backdrop-blur-2xl border-t border-white/10 p-2 sm:p-4 flex items-center justify-center gap-2 sm:gap-8">
        {[
          { id: 'mint', icon: LayoutGrid, label: 'Explore' },
          { id: 'market', icon: ShoppingBag, label: 'Stats' },
          { id: 'profile', icon: User, label: 'Profile' },
          { id: 'roadmap', icon: Info, label: 'Info' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={`flex items-center gap-2 px-4 sm:px-6 py-3 rounded-xl transition-all duration-300 ${activeTab === tab.id ? 'bg-white/10 text-opensea-blue' : 'text-white/60 hover:bg-white/5'}`}
          >
            <tab.icon size={20} />
            <span className="text-sm font-bold hidden sm:block">{tab.label}</span>
          </button>
        ))}
      </nav>
    </main>
  );
}

// --- OpenSea Styled Sub-Views ---

function MintView({ contract, isConnected, minted, setMinted, setTxHash, txHash, mintCount, setMintCount, account }: any) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="grid md:grid-cols-2 gap-8 items-start">
      {/* NFT Card - OpenSea Style */}
      <div className="bg-opensea-card rounded-2xl overflow-hidden border border-white/10 shadow-2xl hover:translate-y-[-4px] transition-transform duration-300">
        <div className="relative aspect-square">
          <img src="/ouwibo-nft.png" alt="NFT" className="w-full h-full object-cover" />
          <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md p-2 rounded-lg">
             <Zap size={16} className="text-bikini-yellow" />
          </div>
        </div>
        <div className="p-5 flex flex-col gap-1">
          <p className="text-opensea-blue text-xs font-bold uppercase tracking-tight">Ouwibo Genesis</p>
          <h2 className="text-xl font-black italic tracking-tight">Ouwibo Pass #0</h2>
          <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4">
             <div>
                <p className="text-white/40 text-[10px] uppercase font-bold">Price</p>
                <p className="font-black text-lg">FREE <span className="text-white/40 text-xs">GASLESS</span></p>
             </div>
             <div className="text-right">
                <p className="text-white/40 text-[10px] uppercase font-bold">Supply</p>
                <p className="font-black text-lg italic">1240 / 6,969</p>
             </div>
          </div>
        </div>
      </div>

      {/* Description & Action */}
      <div className="flex flex-col gap-6 pt-4">
        <div className="space-y-2">
           <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none">Ouwibo Genesis Pass</h1>
           <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-white/5 rounded text-[10px] font-bold text-white/60">ERC-1155</span>
              <span className="px-2 py-1 bg-base-emerald/20 rounded text-[10px] font-bold text-base-emerald uppercase">Live on Base</span>
           </div>
        </div>

        <p className="text-white/60 leading-relaxed italic text-sm">
          Koleksi perdana dari Ouwibo Sea. Genesis Pass memberikan akses eksklusif ke portal airdrop, fitur trading premium, dan utilitas ekosistem di masa depan.
        </p>

        <div className="bg-white/5 rounded-2xl p-6 border border-white/10 space-y-4">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                 <Users size={16} className="text-white/40" />
                 <span className="text-xs text-white/40 font-bold">Ownership Verifed</span>
              </div>
              <ShieldCheck size={16} className="text-opensea-blue" />
           </div>
           
           {!minted ? (
             isConnected ? (
               <TransactionButton
                 transaction={() => claimTo({ contract, to: account!.address, tokenId: 0n, quantity: 1n })}
                 onTransactionConfirmed={( receipt ) => { setMinted(true); setTxHash(receipt.transactionHash); setMintCount((p: any) => p + 1); }}
                 className="!w-full !bg-opensea-blue hover:!bg-opensea-dark !text-white !font-black !py-6 !rounded-xl !text-lg !uppercase !shadow-xl !border-none active:!scale-95 transition-all"
               >
                 MINT GENESIS PASS
               </TransactionButton>
             ) : (
               <div className="p-4 bg-white/5 rounded-xl border border-dashed border-white/10 text-center">
                  <p className="text-xs font-bold text-white/30 uppercase tracking-widest italic">Connect wallet to begin minting</p>
               </div>
             )
           ) : (
             <div className="flex flex-col gap-3">
                <div className="bg-base-emerald/10 border border-base-emerald/20 p-4 rounded-xl flex items-center gap-3">
                   <CheckCircle2 size={24} className="text-base-emerald" />
                   <div>
                      <p className="text-xs font-black uppercase">Mint Successful!</p>
                      <a href={`https://basescan.org/tx/${txHash}`} target="_blank" className="text-[10px] text-white/40 underline">View Transaction</a>
                   </div>
                </div>
                <button onClick={() => window.open('https://warpcast.com', '_blank')} className="w-full bg-white text-black font-black py-4 rounded-xl text-xs uppercase tracking-widest hover:bg-bikini-yellow transition-all">
                   Share to Feed
                </button>
             </div>
           )}
        </div>
      </div>
    </motion.div>
  );
}

function MarketView() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
         <h2 className="text-3xl font-black italic uppercase">Marketplace</h2>
         <div className="flex gap-2">
            {['Items', 'Activity'].map(t => (
              <button key={t} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${t === 'Items' ? 'bg-white/10' : 'text-white/40 hover:text-white/60'}`}>{t}</button>
            ))}
         </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {[1,2,3,4,5,6,7,8].map(i => (
          <div key={i} className="bg-opensea-card rounded-xl overflow-hidden border border-white/5 opacity-40 grayscale group cursor-not-allowed">
             <div className="aspect-square bg-white/5 flex items-center justify-center">
                <ShoppingBag size={24} className="text-white/10" />
             </div>
             <div className="p-3 space-y-2">
                <div className="h-3 bg-white/10 rounded w-1/2" />
                <div className="h-2 bg-white/5 rounded w-3/4" />
             </div>
          </div>
        ))}
      </div>

      <div className="bg-opensea-blue/10 border border-opensea-blue/20 p-8 rounded-3xl text-center backdrop-blur-md">
         <ShoppingBag size={40} className="text-opensea-blue mx-auto mb-4" />
         <h3 className="text-xl font-black uppercase italic">Marketplace Launching Soon</h3>
         <p className="text-xs text-white/50 mt-2 max-w-sm mx-auto italic font-medium">Trading sekunder Ouwibo Sea akan segera hadir di jaringan Base. Pantau terus update selanjutnya!</p>
      </div>
    </motion.div>
  );
}

function ProfileView({ account, contract }: any) {
  const { data: balance, isLoading } = useReadContract({
    contract,
    method: "function balanceOf(address account, uint256 id) view returns (uint256)",
    params: [account?.address || "0x0000000000000000000000000000000000000000", 0n],
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      {/* Profile Banner Style */}
      <div className="relative h-32 bg-gradient-to-r from-opensea-blue to-bikini-yellow rounded-3xl overflow-hidden shadow-2xl">
         <div className="absolute inset-0 bg-black/20" />
         <div className="absolute -bottom-8 left-8">
            <div className="w-24 h-24 bg-[#0a0a0a] border-4 border-[#0a0a0a] rounded-2xl shadow-2xl flex items-center justify-center overflow-hidden">
               {account ? <div className="text-4xl">🔱</div> : <User size={40} className="text-white/10" />}
            </div>
         </div>
      </div>

      <div className="pt-8 px-8">
         <h2 className="text-3xl font-black italic uppercase tracking-tighter">
            {account ? `${account.address.slice(0,6)}...${account.address.slice(-4)}` : 'Unnamed Collector'}
         </h2>
         <p className="text-xs font-bold text-white/40 uppercase tracking-widest mt-1 italic">Ouwibo Member since 2026</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
         <div className="bg-opensea-card p-6 rounded-2xl border border-white/10 flex items-center justify-between group hover:border-opensea-blue transition-all">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center"><Zap className="text-bikini-yellow" size={20} /></div>
               <div>
                  <p className="text-[10px] font-bold text-white/40 uppercase">Assets Owned</p>
                  <p className="font-black text-lg italic uppercase">Genesis Pass</p>
               </div>
            </div>
            <p className="text-3xl font-black text-opensea-blue">{isLoading ? '...' : (balance?.toString() || '0')}</p>
         </div>

         <div className="bg-opensea-card p-6 rounded-2xl border border-white/10 flex items-center justify-between opacity-50 italic">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center"><Wallet className="text-white/40" size={20} /></div>
               <div>
                  <p className="text-[10px] font-bold text-white/40 uppercase">Total Volume</p>
                  <p className="font-black text-lg uppercase tracking-tight">0.00 ETH</p>
               </div>
            </div>
         </div>
      </div>
    </motion.div>
  );
}

function RoadmapView() {
  const steps = [
    { phase: "Q1 2026", title: "Genesis Mint", status: "Live", desc: "Minting publik 6,969 Genesis Pass.", color: "opensea-blue" },
    { phase: "Q2 2026", title: "Shell Token", status: "Pending", desc: "Distribusi token tata kelola ekosistem.", color: "bikini-yellow" },
    { phase: "Q3 2026", title: "Coral DAO", status: "Future", desc: "Integrasi voting komunitas.", color: "bikini-pink" },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
      <div className="text-center">
         <h2 className="text-4xl font-black italic uppercase tracking-tighter">Ouwibo Roadmap</h2>
         <div className="w-24 h-1 bg-opensea-blue mx-auto mt-2 rounded-full" />
      </div>

      <div className="grid gap-6">
        {steps.map((step, i) => (
          <div key={i} className="flex gap-6 items-center group">
            <div className="text-right w-24 hidden sm:block">
               <p className="text-[10px] font-black text-white/30 uppercase italic">{step.phase}</p>
            </div>
            <div className="flex-1 bg-opensea-card border border-white/10 p-6 rounded-2xl group-hover:border-opensea-blue transition-all">
               <div className="flex items-center justify-between mb-2">
                  <h3 className="font-black text-lg italic uppercase">{step.title}</h3>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${step.status === 'Live' ? 'bg-base-emerald text-black' : 'bg-white/5 text-white/40'}`}>{step.status}</span>
               </div>
               <p className="text-xs text-white/50 italic leading-relaxed">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-bikini-yellow/10 border-2 border-dashed border-bikini-yellow/20 p-8 rounded-3xl text-center">
         <p className="text-sm font-black italic uppercase text-bikini-yellow tracking-widest animate-pulse">Wait for the next Wave...</p>
      </div>
    </motion.div>
  );
}