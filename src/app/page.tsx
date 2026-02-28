'use client';

import React, { useState, useEffect } from "react";
import Image from 'next/image';
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutGrid, ShoppingBag, User, Map, Info, Wallet, Loader2, 
  AlertCircle, ShieldCheck, Zap, CheckCircle2, Search, Filter, 
  ArrowUpRight, Share2, Globe, Twitter, Github, ChevronDown, Clock, Tag, RefreshCw
} from 'lucide-react';
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

// Define the NFT Collection
const NFT_COLLECTION = [
  { id: 0n, name: "Ouwibo Genesis", tier: "Legendary", supply: 6969, image: "/ouwibo-nft.png", desc: "Pass pertama yang diluncurkan dalam ekosistem Ouwibo. Memberikan hak istimewa dalam pengambilan keputusan protokol." },
  { id: 1n, name: "Ouwibo Voyager", tier: "Epic", supply: 10000, image: "/ouwibo-nft.png", desc: "Akses eksklusif untuk para penjelajah awal ekosistem Base. Membuka fitur trading tingkat lanjut." },
  { id: 2n, name: "Ouwibo Citizen", tier: "Rare", supply: 20000, image: "/ouwibo-nft.png", desc: "Identitas dasar dalam komunitas Ouwibo. Memberikan akses ke kanal khusus member di Farcaster." },
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
      <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <main className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-primary/30 pb-20 overflow-x-hidden max-w-[500px] mx-auto">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-5%] left-[-5%] w-[50%] h-[50%] bg-purple-900/10 rounded-full blur-[80px] animate-glow-pulse" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[50%] h-[50%] bg-cyan-900/10 rounded-full blur-[80px] animate-glow-pulse delay-1000" />
      </div>

      {/* Mini App Optimized Header */}
      <header className="sticky top-0 z-50 px-4 py-3 backdrop-blur-xl border-b border-white/5 bg-[#020617]/80 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('explore')}>
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center shadow-lg">
            <Zap className="text-white fill-current" size={16} />
          </div>
          <div className="text-left">
            <h1 className="font-black text-sm tracking-tighter text-white leading-none">OUWIBO</h1>
            <p className="text-[7px] font-black text-secondary uppercase tracking-widest mt-0.5">Base Eco</p>
          </div>
        </div>

        <div className="flex items-center gap-2 scale-90 origin-right">
          <ConnectButton 
            client={client} 
            theme="dark" 
            wallets={wallets} 
            chain={base} 
            connectButton={{ 
              className: "!bg-white !text-black !font-black !px-4 !py-2 !rounded-lg !text-[9px] !uppercase !border-none !transition-all active:!scale-95",
              label: "Connect"
            }} 
          />
        </div>
      </header>

      {/* Optimized Main Container */}
      <div className="relative z-10 px-4 pt-4 pb-10">
        {error && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-[10px] font-bold">
            <AlertCircle size={14} /> {error}
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
      <nav className="fixed bottom-4 left-4 right-4 z-50 bg-[#020617]/90 backdrop-blur-2xl border border-white/10 p-1.5 rounded-2xl flex items-center justify-around shadow-2xl">
        {[
          { id: 'explore', icon: LayoutGrid, label: 'Items' },
          { id: 'mint', icon: Zap, label: 'Mint' },
          { id: 'profile', icon: User, label: 'Wallet' },
          { id: 'roadmap', icon: Map, label: 'Path' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-300 ${activeTab === tab.id ? 'bg-primary text-white shadow-lg' : 'text-slate-500'}`}
          >
            <tab.icon size={16} strokeWidth={activeTab === tab.id ? 3 : 2} />
            <span className="text-[7px] font-black uppercase tracking-widest">{tab.label}</span>
          </button>
        ))}
      </nav>
    </main>
  );
}

// --- Compact View Components ---

function NFTCard({ item, onClick }: { item: any, onClick: (id: bigint) => void }) {
  return (
    <motion.div 
      whileTap={{ scale: 0.98 }}
      className="group relative bg-[#0f172a]/40 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden transition-all duration-300 active:border-primary/50"
    >
      <div className="relative aspect-square overflow-hidden">
        <Image src={item.image} alt={item.name} fill className="object-cover" />
        <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-md rounded-md text-[6px] font-black text-secondary uppercase tracking-widest">#{item.id.toString()}</div>
      </div>
      <div className="p-3 space-y-2 text-left">
        <div>
          <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest mb-0.5 leading-none">{item.tier}</p>
          <h4 className="text-xs font-black italic uppercase text-white truncate">{item.name}</h4>
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-white/5">
          <p className="text-[9px] font-black text-secondary italic leading-none">FREE</p>
          <button onClick={() => onClick(item.id)} className="bg-white/5 hover:bg-white/10 px-3 py-1 rounded-md text-[7px] font-black uppercase tracking-widest transition-all">
            Open
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function ExploreView({ onNftClick }: any) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 text-left">
      <section className="space-y-4 pt-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-lg">
          <div className="w-1 h-1 bg-primary rounded-full animate-pulse" />
          <span className="text-[7px] font-black text-primary uppercase tracking-[0.2em]">Protocol v2.0 Live</span>
        </div>
        <h1 className="text-4xl font-black italic tracking-tighter text-white leading-none uppercase">
          Atlantis <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Archives.</span>
        </h1>
        <p className="text-slate-400 text-xs font-medium italic leading-relaxed">
          Temukan koleksi artefak digital eksklusif Ouwibo di jaringan Base.
        </p>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <h2 className="text-sm font-black italic uppercase tracking-widest text-white">Market Grid</h2>
          <p className="text-slate-500 text-[8px] font-bold uppercase tracking-widest">{NFT_COLLECTION.length} Items</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {NFT_COLLECTION.map((nft) => (
            <NFTCard key={nft.id.toString()} item={nft} onClick={onNftClick} />
          ))}
        </div>
      </section>
    </motion.div>
  );
}

function MintView({ contract, isConnected, minted, setMinted, setTxHash, txHash, totalSupply, loadingSupply, account, setError, shareToWarpcast, nft }: any) {
  return (
    <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 pt-2 text-left pb-10">
      <div className="relative aspect-square w-full max-w-[280px] mx-auto bg-[#0f172a] rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
        <Image src={nft.image} alt="NFT" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-60" />
        <div className="absolute bottom-4 left-4 right-4">
          <p className="text-primary text-[8px] font-black uppercase tracking-[0.3em] mb-1">Series: {nft.tier}</p>
          <h2 className="text-xl font-black italic uppercase text-white leading-none truncate">{nft.name}</h2>
        </div>
      </div>

      <div className="bg-[#0f172a]/40 backdrop-blur-3xl border border-white/5 rounded-2xl p-5 space-y-5 shadow-xl">
        <div className="flex justify-between items-center border-b border-white/5 pb-4">
          <div className="text-left">
            <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest italic mb-1">Minting Cost</p>
            <p className="text-lg font-black italic text-base-emerald uppercase tracking-tighter leading-none">Free Gasless</p>
          </div>
          <div className="text-right">
            <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest italic mb-1">Available</p>
            <p className="text-lg font-black italic text-white tracking-tighter font-mono leading-none">
              {loadingSupply ? '...' : (totalSupply?.toString() || '0')} <span className="text-[10px] text-slate-600">/ {nft.supply}</span>
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {!minted ? (
            isConnected ? (
              <TransactionButton
                transaction={() => claimTo({ contract, to: account!.address, tokenId: nft.id, quantity: 1n })}
                onTransactionConfirmed={(r) => { setMinted(true); setTxHash(r.transactionHash); }}
                onError={(e) => setError(e.message)}
                className="!w-full !bg-gradient-to-r !from-primary !to-indigo-600 !text-white !font-black !py-4 !rounded-xl !text-xs !uppercase !shadow-lg !border-none transition-all active:scale-95"
              >
                CONFIRM MINT (#{nft.id.toString()})
              </TransactionButton>
            ) : (
              <div className="p-6 border border-dashed border-white/10 rounded-xl text-center space-y-3">
                <Wallet className="mx-auto text-slate-600" size={24} />
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest italic">Connect to start</p>
              </div>
            )
          ) : (
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-3">
              <div className="bg-base-emerald/10 border border-base-emerald/20 p-4 rounded-xl flex items-center gap-4">
                <div className="w-10 h-10 bg-base-emerald rounded-lg flex items-center justify-center shadow-lg">
                  <CheckCircle2 size={24} className="text-black" />
                </div>
                <div className="text-left">
                  <h4 className="text-xs font-black italic uppercase text-white leading-none mb-1">Asset Secured.</h4>
                  <a href={`https://basescan.org/tx/${txHash}`} target="_blank" className="text-[7px] font-bold text-secondary uppercase tracking-widest hover:underline">Receipt ↗</a>
                </div>
              </div>
              <button onClick={shareToWarpcast} className="w-full bg-white text-black font-black py-4 rounded-xl text-[9px] uppercase tracking-widest hover:bg-secondary hover:text-white transition-all">
                Share Voyager Status
              </button>
            </motion.div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {[
          { l: 'Network', v: 'Base' },
          { l: 'Standard', v: '1155' },
          { l: 'Asset ID', v: `#${nft.id.toString()}` },
          { l: 'Access', v: 'Genesis' },
        ].map(item => (
          <div key={item.l} className="bg-white/5 border border-white/5 p-3 rounded-xl flex flex-col items-center gap-0.5">
            <p className="text-[6px] font-black text-slate-500 uppercase">{item.l}</p>
            <p className="text-[8px] font-black italic text-white uppercase">{item.v}</p>
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
            {account ? <div className="text-3xl">💎</div> : <User size={32} className="text-slate-800" />}
          </div>
        </div>
      </div>

      <div className="px-6 pt-4 space-y-1">
        <h2 className="text-xl font-black italic uppercase text-white truncate">
          {account ? `${account.address.slice(0,6)}...${account.address.slice(-4)}` : 'Guest'}
        </h2>
        <p className="text-[8px] font-black text-secondary uppercase tracking-[0.3em] italic">Identity Verified</p>
      </div>

      <div className="px-6 space-y-4">
        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
              <Zap className="text-primary" size={20} />
            </div>
            <div>
              <p className="text-[7px] font-black text-slate-500 uppercase leading-none">Balance</p>
              <p className="text-lg font-black italic text-white leading-none mt-1">Genesis Pass</p>
            </div>
          </div>
          <p className="text-2xl font-black italic text-white">{isLoading ? '...' : (balance?.toString() || '0')}</p>
        </div>

        <div className="bg-gradient-to-b from-white/5 to-transparent rounded-2xl border border-white/5 p-5 space-y-4">
          <h4 className="font-black text-white text-[8px] uppercase tracking-[0.3em] text-center border-b border-white/10 pb-3 italic">Metadata</h4>
          <div className="space-y-3">
            {[
              { l: 'Network', v: 'Base Mainnet', c: 'text-base-emerald' },
              { l: 'Protocol', v: 'v2.0 Beta', c: 'text-secondary' },
              { l: 'Loyalty', v: 'Voyager', c: 'text-white' },
            ].map(s => (
              <div key={s.l} className="flex justify-between items-center">
                <span className="text-[8px] font-bold uppercase text-slate-500 tracking-widest">{s.l}</span>
                <span className={`text-[8px] font-black uppercase ${s.c}`}>{s.v}</span>
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 pt-4 text-center">
      <div className="space-y-2">
        <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white">BLUE MAP.</h3>
        <p className="text-slate-400 text-[10px] font-medium italic leading-relaxed px-4">
          The strategic evolution of Ouwibo ecosystem on Base.
        </p>
      </div>

      <div className="space-y-4 px-4">
        {[
          { p: '01', t: 'Deployment', d: 'Global synchronization of 6,969 limited passes.' },
          { p: '02', t: 'Airdrop Sync', d: 'Comprehensive snapshot for $SHELL distribution.' },
          { p: '03', t: 'Social DAO', d: 'Transition to community-led infrastructure.' },
        ].map((step, i) => (
          <div key={i} className="relative bg-[#0f172a]/40 backdrop-blur-2xl border border-white/5 p-5 rounded-2xl flex items-center gap-5 text-left">
            <div className="text-2xl font-black italic text-white/5 select-none">{step.p}</div>
            <div className="space-y-1">
              <h4 className="text-sm font-black italic uppercase text-primary leading-none">{step.t}</h4>
              <p className="text-slate-400 text-[9px] italic leading-tight">{step.d}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
