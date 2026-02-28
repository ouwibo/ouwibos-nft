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
  : "https://ouwibo-nft.vercel.app";

const frameConfig = {
  version: "next",
  imageUrl: `${APP_URL}/ouwibo-nft.png`,
  button: {
    title: "Launch Ouwibo",
    action: {
      type: "launch_frame",
      name: "Ouwibo NFT",
      url: APP_URL,
      splashImageUrl: `${APP_URL}/ouwibo-nft.png`,
      splashBackgroundColor: "#000000",
    },
  },
};

const stringifiedFrame = JSON.stringify(frameConfig);

export const metadata: Metadata = {
  title: 'Ouwibo NFT | Base Mainnet',
  description: 'Mint Ouwibo-NFT eksklusif via Farcaster Frame - Base Mainnet',
  manifest: '/manifest.json',
  other: {
    "base:app_id": "69a11773dce51e894f97278f",
    "fc:frame": stringifiedFrame,
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