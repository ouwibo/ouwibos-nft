'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { base } from 'wagmi/chains';
import { parseEther, parseAbi } from 'viem';
import { 
  useAccount, 
  useConnect, 
  useReadContract, 
  useWriteContract, 
  useWaitForTransactionReceipt,
  useSwitchChain,
  useChainId,
  useSendTransaction
} from 'wagmi';
import { 
  LayoutGrid, User, Loader2, 
  AlertCircle, ShieldCheck, Zap, CheckCircle2,
  ChevronRight, Bot, Send, Wallet, Coffee, Heart, Clock
} from 'lucide-react';
import { toast } from 'sonner';
import sdk from "@farcaster/miniapp-sdk";
import { WalletConnector } from '@/components/WalletConnector';

// Constants - Your Official Contract
const CONTRACT_ADDRESS = "0x3525fDbC54DC01121C8e12C3948187E6153Cdf25" as `0x${string}`;
const CREATOR_WALLET = "0xF96c80DAB17bccC9e0C0C454fa6Ec9234EF240f2";
const DEFAULT_TOKEN_ID = 0n; 

// Stable JSON ABI for ERC-1155
const ABI = [
  {
    "name": "claim",
    "type": "function",
    "stateMutability": "payable",
    "inputs": [
      { "type": "address", "name": "_receiver" },
      { "type": "uint256", "name": "_tokenId" },
      { "type": "uint256", "name": "_quantity" },
      { "type": "address", "name": "_currency" },
      { "type": "uint256", "name": "_pricePerToken" },
      {
        "type": "tuple",
        "name": "_allowlistProof",
        "components": [
          { "type": "bytes32[]", "name": "proof" },
          { "type": "uint256", "name": "quantityLimitPerWallet" },
          { "type": "uint256", "name": "pricePerToken" },
          { "type": "address", "name": "currency" }
        ]
      },
      { "type": "bytes", "name": "_data" }
    ],
    "outputs": []
  },
  {
    "name": "totalSupply",
    "type": "function",
    "stateMutability": "view",
    "inputs": [{ "type": "uint256", "name": "id" }],
    "outputs": [{ "type": "uint256" }]
  },
  {
    "name": "balanceOf",
    "type": "function",
    "stateMutability": "view",
    "inputs": [
      { "type": "address", "name": "account" },
      { "type": "uint256", "name": "id" }
    ],
    "outputs": [{ "type": "uint256" }]
  },
  {
    "name": "getActiveClaimCondition",
    "type": "function",
    "stateMutability": "view",
    "inputs": [{ "type": "uint256", "name": "_tokenId" }],
    "outputs": [
      {
        "type": "tuple",
        "components": [
          { "type": "uint256", "name": "startTimestamp" },
          { "type": "uint256", "name": "maxClaimableSupply" },
          { "type": "uint256", "name": "supplyClaimed" },
          { "type": "uint256", "name": "quantityLimitPerWallet" },
          { "type": "uint256", "name": "waitTimeInSecondsBetweenClaims" },
          { "type": "bytes32", "name": "merkleRoot" },
          { "type": "uint256", "name": "pricePerToken" },
          { "type": "address", "name": "currency" },
          { "type": "string", "name": "metadata" }
        ]
      }
    ]
  }
] as const;

interface NFTMetadata {
  id: bigint;
  name: string;
  image: string;
  description: string;
  tagline: string;
}

