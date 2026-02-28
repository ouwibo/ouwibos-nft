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

export default function OuwiboBaseApp() {
  const account = useActiveAccount();
  const isConnected = !!account;
  
  const [minted, setMinted] = useState(false);
  const [mintCount, setMintCount] = useState(1240);
  const [txHash, setTxHash] = useState<string | null>(null);
  
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    // Notify Farcaster that the mini-app is ready to be displayed
    sdk.actions.ready();
  }, []);

  // Initialize Contract
  const contract = getContract({
    client,
    chain: base,
    address: "0x3525fDbC54DC01121C8e12C3948187E6153Cdf25",
  });

  const shareToFeed = () => {
    const text = "I just secured my Ouwibo Genesis Pass! 🚀 Join the mint on Base.";
    const url = typeof window !== 'undefined' ? window.location.origin : "https://ouwibos-nft.vercel.app";
    window.open(`https://warpcast.com/~/compose?text=${encodeURIComponent(text)}&embeds[]=${encodeURIComponent(url)}`, "_blank");
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0a0a0a] to-[#1a1a2e] flex items-center justify-center p-0 sm:p-6 font-sans text-white relative overflow-hidden">
      
      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-base-amber/40 rounded-full blur-sm animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-2 h-2 bg-base-emerald/30 rounded-full blur-sm animate-float animation-delay-2000" />
        <div className="absolute top-1/2 right-1/3 w-1.5 h-1.5 bg-base-amber/20 rounded-full blur-sm animate-pulse-slow" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full h-screen sm:h-auto max-w-md bg-white/5 backdrop-blur-xl sm:rounded-[40px] border border-white/10 flex flex-col relative z-10 overflow-hidden shadow-2xl hover:shadow-base-glow transition-all duration-500"
      >
        {/* Header */}
        <div className="px-8 pt-8 pb-4 flex items-center justify-between border-b border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-gradient-to-br from-base-amber to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
               <span className="text-black font-black text-xl italic leading-none">O</span>
             </div>
             <div className="text-left">
                <h2 className="font-black text-lg tracking-tighter leading-none mb-1 text-base-amber uppercase">OUWIBO</h2>
                <div className="flex items-center gap-1.5 opacity-60">
                   <div className="w-1.5 h-1.5 bg-base-emerald rounded-full animate-ping" />
                   <p className="text-[9px] font-black uppercase tracking-[0.2em] font-mono">Base Mainnet</p>
                </div>
             </div>
          </div>
          
          <ConnectButton
            client={client}
            wallets={wallets}
            chain={base}
            theme="dark"
            connectButton={{
              className: "!bg-white/5 !border !border-white/10 !rounded-2xl !px-4 !py-2 !text-[10px] !font-black !uppercase !tracking-widest !text-white/80 !transition-all hover:!bg-white/10",
              label: "Connect",
            }}
          />
        </div>

        {/* NFT Asset Preview */}
        <div className="px-8 py-6">
          <div className="relative aspect-square group">
            <div className="absolute inset-[-2px] bg-gradient-to-tr from-base-amber via-transparent to-base-emerald rounded-[42px] opacity-50 blur-sm group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative w-full h-full rounded-[40px] border border-white/20 overflow-hidden bg-black shadow-inner">
              <img 
                src="/ouwibo-nft.png" 
                alt="Ouwibo Genesis" 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-8 left-8 right-8 text-left">
                 <div className="flex items-center gap-2 mb-1">
                    <Zap size={14} className="text-base-amber" />
                    <span className="text-[10px] font-black text-base-amber uppercase tracking-[0.3em]">Genesis Pass</span>
                 </div>
                 <h3 className="text-2xl font-black italic tracking-tighter uppercase leading-none">Ouwibo NFT</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Stats & Interactive Button */}
        <div className="px-8 py-6 text-center">
           <div className="mb-8">
              <h1 className="text-5xl font-black font-mono tracking-tighter text-white">
                {mintCount.toLocaleString()} <span className="text-white/20">/ 6,969</span>
              </h1>
              <p className="text-[10px] text-white/30 uppercase font-black tracking-[0.5em] mt-3 tracking-tighter italic">Minted So Far</p>
           </div>

           <div className="relative">
              {!minted ? (
                <>
                  {!isConnected ? (
                    <div className="w-full">
                      <ConnectButton
                        client={client}
                        wallets={wallets}
                        chain={base}
                        theme="dark"
                        connectButton={{
                          className: "!w-full !relative !overflow-hidden !bg-gradient-to-r !from-base-amber !to-orange-500 !text-black !font-black !py-6 !rounded-2xl !text-lg !uppercase !tracking-wider !shadow-2xl !active:scale-95 !border-none",
                          label: "Connect Wallet to Mint",
                        }}
                      />
                    </div>
                  ) : (
                    <TransactionButton
                      transaction={() => claimTo({
                        contract,
                        to: account!.address,
                        tokenId: 0n,
                        quantity: 1n,
                      })}
                      onTransactionConfirmed={(receipt) => {
                        setMinted(true);
                        setTxHash(receipt.transactionHash);
                        setMintCount(prev => prev + 1);
                      }}
                      onError={(error) => alert(`Mint failed: ${error.message}`)}
                      className="!w-full !bg-gradient-to-r !from-base-amber !via-base-emerald !to-emerald-600 !text-black !font-black !py-8 !rounded-2xl !text-lg !uppercase !tracking-wider !shadow-2xl !transition-all !border-none active:!scale-95"
                    >
                      MINT NFT #0 <ArrowRight size={20} className="inline ml-2" />
                    </TransactionButton>
                  )}
                </>
              ) : (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-base-emerald/10 border border-base-emerald/20 rounded-2xl p-6">
                   <div className="flex flex-col items-center gap-4">
                      <CheckCircle2 size={40} className="text-base-emerald" />
                      <h3 className="text-xl font-black uppercase tracking-tight italic">Successfully Claimed!</h3>
                      <button 
                        onClick={shareToFeed}
                        className="w-full bg-white text-black font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-base-amber transition-all"
                      >
                        <Share2 size={18} /> SHARE TO FEED
                      </button>
                      <a href={`https://basescan.org/tx/${txHash}`} target="_blank" className="text-[10px] font-bold opacity-40 hover:opacity-100 uppercase tracking-widest flex items-center gap-1">
                        View Tx <ExternalLink size={10} />
                      </a>
                   </div>
                </motion.div>
              )}
           </div>
        </div>

        <div className="mt-auto px-8 py-8 border-t border-white/5 bg-black/20 flex flex-col items-center gap-2">
           <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20">
              Base Mainnet • Official Protocol
           </p>
        </div>

      </motion.div>
    </main>
  );
}