export async function mintNFT(toAddress: string, tokenId: string = "0", amount: string = "1") {
  const engineUrl = process.env.THIRDWEB_ENGINE_URL;
  const accessToken = process.env.THIRDWEB_ENGINE_ACCESS_TOKEN;
  const backendWallet = process.env.THIRDWEB_ENGINE_BACKEND_WALLET;
  const chainId = process.env.THIRDWEB_ENGINE_CHAIN_ID || "84532";
  const contractAddress = process.env.THIRDWEB_ENGINE_CONTRACT_ADDRESS;

  if (!engineUrl || !accessToken || !backendWallet || !contractAddress) {
    throw new Error("Missing Thirdweb Engine configuration");
  }

  const url = `${engineUrl}/contract/${chainId}/${contractAddress}/erc1155/mint-to`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      "x-backend-wallet-address": backendWallet,
    },
    body: JSON.stringify({
      receiver: toAddress,
      metadataWithTokenId: {
        tokenId: tokenId,
      },
      amount: amount,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Engine minting failed: ${errorText}`);
  }

  return response.json();
}