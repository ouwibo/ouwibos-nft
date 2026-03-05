'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { base } from 'wagmi/chains';
import { parseEther, parseAbi, encodeFunctionData, type Hex } from 'viem';
import { 
  useAccount, 
  useConnect, 
  useReadContract, 
  useSwitchChain,
  useChainId,
} from 'wagmi';
import { useSendCalls, useCallsStatus } from 'wagmi/experimental';
import { 
  LayoutGrid, User, Loader2, 
  Zap, CheckCircle2,
  ChevronRight, Bot, Coffee, ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import sdk from "@farcaster/frame-sdk";
import { WalletConnector } from '@/components/WalletConnector';
import { Attribution } from '@/lib/erc8021';

// STABLE CONFIG - NO ENV DEPENDENCY FOR CRITICAL PATH
const CONTRACT_ADDRESS = "0x075Bb11C9eeEfdd7b5AF5244Df2fb1f08BfA4146" as `0x${string}`;
const CREATOR_WALLET = "0xF96c80DAB17bccC9e0C0C454fa6Ec9234EF240f2";
const TOKEN_ID = 0n; 

// ABI - Standard ERC-1155
const ABI = parseAbi([
  "function claim(address receiver, uint256 tokenId, uint256 quantity, address currency, uint256 pricePerToken, (bytes32[] proof, uint256 quantityLimitPerWallet, uint256 pricePerToken, address currency) allowlistProof, bytes data) external payable",
  "function totalSupply(uint256 id) view returns (uint256)",
  "function balanceOf(address account, uint256 id) view returns (uint256)"
]);

export default function OuwiboBaseApp() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const currentChainId = useChainId();
  const { switchChain } = useSwitchChain();
  
  const [activeTab, setActiveTab] = useState<'explore' | 'mint' | 'profile' | 'ai'>('explore');
  const [minted, setMinted] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [mintError, setMintError] = useState<string | null>(null);
  const isInitialised = React.useRef(false);

  useEffect(() => {
    setMounted(true);

    if (isInitialised.current) return;
    isInitialised.current = true;
    
    const init = async () => {
      try {
        console.log("Initialising Farcaster SDK...");
        await sdk.actions.ready();
        
        // Find the farcaster connector from the config
        const farcasterConnector = connectors.find(c => c.id === 'farcaster');
        if (farcasterConnector && !isConnected) {
          connect({ connector: farcasterConnector });
        }
      } catch (e) { 
        console.error("SDK Initialization Error:", e);
      }
    };
    init();
  }, [connectors, connect, isConnected]);

  // Read Logic
  const { data: totalSupply } = useReadContract({
    address: CONTRACT_ADDRESS, abi: ABI, functionName: 'totalSupply', args: [TOKEN_ID], chainId: base.id,
  });

  const { data: userBalance, refetch: refetchBalance } = useReadContract({
    address: CONTRACT_ADDRESS, abi: ABI, functionName: 'balanceOf', args: [address || "0x0000000000000000000000000000000000000000", TOKEN_ID], chainId: base.id,
  });

  const hasMinted = minted || (userBalance !== undefined && (userBalance as bigint) > 0n);

  // Write Logic (Updated to use sendCalls for ERC-8021 capabilities)
  const { sendCalls, data: callData, isPending, error: writeError } = useSendCalls();
  const callId = typeof callData === 'string' ? callData : callData?.id;
  const { data: callsStatus } = useCallsStatus({
    id: callId as string,
    query: { enabled: !!callId },
  });

  const isConfirming = callsStatus?.status === 'pending';
  const isConfirmed = callsStatus?.status === 'success';
  
  // Custom states for the fetching process
  const [isFetchingProof, setIsFetchingProof] = useState(false);

  useEffect(() => {
    if (isConfirmed) {
      setMinted(true);
      refetchBalance();
      const txHash = callsStatus?.receipts?.[0]?.transactionHash;
      
      toast.success("Transaction Confirmed!", { 
        description: "NFT secured in your wallet.",
        action: txHash ? {
          label: "View BaseScan",
          onClick: () => window.open(`https://basescan.org/tx/${txHash}`, "_blank")
        } : undefined
      });
    }
  }, [isConfirmed, refetchBalance, callsStatus]);

  useEffect(() => {
    if (writeError) {
      const msg = writeError.message.includes('User rejected') 
        ? 'Transaction rejected by user.' 
        : writeError.message.includes('Insufficient funds')
          ? 'Insufficient funds for gas.'
          : 'Simulation failed. Check your connection or balance.';
      setMintError(msg);
      toast.error("Mint Error", { description: msg });
    }
  }, [writeError]);

  const handleMint = useCallback(async () => {
    if (!address) return;
    if (currentChainId !== base.id) {
      switchChain({ chainId: base.id });
      toast.info("Switching to Base Network");
      return;
    }

    setMintError(null);
    setIsFetchingProof(true);
    
    try {
      // 1. Fetch Dynamic Merkle Proof
      const res = await fetch('/api/merkle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address })
      });
      
      const proofData = await res.json();
      
      if (!res.ok) {
        throw new Error(proofData.error || 'Failed to fetch proof');
      }

      const NATIVE_TOKEN = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee' as `0x${string}`;

      // 2. Encode Function Data
      const calldata = encodeFunctionData({
        abi: ABI,
        functionName: 'claim',
        args: [
          address,
          TOKEN_ID,
          1n, // quantity
          NATIVE_TOKEN,
          BigInt(proofData.price),
          {
            proof: proofData.proof,
            quantityLimitPerWallet: BigInt(proofData.quantityLimit),
            pricePerToken: BigInt(proofData.price),
            currency: NATIVE_TOKEN
          },
          '0x'
        ]
      });

      // 3. Send using capabilities (ERC-8021)
      sendCalls({
        calls: [
          {
            to: CONTRACT_ADDRESS,
            data: calldata,
            value: BigInt(proofData.price) // Send value if price > 0
          }
        ],
        capabilities: {
          dataSuffix: Attribution.toDataSuffix() // Automatically handles the 8021 format
        }
      });
    } catch (err: any) {
      console.error("Mint setup error:", err);
      setMintError(err.message || 'Failed to prepare transaction');
      toast.error("Preparation Failed", { description: err.message || 'Could not verify mint allowance.' });
    } finally {
      setIsFetchingProof(false);
    }
  }, [address, currentChainId, switchChain, sendCalls]);

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-[#020617] text-slate-200 pb-16 overflow-hidden max-w-[430px] mx-auto relative touch-manipulation">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-5%] left-[-5%] w-[40%] h-[40%] bg-purple-900/10 rounded-full blur-[60px]" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[40%] h-[40%] bg-cyan-900/5 rounded-full blur-[60px]" />
      </div>

      <header className="sticky top-0 z-50 px-3 py-2.5 backdrop-blur-xl border-b border-white/5 bg-[#020617]/80 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('explore')}>
          <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-[#0f172a] border border-white/10">
            <Image src="/ouwibo-nft.png" alt="Logo" fill className="object-cover" />
          </div>
          <h1 className="font-black text-xs text-white uppercase tracking-tighter">OUWIBO</h1>
        </div>
        <div className="scale-75 origin-right"><WalletConnector /></div>
      </header>

      <div className="px-3 pt-3">
        <AnimatePresence mode="wait">
          {activeTab === 'explore' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 text-left">
              <section className="space-y-2 pb-6 border-b border-white/5">
                <h1 className="text-4xl font-black italic text-white uppercase leading-none tracking-tighter">OUWIBO <br/> <span className="text-primary">CRYPTO.</span></h1>
                <p className="text-slate-400 text-[10px]">Official digital asset portal for the Ouwibo protocol.</p>
              </section>
              
              <div className="bg-[#0f172a]/40 backdrop-blur-xl border border-white/5 rounded-3xl p-4 flex items-center gap-5 cursor-pointer shadow-xl active:scale-95 transition-all" onClick={() => setActiveTab('mint')}>
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-white/10 shadow-md">
                  <Image src="/ouwibo-nft.png" alt="NFT" fill className="object-cover" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-black text-white italic uppercase leading-none">Ouwibo Crypto</h3>
                  <p className="text-[8px] text-slate-500 font-medium italic mt-1">Official Access Pass</p>
                  <div className="flex items-center gap-1 text-base-emerald text-[7px] font-black uppercase pt-2 tracking-widest"><Zap size={8} className="fill-current" /> Status: Live Mint</div>
                </div>
                <ChevronRight size={16} className="text-slate-600" />
              </div>
            </motion.div>
          )}
          
          {activeTab === 'mint' && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 pt-2">
              <div className="relative aspect-square max-w-[240px] mx-auto bg-[#0f172a] rounded-2xl overflow-hidden shadow-2xl border border-white/5">
                <Image src="/ouwibo-nft.png" alt="NFT" fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-60" />
              </div>
              <div className="bg-[#0f172a]/40 backdrop-blur-3xl border border-white/5 rounded-2xl p-4 space-y-4 shadow-xl">
                <div className="flex justify-between border-b border-white/5 pb-3 text-left">
                  <div><p className="text-[6px] font-black text-slate-500 uppercase tracking-widest">Minting Fee</p><p className="text-sm font-black text-base-emerald uppercase">FREE + GAS</p></div>
                  <div className="text-right"><p className="text-[6px] font-black text-slate-500 uppercase tracking-widest">Available</p><p className="text-sm font-black text-white font-mono">{totalSupply?.toString() || '0'} / 6969</p></div>
                </div>
                {hasMinted ? (
                  <div className="bg-base-emerald/10 border border-base-emerald/20 p-3 rounded-xl flex items-center gap-3">
                    <div className="w-8 h-8 bg-base-emerald rounded-lg flex items-center justify-center shadow-lg"><CheckCircle2 size={18} className="text-black" /></div>
                    <p className="text-[10px] font-black uppercase text-white leading-none tracking-tight">Crypto Pass Owned</p>
                  </div>
                ) : (
                  <button 
                    disabled={isPending || isConfirming || isFetchingProof || !address} 
                    onClick={handleMint} 
                    className={`w-full py-3.5 rounded-xl text-[10px] font-black uppercase transition-all shadow-xl flex items-center justify-center gap-2 ${currentChainId !== base.id && isConnected ? 'bg-amber-500 text-black' : 'bg-primary text-white active:scale-95 disabled:opacity-50'}`}
                  >
                    {(isPending || isConfirming || isFetchingProof) && <Loader2 size={12} className="animate-spin" />}
                    {isConnected && currentChainId !== base.id ? "SWITCH TO BASE" : (isPending || isConfirming || isFetchingProof) ? "PROCESSING..." : "INITIALIZE MINT"}
                  </button>
                )}
                {mintError && <p className="text-[8px] text-red-400 uppercase font-black text-center mt-2 italic leading-relaxed">{mintError}</p>}
              </div>
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 text-left">
              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex justify-between items-center shadow-lg">
                <div><p className="text-[7px] text-slate-500 font-black uppercase tracking-widest leading-none">UTILITY BALANCE</p><p className="text-lg font-black italic text-white mt-1 uppercase leading-none">Crypto Pass</p></div>
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
  const { sendCalls, isPending } = useSendCalls();
  return (
    <button 
      disabled={isPending}
      onClick={() => sendCalls({ 
        calls: [{
          to: CREATOR_WALLET as `0x${string}`, 
          value: parseEther("0.001")
        }],
        capabilities: {
          dataSuffix: Attribution.toDataSuffix() // Automatically handles the 8021 format
        }
      })}
      className="w-full bg-secondary/10 border border-secondary/20 p-4 rounded-2xl flex justify-between items-center transition-all hover:bg-secondary/20 group"
    >
      <div className="flex gap-3 items-center">
        <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center text-secondary">
          {isPending ? <Loader2 size={18} className="animate-spin" /> : <Coffee size={18} />}
        </div>
        <div className="text-left">
          <p className="text-[7px] text-slate-500 font-black uppercase tracking-widest leading-none">SUPPORT CREATOR</p>
          <p className="text-xs font-black text-white italic uppercase leading-none mt-1 group-hover:text-secondary">Buy a Coffee</p>
        </div>
      </div>
      <p className="text-xs font-black text-secondary font-mono tracking-tighter">0.001 ETH</p>
    </button>
  );
}

function AiChatView() {
  return (
    <div className="h-[60vh] flex flex-col items-center justify-center text-center p-6 text-slate-500">
      <Bot size={40} className="text-primary mb-4 animate-pulse opacity-20" />
      <p className="italic text-[10px] max-w-[200px] leading-relaxed">Protocol Archives Online.</p>
    </div>
  );
}
