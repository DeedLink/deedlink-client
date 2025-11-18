import { ethers } from "ethers";
import { connectWallet } from "./wallet";
import PropertyNFTABI from "./abis/PropertyNFT.json";
import FractionalTokenFactoryABI from "./abis/FractionTokenFactory.json";
import FractionalTokenABI from "./abis/FractionalToken.json";

const PROPERTY_NFT_ADDRESS = import.meta.env.VITE_PROPERTY_NFT_ADDRESS as string;
const FACTORY_ADDRESS = import.meta.env.VITE_FACTORY_ADDRESS as string;

console.log(PROPERTY_NFT_ADDRESS);

async function getSigner() {
  const wallet = await connectWallet();
  if (!wallet) throw new Error("Wallet not connected");
  return wallet.signer;
}

async function getPropertyNFTContract() {
  const signer = await getSigner();
  return new ethers.Contract(PROPERTY_NFT_ADDRESS, PropertyNFTABI.abi, signer);
}

async function getFactoryContract() {
  const signer = await getSigner();
  return new ethers.Contract(FACTORY_ADDRESS, FractionalTokenFactoryABI.abi, signer);
}

async function getFractionalTokenContract(address: string) {
  const signer = await getSigner();
  return new ethers.Contract(address, FractionalTokenABI.abi, signer);
}

export async function mintNFT(to: string, ipfsuri: string, dburi: string) {
  const nft = await getPropertyNFTContract();

  const tx = await nft.mintProperty(to, ipfsuri, dburi);
  const receipt = await tx.wait();

  let tokenId: string | undefined;

  for (const log of receipt.logs) {
    let parsed: ethers.LogDescription | null = null;

    try {
      parsed = nft.interface.parseLog(log);
    } catch {
    }

    if (parsed && parsed.name === "Transfer") {
      tokenId = parsed.args.tokenId.toString();
      break;
    }
  }
  return { tokenId, txHash: (receipt as any).hash ?? (receipt as any).transactionHash };
}

export async function transferNFT(from: string, to: string, tokenId: number) {
  const nft = await getPropertyNFTContract();
  const tx = await nft.transferFrom(from, to, tokenId);
  const receipt = await tx.wait();
  console.log(receipt);
  
  return { 
    txHash: receipt.hash ?? receipt.transactionHash 
  };
}

export async function safeTransferNFT(from: string, to: string, tokenId: number) {
  const nft = await getPropertyNFTContract();
  const tx = await nft["safeTransferFrom(address,address,uint256)"](from, to, tokenId);
  const receipt = await tx.wait();
  
  return { 
    txHash: receipt.hash ?? receipt.transactionHash 
  };
}

export async function approveNFT(to: string, tokenId: number) {
  const nft = await getPropertyNFTContract();
  const tx = await nft.approve(to, tokenId);
  const receipt = await tx.wait();
  
  return { 
    txHash: receipt.hash ?? receipt.transactionHash 
  };
}

export async function setApprovalForAll(operator: string, approved: boolean) {
  const nft = await getPropertyNFTContract();
  const tx = await nft.setApprovalForAll(operator, approved);
  const receipt = await tx.wait();
  
  return { 
    txHash: receipt.hash ?? receipt.transactionHash 
  };
}

export async function getApproved(tokenId: number) {
  const nft = await getPropertyNFTContract();
  return await nft.getApproved(tokenId);
}

export async function isApprovedForAll(owner: string, operator: string) {
  const nft = await getPropertyNFTContract();
  return await nft.isApprovedForAll(owner, operator);
}

export async function checkNFTApproval(tokenId: number): Promise<{
  isApproved: boolean;
  approvedAddress: string;
}> {
  const nft = await getPropertyNFTContract();
  const approvedAddress = await nft.getApproved(tokenId);
  
  return {
    isApproved: approvedAddress !== "0x0000000000000000000000000000000000000000",
    approvedAddress
  };
}

export async function getNFTURI(tokenId: number) {
  const nft = await getPropertyNFTContract();
  return await nft.tokenURI(tokenId);
}

export async function getNFTOwner(tokenId: number) {
  const nft = await getPropertyNFTContract();
  return await nft.ownerOf(tokenId);
}

/**
 * Create fractional tokens for a property NFT
 * CRITICAL: The NFT must be transferred to the factory contract BEFORE calling this
 */
