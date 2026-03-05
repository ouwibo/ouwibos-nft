import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { RootClientLayout } from '@/components/RootClientLayout'
import { Toaster } from 'sonner'
import { Analytics } from '@vercel/analytics/react'

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
  themeColor: '#020617',
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL 
  ? process.env.NEXT_PUBLIC_APP_URL 
  : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "https://ouwibo-nft.vercel.app";

const miniAppConfig = {
  version: "1",
  imageUrl: `${APP_URL}/ouwibo-nft.png`,
  noindex: false,
  castShareUrl: APP_URL, // URL to share when casting from the Mini App
  button: {
    title: "Launch Ouwibo",
    action: {
      type: "launch_frame",
      name: "OUWIBO CRYPTO",
      url: APP_URL,
      splashImageUrl: `${APP_URL}/loading.svg`,
      splashBackgroundColor: "#020617",
    },
  },
};

const stringifiedConfig = JSON.stringify(miniAppConfig);

export const metadata: Metadata = {
  title: 'OUWIBO CRYPTO Airdrop Portal',
  description: 'Ouwibo Crypto is your premium gateway to the Base network. Mint your Crypto Pass to unlock gasless experiences and $OWB airdrop priority.',
  icons: {
    icon: [
      { url: '/ouwibo-nft.png' },
      { url: '/ouwibo-nft.png', sizes: '32x32', type: 'image/png' },
      { url: '/ouwibo-nft.png', sizes: '16x16', type: 'image/png' },
    ],
    shortcut: '/ouwibo-nft.png',
    apple: [
      { url: '/ouwibo-nft.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'OUWIBO CRYPTO',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: 'OUWIBO CRYPTO Airdrop Portal',
    description: 'Mint your Crypto Pass to unlock exclusive Base ecosystem rewards and $OWB airdrop priority access.',
    url: APP_URL,
    siteName: 'OUWIBO CRYPTO',
    images: [
      {
        url: `${APP_URL}/ouwibo-nft.png`,
        width: 512,
        height: 512,
        alt: 'OUWIBO CRYPTO Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OUWIBO CRYPTO',
    description: 'Mint your Crypto Pass on Base.',
    images: [`${APP_URL}/ouwibo-nft.png`],
  },
  other: {
    "base:app_id": "69a11773dce51e894f97278f",
    "fc:frame": "vNext",
    "fc:frame:image": `${APP_URL}/ouwibo-nft.png`,
    "fc:frame:button:1": "Launch Ouwibo",
    "fc:frame:button:1:action": "launch_frame",
    "fc:frame:button:1:target": APP_URL,
    "fc:miniapp": stringifiedConfig,
  },
}

export default function RootLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body className="antialiased font-sans bg-[#020617] text-white">
        <Toaster position="top-center" richColors theme="dark" />
        <RootClientLayout>
          {children}
        </RootClientLayout>
        <Analytics />
      </body>
    </html>
  )
}
