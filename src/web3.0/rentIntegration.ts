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
  rentPeriodInMonths: number,
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
  const rentPeriodInSeconds = rentPeriodInMonths * 30 * 24 * 60 * 60;

  const tx = await nft.setRent(tokenId, rentAmountWei, rentPeriodInSeconds, receiverAddress);
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

export async function endRent(tokenId: number) {
  const signer = await getSigner();
  const userAddress = await signer.getAddress();
  
  const isFractionalized = await isPropertyFractionalized(tokenId);
  
  if (isFractionalized) {
    const hasFull = await hasFullOwnership(tokenId, userAddress);
    if (!hasFull) {
      throw new Error("You must own 100% of the fractional tokens to end rent");
    }
  }

  const nft = await getPropertyNFTContract();
  const tx = await nft.endRent(tokenId);
  const receipt = await tx.wait();

  return {
    success: true,
    txHash: receipt.hash,
    message: `Rent ended successfully for token #${tokenId}`
  };
}

export async function updateRentReceiver(tokenId: number, newReceiver: string) {
  const signer = await getSigner();
  const userAddress = await signer.getAddress();
  
  const isFractionalized = await isPropertyFractionalized(tokenId);
  
  if (isFractionalized) {
    const hasFull = await hasFullOwnership(tokenId, userAddress);
    if (!hasFull) {
      throw new Error("You must own 100% of the fractional tokens to update rent receiver");
    }
  }

  const nft = await getPropertyNFTContract();
  const tx = await nft.updateRentReceiver(tokenId, newReceiver);
  const receipt = await tx.wait();

  return {
    success: true,
    txHash: receipt.hash,
    message: `Rent receiver updated successfully for token #${tokenId}`
  };
}

export async function getRentDetails(tokenId: number) {
  const nft = await getPropertyNFTContract();
  const rent = await nft.rentInfo(tokenId);
  const isActive = await nft.isRentActive(tokenId);
  
  const periodInSeconds = Number(rent.period);
  const periodInMonths = periodInSeconds / (30 * 24 * 60 * 60);
  const nextPaymentDue = Number(rent.lastPaid) + periodInSeconds;

  return {
    rentAmount: ethers.formatEther(rent.amount),
    rentPeriodDays: periodInSeconds / (24 * 60 * 60),
    rentPeriodMonths: periodInMonths,
    receiver: rent.receiver,
    lastPaid: rent.lastPaid,
    nextPaymentDue: nextPaymentDue,
    isActive: isActive,
    canPay: rent.amount > 0 && BigInt(Math.floor(Date.now() / 1000)) >= BigInt(nextPaymentDue)
  };
}
