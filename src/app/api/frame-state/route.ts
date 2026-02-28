import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // Logic to handle state changes or button clicks
  // This can be used to update frame based on specific action logic
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  
  const frameMetadata = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content="${baseUrl}/ouwibo-nft.png" />
        <meta property="fc:frame:button:1" content="🔗 Connect Wallet" />
        <meta property="fc:frame:button:1:action" content="post" />
        <meta property="fc:frame:button:1:target" content="${baseUrl}/api/connect" />
        <meta property="fc:frame:button:2" content="✨ Mint NFT" />
        <meta property="fc:frame:button:2:action" content="tx" />
        <meta property="fc:frame:button:2:target" content="${baseUrl}/api/mint" />
      </head>
    </html>
  `;

  return new NextResponse(frameMetadata, {
    headers: { "Content-Type": "text/html" },
  });
}