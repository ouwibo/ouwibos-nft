'use client';

import React, { useState, useEffect } from "react";
import Image from 'next/image';
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutGrid, ShoppingBag, User, Map, Info, Wallet, Loader2, 
  AlertCircle, ShieldCheck, Zap, CheckCircle2, Search, Filter, 
  ArrowUpRight, Share2, Globe, Twitter, Github, ChevronDown, Clock, Tag, RefreshCw, ChevronRight
} from 'lucide-react';
import { createThirdwebClient, getContract } from "thirdweb";
import { base } from "thirdweb/chains";
import { claimTo } from "thirdweb/extensions/erc1155";
import { TransactionButton, useActiveAccount, useReadContract } from "thirdweb/react";
import { createWallet, inAppWallet } from "thirdweb/wallets";
import sdk from "@farcaster/frame-sdk";
import { WalletConnector } from "@/components/WalletConnector";

// Initialize Thirdweb Client
const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "bdaebf7f32c0b8df548c6b9c5f800dbf",
});

// Simplified NFT Collection: Primary Asset Only
const NFT_COLLECTION = [
  { 
    id: 0n, 
    name: "Ouwibo Genesis", 
    tier: "Legendary", 
    supply: 6969, 
    image: "/ouwibo-nft.png", 
    tagline: "The Ultimate Protocol Access",
    desc: "Pass utama yang diluncurkan dalam ekosistem Ouwibo. Memberikan hak istimewa dalam pengambilan keputusan protokol, alokasi token $SHELL, dan akses ke node infrastruktur." 
  }
];

type Tab = 'explore' | 'mint' | 'profile' | 'roadmap';

export default function OuwiboBaseApp() {
  const account = useActiveAccount();
  const isConnected = !!account;
  
  const [activeTab, setActiveTab] = useState<Tab>('explore');
  const [selectedNftId, setSelectedNftId] = useState<bigint>(0n);
  const [minted, setMinted] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        await sdk.actions.ready();
      } catch (e) { console.error("SDK Error", e); }
    };
    init();
    setMounted(true);
  }, []);

  const contract = getContract({
    client,
    chain: base,
    address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x3525fDbC54DC01121C8e12C3948187E6153Cdf25",
  });

  const selectedNft = NFT_COLLECTION.find(n => n.id === selectedNftId) || NFT_COLLECTION[0];

  const { data: totalSupply, isLoading: loadingSupply } = useReadContract({
    contract,
    method: "function totalSupply(uint256 id) view returns (uint256)",
    params: [selectedNftId],
  });

  const shareToWarpcast = () => {
    const text = `I just secured my ${selectedNft.name} on Base! 🚀 Join the wave at @ouwibo`;
    const url = "https://ouwibo-nft.vercel.app";
    const castUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}&embeds[]=${encodeURIComponent(url)}`;
    window.open(castUrl, "_blank");
  };

  const handleViewNft = (id: bigint) => {
    setSelectedNftId(id);
    setActiveTab('mint');
    setMinted(false);
  };

  if (!mounted) return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <main className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-primary/30 pb-16 overflow-hidden max-w-[430px] mx-auto relative touch-manipulation">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-5%] left-[-5%] w-[40%] h-[40%] bg-purple-900/10 rounded-full blur-[60px] animate-glow-pulse" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[40%] h-[40%] bg-cyan-900/10 rounded-full blur-[60px] animate-glow-pulse delay-1000" />
      </div>

      {/* Mini App Optimized Header */}
      <header className="sticky top-0 z-50 px-3 py-2.5 backdrop-blur-xl border-b border-white/5 bg-[#020617]/80 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('explore')}>
          <div className="w-7 h-7 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center shadow-lg">
            <Zap className="text-white fill-current" size={14} />
          </div>
          <div className="text-left">
            <h1 className="font-black text-xs tracking-tighter text-white leading-none">OUWIBO</h1>
            <p className="text-[6px] font-black text-secondary uppercase tracking-widest mt-0.5 leading-none">Base Network</p>
          </div>
        </div>

        <div className="flex items-center gap-2 scale-75 origin-right">
          <WalletConnector />
        </div>
      </header>

      {/* Optimized Main Container */}
      <div className="relative z-10 px-3 pt-3 pb-8 text-left">
        {error && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mb-3 p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-[9px] font-bold">
            <AlertCircle size={12} /> {error}
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {activeTab === 'explore' && <ExploreView key="explore" onNftClick={handleViewNft} />}
          {activeTab === 'mint' && <MintView key="mint" contract={contract} isConnected={isConnected} minted={minted} setMinted={setMinted} setTxHash={setTxHash} txHash={txHash} totalSupply={totalSupply} loadingSupply={loadingSupply} account={account} setError={setError} shareToWarpcast={shareToWarpcast} nft={selectedNft} />}
          {activeTab === 'profile' && <ProfileView key="profile" account={account} contract={contract} />}
          {activeTab === 'roadmap' && <RoadmapView key="roadmap" />}
        </AnimatePresence>
      </div>

      {/* Mini App Bottom Bar */}
      <nav className="fixed bottom-3 left-3 right-3 z-50 bg-black/60 backdrop-blur-2xl border border-white/10 p-1 rounded-2xl flex items-center justify-around shadow-2xl">
        {[
          { id: 'explore', icon: LayoutGrid, label: 'Explore' },
          { id: 'mint', icon: Zap, label: 'Mint' },
          { id: 'profile', icon: User, label: 'Wallet' },
          { id: 'roadmap', icon: Map, label: 'Road' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-300 ${activeTab === tab.id ? 'bg-primary text-white scale-105' : 'text-slate-500'}`}
          >
            <tab.icon size={14} strokeWidth={activeTab === tab.id ? 3 : 2} />
            <span className="text-[6px] font-black uppercase tracking-widest">{tab.label}</span>
          </button>
        ))}
      </nav>
    </main>
  );
}

