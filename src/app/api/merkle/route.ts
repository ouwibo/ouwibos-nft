import { NextRequest, NextResponse } from 'next/server';
import { parseEther } from 'viem';

// In-memory store for basic rate limiting (IP -> { count, resetTime })
// Note: For production with multiple instances, use Redis (e.g., Upstash)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

export async function POST(req: NextRequest) {
  try {
    // 1. Extract IP for rate limiting
    const ip = req.headers.get('x-forwarded-for') || 'unknown-ip';
    
    const now = Date.now();
    const userRate = rateLimitStore.get(ip) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW_MS };

    // Reset window if passed
    if (now > userRate.resetTime) {
      userRate.count = 0;
      userRate.resetTime = now + RATE_LIMIT_WINDOW_MS;
    }

    if (userRate.count >= RATE_LIMIT_MAX) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Maximum 10 mints per hour.' },
        { status: 429 }
      );
    }

    // 2. Parse request body
    const body = await req.json();
    const { address } = body;

    if (!address) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }

    // 3. Developer Wallet Override (Unlimited Minting)
    const IS_DEV = address.toLowerCase() === '0xF96c80DAB17bccC9e0C0C454fa6Ec9234EF240f2'.toLowerCase();

    if (!IS_DEV) {
      // Increment rate limit for non-dev users
      userRate.count += 1;
      rateLimitStore.set(ip, userRate);
    }

    // 4. Generate Dynamic Merkle Proof
    const responseData = {
      proof: [], 
      quantityLimit: IS_DEV ? "0" : "0", // Both set to 0 to use contract's default, but logic is here if needed
      price: "0" 
    };

    return NextResponse.json(responseData);

  } catch (error: any) {
    console.error('Merkle API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error generating proof' },
      { status: 500 }
    );
  }
}
