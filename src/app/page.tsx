'use client';

import React, { useState, useEffect } from "react";
import Image from 'next/image';
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutGrid, ShoppingBag, User, Map, Info, Wallet, Loader2, 
  AlertCircle, ShieldCheck, Zap, CheckCircle2, Search, Filter, 
  ArrowUpRight, Share2, Globe, Twitter, Github, ChevronDown, Clock, Tag
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

type Tab = 'explore' | 'mint' | 'profile' | 'roadmap';

export default function OuwiboBaseApp() {
  const account = useActiveAccount();
  const isConnected = !!account;
  
  const [activeTab, setActiveTab] = useState<Tab>('explore');
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

  const { data: totalSupply, isLoading: loadingSupply } = useReadContract({
    contract,
    method: "function totalSupply(uint256 id) view returns (uint256)",
    params: [0n],
  });

  const shareToWarpcast = () => {
    const text = "I just secured my OUWIBO Genesis Pass on Base! 🚀 Join the wave at @ouwibo";
    const url = "https://ouwibo-nft.vercel.app";
    const castUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}&embeds[]=${encodeURIComponent(url)}`;
    window.open(castUrl, "_blank");
  };

  if (!mounted) return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <div className="absolute inset-0 bg-primary blur-3xl opacity-20 animate-pulse" />
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-primary/30 pb-20 md:pb-0">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-purple-900/20 rounded-full blur-[120px] animate-glow-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-cyan-900/20 rounded-full blur-[120px] animate-glow-pulse delay-1000" />
      </div>

      {/* Premium Navbar */}
      <header className="sticky top-0 z-50 px-6 lg:px-12 py-5 backdrop-blur-xl border-b border-white/5 bg-[#020617]/80">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 group cursor-pointer" onClick={() => setActiveTab('explore')}>
            <div className="relative w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-primary/40 transition-all duration-500">
              <Zap className="text-white fill-current" size={24} />
              <div className="absolute inset-0 bg-white blur-xl opacity-0 group-hover:opacity-30 transition-opacity" />
            </div>
            <div className="hidden sm:block">
              <h1 className="font-black text-2xl tracking-tighter text-white leading-none">OUWIBO</h1>
              <p className="text-[10px] font-black text-secondary uppercase tracking-[0.3em] mt-1">Base Ecosystem</p>
            </div>
          </div>

          <nav className="hidden lg:flex items-center bg-white/5 border border-white/10 rounded-2xl px-2 py-1.5 gap-1">
            {[
              { id: 'explore', label: 'Marketplace', icon: LayoutGrid },
              { id: 'mint', label: 'Genesis Mint', icon: Zap },
              { id: 'profile', label: 'Collector', icon: User },
              { id: 'roadmap', label: 'Ecosystem', icon: Map },
            ].map((item) => (
              <button 
                key={item.id} 
                onClick={() => setActiveTab(item.id as Tab)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === item.id ? 'bg-white/10 text-white shadow-inner' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
              >
                <item.icon size={14} />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <ConnectButton 
              client={client} 
              theme="dark" 
              wallets={wallets} 
              chain={base} 
              connectButton={{ 
                className: "!bg-gradient-to-r !from-primary !to-indigo-600 !text-white !font-black !px-8 !py-3 !rounded-2xl !text-xs !uppercase !shadow-lg !shadow-primary/20 !border-none !transition-all hover:!scale-105 active:!scale-95",
                label: "Connect Wallet"
              }} 
            />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {error && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mb-8 p-5 bg-red-500/10 border border-red-500/20 rounded-3xl flex items-center gap-4 text-red-400 text-sm font-bold backdrop-blur-md">
            <AlertCircle size={20} /> {error}
            <button onClick={() => setError(null)} className="ml-auto p-2 hover:bg-white/5 rounded-xl transition-colors">✕</button>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {activeTab === 'explore' && <ExploreView key="explore" setActiveTab={setActiveTab} />}
          {activeTab === 'mint' && <MintView key="mint" contract={contract} isConnected={isConnected} minted={minted} setMinted={setMinted} setTxHash={setTxHash} txHash={txHash} totalSupply={totalSupply} loadingSupply={loadingSupply} account={account} setError={setError} shareToWarpcast={shareToWarpcast} />}
          {activeTab === 'profile' && <ProfileView key="profile" account={account} contract={contract} />}
          {activeTab === 'roadmap' && <RoadmapView key="roadmap" />}
        </AnimatePresence>
      </div>

      {/* Mobile Nav */}
      <nav className="lg:hidden fixed bottom-6 left-6 right-6 z-50 bg-[#020617]/80 backdrop-blur-3xl border border-white/10 p-2.5 rounded-[32px] flex items-center justify-around shadow-2xl">
        {[
          { id: 'explore', icon: LayoutGrid },
          { id: 'mint', icon: Zap },
          { id: 'profile', icon: User },
          { id: 'roadmap', icon: Map },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={`p-4 rounded-2xl transition-all duration-500 ${activeTab === tab.id ? 'bg-primary text-white shadow-neon-purple scale-110' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <tab.icon size={22} strokeWidth={activeTab === tab.id ? 3 : 2} />
          </button>
        ))}
      </nav>
    </main>
  );
}

