import { ethers } from "ethers";
import { connectWallet } from "./wallet";
import PropertyNFTABI from "./abis/PropertyNFT.json";
import FractionalTokenABI from "./abis/FractionalToken.json";
import { getFractionalTokenAddress, isPropertyFractionalized } from "./contractService";

const PROPERTY_NFT_ADDRESS = import.meta.env.VITE_PROPERTY_NFT_ADDRESS as string;

async function getProvider() {
  const wallet = await connectWallet();
  if (!wallet) throw new Error("Wallet not connected");
  return wallet.provider;
}

async function getPropertyNFTContract() {
  const provider = await getProvider();
  return new ethers.Contract(PROPERTY_NFT_ADDRESS, PropertyNFTABI.abi, provider);
}

async function getFractionalTokenContract(address: string) {
  const provider = await getProvider();
  return new ethers.Contract(address, FractionalTokenABI.abi, provider);
}

export interface TransferEvent {
  from: string;
  to: string;
  tokenId?: number;
  amount?: number;
  blockNumber: number;
  transactionHash: string;
  timestamp?: number;
}

export async function getNFTTransferEvents(tokenId: number, fromBlock?: number): Promise<TransferEvent[]> {
  try {
    console.log(`[ON-CHAIN] eventService: Fetching NFT Transfer events for tokenId ${tokenId}...`);
    const nft = await getPropertyNFTContract();
    const filter = nft.filters.Transfer(null, null, tokenId);
    
    const events = await nft.queryFilter(filter, fromBlock);
    console.log(`[ON-CHAIN] eventService: Found ${events.length} NFT Transfer events`);
    
    const transferEvents: TransferEvent[] = [];
    
    for (const event of events) {
      if ('args' in event && event.args) {
        const block = await event.getBlock();
        const args = event.args as any;
        transferEvents.push({
          from: args.from?.toLowerCase() || "",
          to: args.to?.toLowerCase() || "",
          tokenId: Number(args.tokenId),
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash,
          timestamp: block?.timestamp ? Number(block.timestamp) : undefined
        });
      }
    }
    
    const sorted = transferEvents.sort((a, b) => a.blockNumber - b.blockNumber);
    console.log(`[ON-CHAIN] eventService: Processed ${sorted.length} NFT Transfer events:`, sorted);
    return sorted;
  } catch (error) {
    console.error("[ON-CHAIN] eventService: Error fetching NFT transfer events:", error);
    return [];
  }
}

export async function getFractionalTokenTransferEvents(
  tokenId: number,
  fromBlock?: number
): Promise<TransferEvent[]> {
  try {
    console.log(`[ON-CHAIN] eventService: Checking if tokenId ${tokenId} is fractionalized...`);
    const isFractionalized = await isPropertyFractionalized(tokenId);
    if (!isFractionalized) {
      console.log(`[ON-CHAIN] eventService: TokenId ${tokenId} is not fractionalized`);
      return [];
    }

    const tokenAddress = await getFractionalTokenAddress(tokenId);
    if (!tokenAddress || tokenAddress === "0x0000000000000000000000000000000000000000") {
      console.log(`[ON-CHAIN] eventService: No fractional token address found for tokenId ${tokenId}`);
      return [];
    }

    console.log(`[ON-CHAIN] eventService: Fetching FractionalToken Transfer events for tokenId ${tokenId} (token: ${tokenAddress})...`);
    const ftContract = await getFractionalTokenContract(tokenAddress);
    const filter = ftContract.filters.Transfer();
    
    const events = await ftContract.queryFilter(filter, fromBlock);
    console.log(`[ON-CHAIN] eventService: Found ${events.length} FractionalToken Transfer events`);
    
    const transferEvents: TransferEvent[] = [];
    
    for (const event of events) {
      if ('args' in event && event.args) {
        const block = await event.getBlock();
        const args = event.args as any;
        transferEvents.push({
          from: args.from?.toLowerCase() || "",
          to: args.to?.toLowerCase() || "",
          amount: Number(args.value),
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash,
          timestamp: block?.timestamp ? Number(block.timestamp) : undefined
        });
      }
    }
    
    const sorted = transferEvents.sort((a, b) => a.blockNumber - b.blockNumber);
    console.log(`[ON-CHAIN] eventService: Processed ${sorted.length} FractionalToken Transfer events:`, sorted);
    return sorted;
  } catch (error) {
    console.error("[ON-CHAIN] eventService: Error fetching fractional token transfer events:", error);
    return [];
  }
}

