'use client';

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from 'next/image';
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutGrid, ShoppingBag, User, Map, Info, Wallet, Loader2, 
  AlertCircle, ShieldCheck, Zap, CheckCircle2, Search, Filter, 
  ArrowUpRight, Share2, Globe, Twitter, Github, ChevronDown, Clock, Tag, RefreshCw, ChevronRight,
  Bot, Send, MessageSquare, Sparkles
} from 'lucide-react';
import sdk from "@farcaster/frame-sdk";
import { 
  useAccount, 
  useConnect, 
  useDisconnect, 
  useWriteContract, 
  useWaitForTransactionReceipt,
  useReadContract
} from 'wagmi';
import { base } from 'wagmi/chains';
import { parseAbi } from 'viem';
import { WalletConnector } from "@/components/WalletConnector";

const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x3525fDbC54DC01121C8e12C3948187E6153Cdf25") as `0x${string}`;
const ABI = parseAbi([
  "function claim(address receiver, uint256 tokenId, uint256 quantity, address currency, uint256 pricePerToken, (bytes32[] proof, uint256 quantityLimitPerWallet, uint256 pricePerToken, address currency) allowlistProof, bytes data) external payable",
  "function claimTo(address to, uint256 tokenId, uint256 quantity) external",
  "function totalSupply(uint256 id) view returns (uint256)",
  "function balanceOf(address account, uint256 id) view returns (uint256)"
]);

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

type Tab = 'explore' | 'mint' | 'profile' | 'ai';

