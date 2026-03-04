# OUWIBO NFT Protocol

The **OUWIBO NFT Protocol** is a premium digital asset infrastructure built on the **Base network** (Layer 2) and optimized for the **Farcaster** social ecosystem. This repository contains the official minting portal for the **OUWIBO Genesis Pass**, featuring a gasless onboarding experience and high-fidelity mobile-first design.

## Key Features

- **Genesis Pass Minting**: Primary utility NFT for the Ouwibo ecosystem, granting governance rights and $OWB airdrop priority.
- **Gasless Infrastructure**: Leverages server-side sponsorship to allow users to mint without requiring upfront ETH for gas.
- **Farcaster Native**: Fully integrated with the **Farcaster Mini-app SDK**, providing a seamless experience within Warpcast.
- **OnchainKit Integration**: Powered by Coinbase OnchainKit for robust wallet connectivity and transaction handling.
- **Atlantis Design System**: A futuristic, high-performance UI built with Framer Motion and Tailwind CSS.

## Technical Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Blockchain**: [Base Network](https://base.org/)
- **SDKs**: 
  - [Farcaster Mini-app SDK](https://docs.farcaster.xyz/developers/frames/v2/)
  - [Thirdweb v5](https://portal.thirdweb.com/)
  - [Wagmi / Viem](https://wagmi.sh/)
- **Styling**: Tailwind CSS & Framer Motion
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/ouwibo/ouwibos-nft.git
   cd ouwibos-nft
   ```

2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

## Configuration

Create a `.env.local` file in the root directory and add the following:

```env
# Thirdweb Configuration
THIRDWEB_SECRET_KEY=your_secret_key
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_client_id

# Contract Configuration
NEXT_PUBLIC_CONTRACT_ADDRESS=0x69A11773Dce51E894f97278F3d40Aae8efEde91f

# Wallet Configuration
BACKEND_PRIVATE_KEY=your_private_key_for_gasless
```

## Deployment

The project is optimized for deployment on **Vercel**. Ensure that all environment variables are correctly configured in the Vercel dashboard.

---

© 2026 OUWIBO Protocol. Built for the future of decentralized social.
