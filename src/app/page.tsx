'use client';

import React, { useState, useEffect } from "react";
import Image from 'next/image';
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Share2, ShieldCheck, Zap, ExternalLink, RefreshCw, Users, CheckCircle2, ArrowRight, LayoutGrid, ShoppingBag, User, Map, Info, Wallet, Loader2, AlertCircle } from 'lucide-react';
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
  const [error, setError] = useState<string | null>(null);
  
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

  if (!mounted) return (
    <div className="min-h-screen bg-[#051923] flex items-center justify-center">
      <Loader2 className="text-opensea-blue animate-spin" size={40} />
    </div>
  );

  return (
    <main className="min-h-screen bg-[#051923] text-white font-sans pb-28 relative overflow-hidden">
      {/* Bikini Bottom Background Layer */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0077be] via-[#005f8d] to-[#002b4e]" />
        
        {/* Animated Bubbles */}
        {[...Array(15)].map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full bg-white/10 blur-[1px] animate-bubble"
            style={{
              left: `${(i * 7) % 100}%`,
              width: `${(i % 3 + 1) * 8}px`,
              height: `${(i % 3 + 1) * 8}px`,
              animationDelay: `${i * 0.8}s`,
              animationDuration: `${6 + (i % 4)}s`
            }}
          />
        ))}

        {/* Flower Clouds */}
        <div className="absolute top-[-5%] left-[-5%] w-64 h-64 text-bikini-pink/10 animate-flower opacity-40 rotate-12">
           <svg viewBox="0 0 100 100" fill="currentColor">
             <path d="M50 0 C60 20 100 20 100 50 C100 80 60 80 50 100 C40 80 0 80 0 50 C0 20 40 20 50 0" />
           </svg>
        </div>
        <div className="absolute top-[60%] right-[-10%] w-80 h-80 text-bikini-yellow/5 animate-flower opacity-30">
           <svg viewBox="0 0 100 100" fill="currentColor">
             <path d="M50 0 C60 20 100 20 100 50 C100 80 60 80 50 100 C40 80 0 80 0 50 C0 20 40 20 50 0" />
           </svg>
        </div>
      </div>

      {/* Modern Header */}
      <header className="sticky top-0 z-50 px-4 sm:px-10 py-5 backdrop-blur-2xl border-b border-white/5 bg-black/40 flex items-center justify-between">
        <div className="flex items-center gap-4 group cursor-pointer">
          <div className="w-11 h-11 bg-gradient-to-tr from-opensea-blue to-cyan-400 rounded-2xl flex items-center justify-center shadow-lg transform transition-transform group-hover:rotate-12">
            <ShoppingBag className="text-white" size={24} />
          </div>
          <div className="hidden sm:block">
            <h1 className="font-black tracking-tight text-2xl">OUWIBO SEA</h1>
            <p className="text-[9px] font-black text-opensea-blue uppercase tracking-[0.2em] mt-1">Base Official Portal</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <ConnectButton 
            client={client} 
            theme="dark" 
            wallets={wallets} 
            chain={base} 
            connectButton={{ 
              className: "!bg-opensea-blue hover:!bg-opensea-dark !text-white !font-black !px-8 !py-3 !rounded-2xl !transition-all !shadow-xl !active:scale-95 !text-sm",
              label: "Connect"
            }} 
          />
        </div>
      </header>

      {/* Main Content Area */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-10">
        {error && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-sm italic font-medium">
            <AlertCircle size={18} /> {error}
            <button onClick={() => setError(null)} className="ml-auto opacity-40 hover:opacity-100">✕</button>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {activeTab === 'mint' && <MintView key="mint" contract={contract} isConnected={isConnected} minted={minted} setMinted={setMinted} setTxHash={setTxHash} txHash={txHash} mintCount={mintCount} setMintCount={setMintCount} account={account} setError={setError} />}
          {activeTab === 'market' && <MarketView key="market" />}
          {activeTab === 'profile' && <ProfileView key="profile" account={account} contract={contract} />}
          {activeTab === 'roadmap' && <RoadmapView key="roadmap" />}
        </AnimatePresence>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-[#04111D]/80 backdrop-blur-3xl border border-white/10 p-2 rounded-[32px] flex items-center gap-2 shadow-2xl">
        {[
          { id: 'mint', icon: LayoutGrid, label: 'Explore' },
          { id: 'market', icon: ShoppingBag, label: 'Secondary' },
          { id: 'profile', icon: User, label: 'Treasury' },
          { id: 'roadmap', icon: Map, label: 'Path' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={`flex items-center gap-2 px-6 py-3 rounded-[24px] transition-all duration-500 group ${activeTab === tab.id ? 'bg-opensea-blue text-white shadow-lg' : 'text-white/40 hover:text-white/70 hover:bg-white/5'}`}
          >
            <tab.icon size={20} className={activeTab === tab.id ? 'animate-pulse' : ''} />
            <span className={`text-xs font-black uppercase tracking-widest overflow-hidden transition-all duration-500 ${activeTab === tab.id ? 'max-w-[100px] opacity-100 ml-1' : 'max-w-0 opacity-0'}`}>{tab.label}</span>
          </button>
        ))}
      </nav>
    </main>
  );
}

// --- Optimized Mint View ---

function MintView({ contract, isConnected, minted, setMinted, setTxHash, txHash, mintCount, setMintCount, account, setError }: any) {
  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="grid lg:grid-cols-12 gap-12 items-center">
      
      {/* Visual Side */}
      <div className="lg:col-span-5 group">
        <div className="relative aspect-[4/5] rounded-[48px] overflow-hidden border-2 border-white/10 bg-black shadow-2xl transition-all duration-700 group-hover:border-opensea-blue/50 group-hover:shadow-opensea-blue/10">
          <Image 
            src="/ouwibo-nft.png" 
            alt="Ouwibo Genesis NFT" 
            fill 
            className="object-cover transition-transform duration-[2s] group-hover:scale-110"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
          <div className="absolute bottom-10 left-10 right-10">
            <p className="text-opensea-blue text-xs font-black uppercase tracking-[0.4em] mb-2 drop-shadow-md">Tier: Genesis</p>
            <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-none drop-shadow-2xl">Ouwibo Pass #0</h2>
          </div>
        </div>
      </div>

      {/* Info Side */}
      <div className="lg:col-span-7 space-y-8">
        <div className="space-y-4">
           <div className="inline-flex items-center gap-2 px-4 py-1 bg-white/5 border border-white/10 rounded-full">
              <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Base Mainnet</span>
              <ShieldCheck size={12} className="text-opensea-blue" />
           </div>
           <h1 className="text-6xl font-black italic tracking-tighter uppercase leading-[0.9] bg-gradient-to-br from-white via-white to-white/20 bg-clip-text text-transparent">
             Secure Your <br/>Legacy Pass.
           </h1>
           <p className="text-lg text-white/50 leading-relaxed italic max-w-xl font-medium">
             Gerbang eksklusif menuju ekosistem Ouwibo di jaringan Base. Dapatkan akses prioritas airdrop, fitur premium, dan koleksi langka.
           </p>
        </div>

        {/* Action Card */}
        <div className="p-1 bg-gradient-to-r from-opensea-blue/20 to-transparent rounded-[40px]">
           <div className="bg-[#0a0a0a]/60 backdrop-blur-3xl p-8 rounded-[39px] border border-white/5 space-y-6">
              <div className="flex justify-between items-end border-b border-white/5 pb-6">
                 <div>
                    <p className="text-[10px] font-black text-white/30 uppercase mb-1 tracking-widest">Minting Fee</p>
                    <p className="text-2xl font-black italic text-base-emerald uppercase">Free Gasless</p>
                 </div>
                 <div className="text-right">
                    <p className="text-[10px] font-black text-white/30 uppercase mb-1 tracking-widest">Allowance</p>
                    <p className="text-2xl font-black italic text-base-amber">1 / Wallet</p>
                 </div>
              </div>

              {!minted ? (
                isConnected ? (
                  <TransactionButton
                    transaction={() => claimTo({ contract, to: account!.address, tokenId: 0n, quantity: 1n })}
                    onTransactionConfirmed={( receipt ) => { setMinted(true); setTxHash(receipt.transactionHash); setMintCount((p: any) => p + 1); }}
                    onError={(err) => setError(err.message)}
                    className="!w-full !bg-opensea-blue hover:!bg-opensea-dark !text-white !font-black !py-8 !rounded-3xl !text-xl !uppercase !shadow-2xl !shadow-opensea-blue/20 !border-none transition-all active:scale-95"
                  >
                    MINT GENESIS PASS (MAX 1)
                  </TransactionButton>
                ) : (
                  <div className="p-6 bg-white/5 rounded-3xl border border-dashed border-white/10 text-center space-y-3">
                     <Wallet className="mx-auto text-white/20" size={32} />
                     <p className="text-xs font-bold text-white/30 uppercase tracking-widest italic">Connect your wallet to participate</p>
                  </div>
                )
              ) : (
                <div className="space-y-4">
                   <div className="bg-base-emerald/10 border border-base-emerald/20 p-6 rounded-3xl flex items-center gap-5">
                      <div className="w-12 h-12 bg-base-emerald rounded-2xl flex items-center justify-center shadow-lg shadow-base-emerald/20">
                         <CheckCircle2 size={28} className="text-black" />
                      </div>
                      <div>
                         <p className="text-sm font-black uppercase italic leading-none mb-1">Claimed Success!</p>
                         <a href={`https://basescan.org/tx/${txHash}`} target="_blank" className="text-[10px] text-white/40 hover:text-opensea-blue transition-colors underline uppercase font-bold tracking-widest">Verify Transaction</a>
                      </div>
                   </div>
                   <button onClick={() => window.open('https://warpcast.com', '_blank')} className="w-full bg-white text-black font-black py-5 rounded-3xl text-sm uppercase tracking-[0.2em] hover:bg-bikini-yellow transition-all shadow-xl">
                      SHARE TO FEED
                   </button>
                </div>
              )}
           </div>
        </div>
      </div>
    </motion.div>
  );
}