// --- Component Atoms & Organisms ---

function NFTCard({ item, onClick }: { item: any, onClick: () => void }) {
  return (
    <motion.div 
      whileHover={{ y: -8 }}
      className="group relative bg-[#0f172a]/40 backdrop-blur-xl border border-white/5 rounded-[32px] overflow-hidden transition-all duration-500 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/20"
    >
      <div className="relative aspect-square overflow-hidden">
        <Image src="/ouwibo-nft.png" alt="NFT" fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
        <div className="absolute top-4 left-4 flex gap-2">
          <span className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-xl text-[8px] font-black text-secondary uppercase tracking-widest border border-white/5">Legendary</span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
          <button onClick={onClick} className="w-full bg-white text-black font-black py-3 rounded-2xl text-[10px] uppercase tracking-widest transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 shadow-xl">
            View Asset
          </button>
        </div>
      </div>
      <div className="p-6 space-y-4 text-left">
        <div>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1.5">
            <Tag size={10} /> Ouwibo Protocol
          </p>
          <h4 className="text-xl font-black italic uppercase text-white truncate group-hover:text-primary transition-colors">Genesis Pass #0</h4>
        </div>
        <div className="flex justify-between items-end pt-4 border-t border-white/5">
          <div>
            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter">Current Floor</p>
            <p className="text-lg font-black text-secondary italic">FREE <span className="text-[10px] text-slate-600 font-bold ml-1">GASLESS</span></p>
          </div>
          <div className="text-right">
            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter">Status</p>
            <p className="text-xs font-black text-base-emerald uppercase italic">Live Mint</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ExploreView({ setActiveTab }: any) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-20">
      {/* Premium Hero */}
      <section className="relative flex flex-col lg:flex-row items-center gap-16 py-10 lg:py-20">
        <div className="flex-1 space-y-8 text-center lg:text-left">
          <div className="inline-flex items-center gap-3 px-5 py-2 bg-primary/10 border border-primary/20 rounded-2xl">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_10px_#8B5CF6]" />
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Protocol v2.0 Live on Base</span>
          </div>
          <h1 className="text-7xl lg:text-9xl font-black italic tracking-tighter text-white leading-[0.8] uppercase">
            Own The <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Future.</span>
          </h1>
          <p className="text-slate-400 text-lg lg:text-2xl font-medium italic max-w-xl mx-auto lg:mx-0 leading-relaxed">
            The most advanced NFT infrastructure built natively for the Farcaster ecosystem. Start your journey today.
          </p>
          <div className="flex flex-wrap justify-center lg:justify-start gap-5">
            <button onClick={() => setActiveTab('mint')} className="bg-white text-black font-black px-12 py-6 rounded-[24px] text-sm uppercase tracking-widest hover:bg-primary hover:text-white transition-all transform hover:scale-105 shadow-2xl shadow-white/5">
              Launch Mint
            </button>
            <button className="bg-white/5 border border-white/10 text-white font-black px-12 py-6 rounded-[24px] text-sm uppercase tracking-widest hover:bg-white/10 transition-all backdrop-blur-md">
              Whitepaper
            </button>
          </div>
        </div>

        <div className="flex-1 relative group">
          <div className="absolute -inset-10 bg-primary/20 rounded-full blur-[100px] animate-glow-pulse" />
          <motion.div 
            animate={{ y: [0, -20, 0], rotate: [0, 2, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="relative aspect-[4/5] w-full max-w-md mx-auto bg-[#0f172a] rounded-[56px] border-2 border-white/10 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]"
          >
            <Image src="/ouwibo-nft.png" alt="Feature" fill className="object-cover" priority />
            <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-80" />
            <div className="absolute bottom-12 left-12 right-12 flex justify-between items-end">
              <div>
                <p className="text-secondary text-[10px] font-black uppercase tracking-[0.4em] mb-2">Exclusive Genesis</p>
                <h3 className="text-4xl font-black italic uppercase text-white tracking-tighter">Ouwibo #0</h3>
              </div>
              <div className="w-14 h-14 bg-white/10 backdrop-blur-2xl rounded-2xl flex items-center justify-center border border-white/10 shadow-inner">
                <ArrowUpRight className="text-white" size={24} />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Dynamic Grid */}
      <section className="space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-2">
            <h2 className="text-4xl lg:text-5xl font-black italic uppercase tracking-tighter text-white">Live Collections</h2>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em] flex items-center gap-2">
              <span className="w-1 h-1 bg-primary rounded-full" /> Synchronized with Base Mainnet
            </p>
          </div>
          <div className="flex bg-white/5 border border-white/10 p-1.5 rounded-2xl backdrop-blur-md">
            <div className="flex items-center px-4 gap-2 border-r border-white/5">
              <Search size={14} className="text-slate-500" />
              <input type="text" placeholder="Search..." className="bg-transparent border-none outline-none text-[10px] font-bold uppercase tracking-widest w-32" />
            </div>
            <button className="flex items-center gap-2 px-6 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
              <Filter size={14} /> Filter Assets
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {[1].map((i) => <NFTCard key={i} item={i} onClick={() => setActiveTab('mint')} />)}
          {[1,2,3].map((i) => (
            <div key={i} className="bg-white/[0.02] border border-dashed border-white/5 rounded-[32px] flex flex-col items-center justify-center p-16 text-center opacity-30 grayscale transition-all hover:opacity-50">
              <Clock className="text-slate-700 mb-4" size={40} strokeWidth={1} />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 italic leading-relaxed">Incoming <br/>Protocol Drop</p>
            </div>
          ))}
        </div>
      </section>
    </motion.div>
  );
}

function MintView({ contract, isConnected, minted, setMinted, setTxHash, txHash, totalSupply, loadingSupply, account, setError, shareToWarpcast }: any) {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid lg:grid-cols-12 gap-20 items-start py-10">
      <div className="lg:col-span-5 space-y-10 lg:sticky lg:top-36">
        <div className="relative aspect-[4/5] bg-[#0f172a] rounded-[64px] overflow-hidden border-2 border-white/5 shadow-[0_0_60px_rgba(0,0,0,0.6)] group">
          <Image src="/ouwibo-nft.png" alt="NFT" fill className="object-cover transition-transform duration-[4s] group-hover:scale-110" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent" />
          <div className="absolute top-8 left-8 flex items-center gap-3 px-4 py-2 bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10">
            <span className="w-2 h-2 bg-base-emerald rounded-full animate-ping" />
            <p className="text-[10px] font-black text-white uppercase tracking-widest">Protocol Active</p>
          </div>
          <div className="absolute bottom-12 left-12 right-12">
            <p className="text-primary text-xs font-black uppercase tracking-[0.5em] mb-3">Series: Genesis</p>
            <h2 className="text-6xl font-black italic tracking-tighter uppercase text-white leading-none">PASS #0</h2>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { l: 'Network', v: 'Base Mainnet', i: Globe },
            { l: 'Standard', v: 'ERC-1155', i: ShieldCheck },
            { l: 'Utility', v: 'DAO Voting', i: Zap },
            { l: 'Access', v: 'Genesis Only', i: User },
          ].map(item => (
            <div key={item.l} className="bg-white/5 border border-white/5 p-6 rounded-[32px] flex flex-col items-center gap-2 group hover:border-secondary transition-all">
              <item.i size={16} className="text-secondary opacity-40 group-hover:opacity-100 transition-opacity" />
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{item.l}</p>
              <p className="text-[10px] font-black italic text-white uppercase tracking-tight">{item.v}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="lg:col-span-7 space-y-12">
        <div className="space-y-8 text-center lg:text-left">
          <div className="inline-flex items-center gap-3 px-5 py-2 bg-white/5 border border-white/10 rounded-2xl text-secondary">
            <ShieldCheck size={18} />
            <span className="text-xs font-black uppercase tracking-widest">Verified Infrastructure Contract</span>
          </div>
          <h1 className="text-8xl lg:text-[120px] font-black italic tracking-tighter text-white leading-[0.8] uppercase">
            Protocol <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Genesis.</span>
          </h1>
          <p className="text-slate-400 text-xl font-medium italic leading-relaxed max-w-2xl lg:mx-0 mx-auto">
            Pass pertama yang diluncurkan dalam ekosistem Ouwibo. Memberikan hak istimewa dalam pengambilan keputusan protokol dan alokasi token $SHELL secara eksklusif.
          </p>
        </div>

        <div className="bg-[#0f172a]/40 backdrop-blur-3xl border border-white/5 rounded-[56px] p-10 lg:p-16 space-y-10 shadow-2xl">
          <div className="flex justify-between items-center pb-10 border-b border-white/5">
            <div className="text-left">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic mb-3">Minting Cost</p>
              <p className="text-5xl font-black italic text-base-emerald uppercase tracking-tighter">Free <span className="text-sm text-slate-600 font-bold ml-3">NO GAS</span></p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic mb-3">Available</p>
              <p className="text-5xl font-black italic text-white tracking-tighter font-mono">
                {loadingSupply ? '...' : (totalSupply?.toString() || '0')}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {!minted ? (
              isConnected ? (
                <TransactionButton
                  transaction={() => claimTo({ contract, to: account!.address, tokenId: 0n, quantity: 1n })}
                  onTransactionConfirmed={(r) => { setMinted(true); setTxHash(r.transactionHash); }}
                  onError={(e) => setError(e.message)}
                  className="!w-full !bg-gradient-to-r !from-primary !to-indigo-600 !text-white !font-black !py-10 !rounded-[32px] !text-2xl !uppercase !shadow-2xl !shadow-primary/30 !border-none !transition-all hover:scale-105 active:scale-95"
                >
                  INITIALIZE MINT (MAX 1)
                </TransactionButton>
              ) : (
                <div className="p-12 border-2 border-dashed border-white/10 rounded-[40px] text-center space-y-5 group hover:border-primary/30 transition-colors">
                  <div className="w-20 h-20 bg-white/5 rounded-3xl mx-auto flex items-center justify-center">
                    <Wallet className="text-slate-600 group-hover:text-primary transition-colors" size={40} />
                  </div>
                  <p className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] italic">Connect to the secure network to proceed</p>
                </div>
              )
            ) : (
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-6">
                <div className="bg-base-emerald/10 border border-base-emerald/20 p-10 rounded-[40px] flex items-center gap-8">
                  <div className="w-20 h-20 bg-base-emerald rounded-3xl flex items-center justify-center shadow-2xl shadow-base-emerald/20">
                    <CheckCircle2 size={40} className="text-black" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-2xl font-black italic uppercase text-white">Genesis Secured.</h4>
                    <a href={`https://basescan.org/tx/${txHash}`} target="_blank" className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em] hover:underline mt-2 flex items-center gap-2">
                      Transaction Receipt ↗
                    </a>
                  </div>
                </div>
                <button onClick={shareToWarpcast} className="w-full bg-white text-black font-black py-8 rounded-[32px] text-sm uppercase tracking-[0.3em] hover:bg-secondary hover:text-white transition-all shadow-2xl">
                  Share Your Voyager Status
                </button>
              </motion.div>
            )}
          </div>
        </div>
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-16 py-10">
      <div className="relative h-80 bg-slate-900 rounded-[64px] shadow-2xl overflow-hidden border border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-transparent to-secondary/30" />
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
        <div className="absolute -bottom-16 left-20">
          <div className="w-48 h-48 bg-[#020617] border-[12px] border-[#020617] rounded-[56px] shadow-2xl flex items-center justify-center overflow-hidden">
            {account ? <div className="text-7xl animate-bounce">💎</div> : <User size={80} className="text-slate-800" />}
          </div>
        </div>
      </div>

      <div className="px-20 pt-10 flex flex-col md:flex-row justify-between items-end gap-12">
        <div className="space-y-3 text-left">
          <h2 className="text-6xl lg:text-7xl font-black italic uppercase tracking-tighter text-white drop-shadow-2xl">
            {account ? `${account.address.slice(0,6)}...${account.address.slice(-4)}` : 'Unnamed Collector'}
          </h2>
          <div className="flex items-center gap-4">
            <p className="text-xs font-black text-secondary uppercase tracking-[0.5em] italic">Identity Verified</p>
            <div className="h-4 w-[1px] bg-white/10" />
            <p className="text-xs font-black text-slate-500 uppercase tracking-[0.5em] italic">Base Network</p>
          </div>
        </div>
        
        {account && (
          <div className="flex gap-6">
            <div className="bg-white/5 border border-white/10 p-8 rounded-[40px] flex items-center gap-6 min-w-[240px] backdrop-blur-md">
              <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center">
                <Zap className="text-primary" size={28} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Genesis Assets</p>
                <p className="text-4xl font-black italic text-white">{isLoading ? '...' : (balance?.toString() || '0')}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="px-20 grid md:grid-cols-3 gap-10">
        <div className="md:col-span-2 bg-white/[0.02] border border-dashed border-white/10 rounded-[64px] py-40 flex flex-col items-center justify-center text-center group transition-all hover:bg-white/[0.04]">
          <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <ShoppingBag className="text-slate-700" size={40} />
          </div>
          <p className="text-sm font-black uppercase tracking-[0.3em] text-slate-600 italic">No secondary transactions <br/>detected in treasury</p>
        </div>
        
        <div className="bg-gradient-to-b from-white/5 to-transparent rounded-[64px] border border-white/5 p-12 space-y-10">
          <h4 className="font-black text-white text-sm uppercase tracking-[0.4em] text-center border-b border-white/10 pb-6 italic">Protocol Metadata</h4>
          <div className="space-y-8">
            {[
              { l: 'Auth Status', v: 'Secured', c: 'text-base-emerald' },
              { l: 'Base Protocol', v: 'v2.0 Beta', c: 'text-secondary' },
              { l: 'Loyalty Class', v: 'Voyager', c: 'text-white' },
              { l: 'Snapshot', v: 'Eligible', c: 'text-primary' },
            ].map(s => (
              <div key={s.l} className="flex justify-between items-center group">
                <span className="text-[10px] font-bold uppercase text-slate-500 tracking-widest group-hover:text-slate-300 transition-colors">{s.l}</span>
                <span className={`text-[10px] font-black uppercase ${s.c} group-hover:scale-110 transition-transform`}>{s.v}</span>
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-24 py-20">
      <div className="max-w-4xl mx-auto text-center space-y-8 relative">
        <h2 className="text-[150px] lg:text-[200px] font-black italic tracking-tighter text-white uppercase leading-none opacity-[0.03] absolute left-0 right-0 -top-20 -z-10 select-none">VISION</h2>
        <h3 className="text-7xl lg:text-9xl font-black italic uppercase tracking-tighter text-white drop-shadow-2xl">BLUE MAP.</h3>
        <div className="w-24 h-2 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full" />
        <p className="text-slate-400 text-xl lg:text-2xl font-medium italic max-w-2xl mx-auto leading-relaxed">
          The strategic evolution of Ouwibo ecosystem infrastructure. Pioneering the next-gen social-finance on Base.
        </p>
      </div>

      <div className="grid gap-12 max-w-6xl mx-auto">
        {[
          { p: '01', t: 'Genesis Deployment', d: 'Global synchronization of 6,969 limited passes and deep integration with Farcaster frames protocol v2.' },
          { p: '02', t: 'Cyber Airdrop Sync', d: 'Comprehensive snapshot of all Genesis holders for the $SHELL utility and governance token distribution.' },
          { p: '03', t: 'Atlantis Governance', d: 'Transition to a fully decentralized Social DAO structure for community-led infrastructure expansion.' },
        ].map((step, i) => (
          <div key={i} className="group relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-[56px] opacity-0 group-hover:opacity-20 blur-3xl transition-all duration-1000" />
            <div className="relative bg-[#0f172a]/40 backdrop-blur-2xl border border-white/5 p-16 rounded-[56px] flex flex-col md:flex-row gap-16 items-center transition-all duration-700 hover:bg-white/[0.08] hover:border-white/10">
              <div className="text-[120px] font-black italic text-white/5 select-none leading-none group-hover:text-primary/20 transition-colors duration-700">{step.p}</div>
              <div className="space-y-6 flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-4">
                  <span className="text-xs font-black text-primary uppercase tracking-[0.5em] italic">Milestone</span>
                  <div className="h-1 w-12 bg-white/10 rounded-full" />
                </div>
                <h4 className="text-5xl font-black italic uppercase tracking-tighter text-white group-hover:text-secondary transition-colors duration-700">{step.t}</h4>
                <p className="text-slate-400 font-medium italic text-xl leading-relaxed">{step.d}</p>
              </div>
              <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center border border-white/10 group-hover:bg-primary transition-all duration-700 group-hover:rotate-[360deg]">
                <Info className="text-white group-hover:text-black transition-colors" size={32} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-tr from-primary/10 to-secondary/10 border border-white/10 p-20 rounded-[72px] text-center max-w-4xl mx-auto backdrop-blur-3xl shadow-2xl relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-primary blur-[100px] opacity-10" />
         <Zap className="text-secondary mx-auto mb-8 animate-bounce" size={48} />
         <h4 className="text-3xl font-black uppercase italic mb-4 text-white tracking-tighter">The $SHELL Reward Protocol</h4>
         <p className="text-xl text-slate-400 italic font-medium leading-relaxed max-w-2xl mx-auto">
           60% of total $SHELL supply is reserved for the community. Holding a Genesis Pass is the primary requirement for eligibility.
         </p>
      </div>
    </motion.div>
  );
}