export async function createFractionalToken(
  nftId: number, 
  name: string, 
  symbol: string, 
  supply: number
) {
  try {
    const factory = await getFactoryContract();
    const propertyNFT = await getPropertyNFTContract();
    const signer = await getSigner();
    const userAddress = await signer.getAddress();

    console.log("=== Starting Fractionalization Process ===");
    console.log("NFT ID:", nftId);
    console.log("User Address:", userAddress);
    console.log("Factory Address:", FACTORY_ADDRESS);
    console.log("Property NFT Address:", PROPERTY_NFT_ADDRESS);

    // Step 1: Verify ownership
    console.log("\n1: Verifying NFT ownership...");
    const owner = await propertyNFT.ownerOf(nftId);
    console.log("Current owner:", owner);
    
    if (owner.toLowerCase() !== userAddress.toLowerCase()) {
      throw new Error(`You don't own this NFT. Owner: ${owner}`);
    }

    // Step 2: Check if already fractionalized
    console.log("\n2: Checking if already fractionalized...");
    const existingToken = await factory.propertyToFractionToken(nftId);
    if (existingToken !== "0x0000000000000000000000000000000000000000") {
      throw new Error(`Property ${nftId} is already fractionalized at ${existingToken}`);
    }

    // Step 3: Approve factory to transfer the NFT
    console.log("\n3: Approving factory to transfer NFT...");
    const currentApproval = await propertyNFT.getApproved(nftId);
    console.log("Current approval:", currentApproval);
    
    if (currentApproval.toLowerCase() !== FACTORY_ADDRESS.toLowerCase()) {
      console.log("Setting approval for factory...");
      const approveTx = await propertyNFT.approve(FACTORY_ADDRESS, nftId);
      const approveReceipt = await approveTx.wait();
      console.log("Approval granted:", approveReceipt.hash);
    } else {
      console.log("Factory already approved");
    }

    // Step 4: Create fractional tokens (this will transfer the NFT)
    console.log("\n4: Creating fractional tokens...");
    console.log("Parameters:", { nftId, name, symbol, supply });
    
    const tx = await factory.createFractionToken(
      nftId, 
      name, 
      symbol, 
      supply, 
      PROPERTY_NFT_ADDRESS
    );
    
    console.log("Transaction submitted:", tx.hash);
    const receipt = await tx.wait();
    console.log("Transaction confirmed:", receipt.hash);

    // Step 5: Get the created token address
    console.log("\n5: Getting fractional token address...");
    const tokenAddress = await factory.propertyToFractionToken(nftId);
    console.log("Fractional token created at:", tokenAddress);

    // Step 6: Verify NFT transfer
    console.log("\n6: Verifying NFT transfer to factory...");
    const newOwner = await propertyNFT.ownerOf(nftId);
    console.log("New NFT owner:", newOwner);
    console.log("Factory address:", FACTORY_ADDRESS);
    
    if (newOwner.toLowerCase() !== FACTORY_ADDRESS.toLowerCase()) {
      console.warn("Warning: NFT was not transferred to factory!");
    } else {
      console.log("NFT successfully transferred to factory");
    }

    console.log("\n=== Fractionalization Complete ===");
    
    return {
      success: true,
      tokenAddress,
      txHash: receipt.hash ?? receipt.transactionHash,
      message: `Property fractionalized successfully. Token address: ${tokenAddress}`
    };

  } catch (error: any) {
    console.error("\nFractionalization failed:", error);
    
    // Later I added this specific error handling for NFT transfer failure
    if (error.message.includes("0x177e802f")) {
      throw new Error(
        "NFT transfer to factory failed. The factory contract doesn't own the NFT. " +
        "This usually means the approval wasn't successful or the contract has insufficient permissions."
      );
    }
    
    throw error;
  }
}

export async function getFTBalance(tokenAddress: string, account: string) {
  const fft = await getFactoryContract();
  return await fft.getFractionBalance(tokenAddress, account);
}

export async function getFractionalTokenAddress(nftId: number) {
  const factory = await getFactoryContract();
  return await factory.propertyToFractionToken(nftId);
}

export async function transferFT(tokenAddress: string, to: string, amount: number) {
  const ft = await getFractionalTokenContract(tokenAddress);
  const tx = await ft.transfer(to, amount);
  return await tx.wait();
}