function MarketView() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
      <div className="text-center space-y-4">
         <h2 className="text-5xl font-black italic uppercase tracking-tighter">Secondary Sea.</h2>
         <p className="text-white/40 italic font-medium max-w-lg mx-auto">Explore the upcoming decentralized marketplace for Ouwibo Genesis holders.</p>
      </div>
      <div className="bg-white/5 border border-white/10 p-20 rounded-[48px] text-center backdrop-blur-xl border-dashed">
         <ShoppingBag size={48} className="text-opensea-blue/40 mx-auto mb-6" />
         <h3 className="text-2xl font-black uppercase italic mb-2">Marketplace Loading...</h3>
         <p className="text-sm text-white/40 italic">Trading sekunder sedang disinkronkan dengan protokol Base.</p>
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
      <div className="relative h-48 bg-gradient-to-br from-opensea-blue via-cyan-500 to-bikini-yellow rounded-[48px] shadow-2xl overflow-hidden">
         <div className="absolute -bottom-10 left-12">
            <div className="w-32 h-32 bg-[#051923] border-[6px] border-[#051923] rounded-[40px] shadow-2xl flex items-center justify-center overflow-hidden">
               {account ? <div className="text-5xl">🔱</div> : <User size={48} className="text-white/5" />}
            </div>
         </div>
      </div>
      <div className="pt-6 px-12">
         <h2 className="text-4xl font-black italic uppercase tracking-tighter">
            {account ? `${account.address.slice(0,6)}...${account.address.slice(-4)}` : 'Unnamed Voyager'}
         </h2>
         <p className="text-xs font-bold text-opensea-blue uppercase tracking-[0.3em] mt-2 italic">Active Collector</p>
         <div className="mt-8 p-6 bg-white/5 rounded-3xl border border-white/10 flex justify-between items-center">
            <div className="flex items-center gap-4">
               <Zap className="text-bikini-yellow" />
               <span className="font-bold italic uppercase">Genesis Pass Owned</span>
            </div>
            <p className="text-3xl font-black text-opensea-blue">{isLoading ? '...' : (balance?.toString() || '0')}</p>
         </div>
      </div>
    </motion.div>
  );
}

