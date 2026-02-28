import { NeynarAPIClient } from "@neynar/nodejs-sdk";

export const neynarClient = process.env.NEYNAR_API_KEY 
  ? new NeynarAPIClient(process.env.NEYNAR_API_KEY)
  : null;

export async function validateFrameMessage(messageBytes: string) {
  if (!neynarClient) {
    console.warn("Neynar client not initialized - missing NEYNAR_API_KEY");
    return null;
  }
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