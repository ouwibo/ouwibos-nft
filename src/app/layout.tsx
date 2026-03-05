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

const APP_URL = process.env.NEXT_PUBLIC_VERCEL_URL 
  ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` 
  : "https://ouwibo-nft.vercel.app";

const miniAppConfig = {
  version: "1",
  imageUrl: `${APP_URL}/ouwibo-nft.png`,
  noindex: false,
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
        width: 1200,
        height: 800,
        alt: 'OUWIBO CRYPTO Preview',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  other: {
    "talentapp:project_verification": "a02258cfbd696e6d4ce2c4a512ffa2cfd5bfd72fbbe6b34818a714938f0e44ba0002b0eb816aca67e2883d40aae8efede91fed868fb5d4463759a73a73e07319",
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
