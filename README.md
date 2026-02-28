# 🚀 Ouwibo-NFT Premium Minter

A premium Farcaster Frame and Miniapp for minting exclusive Genesis Ouwibo-NFTs on **Base Mainnet**. Built with Next.js 15, Tailwind CSS, and Thirdweb SDK v5.

## ✨ Features

- **Premium UI/UX:** High-end "Base One" Amber & Emerald theme with cinematic animations and glassmorphism.
- **Farcaster Native:** Fully compatible with Farcaster Frames and Miniapps spec.
- **Base Mainnet:** Optimized for the Base ecosystem with official `base:app_id`.
- **Advanced Wallet Flow:** Integrated connection for Coinbase Wallet, MetaMask, and Farcaster Auth.
- **Viral Loop:** Built-in "Share to Feed" feature for community growth.

## 🛠 Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS + Framer Motion
- **Web3:** Thirdweb SDK v5
- **Network:** Base Mainnet (Chain ID: 8453)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and fill in your credentials:
   ```env
   NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_client_id
   THIRDWEB_SECRET_KEY=your_secret_key
   NEXT_PUBLIC_CONTRACT_ADDRESS=0x3525fDbC54DC01121C8e12C3948187E6153Cdf25
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

## 🌐 Deployment

Deploy easily to Vercel:

1. Push your code to GitHub.
2. Connect your repository to Vercel.
3. Add your Environment Variables in the Vercel dashboard.
4. Set `NEXT_PUBLIC_APP_URL` to your production domain.

---
Powered by **Thirdweb** & **Base**.
