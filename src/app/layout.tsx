import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from '@/components/Providers'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const APP_URL = process.env.NEXT_PUBLIC_VERCEL_URL 
  ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` 
  : "https://ouwibos-nft.vercel.app";

const miniappEmbed = {
  version: "1",
  type: "miniapp",
  name: "Ouwibo NFT",
  icon: `${APP_URL}/ouwibo-nft.png`,
  imageUrl: `${APP_URL}/ouwibo-nft.png`,
  description: "Mint Ouwibo NFT on Base Mainnet gasless.",
  app_url: APP_URL
};

const stringifiedEmbed = JSON.stringify(miniappEmbed);

export const metadata: Metadata = {
  title: 'Ouwibo NFT | Base Mainnet',
  description: 'Mint Ouwibo-NFT eksklusif via Farcaster Frame - Base Mainnet',
  manifest: '/manifest.json',
  other: {
    "base:app_id": "69a11773dce51e894f97278f",
    "fc:miniapp": stringifiedEmbed,
    "fc:frame": stringifiedEmbed,
    "fc:frame:image": `${APP_URL}/ouwibo-nft.png`,
    "fc:frame:button:1": "🔗 Connect Wallet",
    "fc:frame:button:1:action": "post",
    "fc:frame:button:1:target": `${APP_URL}/api/connect`,
    "fc:frame:button:2": "✨ Mint NFT",
    "fc:frame:button:2:action": "tx",
    "fc:frame:button:2:target": `${APP_URL}/api/mint`,
    "fc:frame:post_url": `${APP_URL}/api/frame-state`,
  },
}

export default function RootLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${inter.variable}`}>
      <body className="antialiased font-sans bg-black text-white">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}