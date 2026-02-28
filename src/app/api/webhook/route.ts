import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Farcaster Webhook Received:", body);

    // Logic to handle webhook events (e.g., app_added, app_removed)
    // For now, return success to acknowledge receipt
    return NextResponse.json({ success: true, message: "Webhook received" });
  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({ message: "Farcaster Webhook Endpoint Active" });
}