export async function getSignatures(tokenId: number) {
  const nft = await getPropertyNFTContract();

  try {
    const surveyor: boolean = await nft.isSignedBySurveyor(tokenId);
    const notary: boolean = await nft.isSignedByNotary(tokenId);
    const ivsl: boolean = await nft.isSignedByIVSL(tokenId);
    const fully: boolean = await nft.isFullySigned(tokenId);

    return { surveyor, notary, ivsl, fully };
  } catch (err) {
    console.error("Contract call failed:", err);
    throw err;
  }
}

export async function nftOwnershipVerification(tokenId: number, userAddress: string) {
  const nft = await getPropertyNFTContract();
  const owner = await nft.ownerOf(tokenId);
  return owner.toLowerCase() === userAddress.toLowerCase();
}

export async function isPropertyFractionalized(nftId: number): Promise<boolean> {
  try {
    const factory = await getFactoryContract();
    const tokenAddress = await factory.propertyToFractionToken(nftId);
    return tokenAddress !== "0x0000000000000000000000000000000000000000";
  } catch (error) {
    console.error("Error checking fractionalization:", error);
    return false;
  }
}

export async function hasFullOwnership(nftId: number, userAddress: string): Promise<boolean> {
  try {
    const factory = await getFactoryContract();
    const hasFull = await factory.hasFullOwnership(nftId, userAddress);
    return hasFull;
  } catch (error) {
    console.error("Error checking full ownership:", error);
    return false;
  }
}

export async function getTotalSupply(nftId: number): Promise<number> {
  try {
    const factory = await getFactoryContract();
    const supply = await factory.propertyToTotalSupply(nftId);
    return Number(supply);
  } catch (error) {
    console.error("Error getting total supply:", error);
    return 0;
  }
}

export async function getFractionalTokenInfo(nftId: number) {
  try {
    const factory = await getFactoryContract();
    const tokenAddress = await factory.propertyToFractionToken(nftId);
    const isFractionalized = tokenAddress !== "0x0000000000000000000000000000000000000000";
    
    if (!isFractionalized) {
      return {
        isFractionalized: false,
        tokenAddress: null,
        totalSupply: 0,
        userBalance: 0,
        userPercentage: 0
      };
    }

    const signer = await getSigner();
    const userAddress = await signer.getAddress();
    const totalSupply = await factory.propertyToTotalSupply(nftId);
    const userBalance = await getFTBalance(tokenAddress, userAddress);
    const totalSupplyNum = Number(totalSupply);
    const userBalanceNum = Number(userBalance);
    const userPercentage = totalSupplyNum > 0 ? (userBalanceNum / totalSupplyNum) * 100 : 0;

    return {
      isFractionalized: true,
      tokenAddress,
      totalSupply: totalSupplyNum,
      userBalance: userBalanceNum,
      userPercentage
    };
  } catch (error) {
    console.error("Error getting fractional token info:", error);
    return {
      isFractionalized: false,
      tokenAddress: null,
      totalSupply: 0,
      userBalance: 0,
      userPercentage: 0
    };
  }
}

export async function transferFractionalTokens(tokenAddress: string, to: string, amount: number) {
  try {
    const ft = await getFractionalTokenContract(tokenAddress);
    const tx = await ft.transfer(to, amount);
    const receipt = await tx.wait();
    return {
      success: true,
      txHash: receipt.hash ?? receipt.transactionHash
    };
  } catch (error: any) {
    console.error("Error transferring fractional tokens:", error);
    throw new Error(error.message || "Failed to transfer fractional tokens");
  }
}

export async function defractionalizeProperty(nftId: number) {
  try {
    const factory = await getFactoryContract();
    const PROPERTY_NFT_ADDRESS = import.meta.env.VITE_PROPERTY_NFT_ADDRESS as string;
    const tx = await factory.defractionalizeProperty(nftId, PROPERTY_NFT_ADDRESS);
    const receipt = await tx.wait();
    return {
      success: true,
      txHash: receipt.hash ?? receipt.transactionHash
    };
  } catch (error: any) {
    console.error("Error defractionalizing property:", error);
    throw new Error(error.message || "Failed to defractionalize property");
  }
}