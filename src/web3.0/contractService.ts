import { ethers } from "ethers";
import { connectWallet } from "./wallet";
import PropertyNFTABI from "./abis/PropertyNFT.json";
import FractionalTokenFactoryABI from "./abis/FractionTokenFactory.json";
import FractionalTokenABI from "./abis/FractionalToken.json";
import MarketplaceABI from "./abis/Marketplace.json";

const PROPERTY_NFT_ADDRESS = import.meta.env.VITE_PROPERTY_NFT_ADDRESS as string;
const FACTORY_ADDRESS = import.meta.env.VITE_FACTORY_ADDRESS as string;
const MARKETPLACE_ADDRESS = import.meta.env.VITE_MARKETPLACE_ADDRESS as string;

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

async function getMarketplaceContract() {
  const signer = await getSigner();
  return new ethers.Contract(MARKETPLACE_ADDRESS, MarketplaceABI.abi, signer);
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
  try {
  const nft = await getPropertyNFTContract();
  const tx = await nft.transferFrom(from, to, tokenId);
  const receipt = await tx.wait();
  
  return { 
    txHash: receipt.hash ?? receipt.transactionHash 
  };
  } catch (error: any) {
    const errorMessage = error.reason || error.message || "Failed to transfer NFT";
    throw new Error(errorMessage);
  }
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

    const owner = await propertyNFT.ownerOf(nftId);
    if (owner.toLowerCase() !== userAddress.toLowerCase()) {
      throw new Error(`You don't own this NFT. Owner: ${owner}`);
    }

    const existingToken = await factory.propertyToFractionToken(nftId);
    if (existingToken !== "0x0000000000000000000000000000000000000000") {
      throw new Error(`Property ${nftId} is already fractionalized at ${existingToken}`);
    }

    const currentApproval = await propertyNFT.getApproved(nftId);
    if (currentApproval.toLowerCase() !== FACTORY_ADDRESS.toLowerCase()) {
      const approveTx = await propertyNFT.approve(FACTORY_ADDRESS, nftId);
      await approveTx.wait();
    }
    
    const tx = await factory.createFractionToken(
      nftId, 
      name, 
      symbol, 
      supply, 
      PROPERTY_NFT_ADDRESS
    );
    
    const receipt = await tx.wait();
    const tokenAddress = await factory.propertyToFractionToken(nftId);
    const newOwner = await propertyNFT.ownerOf(nftId);
    
    if (newOwner.toLowerCase() !== FACTORY_ADDRESS.toLowerCase()) {
      throw new Error("NFT was not transferred to factory");
    }
    
    return {
      success: true,
      tokenAddress,
      txHash: receipt.hash ?? receipt.transactionHash
    };

  } catch (error: any) {
    if (error.message && error.message.includes("0x177e802f")) {
      throw new Error("NFT transfer to factory failed. Approval may not have been successful.");
    }
    const errorMessage = error.reason || error.message || "Failed to create fractional tokens";
    throw new Error(errorMessage);
  }
}

export async function getFTBalance(tokenAddress: string, account: string) {
  if (!tokenAddress || tokenAddress === "0x0000000000000000000000000000000000000000") {
    return 0;
  }

  try {
    const tokenContract = await getFractionalTokenContract(tokenAddress);
    const [balanceRaw, decimals] = await Promise.all([
      tokenContract.balanceOf(account),
      tokenContract.decimals().catch(() => 0),
    ]);

    // debug: small log to help track propagation/formatting
    // eslint-disable-next-line no-console
    console.debug("getFTBalance:", { tokenAddress, account, decimals, balanceRaw: String(balanceRaw) });

    // If decimals is a number > 0, format using ethers.formatUnits
    if (typeof decimals === "number" && decimals > 0) {
      try {
        const formatted = ethers.formatUnits(balanceRaw, decimals);
        return Number(formatted);
      } catch (e) {
        // fallback to raw string
        return Number(String(balanceRaw)) || 0;
      }
    }

    // No decimals or decimals === 0
    return Number(String(balanceRaw)) || 0;
  } catch (error) {
    console.error("getFTBalance error:", error);
    return 0;
  }
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
    const userBalance = await factory.getFractionBalance(nftId, userAddress);
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
    if (!ethers.isAddress(tokenAddress)) {
      throw new Error("Invalid fractional token address");
    }
    if (!ethers.isAddress(to)) {
      throw new Error("Invalid recipient address");
    }
    if (amount <= 0 || !Number.isInteger(amount)) {
      throw new Error("Amount must be a positive integer");
    }

    const ft = await getFractionalTokenContract(tokenAddress);
    const tx = await ft.transfer(to, amount);
    const receipt = await tx.wait();
    return {
      success: true,
      txHash: receipt.hash ?? receipt.transactionHash
    };
  } catch (error: any) {
    const errorMessage = error.reason || error.message || "Failed to transfer fractional tokens";
    throw new Error(errorMessage);
  }
}

