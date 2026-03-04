import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const secretKey = process.env.THIRDWEB_SECRET_KEY;
    const contractAddress = "0x3525fDbC54DC01121C8e12C3948187E6153Cdf25";
    const chainId = "8453"; // Base

    if (!secretKey) {
      return NextResponse.json({ error: "Missing THIRDWEB_SECRET_KEY" }, { status: 500 });
    }

    const url = `https://api.thirdweb.com/v1/contracts/${chainId}/${contractAddress}/events?eventSignature=event TokensLazyMinted(uint256 indexed startTokenId, uint256 endTokenId, string baseURI, bytes encryptedBaseURI)`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-secret-key": secretKey,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: `Thirdweb API error: ${errorText}` }, { status: response.status });
    }

    const data = await response.json();
    
    // Process the events to create a collection list
    // We'll return the raw data for now, or you can map it to your NFT structure
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Collection API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