// --- Professional List Components ---

function ExploreView({ onNftClick }: any) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 text-left">
      <section className="space-y-2 pt-1 border-b border-white/5 pb-6 text-left">
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-primary/10 border border-primary/20 rounded-md text-left">
          <ShieldCheck size={8} className="text-primary" />
          <span className="text-[6px] font-black text-primary uppercase tracking-widest leading-none">Verified Infrastructure</span>
        </div>
        <h1 className="text-4xl font-black italic tracking-tighter text-white leading-none uppercase text-left">
          OUWIBO <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary text-left">GENESIS.</span>
        </h1>
        <p className="text-slate-400 text-[10px] font-medium italic leading-tight max-w-[280px] text-left">
          Portal aset digital resmi Ouwibo di jaringan Base. Minting Utility NFT untuk membuka akses penuh ke protokol.
        </p>
      </section>

      <section className="space-y-4 text-left">
        <div className="flex items-center justify-between text-left">
          <h2 className="text-[10px] font-black italic uppercase tracking-[0.2em] text-slate-500 text-left leading-none">Official Collection</h2>
          <span className="w-12 h-[1px] bg-white/5" />
        </div>
        
        <div className="flex flex-col gap-4 text-left">
          {NFT_COLLECTION.map((nft) => (
            <motion.div 
              key={nft.id.toString()}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNftClick(nft.id)}
              className="group relative bg-[#0f172a]/40 backdrop-blur-xl border border-white/5 rounded-3xl p-4 flex items-center gap-5 transition-all active:border-primary/50 text-left"
            >
              <div className="relative w-20 h-20 shrink-0 rounded-2xl overflow-hidden border border-white/10 shadow-lg">
                <Image src={nft.image} alt={nft.name} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="flex-1 space-y-1.5 pr-2 text-left">
                <div className="flex items-center justify-between text-left">
                  <span className="text-[7px] font-black text-secondary uppercase tracking-widest bg-secondary/10 px-1.5 py-0.5 rounded-md leading-none">Primary Pass</span>
                  <span className="text-[8px] font-black text-slate-600 uppercase italic leading-none">ID #{nft.id.toString()}</span>
                </div>
                <h3 className="text-lg font-black italic uppercase text-white leading-none tracking-tight group-hover:text-primary transition-colors text-left">{nft.name}</h3>
                <p className="text-[9px] text-slate-400 font-medium leading-tight line-clamp-2 italic text-left">{nft.tagline}</p>
                <div className="flex items-center gap-1 text-base-emerald text-[7px] font-black uppercase tracking-widest pt-1 leading-none">
                  <Zap size={8} className="fill-current" /> Status: Open Mint
                </div>
              </div>
              <div className="shrink-0 text-slate-600 group-hover:text-primary transition-colors">
                <ChevronRight size={16} />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="bg-gradient-to-tr from-white/5 to-transparent border border-white/10 rounded-3xl p-6 text-center space-y-3 relative overflow-hidden text-center">
        <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 blur-3xl" />
        <Clock size={20} className="text-slate-500 mx-auto" />
        <h4 className="text-[10px] font-black uppercase text-white tracking-widest leading-none text-center">Future Integration</h4>
        <p className="text-[8px] text-slate-500 italic font-medium leading-tight text-center">Modul tambahan akan dirilis secara bertahap <br/>melalui mekanisme tata kelola komunitas.</p>
      </section>
    </motion.div>
  );
}

