import { createThirdwebClient, getContract, sendTransaction } from "thirdweb";
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

    // Initialize Thirdweb Client
    const client = createThirdwebClient({
      secretKey: process.env.THIRDWEB_SECRET_KEY!,
    });

    // Initialize contract
    const contract = getContract({
      client,
      chain: base,
      address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!,
    });

    // Initialize Backend Wallet if needed for gasless sponsorship
    if (!process.env.BACKEND_PRIVATE_KEY) {
        return Response.json({ error: 'Server configuration error: Missing private key' }, { status: 500 });
    }
    
    const account = privateKeyToAccount({
      client,
      privateKey: process.env.BACKEND_PRIVATE_KEY,
    });

    // Execute Claim
    const transaction = claimTo({
      contract,
      to: userAddress,
      tokenId: 0n,
      quantity: 1n,
    });

    const { transactionHash } = await sendTransaction({
      transaction,
      account,
    });

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
    }, { status: 500 });
  }
}