import { NextResponse } from "next/server";
import { validateFrameMessage } from "@/lib/neynar";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { trustedData } = body;
    
    // Validate signature via Neynar
    const validationResponse = await validateFrameMessage(trustedData.messageBytes);
    if (!validationResponse || !validationResponse.valid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // Return next frame with Connect success or logic
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
    const successFrame = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta property="fc:frame" content="vNext" />
          <meta property="fc:frame:image" content="${baseUrl}/connected-image.png" />
          <meta property="fc:frame:button:1" content="✨ Mint Ouwibo-NFT" />
          <meta property="fc:frame:button:1:action" content="tx" />
          <meta property="fc:frame:button:1:target" content="${baseUrl}/api/mint" />
        </head>
      </html>
    `;

    return new NextResponse(successFrame, {
      headers: { "Content-Type": "text/html" },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to connect" }, { status: 500 });
  }
}