function MintView({ contract, isConnected, minted, setMinted, setTxHash, txHash, totalSupply, loadingSupply, account, setError, shareToWarpcast, nft }: any) {
  return (
    <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 pt-2 text-left pb-8">
      <div className="relative aspect-square w-full max-w-[240px] mx-auto bg-[#0f172a] rounded-2xl overflow-hidden border border-white/5 shadow-xl">
        <Image src={nft.image} alt="NFT" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-60" />
        <div className="absolute bottom-3 left-3 right-3 text-left">
          <p className="text-primary text-[6px] font-black uppercase tracking-widest mb-0.5 leading-none">Utility Asset</p>
          <h2 className="text-lg font-black italic uppercase text-white leading-none truncate">{nft.name}</h2>
        </div>
      </div>

      <div className="space-y-4 px-1 text-left">
        <div className="flex items-center gap-2 text-secondary text-left">
          <ShieldCheck size={12} />
          <span className="text-[8px] font-black uppercase tracking-widest italic leading-none">Official Description</span>
        </div>
        <p className="text-[10px] text-slate-400 font-medium italic leading-relaxed text-left">
          {nft.desc}
        </p>
      </div>

      <div className="bg-[#0f172a]/40 backdrop-blur-3xl border border-white/5 rounded-2xl p-4 space-y-4 text-left">
        <div className="flex justify-between items-center border-b border-white/5 pb-3 text-left">
          <div className="text-left text-left text-left">
            <p className="text-[6px] font-black text-slate-500 uppercase tracking-widest mb-0.5 leading-none text-left">Minting Fee</p>
            <p className="text-sm font-black italic text-base-emerald uppercase leading-none text-left">Free Gasless</p>
          </div>
          <div className="text-right text-right text-right">
            <p className="text-[6px] font-black text-slate-500 uppercase tracking-widest mb-0.5 leading-none text-right text-right text-right">Supply Count</p>
            <p className="text-sm font-black italic text-white tracking-tighter leading-none font-mono text-right text-right text-right text-right">
              {loadingSupply ? '..' : (totalSupply?.toString() || '0')} / {nft.supply}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {!minted ? (
            isConnected ? (
              <TransactionButton
                transaction={() => claimTo({ contract, to: account!.address, tokenId: nft.id, quantity: 1n })}
                onTransactionConfirmed={(r) => { setMinted(true); setTxHash(r.transactionHash); }}
                onError={(e) => setError(e.message)}
                className="!w-full !bg-gradient-to-r !from-primary !to-indigo-600 !text-white !font-black !py-3.5 !rounded-xl !text-[10px] !uppercase !shadow-lg !border-none active:scale-95 transition-all"
              >
                INITIALIZE MINT (#{nft.id.toString()})
              </TransactionButton>
            ) : (
              <div className="p-6 border border-dashed border-white/10 rounded-xl text-center space-y-4 flex flex-col items-center">
                <Wallet className="text-slate-600" size={24} />
                <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest italic leading-none text-center">Connect to the secure network</p>
                <WalletConnector />
              </div>
            )
          ) : (
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="space-y-2.5">
              <div className="bg-base-emerald/10 border border-base-emerald/20 p-3 rounded-xl flex items-center gap-3 text-left">
                <div className="w-8 h-8 bg-base-emerald rounded-lg flex items-center justify-center shadow-lg text-left">
                  <CheckCircle2 size={18} className="text-black" />
                </div>
                <div className="text-left text-left text-left">
                  <h4 className="text-[10px] font-black uppercase text-white leading-none text-left">Mint Successful</h4>
                  <a href={`https://basescan.org/tx/${txHash}`} target="_blank" className="text-[6px] font-bold text-secondary uppercase hover:underline leading-none text-left">Explorer Receipt ↗</a>
                </div>
              </div>
              <button onClick={shareToWarpcast} className="w-full bg-white text-black font-black py-3 rounded-xl text-[8px] uppercase tracking-widest transition-all shadow-xl">
                Share Achievement
              </button>
            </motion.div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-1.5 px-1">
        {[
          { l: 'Net', v: 'Base' },
          { l: 'Std', v: '1155' },
          { l: 'ID', v: `#${nft.id.toString()}` },
          { l: 'Access', v: 'Full' },
        ].map(item => (
          <div key={item.l} className="bg-white/5 border border-white/5 p-2 rounded-lg flex flex-col items-center">
            <p className="text-[5px] font-black text-slate-500 uppercase leading-none mb-0.5 text-center">{item.l}</p>
            <p className="text-[7px] font-black text-white uppercase leading-none italic text-center">{item.v}</p>
          </div>
        ))}
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pt-2 text-left">
      <div className="relative h-32 bg-slate-900 rounded-3xl overflow-hidden border border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-transparent to-secondary/30" />
        <div className="absolute -bottom-6 left-6">
          <div className="w-20 h-20 bg-[#020617] border-4 border-[#020617] rounded-2xl shadow-xl flex items-center justify-center overflow-hidden">
            {account ? <div className="text-3xl animate-pulse">💎</div> : <User size={32} className="text-slate-800" />}
          </div>
        </div>
      </div>

      <div className="px-6 pt-4 space-y-1 text-left">
        <h2 className="text-xl font-black italic uppercase text-white truncate text-left">
          {account ? `${account.address.slice(0,6)}...${account.address.slice(-4)}` : 'Unnamed Voyager'}
        </h2>
        <p className="text-[8px] font-black text-secondary uppercase tracking-[0.3em] italic leading-none text-left">Identity Verified on Base</p>
      </div>

      <div className="px-6 space-y-4 text-left">
        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center justify-between text-left">
          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
              <Zap className="text-primary" size={20} />
            </div>
            <div className="text-left">
              <p className="text-[7px] font-black text-slate-500 uppercase leading-none text-left">Utility Balance</p>
              <p className="text-lg font-black italic text-white leading-none mt-1 text-left">Genesis Pass</p>
            </div>
          </div>
          <p className="text-2xl font-black italic text-white leading-none text-right">{isLoading ? '...' : (balance?.toString() || '0')}</p>
        </div>

        <div className="bg-gradient-to-b from-white/5 to-transparent rounded-2xl border border-white/5 p-5 space-y-4 text-left text-left">
          <h4 className="font-black text-white text-[8px] uppercase tracking-[0.3em] text-center border-b border-white/10 pb-3 italic leading-none text-center">Vault Status</h4>
          <div className="space-y-3 text-left text-left">
            {[
              { l: 'Network', v: 'Base Mainnet', c: 'text-base-emerald' },
              { l: 'Protocol', v: 'v2.0 Active', c: 'text-secondary' },
              { l: 'Access', v: 'Verified', c: 'text-white' },
            ].map(s => (
              <div key={s.l} className="flex justify-between items-center text-left text-left">
                <span className="text-[8px] font-bold uppercase text-slate-500 tracking-widest text-left">{s.l}</span>
                <span className={`text-[8px] font-black uppercase ${s.c} leading-none text-right text-right`}>{s.v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function RoadmapView() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 pt-4 text-center text-center">
      <div className="space-y-2 text-center text-center">
        <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white text-center leading-none text-center text-center">BLUE MAP.</h3>
        <p className="text-slate-400 text-[10px] font-medium italic leading-relaxed px-4 text-center text-center text-center">
          Evolusi strategis infrastruktur ekosistem Ouwibo di Base.
        </p>
      </div>

      <div className="space-y-4 px-4 text-left text-left">
        {[
          { p: '01', t: 'Genesis Deployment', d: 'Global synchronization of 6,969 limited passes.' },
          { p: '02', t: 'Airdrop Snapshot', d: 'Comprehensive verification for $SHELL distribution.' },
          { p: '03', t: 'Social Governance', d: 'Transition to decentralized community control.' },
        ].map((step, i) => (
          <div key={i} className="relative bg-[#0f172a]/40 backdrop-blur-2xl border border-white/5 p-5 rounded-2xl flex items-center gap-5 text-left text-left">
            <div className="text-2xl font-black italic text-white/5 select-none leading-none text-left">{step.p}</div>
            <div className="space-y-1 text-left text-left text-left">
              <h4 className="text-sm font-black italic uppercase text-primary leading-none text-left text-left">{step.t}</h4>
              <p className="text-slate-400 text-[9px] italic leading-tight text-left text-left">{step.d}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
