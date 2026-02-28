import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from '@/components/Providers'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

const APP_URL = process.env.NEXT_PUBLIC_VERCEL_URL 
  ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` 
  : "https://ouwibo-nft.vercel.app";

const miniAppConfig = {
  version: "1",
  imageUrl: `${APP_URL}/ouwibo-nft.png`,
  button: {
    title: "Launch Ouwibo",
    action: {
      type: "launch_frame",
      name: "OUWIBO NFT",
      url: APP_URL,
      splashImageUrl: `${APP_URL}/ouwibo-nft.png`,
      splashBackgroundColor: "#000000",
    },
  },
};

const stringifiedConfig = JSON.stringify(miniAppConfig);

export const metadata: Metadata = {
  title: 'OUWIBO GENESIS Pass Airdrop Portal',
  description: 'Ouwibo NFT is your premium gateway to Base. Mint your Genesis Pass to unlock gasless experiences and airdrop priority.',
  manifest: '/manifest.json',
  openGraph: {
    title: 'OUWIBO GENESIS Pass Airdrop Portal',
    description: 'Mint your Genesis Pass to unlock exclusive Base ecosystem rewards and airdrop priority access.',
    url: APP_URL,
    siteName: 'OUWIBO NFT',
    images: [
      {
        url: `${APP_URL}/ouwibo-nft.png`,
        width: 1200,
        height: 800,
        alt: 'OUWIBO NFT Preview',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  other: {
    "base:app_id": "69a11773dce51e894f97278f",
    "fc:miniapp": stringifiedConfig,
    "fc:frame": stringifiedConfig,
    "fc:frame:image": `${APP_URL}/ouwibo-nft.png`,
    "fc:frame:button:1": "Launch Ouwibo",
    "fc:frame:button:1:action": "post_redirect",
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
