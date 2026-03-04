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

// Refined ABI for Thirdweb DropERC1155
const ABI = ([
  "function claim(address receiver, uint256 tokenId, uint256 quantity, address currency, uint256 pricePerToken, (bytes32[] proof, uint256 quantityLimitPerWallet, uint256 pricePerToken, address currency) allowlistProof, bytes data) external payable",
  "function totalSupply(uint256 id) view returns (uint256)",
  "function balanceOf(address account, uint256 id) view returns (uint256)",
  "function getActiveClaimCondition(uint256 tokenId) view returns (tuple(uint256 startTimestamp, uint256 maxClaimableSupply, uint256 supplyClaimed, uint256 quantityLimitPerWallet, uint256 waitTimeInSecondsBetweenClaims, bytes32 merkleRoot, uint256 pricePerToken, address currency, string metadata))"
]);

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
      
      setMintError(msg);
      toast.error("Error", { description: msg });
    }
  }, [writeError]);

  const handleMint = useCallback(() => {
    if (!address || !activeCondition) {
      toast.error("Contract data not loaded yet. Please wait.");
      return;
    }
    
    if (currentChainId !== base.id) {
      switchChain({ chainId: base.id });
      return;
    }

    setMintError(null);

    // EXTRACT EXACT VALUES FROM CONTRACT
    const cond = activeCondition as any;
    const price = cond.pricePerToken;
    const currency = cond.currency;
    const limit = cond.quantityLimitPerWallet;

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
          quantityLimitPerWallet: limit, // MUST match the active condition exactly
          pricePerToken: price,          // MUST match the active condition exactly
          currency: currency             // MUST match the active condition exactly
        },
        '0x'
      ],
      value: (currency === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' && price > 0n) ? price : 0n,
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
              price={activeCondition ? (Number((activeCondition as any).pricePerToken) / 1e18).toString() : "..."}
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
        <h1 className="text-4xl font-black italic text-white uppercase">OUWIBO GENESIS.</h1>
        <p className="text-slate-400 text-[10px]">Official digital asset portal on Base.</p>
      </section>
      <div className="bg-[#0f172a]/40 border border-white/5 rounded-3xl p-4 flex items-center gap-5 cursor-pointer" onClick={onNftClick}>
        <div className="relative w-20 h-20 rounded-2xl overflow-hidden"><Image src="/ouwibo-nft.png" alt="NFT" fill /></div>
        <div className="flex-1">
          <h3 className="text-lg font-black text-white">Ouwibo Genesis</h3>
          <div className="flex items-center gap-1 text-base-emerald text-[7px] font-black uppercase"><Zap size={8} /> Status: Live</div>
        </div>
        <ChevronRight size={16} className="text-slate-600" />
      </div>
    </motion.div>
  );
}

function MintView({ isConnected, wrongNetwork, minted, totalSupply, handleMint, mintError, isPending, price, loading }: any) {
  return (
    <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 pt-2">
      <div className="relative aspect-square max-w-[240px] mx-auto bg-[#0f172a] rounded-2xl overflow-hidden shadow-2xl">
        <Image src="/ouwibo-nft.png" alt="NFT" fill />
      </div>
      <div className="bg-[#0f172a]/40 border border-white/5 rounded-2xl p-4 space-y-4">
        <div className="flex justify-between border-b border-white/5 pb-3 text-left">
          <div><p className="text-[6px] font-black text-slate-500 uppercase">Fee</p><p className="text-sm font-black text-base-emerald">{loading ? '...' : price === "0" ? "Free" : `${price} ETH`}</p></div>
          <div className="text-right"><p className="text-[6px] font-black text-slate-500 uppercase">Minted</p><p className="text-sm font-black text-white">{totalSupply?.toString() || '0'}</p></div>
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
            className={`w-full py-3.5 rounded-xl text-[10px] font-black uppercase transition-all ${wrongNetwork ? 'bg-amber-500' : 'bg-primary text-white active:scale-95'}`}
          >
            {isPending ? <Loader2 size={12} className="animate-spin inline mr-2" /> : null}
            {loading ? "FETCHING CONTRACT..." : wrongNetwork ? "SWITCH TO BASE" : isPending ? "WAITING..." : "INITIALIZE MINT"}
          </button>
        )}
        {mintError && <p className="text-[8px] text-red-400 uppercase font-black text-center">{mintError}</p>}
      </div>
    </motion.div>
  );
}

function ProfileView({ address, userBalance }: any) {
  const { sendTransaction } = useSendTransaction();
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 text-left">
      <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex justify-between items-center">
        <div><p className="text-[7px] text-slate-500">UTILITY BALANCE</p><p className="text-lg font-black italic text-white">Genesis Pass</p></div>
        <p className="text-2xl font-black text-white">{userBalance?.toString() || '0'}</p>
      </div>
      <button 
        onClick={() => sendTransaction({ to: CREATOR_WALLET as `0x${string}`, value: parseEther("0.001"), chainId: base.id })}
        className="w-full bg-secondary/10 border border-secondary/20 p-4 rounded-2xl flex justify-between items-center"
      >
        <div className="flex gap-3"><Coffee size={18} /><p className="text-xs font-black text-white italic">Support Creator</p></div>
        <p className="text-xs font-black text-secondary">0.001 ETH</p>
      </button>
    </motion.div>
  );
}

function AiChatView() {
  return <div className="h-[60vh] flex items-center justify-center italic text-slate-500 text-xs">AI Core Online.</div>;
}
