import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const secretKey = process.env.THIRDWEB_SECRET_KEY;
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x3525fDbC54DC01121C8e12C3948187E6153Cdf25";
    const chainId = process.env.NEXT_PUBLIC_CHAIN_ID || "8453"; // Base

    if (!secretKey) {
      console.warn("THIRDWEB_SECRET_KEY is not defined.");
      return NextResponse.json([]);
    }

    const url = `https://api.thirdweb.com/v1/contracts/${chainId}/${contractAddress}/events?eventSignature=event TokensLazyMinted(uint256 indexed startTokenId, uint256 endTokenId, string baseURI, bytes encryptedBaseURI)`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-secret-key": secretKey,
      },
    });

    if (!response.ok) return NextResponse.json([]);

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json([]);
  }
}