export async function getTokensInMarketplace(tokenId: number): Promise<number> {
  try {
    const factory = await getFactoryContract();
    const tokenAddress = await factory.propertyToFractionToken(tokenId);
    if (!tokenAddress || tokenAddress === "0x0000000000000000000000000000000000000000") {
      return 0;
    }
    
    const marketplace = await getMarketplaceContract();
    const marketplaceAddress = await marketplace.getAddress();
    const ftContract = await getFractionalTokenContract(tokenAddress);
    const balance = await ftContract.balanceOf(marketplaceAddress);
    return Number(balance);
  } catch {
    return 0;
  }
}

export async function getAllTokenHolders(tokenId: number): Promise<Array<{ address: string; balance: number }>> {
  try {
    const factory = await getFactoryContract();
    const tokenAddress = await factory.propertyToFractionToken(tokenId);
    if (!tokenAddress || tokenAddress === "0x0000000000000000000000000000000000000000") {
      return [];
    }
    
    const ftContract = await getFractionalTokenContract(tokenAddress);
    const totalSupply = Number(await ftContract.totalSupply());
    
    if (totalSupply === 0) return [];
    
    const holders: Array<{ address: string; balance: number }> = [];
    const checkedAddresses = new Set<string>();
    
    const filter = ftContract.filters.Transfer(null, null);
    const events = await ftContract.queryFilter(filter);
    
    for (const event of events) {
      if ('args' in event && event.args) {
        const args = event.args as any;
        const to = args.to?.toLowerCase();
        const from = args.from?.toLowerCase();
        
        if (to && to !== "0x0000000000000000000000000000000000000000" && !checkedAddresses.has(to)) {
          checkedAddresses.add(to);
          try {
            const balance = Number(await ftContract.balanceOf(to));
            if (balance > 0) {
              holders.push({ address: to, balance });
            }
          } catch {
            // Skip if we can't get balance
          }
        }
        
        if (from && from !== "0x0000000000000000000000000000000000000000" && !checkedAddresses.has(from)) {
          checkedAddresses.add(from);
          try {
            const balance = Number(await ftContract.balanceOf(from));
            if (balance > 0) {
              holders.push({ address: from, balance });
            }
          } catch {
            // Skip if we can't get balance
          }
        }
      }
    }
    
    return holders.filter(h => h.balance > 0);
  } catch {
    return [];
  }
}

export async function getActiveListingsForToken(tokenId: number): Promise<number[]> {
  try {
    const marketplace = await getMarketplaceContract();
    const nextListingId = await marketplace.nextListingId();
    const nextIdNum = Number(nextListingId);
    
    if (nextIdNum <= 1) {
      return [];
    }
    
    const activeListings: number[] = [];
    const checkPromises: Promise<void>[] = [];
    
    for (let i = 1; i < nextIdNum && i < 1000; i++) {
      checkPromises.push(
        (async () => {
          try {
            const listing = await marketplace.getListing(i);
            if (listing.isActive && Number(listing.tokenId) === tokenId) {
              activeListings.push(i);
            }
          } catch {
            // Listing doesn't exist or other error, skip
          }
        })()
      );
    }
    
    await Promise.all(checkPromises);
    return activeListings.sort((a, b) => a - b);
  } catch (error) {
    console.error("Error getting active listings:", error);
    return [];
  }
}