export default function OuwiboBaseApp() {
  const { address, isConnected, chainId } = useAccount();
  const { connect, connectors } = useConnect();
  
  const [activeTab, setActiveTab] = useState<Tab>('explore');
  const [selectedNftId, setSelectedNftId] = useState<bigint>(0n);
  const [minted, setMinted] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        await sdk.actions.ready();
        
        // Auto-connect inside Farcaster frame
        const farcasterConnector = connectors.find(c => c.id === 'farcaster');
        if (farcasterConnector && !isConnected) {
          connect({ connector: farcasterConnector });
        }
      } catch (e) { 
        console.error("SDK Error", e); 
      }
    };
    init();
    setMounted(true);
  }, [connectors, connect, isConnected]);

  const selectedNft = NFT_COLLECTION.find(n => n.id === selectedNftId) || NFT_COLLECTION[0];

  const { data: totalSupply, isLoading: loadingSupply } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: 'totalSupply',
    args: [selectedNftId],
    chainId: base.id,
  });

  const handleViewNft = (id: bigint) => {
    setSelectedNftId(id);
    setActiveTab('mint');
    setMinted(false);
  };

  const shareToWarpcast = () => {
    const text = `I just secured my ${selectedNft.name} on Base! 🚀 Join the wave at @ouwibo`;
    const url = "https://ouwibo-nft.vercel.app";
    const castUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}&embeds[]=${encodeURIComponent(url)}`;
    window.open(castUrl, "_blank");
  };

  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isConfirmed) {
      setMinted(true);
      setTxHash(hash || null);
    }
  }, [isConfirmed, hash, setMinted, setTxHash]);

  const [mintError, setMintError] = useState<string | null>(null);

  const handleMint = useCallback(async () => {
    if (!address) return;
    
    setMinted(false);
    setTxHash(null);
    setMintError(null);
    
    // Using API for Gasless Minting
    try {
      const response = await fetch('/api/mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          address, 
          nftId: selectedNftId.toString() 
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok || data.error) {
        throw new Error(data.error || 'Failed to mint via API');
      }
      
      if (data.txHash || data.success) {
        setTxHash(data.txHash);
        setMinted(true);
      }
    } catch (e: any) {
      console.error("Minting Error:", e);
      setMintError(e.message || "An unexpected error occurred during minting.");
    }
  }, [address, selectedNftId]);

  const [isMinting, setIsMinting] = useState(false);

  return (
    <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 pt-2 text-left pb-8">
      <div className="relative aspect-square w-full max-w-[240px] mx-auto bg-[#0f172a] rounded-2xl overflow-hidden border border-white/5 shadow-xl">
        <Image src={nft.image} alt="NFT" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-60" />
        <div className="absolute bottom-3 left-3 right-3 text-left">
          <p className="text-primary text-[8px] font-black uppercase tracking-widest mb-0.5 leading-none">Official Genesis</p>
          <h2 className="text-lg font-black italic uppercase text-white leading-none truncate">{nft.name}</h2>
        </div>
      </div>

      <div className="bg-[#0f172a]/40 backdrop-blur-3xl border border-white/5 rounded-2xl p-4 space-y-4 text-left">
        <div className="flex justify-between items-center border-b border-white/5 pb-3">
          <div className="text-left text-left">
            <p className="text-[6px] font-black text-slate-500 uppercase tracking-widest mb-0.5 leading-none text-left">Minting Fee</p>
            <p className="text-sm font-black italic text-base-emerald uppercase leading-none text-left">Free Gasless</p>
          </div>
          <div className="text-right">
            <p className="text-[6px] font-black text-slate-500 uppercase tracking-widest mb-0.5 leading-none text-right">Supply Count</p>
            <p className="text-sm font-black italic text-white tracking-tighter leading-none font-mono text-right">
              {loadingSupply ? '..' : (totalSupply?.toString() || '0')} / {nft.supply}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {mintError && (
            <div className="p-3 bg-red-900/20 border border-red-500/20 rounded-xl flex items-center gap-2">
              <AlertCircle size={12} className="text-red-500 shrink-0" />
              <p className="text-[8px] font-black text-red-400 uppercase tracking-widest leading-tight">{mintError}</p>
            </div>
          )}

          {!minted ? (
            isConnected ? (
              <button 
                disabled={isMinting} 
                onClick={async () => {
                  setIsMinting(true);
                  await handleMint();
                  setIsMinting(false);
                }} 
                className="w-full bg-gradient-to-r from-primary to-indigo-600 text-white font-black py-3.5 rounded-xl text-[10px] uppercase shadow-lg border-none active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isMinting && <Loader2 size={12} className="animate-spin" />}
                {isMinting ? "GASLESS MINTING..." : `INITIALIZE MINT (#${nft.id.toString()})`}
              </button>
            ) : (
              <div className="p-6 border border-dashed border-white/10 rounded-xl text-center space-y-4 flex flex-col items-center">
                <Wallet className="text-slate-600" size={24} />
                <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest italic leading-none text-center">Connect to proceed</p>
                <WalletConnector />
              </div>
            )
          ) : (
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="space-y-2.5">
              <div className="bg-base-emerald/10 border border-base-emerald/20 p-3 rounded-xl flex items-center gap-3 text-left">
                <div className="w-8 h-8 bg-base-emerald rounded-lg flex items-center justify-center shadow-lg">
                  <CheckCircle2 size={18} className="text-black" />
                </div>
                <div className="text-left">
                  <h4 className="text-[10px] font-black uppercase text-white leading-none text-left">Mint Successful</h4>
                  <a href={`https://basescan.org/tx/${txHash}`} target="_blank" className="text-[6px] font-bold text-secondary uppercase hover:underline leading-none">Explorer Receipt ↗</a>
                </div>
              </div>
              <button onClick={shareToWarpcast} className="w-full bg-white text-black font-black py-3 rounded-xl text-[8px] uppercase tracking-widest shadow-xl">
                Share Achievement
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function ProfileView({ address }: any) {
  const { data: balance, isLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: 'balanceOf',
    args: [address || "0x0000000000000000000000000000000000000000", 0n],
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pt-2 text-left text-left">
      <div className="relative h-32 bg-slate-900 rounded-3xl overflow-hidden border border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-transparent to-secondary/30" />
        <div className="absolute -bottom-6 left-6">
          <div className="w-20 h-20 bg-[#020617] border-4 border-[#020617] rounded-2xl shadow-xl flex items-center justify-center overflow-hidden text-3xl">💎</div>
        </div>
      </div>
      <div className="px-6 pt-4 space-y-1 text-left">
        <h2 className="text-xl font-black italic uppercase text-white truncate text-left">{address ? `${address.slice(0,6)}...${address.slice(-4)}` : 'Guest'}</h2>
        <p className="text-[8px] font-black text-secondary uppercase tracking-[0.3em] italic leading-none text-left">Identity Verified on Base</p>
      </div>
      <div className="px-6 space-y-4">
        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center justify-between text-left">
          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center text-primary"><Zap size={20} /></div>
            <div className="text-left"><p className="text-[7px] font-black text-slate-500 uppercase leading-none text-left">Utility Balance</p><p className="text-lg font-black italic text-white leading-none mt-1 text-left">Genesis Pass</p></div>
          </div>
          <p className="text-2xl font-black italic text-white leading-none">{isLoading ? '...' : (balance?.toString() || '0')}</p>
        </div>
      </div>
    </motion.div>
  );
}

function AiChatView() {
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Greetings, Voyager! I am **Clawdbot**, the neural guide for **OUWIBO GENESIS**. How can I assist your journey through the protocol today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const KNOWLEDGE_BASE: Record<string, string> = {
    'genesis': 'The **OUWIBO Genesis Pass (ID #0)** is our legendary tier asset. It grants 100% governance rights and the highest multiplier for $SHELL allocations.',
    'shell': '**$SHELL** is the native utility token of the Atlantis ecosystem. 60% of the supply is reserved for the community, primarily Genesis holders.',
    'base': 'We are built natively on **Base**, the secure and low-cost Layer 2 network powered by Coinbase.',
    'mint': 'You can initialize your mint in the **Mint** tab. Remember, the limit is **1 Pass per wallet** to ensure fair distribution.',
    'airdrop': 'The first snapshot for the **$SHELL airdrop** is scheduled for Q2 2026. Keep your Genesis Pass secured in your wallet.',
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (textOverride?: string) => {
    const messageText = textOverride || input;
    if (!messageText.trim()) return;

    const userMsg = { role: 'user', text: messageText };
    setMessages(prev => [...prev, userMsg]);
    if (!textOverride) setInput('');
    
    setIsTyping(true);

    // Simulate AI Processing
    setTimeout(() => {
      let response = "I'm synchronizing with the protocol archives. Could you be more specific? I have detailed data on **Genesis**, **$SHELL token**, and **Base network**.";
      
      const lowerInput = messageText.toLowerCase();
      for (const key in KNOWLEDGE_BASE) {
        if (lowerInput.includes(key)) {
          response = KNOWLEDGE_BASE[key];
          break;
        }
      }

      setIsTyping(false);
      setMessages(prev => [...prev, { role: 'bot', text: response }]);
    }, 1500);
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="h-[72vh] flex flex-col gap-4 text-left">
      <div className="flex items-center justify-between border-b border-white/5 pb-4 px-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-primary to-secondary rounded-2xl flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.3)]">
            <Bot size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-lg font-black italic uppercase text-white leading-none">CLAWDBOT</h2>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-1 h-1 bg-base-emerald rounded-full animate-pulse" />
              <p className="text-[7px] font-black text-secondary uppercase tracking-widest leading-none">Quantum Neural Core Active</p>
            </div>
          </div>
        </div>
        <div className="px-3 py-1 bg-white/5 rounded-lg border border-white/10 text-[7px] font-black text-slate-500 uppercase tracking-widest">v1.2.0-PRO</div>
      </div>

      <div className="flex-1 overflow-y-auto px-1 space-y-4 scrollbar-hide pb-4">
        {messages.map((msg, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl text-[11px] font-medium leading-relaxed shadow-sm ${
              msg.role === 'user' 
                ? 'bg-primary text-white rounded-tr-none' 
                : 'bg-white/5 border border-white/10 text-slate-300 rounded-tl-none italic'
            }`}>
              <div dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<b class="text-secondary">$1</b>') }} />
            </div>
          </motion.div>
        ))}
        {isTyping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="bg-white/5 border border-white/10 p-3 rounded-2xl flex gap-1">
              <div className="w-1 h-1 bg-primary rounded-full animate-bounce" />
              <div className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestions */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {['What is $SHELL?', 'Genesis Utility', 'Base Network'].map((q) => (
          <button 
            key={q} 
            onClick={() => handleSend(q)}
            className="whitespace-nowrap px-3 py-1.5 bg-white/5 border border-white/5 rounded-lg text-[8px] font-bold text-slate-400 uppercase hover:bg-primary/20 hover:text-white transition-all"
          >
            {q}
          </button>
        ))}
      </div>

      <div className="p-2 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-2 focus-within:border-primary/50 transition-all">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask Clawdbot about the protocol..." 
          className="flex-1 bg-transparent border-none outline-none px-3 py-2 text-xs placeholder:text-slate-600 italic" 
        />
        <button onClick={() => handleSend()} className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center hover:bg-secondary transition-all shadow-lg active:scale-90">
          <Send size={16} className="text-white" />
        </button>
      </div>
    </motion.div>
  );
}