function RoadmapView() {
  const steps = [
    { phase: "Phase 01", title: "Genesis Launch", status: "Active", desc: "Global minting of 6,969 Genesis Passes on Base." },
    { phase: "Phase 02", title: "Airdrop Gateway", status: "Upcoming", desc: "Snapshot and reward distribution for holders." },
    { phase: "Phase 03", title: "Social DAO", status: "Planning", desc: "Governance integration with Farcaster protocol." },
  ];

  return (
    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-16 py-10">
      <div className="text-center space-y-4">
         <h2 className="text-6xl font-black italic uppercase tracking-tighter">The Blue Map.</h2>
         <p className="text-white/40 italic font-medium max-w-xl mx-auto text-lg">Visi ekosistem Ouwibo untuk tahun 2026.</p>
      </div>
      <div className="grid gap-8 max-w-4xl mx-auto">
        {steps.map((step, i) => (
          <div key={i} className="relative bg-white/5 border border-white/10 p-10 rounded-[40px] flex flex-col md:flex-row gap-8 items-center transition-all duration-500 hover:bg-white/[0.08]">
             <div className="w-20 h-20 bg-black rounded-3xl flex items-center justify-center font-black text-3xl italic text-opensea-blue shrink-0">0{i+1}</div>
             <div className="space-y-2 flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3">
                   <span className="text-[10px] font-black text-opensea-blue uppercase tracking-[0.3em]">{step.phase}</span>
                   <span className={`px-3 py-0.5 rounded-full text-[8px] font-black uppercase ${step.status === 'Active' ? 'bg-base-emerald text-black' : 'bg-white/10 text-white/40'}`}>{step.status}</span>
                </div>
                <h3 className="text-3xl font-black italic uppercase tracking-tight">{step.title}</h3>
                <p className="text-white/50 text-sm italic">{step.desc}</p>
             </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
