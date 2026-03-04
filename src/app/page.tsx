'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { base } from 'wagmi/chains';
import { parseEther } from 'viem';
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
  ChevronRight, Bot, Send, Wallet, Coffee, Heart
} from 'lucide-react';
import { toast } from 'sonner';
import sdk from "@farcaster/miniapp-sdk";
import { WalletConnector } from '@/components/WalletConnector';

// Constants
const CONTRACT_ADDRESS = "0x3525fDbC54DC01121C8e12C3948187E6153Cdf25" as `0x${string}`;
const CREATOR_WALLET = "0xF96c80DAB17bccC9e0C0C454fa6Ec9234EF240f2";
const TOKEN_ID = 0n; 

// ABI for Thirdweb DropERC1155
const ABI = ([
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
] as const);

const NFT_COLLECTION = [
  { 
    id: TOKEN_ID, 
    name: "Ouwibo Genesis", 
    tier: "Legendary", 
    supply: 6969, 
    image: "/ouwibo-nft.png", 
    tagline: "The Ultimate Protocol Access",
    desc: "The primary pass launched within the Ouwibo ecosystem. It provides priority protocol decision-making rights, $OWB token allocations, and access to infrastructure nodes." 
  }
];

export default function OuwiboBaseApp() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const currentChainId = useChainId();
  const { switchChain } = useSwitchChain();
  
  const [activeTab, setActiveTab] = useState<'explore' | 'mint' | 'profile' | 'ai'>('explore');
  const [minted, setMinted] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [mintError, setMintError] = useState<string | null>(null);

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
  }, [connectors, connect, isConnected]);

  // Fetch Live Data from Contract
  const { data: totalSupply } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: 'totalSupply',
    args: [TOKEN_ID],
    chainId: base.id,
  });

  const { data: userBalance, refetch: refetchBalance } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: 'balanceOf',
    args: [address || "0x0000000000000000000000000000000000000000", TOKEN_ID],
    chainId: base.id,
  });

  const { data: activeCondition, isLoading: loadingCondition } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: 'getActiveClaimCondition',
    args: [TOKEN_ID],
    chainId: base.id,
  });

  const hasMinted = minted || (userBalance !== undefined && (userBalance as bigint) > 0n);

  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isConfirmed) {
      setMinted(true);
      setTxHash(hash || null);
      refetchBalance();
      toast.success("Minting Successful!");
    }
  }, [isConfirmed, hash, refetchBalance]);

  useEffect(() => {
    if (writeError) {
      console.error("BLOCKCHAIN ERROR:", writeError);
      let msg = "Minting failed. Simulation failed.";
      if (writeError.message.includes('User rejected')) msg = "Transaction rejected.";
      else if (writeError.message.includes('insufficient funds')) msg = "Insufficient ETH for gas.";
      else if (writeError.message.includes('not eligible')) msg = "Not eligible. Whitelist issue?";
      
      setMintError(msg);
      toast.error("Error", { description: msg });
    }
  }, [writeError]);

  const handleMint = useCallback(() => {
    if (!address || !activeCondition) {
      toast.error("Waiting for contract data...");
      return;
    }
    
    if (currentChainId !== base.id) {
      switchChain({ chainId: base.id });
      return;
    }

    setMintError(null);

    // Dynamic parameters from contract
    const price = activeCondition.pricePerToken;
    const currency = activeCondition.currency;
    const limit = activeCondition.quantityLimitPerWallet;

    writeContract({
      address: CONTRACT_ADDRESS,
      abi: ABI,
      functionName: 'claim',
      args: [
        address,
        TOKEN_ID,
        1n,
        currency,
        price,
        {
          proof: [],
          quantityLimitPerWallet: limit,
          pricePerToken: price,
          currency: currency
        },
        '0x'
      ],
      value: (currency.toLowerCase() === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee' && price > 0n) ? price : 0n,
      chainId: base.id,
    });
  }, [address, currentChainId, switchChain, writeContract, activeCondition]);

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-[#020617] text-slate-200 pb-16 overflow-hidden max-w-[430px] mx-auto relative">
      <header className="sticky top-0 z-50 px-3 py-2.5 backdrop-blur-xl border-b border-white/5 bg-[#020617]/80 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('explore')}>
          <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-[#0f172a]">
            <Image src="/ouwibo-nft.png" alt="Logo" fill className="object-cover" />
          </div>
          <h1 className="font-black text-xs text-white">OUWIBO</h1>
        </div>
        <WalletConnector />
      </header>

      <div className="px-3 pt-3">
        <AnimatePresence mode="wait">
          {activeTab === 'explore' && <ExploreView onNftClick={() => setActiveTab('mint')} />}
          {activeTab === 'mint' && (
            <MintView 
              isConnected={isConnected} 
              wrongNetwork={isConnected && currentChainId !== base.id}
              minted={hasMinted} 
              totalSupply={totalSupply} 
              handleMint={handleMint} 
              mintError={mintError}
              isPending={isPending || isConfirming}
              price={activeCondition ? (Number(activeCondition.pricePerToken) / 1e18).toString() : "..."}
              loading={loadingCondition}
            />
          )}
          {activeTab === 'profile' && <ProfileView address={address} userBalance={userBalance} />}
          {activeTab === 'ai' && <AiChatView />}
        </AnimatePresence>
      </div>

      <nav className="fixed bottom-3 left-3 right-3 z-50 bg-black/60 backdrop-blur-2xl border border-white/10 p-1 rounded-2xl flex items-center justify-around">
        {[
          { id: 'explore', icon: LayoutGrid, label: 'Explore' },
          { id: 'mint', icon: Zap, label: 'Mint' },
          { id: 'profile', icon: User, label: 'Wallet' },
          { id: 'ai', icon: Bot, label: 'AI' },
        ].map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl ${activeTab === tab.id ? 'bg-primary text-white' : 'text-slate-500'}`}>
            <tab.icon size={14} />
            <span className="text-[6px] font-black uppercase tracking-widest">{tab.label}</span>
          </button>
        ))}
      </nav>
    </main>
  );
}

function ExploreView({ onNftClick }: any) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 text-left">
      <section className="space-y-2 pb-6 border-b border-white/5">
        <h1 className="text-4xl font-black italic text-white uppercase leading-none">OUWIBO <br/> GENESIS.</h1>
        <p className="text-slate-400 text-[10px]">The official digital asset portal for the Ouwibo protocol on Base.</p>
      </section>
      <div className="bg-[#0f172a]/40 border border-white/5 rounded-3xl p-4 flex items-center gap-5 cursor-pointer" onClick={onNftClick}>
        <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-white/10 shadow-lg"><Image src="/ouwibo-nft.png" alt="NFT" fill /></div>
        <div className="flex-1">
          <h3 className="text-lg font-black text-white italic uppercase leading-none">Ouwibo Genesis</h3>
          <div className="flex items-center gap-1 text-base-emerald text-[7px] font-black uppercase mt-2 tracking-widest"><Zap size={8} className="fill-current" /> Status: Live Mint</div>
        </div>
        <ChevronRight size={16} className="text-slate-600" />
      </div>
    </motion.div>
  );
}

function MintView({ isConnected, wrongNetwork, minted, totalSupply, handleMint, mintError, isPending, price, loading }: any) {
  return (
    <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 pt-2">
      <div className="relative aspect-square max-w-[240px] mx-auto bg-[#0f172a] rounded-2xl overflow-hidden shadow-2xl border border-white/5">
        <Image src="/ouwibo-nft.png" alt="NFT" fill />
      </div>
      <div className="bg-[#0f172a]/40 border border-white/5 rounded-2xl p-4 space-y-4">
        <div className="flex justify-between border-b border-white/5 pb-3 text-left">
          <div><p className="text-[6px] font-black text-slate-500 uppercase tracking-widest">Protocol Fee</p><p className="text-sm font-black text-base-emerald">{loading ? '...' : price === "0" ? "FREE" : `${price} ETH`}</p></div>
          <div className="text-right"><p className="text-[6px] font-black text-slate-500 uppercase tracking-widest">Total Minted</p><p className="text-sm font-black text-white font-mono">{totalSupply?.toString() || '0'}</p></div>
        </div>
        {minted ? (
          <div className="bg-base-emerald/10 border border-base-emerald/20 p-3 rounded-xl flex items-center gap-3">
            <CheckCircle2 size={18} className="text-base-emerald" />
            <p className="text-[10px] font-black uppercase text-white">Genesis Pass Owned</p>
          </div>
        ) : (
          <button 
            disabled={isPending || loading} 
            onClick={handleMint} 
            className={`w-full py-3.5 rounded-xl text-[10px] font-black uppercase transition-all shadow-xl ${wrongNetwork ? 'bg-amber-500 text-black' : 'bg-primary text-white active:scale-95'}`}
          >
            {isPending ? <Loader2 size={12} className="animate-spin inline mr-2" /> : null}
            {loading ? "SYNCING..." : wrongNetwork ? "SWITCH TO BASE" : isPending ? "PROCESSING..." : "INITIALIZE MINT"}
          </button>
        )}
        {mintError && <p className="text-[8px] text-red-400 uppercase font-black text-center italic tracking-widest">{mintError}</p>}
      </div>
    </motion.div>
  );
}

function ProfileView({ address, userBalance }: any) {
  const { sendTransaction, isPending } = useSendTransaction();
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 text-left">
      <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex justify-between items-center shadow-lg">
        <div><p className="text-[7px] text-slate-500 font-black uppercase tracking-widest">UTILITY BALANCE</p><p className="text-lg font-black italic text-white leading-none mt-1 uppercase">Genesis Pass</p></div>
        <p className="text-2xl font-black text-white font-mono">{userBalance?.toString() || '0'}</p>
      </div>
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
        <div className="text-right">
          <p className="text-xs font-black text-secondary font-mono">0.001 ETH</p>
          <Heart size={10} className="text-secondary mt-1 fill-current animate-pulse ml-auto" />
        </div>
      </button>
    </motion.div>
  );
}

function AiChatView() {
  return (
    <div className="h-[60vh] flex flex-col items-center justify-center text-center p-6">
      <Bot size={40} className="text-primary mb-4 animate-pulse" />
      <p className="italic text-slate-500 text-xs font-medium max-w-[200px]">OUWIBO AI core is currently synchronizing with the protocol archives...</p>
    </div>
  );
}