export async function defractionalizeProperty(nftId: number) {
  try {
    const factory = await getFactoryContract();
    const PROPERTY_NFT_ADDRESS = import.meta.env.VITE_PROPERTY_NFT_ADDRESS as string;
    const signer = await getSigner();
    const userAddress = await signer.getAddress();

    const tokenAddress = await factory.propertyToFractionToken(nftId);
    if (!tokenAddress || tokenAddress === "0x0000000000000000000000000000000000000000") {
      throw new Error("Property is not fractionalized");
    }

    // Gather required on-chain info in parallel using existing helpers
    const [totalSupply, userBalanceFromFactory, userBalanceFromToken, tokensInMarketplace, allHolders, hasFull] = await Promise.all([
      getTotalSupply(nftId),
      (async () => {
        try {
          return Number(await factory.getFractionBalance(nftId, userAddress));
        } catch {
          return 0;
        }
      })(),
      getFTBalance(tokenAddress, userAddress),
      getTokensInMarketplace(nftId),
      getAllTokenHolders(nftId),
      hasFullOwnership(nftId, userAddress)
    ]);

    const totalSupplyNum = Number(totalSupply);
    const userBalanceFactoryNum = Number(userBalanceFromFactory);
    const userBalanceTokenNum = Number(userBalanceFromToken);

    if (totalSupplyNum === 0) {
      throw new Error("Invalid total supply. Property may not be properly fractionalized.");
    }

    const actualUserBalance = Math.max(userBalanceFactoryNum, userBalanceTokenNum);

    if (actualUserBalance === 0) {
      throw new Error("You don't own any fractional tokens of this property.");
    }

    if (tokensInMarketplace > 0) {
      throw new Error(`Cannot defractionalize: ${tokensInMarketplace.toLocaleString()} tokens are currently in the marketplace contract. Please cancel all active listings first.`);
    }

    const totalInOtherAddresses = allHolders
      .filter(h => h.address.toLowerCase() !== userAddress.toLowerCase())
      .reduce((sum, h) => sum + (h.balance || 0), 0);

    if (totalInOtherAddresses > 0) {
      const otherHolders = allHolders
        .filter(h => h.address.toLowerCase() !== userAddress.toLowerCase() && h.balance > 0)
        .map(h => `${h.address.substring(0, 10)}... (${h.balance.toLocaleString()} tokens)`) 
        .join(", ");
      throw new Error(`Cannot defractionalize: ${totalInOtherAddresses.toLocaleString()} tokens are held by other addresses: ${otherHolders}. You must own all tokens to defractionalize.`);
    }

    if (actualUserBalance !== totalSupplyNum) {
      const percentage = (actualUserBalance / totalSupplyNum) * 100;
      const missing = totalSupplyNum - actualUserBalance;
      throw new Error(`You must own 100% of the fractional tokens to defractionalize. You currently own ${actualUserBalance.toLocaleString()}/${totalSupplyNum.toLocaleString()} tokens (${percentage.toFixed(2)}%). Missing ${missing.toLocaleString()} tokens.`);
    }

    if (!hasFull) {
      const holdersInfo = allHolders.length > 0 
        ? ` Token holders: ${allHolders.map(h => `${h.address.substring(0, 10)}... (${h.balance})`).join(", ")}`
        : "";
      throw new Error(`Ownership verification failed. You own ${actualUserBalance.toLocaleString()}/${totalSupplyNum.toLocaleString()} tokens but contract's hasFullOwnership returned false.${holdersInfo} This may indicate tokens are in escrow, marketplace, or other contracts.`);
    }

    const tx = await factory.defractionalizeProperty(nftId, PROPERTY_NFT_ADDRESS);
    const receipt = await tx.wait();
    return {
      success: true,
      txHash: receipt.hash ?? receipt.transactionHash
    };
  } catch (error: any) {
    // Try to extract details from custom revert data
    if (error && error.data && typeof error.data === 'string' && error.data.includes('fb8f41b2')) {
      const value1Hex = error.data.slice(74, 138);
      const value2Hex = error.data.slice(138, 202);
      try {
        const value1 = BigInt('0x' + value1Hex);
        const value2 = BigInt('0x' + value2Hex);
        if (value1 < value2) {
          const percentage = (Number(value1) / Number(value2) * 100).toFixed(2);
          throw new Error(`You must own 100% of the fractional tokens to defractionalize. You currently own ${value1.toString()}/${value2.toString()} tokens (${percentage}%).`);
        }
      } catch {}
    }

    if (error && error.reason && error.reason !== "execution reverted") {
      throw new Error(error.reason);
    }

    if (error && error.message && !error.message.includes("execution reverted")) {
      throw error;
    }

    throw new Error("Failed to defractionalize property. Please ensure you own 100% of the fractional tokens and there are no active listings.");
  }
}