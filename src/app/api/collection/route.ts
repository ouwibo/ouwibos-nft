import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const secretKey = process.env.THIRDWEB_SECRET_KEY;
    const contractAddress = "0x3525fDbC54DC01121C8e12C3948187E6153Cdf25";
    const chainId = "8453"; // Base

    // If key is missing, return empty array instead of 500 error to avoid build failures
    if (!secretKey) {
      console.warn("THIRDWEB_SECRET_KEY is not defined. Returning empty collection.");
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

    if (!response.ok) {
      // In case of API failure, return empty array to prevent frontend crash
      console.error("Thirdweb API failure during build/runtime");
      return NextResponse.json([]);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Collection API Error:', error);
    return NextResponse.json([], { status: 200 }); // Always return success with empty array as fallback
  }
}
