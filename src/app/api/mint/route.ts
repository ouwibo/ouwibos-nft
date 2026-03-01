import { NextRequest, NextResponse } from 'next/server';
import { mintNFT } from '@/lib/thirdweb';

export async function POST(req: NextRequest) {
  try {
    const { address, nftId } = await req.json();

    if (!address) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }

    // Call the Thirdweb Engine minting function from lib/thirdweb.ts
    const result = await mintNFT(address, nftId?.toString() || "0", "1");

    return NextResponse.json({ 
      success: true, 
      txHash: result.result?.transactionHash || result.transactionHash,
      data: result 
    });
  } catch (error: any) {
    console.error('Minting API Error:', error);
    return NextResponse.json({ 
      error: error.message || 'Internal server error during minting' 
    }, { status: 500 });
  }
}
