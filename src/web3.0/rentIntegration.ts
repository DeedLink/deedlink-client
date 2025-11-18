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

export async function setRent(
  tokenId: number,
  rentAmountInEth: string,
  rentPeriodInDays: number,
  receiverAddress: string
) {
  const signer = await getSigner();
  const userAddress = await signer.getAddress();
  
  const isFractionalized = await isPropertyFractionalized(tokenId);
  
  if (isFractionalized) {
    const hasFull = await hasFullOwnership(tokenId, userAddress);
    if (!hasFull) {
      throw new Error("You must own 100% of the fractional tokens to set rent");
    }
  }

  const nft = await getPropertyNFTContract();
  const rentAmountWei = ethers.parseEther(rentAmountInEth);

  const tx = await nft.setRent(tokenId, rentAmountWei, rentPeriodInDays, receiverAddress);
  const receipt = await tx.wait();

  return {
    success: true,
    txHash: receipt.hash,
    message: `Rent set successfully for token #${tokenId}`
  };
}

// Pay rent (called by tenant or PoA)
export async function payRent(tokenId: number, rentAmountInEth: string) {
  const nft = await getPropertyNFTContract();
  const rentAmountWei = ethers.parseEther(rentAmountInEth);

  const tx = await nft.payRent(tokenId, { value: rentAmountWei });
  const receipt = await tx.wait();

  return {
    success: true,
    txHash: receipt.hash,
    message: `Rent payment successful for token #${tokenId}`
  };
}

// View current rent details
export async function getRentDetails(tokenId: number) {
  const nft = await getPropertyNFTContract();
  const rent = await nft.rentInfo(tokenId);

  return {
    rentAmount: ethers.formatEther(rent.amount),
    rentPeriodDays: Number(rent.period),
    receiver: rent.receiver,
    lastPaid: rent.lastPaid
  };
}