export default function OuwiboBaseApp() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const currentChainId = useChainId();
  const { switchChain } = useSwitchChain();
  
  const [activeTab, setActiveTab] = useState<'explore' | 'mint' | 'profile' | 'ai'>('explore');
  const [selectedNftId, setSelectedNftId] = useState<bigint>(DEFAULT_TOKEN_ID);
  const [minted, setMinted] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [mintError, setMintError] = useState<string | null>(null);
  const [collection, setCollection] = useState<NFTMetadata[]>([]);
  const [loadingCollection, setLoadingCollection] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        await sdk.actions.ready();
        const farcasterConnector = connectors.find(c => c.id === 'farcaster');
        if (farcasterConnector && !isConnected) {
          connect({ connector: farcasterConnector });
        }
      } catch (e) { console.error("SDK Error", e); }
    };
    init();
    setMounted(true);
    fetchCollection();
  }, [connectors, connect, isConnected]);

  const fetchCollection = async () => {
    try {
      const response = await fetch('/api/collection');
      const data = await response.json();
      
      if (data && Array.isArray(data)) {
        // Here we map the lazy mint events to NFT metadata
        // For a single collection pass, we usually just need Token ID 0
        // But this structure allows for multiple if you batch upload metadata
        const items: NFTMetadata[] = data.map((event: any) => ({
          id: BigInt(event.data.startTokenId),
          name: "Ouwibo Genesis", // Fallback name
          image: "/ouwibo-nft.png", // Fallback image
          description: "The primary pass launched within the Ouwibo ecosystem.",
          tagline: "The Ultimate Protocol Access"
        }));
        
        // Ensure we at least have the genesis pass
        if (items.length === 0) {
          items.push({
            id: 0n,
            name: "Ouwibo Genesis",
            image: "/ouwibo-nft.png",
            description: "The primary pass launched within the Ouwibo ecosystem.",
            tagline: "The Ultimate Protocol Access"
          });
        }
        
        setCollection(items);
      }
    } catch (err) {
      console.error("Failed to fetch collection", err);
      // Fallback
      setCollection([{
        id: 0n,
        name: "Ouwibo Genesis",
        image: "/ouwibo-nft.png",
        description: "The primary pass launched within the Ouwibo ecosystem.",
        tagline: "The Ultimate Protocol Access"
      }]);
    } finally {
      setLoadingCollection(false);
    }
  };

  // Read State
  const { data: totalSupply } = useReadContract({
    address: CONTRACT_ADDRESS, abi: ABI, functionName: 'totalSupply', args: [selectedNftId], chainId: base.id,
  });

  const { data: userBalance, refetch: refetchBalance } = useReadContract({
    address: CONTRACT_ADDRESS, abi: ABI, functionName: 'balanceOf', args: [address || "0x0000000000000000000000000000000000000000", selectedNftId], chainId: base.id,
  });

  const { data: activeCondition } = useReadContract({
    address: CONTRACT_ADDRESS, abi: ABI, functionName: 'getActiveClaimCondition', args: [selectedNftId], chainId: base.id,
  });

  const hasMinted = minted || (userBalance !== undefined && (userBalance as bigint) > 0n);
  const startTime = activeCondition ? Number((activeCondition as any).startTimestamp) : 0;
  const isStarted = startTime === 0 || Math.floor(Date.now() / 1000) >= startTime;

  // Write State
  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isConfirmed) {
      setMinted(true);
      refetchBalance();
      toast.success("Minting Successful!");
    }
  }, [isConfirmed, refetchBalance]);

  useEffect(() => {
    if (writeError) {
      console.error("Write Error:", writeError);
      const rawMessage = (writeError as any).shortMessage || writeError.message || "";
      const msg = writeError.message.includes('User rejected') ? 'Transaction rejected.' : rawMessage.split('\n')[0];
      setMintError(msg);
      toast.error("Minting Failed", { description: msg });
    }
  }, [writeError]);

  const handleMint = useCallback(() => {
    if (!address) return;
    if (currentChainId !== base.id) {
      switchChain({ chainId: base.id });
      return;
    }

    setMintError(null);
    const NATIVE_TOKEN = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee' as `0x${string}`;
    const MAX_UINT256 = BigInt("115792089237316195423570985008687907853269984665640564039457584007913129639935");

    writeContract({
      address: CONTRACT_ADDRESS,
      abi: ABI,
      functionName: 'claim',
      args: [
        address,
        selectedNftId,
        1n,
        NATIVE_TOKEN,
        0n,
        {
          proof: [],
          quantityLimitPerWallet: MAX_UINT256,
          pricePerToken: 0n,
          currency: NATIVE_TOKEN
        },
        '0x'
      ],
      chainId: base.id,
    });
  }, [address, currentChainId, switchChain, writeContract, selectedNftId]);

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-[#020617] text-slate-200 pb-16 overflow-hidden max-w-[430px] mx-auto relative touch-manipulation">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-5%] left-[-5%] w-[40%] h-[40%] bg-purple-900/5 rounded-full blur-[60px]" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[40%] h-[40%] bg-cyan-900/5 rounded-full blur-[60px]" />
      </div>

      <header className="sticky top-0 z-50 px-3 py-2.5 backdrop-blur-xl border-b border-white/5 bg-[#020617]/80 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('explore')}>
          <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-[#0f172a] border border-white/10 shadow-lg">
            <Image src="/ouwibo-nft.png" alt="Logo" fill className="object-cover" />
          </div>
          <div className="text-left">
            <h1 className="font-black text-xs text-white leading-none">OUWIBO</h1>
            <p className="text-[6px] font-bold text-secondary uppercase tracking-widest mt-0.5">Base Network</p>
          </div>
        </div>
        <div className="scale-75 origin-right"><WalletConnector /></div>
      </header>

      <div className="px-3 pt-3">
        <AnimatePresence mode="wait">
          {activeTab === 'explore' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 text-left">
              <section className="space-y-2 pb-6 border-b border-white/5">
                <h1 className="text-4xl font-black italic text-white uppercase leading-none tracking-tighter">OUWIBO <br/> <span className="text-primary">GENESIS.</span></h1>
                <p className="text-slate-400 text-[10px]">Official digital asset portal for the Ouwibo protocol on Base.</p>
              </section>
              
              <div className="space-y-4">
                {loadingCollection ? (
                  <div className="flex items-center justify-center p-12">
                    <Loader2 className="animate-spin text-primary" size={24} />
                  </div>
                ) : (
                  collection.map((nft) => (
                    <div key={nft.id.toString()} className="bg-[#0f172a]/40 backdrop-blur-xl border border-white/5 rounded-3xl p-4 flex items-center gap-5 cursor-pointer hover:border-primary/30 transition-all active:scale-95 shadow-xl" onClick={() => { setSelectedNftId(nft.id); setActiveTab('mint'); }}>
                      <div className="relative w-20 h-20 rounded-2xl overflow-hidden shadow-lg border border-white/10"><Image src={nft.image} alt={nft.name} fill className="object-cover" /></div>
                      <div className="flex-1 space-y-1">
                        <h3 className="text-lg font-black text-white italic uppercase leading-none">{nft.name}</h3>
                        <p className="text-[8px] text-slate-500 font-medium italic">#{nft.id.toString()}</p>
                        <div className="flex items-center gap-1 text-base-emerald text-[7px] font-black uppercase pt-1 tracking-widest"><Zap size={8} className="fill-current" /> Status: Open Mint</div>
                      </div>
                      <ChevronRight size={16} className="text-slate-600" />
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
          
          {activeTab === 'mint' && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 pt-2">
              <div className="relative aspect-square max-w-[240px] mx-auto bg-[#0f172a] rounded-2xl overflow-hidden shadow-2xl border border-white/5">
                <Image src={collection.find(n => n.id === selectedNftId)?.image || "/ouwibo-nft.png"} alt="NFT" fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-60" />
              </div>
              <div className="bg-[#0f172a]/40 backdrop-blur-3xl border border-white/5 rounded-2xl p-4 space-y-4 shadow-xl">
                <div className="flex justify-between border-b border-white/5 pb-3 text-left">
                  <div><p className="text-[6px] font-black text-slate-500 uppercase tracking-widest">Minting Fee</p><p className="text-sm font-black text-base-emerald uppercase">FREE + GAS</p></div>
                  <div className="text-right"><p className="text-[6px] font-black text-slate-500 uppercase tracking-widest">Available Supply</p><p className="text-sm font-black text-white font-mono">{totalSupply?.toString() || '0'} / 6969</p></div>
                </div>
                {hasMinted ? (
                  <div className="bg-base-emerald/10 border border-base-emerald/20 p-3 rounded-xl flex items-center gap-3">
                    <div className="w-8 h-8 bg-base-emerald rounded-lg flex items-center justify-center shadow-lg"><CheckCircle2 size={18} className="text-black" /></div>
                    <p className="text-[10px] font-black uppercase text-white leading-none">Genesis Pass Owned</p>
                  </div>
                ) : !isStarted ? (
                  <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex flex-col items-center gap-2 text-center">
                    <Clock size={24} className="text-amber-500 animate-pulse" />
                    <p className="text-[10px] font-black uppercase text-white">Minting Starts Soon</p>
                    <p className="text-[8px] text-slate-400 font-medium italic">Opens on March 10, 2026</p>
                  </div>
                ) : (
                  <button 
                    disabled={isPending || isConfirming || !address} 
                    onClick={handleMint} 
                    className={`w-full py-3.5 rounded-xl text-[10px] font-black uppercase transition-all shadow-xl flex items-center justify-center gap-2 ${currentChainId !== base.id && isConnected ? 'bg-amber-500 text-black' : 'bg-primary text-white active:scale-95 disabled:opacity-50'}`}
                  >
                    {(isPending || isConfirming) && <Loader2 size={12} className="animate-spin" />}
                    {isConnected && currentChainId !== base.id ? "SWITCH TO BASE NETWORK" : (isPending || isConfirming) ? "PROCESSING..." : "INITIALIZE FREE MINT"}
                  </button>
                )}
                {mintError && <p className="text-[8px] text-red-400 uppercase font-black text-center mt-2 italic leading-relaxed">{mintError}</p>}
              </div>
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 text-left">
              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex justify-between items-center shadow-lg">
                <div><p className="text-[7px] text-slate-500 font-black uppercase tracking-widest leading-none">UTILITY BALANCE</p><p className="text-lg font-black italic text-white mt-1 uppercase leading-none">Genesis Pass</p></div>
                <p className="text-2xl font-black text-white font-mono">{userBalance?.toString() || '0'}</p>
              </div>
              <ProfileView address={address} />
            </motion.div>
          )}

          {activeTab === 'ai' && <AiChatView />}
        </AnimatePresence>
      </div>

      <nav className="fixed bottom-3 left-3 right-3 z-50 bg-black/60 backdrop-blur-2xl border border-white/10 p-1 rounded-2xl flex items-center justify-around shadow-2xl">
        {[
          { id: 'explore', icon: LayoutGrid, label: 'Explore' },
          { id: 'mint', icon: Zap, label: 'Mint' },
          { id: 'profile', icon: User, label: 'Wallet' },
          { id: 'ai', icon: Bot, label: 'AI' },
        ].map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${activeTab === tab.id ? 'bg-primary text-white scale-105 shadow-lg' : 'text-slate-500'}`}>
            <tab.icon size={14} strokeWidth={activeTab === tab.id ? 3 : 2} />
            <span className="text-[6px] font-black uppercase tracking-widest">{tab.label}</span>
          </button>
        ))}
      </nav>
    </main>
  );
}

function ProfileView({ address }: any) {
  const { sendTransaction, isPending } = useSendTransaction();
  return (
    <button 
      disabled={isPending}
      onClick={() => sendTransaction({ to: CREATOR_WALLET as `0x${string}`, value: parseEther("0.001"), chainId: base.id })}
      className="w-full bg-secondary/10 border border-secondary/20 p-4 rounded-2xl flex justify-between items-center transition-all hover:bg-secondary/20 group"
    >
      <div className="flex gap-3 items-center">
        <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center text-secondary">
          {isPending ? <Loader2 size={18} className="animate-spin" /> : <Coffee size={18} />}
        </div>
        <div className="text-left">
          <p className="text-[7px] text-slate-500 font-black uppercase tracking-widest">SUPPORT CREATOR</p>
          <p className="text-xs font-black text-white italic uppercase leading-none mt-1 group-hover:text-secondary">Buy a Coffee</p>
        </div>
      </div>
      <p className="text-xs font-black text-secondary font-mono">0.001 ETH</p>
    </button>
  );
}

function AiChatView() {
  return (
    <div className="h-[60vh] flex flex-col items-center justify-center text-center p-6">
      <Bot size={40} className="text-primary mb-4 animate-pulse" />
      <p className="italic text-slate-500 text-xs font-medium max-w-[200px] leading-relaxed text-center">OUWIBO AI core is currently synchronizing with the protocol archives...</p>
    </div>
  );
}
