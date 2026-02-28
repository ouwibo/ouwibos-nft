import { NeynarAPIClient } from "@neynar/nodejs-sdk";

if (!process.env.NEYNAR_API_KEY) {
  throw new Error("Missing NEYNAR_API_KEY");
}

export const neynarClient = new NeynarAPIClient(process.env.NEYNAR_API_KEY);

export async function validateFrameMessage(messageBytes: string) {
  try {
    const response = await neynarClient.validateFrameAction(messageBytes);
    if (response.valid) {
      return response;
    }
    return null;
  } catch (error) {
    console.error("Neynar validation error:", error);
    return null;
  }
}