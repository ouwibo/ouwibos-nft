export async function mintNFT(toAddress: string, tokenId: string = "0", amount: string = "1") {
  const engineUrl = process.env.THIRDWEB_ENGINE_URL;
  const accessToken = process.env.THIRDWEB_ENGINE_ACCESS_TOKEN;
  const backendWallet = process.env.THIRDWEB_ENGINE_BACKEND_WALLET;
  const chainId = process.env.THIRDWEB_ENGINE_CHAIN_ID || "8453"; // Default to Base Mainnet
  const contractAddress = process.env.THIRDWEB_ENGINE_CONTRACT_ADDRESS || "0x3525fDbC54DC01121C8e12C3948187E6153Cdf25";

  if (!engineUrl || !accessToken || !backendWallet || !contractAddress) {
    throw new Error("Missing Thirdweb Engine configuration in environment variables");
  }

  // Using the 'claim-to' endpoint for gasless minting
  const url = `${engineUrl}/contract/${chainId}/${contractAddress}/erc1155/claim-to`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      "x-backend-wallet-address": backendWallet,
    },
    body: JSON.stringify({
      receiver: toAddress,
      tokenId: tokenId,
      quantity: amount,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Engine Error Detail:", errorText);
    throw new Error(`Engine minting failed: ${errorText}`);
  }

  return response.json();
}