export interface OwnershipInfo {
  address: string;
  share: number;
}

export async function calculateOwnershipFromEvents(
  tokenId: number,
  totalSupply?: number
): Promise<OwnershipInfo[]> {
  try {
    console.log(`[ON-CHAIN] eventService: Calculating ownership from events for tokenId ${tokenId}...`);
    const isFractionalized = await isPropertyFractionalized(tokenId);
    console.log(`[ON-CHAIN] eventService: TokenId ${tokenId} isFractionalized: ${isFractionalized}`);
    
    if (!isFractionalized) {
      const nftEvents = await getNFTTransferEvents(tokenId);
      if (nftEvents.length === 0) {
        console.log(`[ON-CHAIN] eventService: No NFT transfer events found for tokenId ${tokenId}`);
        return [];
      }
      
      const lastTransfer = nftEvents[nftEvents.length - 1];
      if (lastTransfer.to && lastTransfer.to !== "0x0000000000000000000000000000000000000000") {
        const owner = [{
          address: lastTransfer.to,
          share: 100
        }];
        console.log(`[ON-CHAIN] eventService: Calculated NFT ownership:`, owner);
        return owner;
      }
      console.log(`[ON-CHAIN] eventService: Invalid last transfer event for tokenId ${tokenId}`);
      return [];
    }

    const tokenAddress = await getFractionalTokenAddress(tokenId);
    if (!tokenAddress || tokenAddress === "0x0000000000000000000000000000000000000000") {
      return [];
    }

    const ftContract = await getFractionalTokenContract(tokenAddress);
    const supply = totalSupply || Number(await ftContract.totalSupply());
    
    if (supply === 0) return [];

    const ftEvents = await getFractionalTokenTransferEvents(tokenId);
    if (ftEvents.length === 0) {
      const factoryAddress = import.meta.env.VITE_FACTORY_ADDRESS as string;
      const nft = await getPropertyNFTContract();
      const nftOwner = (await nft.ownerOf(tokenId)).toLowerCase();
      
      if (nftOwner === factoryAddress.toLowerCase()) {
        return [];
      }
      
      return [{
        address: nftOwner,
        share: 100
      }];
    }

    console.log(`[ON-CHAIN] eventService: Calculating fractional ownership from ${ftEvents.length} events, totalSupply: ${supply}`);
    const balances = new Map<string, number>();
    
    for (const event of ftEvents) {
      if (event.from && event.from !== "0x0000000000000000000000000000000000000000") {
        const currentFrom = balances.get(event.from) || 0;
        balances.set(event.from, Math.max(0, currentFrom - (event.amount || 0)));
      }
      
      if (event.to && event.to !== "0x0000000000000000000000000000000000000000") {
        const currentTo = balances.get(event.to) || 0;
        balances.set(event.to, currentTo + (event.amount || 0));
      }
    }

    console.log(`[ON-CHAIN] eventService: Calculated balances:`, Array.from(balances.entries()));

    const owners: OwnershipInfo[] = [];
    
    for (const [address, balance] of balances.entries()) {
      if (balance > 0) {
        const share = (balance / supply) * 100;
        owners.push({ address, share });
      }
    }

    const sorted = owners.sort((a, b) => b.share - a.share);
    console.log(`[ON-CHAIN] eventService: Final calculated fractional ownership:`, sorted);
    return sorted;
  } catch (error) {
    console.error("Error calculating ownership from events:", error);
    return [];
  }
}

