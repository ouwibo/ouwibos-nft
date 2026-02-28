import { createThirdwebClient, getContract } from "thirdweb";
import { base } from "thirdweb/chains";
import { claimTo } from "thirdweb/extensions/erc1155";
import { privateKeyToAccount } from "thirdweb/wallets";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Farcaster user address
    const userAddress = body.trustedData?.address || body.untrustedData?.address;
    
    if (!userAddress) {
      return Response.json({ error: 'No wallet address provided' }, { status: 400 });
    }

    // Initialize Thirdweb Client with Secret Key
    const client = createThirdwebClient({
      secretKey: process.env.THIRDWEB_SECRET_KEY!,
    });

    // Initialize your contract
    const contract = getContract({
      client,
      chain: base,
      address: "0x3525fDbC54DC01121C8e12C3948187E6153Cdf25",
    });

    // Initialize Backend Wallet Account
    // WARNING: Ensure you have ETH on Base Mainnet in this wallet
    // It is recommended to use a Private Key for server-side signing
    if (!process.env.BACKEND_PRIVATE_KEY) {
        return Response.json({ error: 'Server configuration error: Missing private key' }, { status: 500 });
    }
    
    const account = privateKeyToAccount({
      client,
      privateKey: process.env.BACKEND_PRIVATE_KEY,
    });

    // Execute Claim Transaction (Gasless for user, paid by your backend wallet)
    const transaction = claimTo({
      contract,
      to: userAddress,
      tokenId: 0n,
      quantity: 1n,
    });

    const { transactionHash } = await transaction.sendBatch({ account });

    return Response.json({
      success: true,
      transactionId: transactionHash,
      explorer: `https://basescan.org/tx/${transactionHash}`,
      message: "Ouwibo-NFT claimed successfully! 🎉"
    });

  } catch (error: any) {
    console.error('SDK Minting Error:', error);
    return Response.json({ 
      error: error.message || 'Minting failed',
      details: error.toString()
    }, { status: 500 });
  }
}