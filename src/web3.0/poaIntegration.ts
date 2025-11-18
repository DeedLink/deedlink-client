import { ethers } from "ethers";
import { connectWallet } from "./wallet";
import PropertyNFTABI from "./abis/PropertyNFT.json";
import { hasFullOwnership, isPropertyFractionalized } from "./contractService";

const PROPERTY_NFT_ADDRESS = import.meta.env.VITE_PROPERTY_NFT_ADDRESS as string;

async function getSigner() {
  const wallet = await connectWallet();
  if (!wallet) throw new Error("Wallet not connected");
  return wallet.signer;
}

async function getPropertyNFTContract() {
  const signer = await getSigner();
  return new ethers.Contract(PROPERTY_NFT_ADDRESS, PropertyNFTABI.abi, signer);
}

export enum PoARights {
  SIGN = 0,
  TRANSFER = 1,
  FRACTIONALIZE = 2,
  PAY_RENT = 3
}

export async function assignPoA(
  tokenId: number,
  agent: string,
  right: PoARights,
  allowed: boolean,
  start: number,
  end: number
) {
  const signer = await getSigner();
  const userAddress = await signer.getAddress();
  
  const isFractionalized = await isPropertyFractionalized(tokenId);
  
  if (isFractionalized) {
    const hasFull = await hasFullOwnership(tokenId, userAddress);
    if (!hasFull) {
      throw new Error("You must own 100% of the fractional tokens to assign Power of Attorney");
    }
  }

  const nft = await getPropertyNFTContract();
  const tx = await nft.setPoA(tokenId, agent, right, allowed, start, end);
  const receipt = await tx.wait();

  return {
    success: true,
    txHash: receipt.hash,
    message: "Power of Attorney assigned successfully"
  };
}

export async function getPoAInfo(tokenId: number, agent: string, right: PoARights) {
  const nft = await getPropertyNFTContract();
  const poaInfo = await nft.poa(tokenId, agent, right);
  return {
    allowed: poaInfo.allowed,
    start: Number(poaInfo.start),
    end: Number(poaInfo.end)
  };
}
