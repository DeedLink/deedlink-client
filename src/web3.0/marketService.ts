import { ethers } from "ethers";
import { connectWallet } from "./wallet";
import MarketplaceABI from "./abis/Marketplace.json";
import { setApprovalForAll } from "./contractService";

const MARKETPLACE_ADDRESS = import.meta.env.VITE_MARKETPLACE_ADDRESS as string;

async function getSigner() {
  const wallet = await connectWallet();
  if (!wallet) throw new Error("Wallet not connected");
  return wallet.signer;
}

async function getMarketplaceContract() {
  const signer = await getSigner();
  return new ethers.Contract(MARKETPLACE_ADDRESS, MarketplaceABI.abi, signer);
}

export async function listNFTForSale(
  nftAddress: string,
  tokenId: number,
  priceInEth: string
) {
  try {
    const marketplace = await getMarketplaceContract();
    const priceInWei = ethers.parseEther(priceInEth);

    await setApprovalForAll(MARKETPLACE_ADDRESS, true);

    const tx = await marketplace.listNFT(nftAddress, tokenId, priceInWei);
    const receipt = await tx.wait();

    let listingId: string | undefined;
    for (const log of receipt.logs) {
      try {
        const parsed = marketplace.interface.parseLog(log);
        if (parsed && parsed.name === "Listed") {
          listingId = parsed.args.listingId.toString();
          break;
        }
      } catch (parseError) {
        // Continue searching for Listed event
      }
    }

    if (!listingId) {
      throw new Error("Failed to extract listing ID from transaction");
    }

    return {
      success: true,
      listingId,
      txHash: receipt.hash ?? receipt.transactionHash
    };
  } catch (error: any) {
    const errorMessage = error.reason || error.message || "Failed to list NFT for sale";
    throw new Error(errorMessage);
  }
}

export async function listFractionalTokensForSale(
  nftAddress: string,
  tokenId: number,
  tokenAddress: string,
  amount: number,
  pricePerTokenInEth: string
) {
  try {
    if (!tokenAddress || tokenAddress === "0x0000000000000000000000000000000000000000") {
      throw new Error("Invalid fractional token address. Property may not be fractionalized yet.");
    }

    const marketplace = await getMarketplaceContract();
    const signer = await getSigner();
    const priceInWei = ethers.parseEther(pricePerTokenInEth);

    const tokenContract = new ethers.Contract(
      tokenAddress,
      [
        "function approve(address spender, uint256 amount) public returns (bool)",
        "function allowance(address owner, address spender) public view returns (uint256)",
        "function balanceOf(address account) public view returns (uint256)"
      ],
      signer
    );

    const userAddress = await signer.getAddress();
    const balance = await tokenContract.balanceOf(userAddress);

    if (balance < amount) {
      throw new Error(`Insufficient fractional tokens. You have ${balance.toString()} but trying to list ${amount}`);
    }

    const marketplaceAddress = await marketplace.getAddress();
    const currentAllowance = await tokenContract.allowance(userAddress, marketplaceAddress);

    if (currentAllowance < amount) {
      const approveTx = await tokenContract.approve(marketplaceAddress, amount);
      await approveTx.wait();
    }

    const tx = await marketplace.listFractionalTokens(
      nftAddress,
      tokenId,
      tokenAddress,
      amount,
      priceInWei
    );
    const receipt = await tx.wait();

    let listingId: string | undefined;
    for (const log of receipt.logs) {
      try {
        const parsed = marketplace.interface.parseLog(log);
        if (parsed && parsed.name === "Listed") {
          listingId = parsed.args.listingId.toString();
          break;
        }
      } catch (parseError) {
        // Continue searching for Listed event
      }
    }

    if (!listingId) {
      throw new Error("Failed to extract listing ID from transaction");
    }

    return {
      success: true,
      listingId,
      txHash: receipt.hash ?? receipt.transactionHash
    };
  } catch (error: any) {
    throw new Error(error.message || "Failed to list fractional tokens for sale");
  }
}

export async function buyNFT(listingId: number, priceInEth: string) {
  try {
    const marketplace = await getMarketplaceContract();
    const priceInWei = ethers.parseEther(priceInEth);

    const listing = await marketplace.getListing(listingId);
    if (!listing.isActive) {
      throw new Error("Listing is no longer active");
    }

    const tx = await marketplace.buyNFT(listingId, { value: priceInWei });
    const receipt = await tx.wait();

    return {
      success: true,
      txHash: receipt.hash ?? receipt.transactionHash
    };
  } catch (error: any) {
    const errorMessage = error.reason || error.message || "Failed to purchase NFT";
    throw new Error(errorMessage);
  }
}

export async function buyFractionalTokens(
  listingId: number,
  amount: number,
  totalPriceInEth: string
) {
  try {
    const marketplace = await getMarketplaceContract();
    
    const listing = await marketplace.getListing(listingId);
    
    if (!listing.isActive) {
      throw new Error("Listing is no longer active");
    }
    
    const listedAmount = Number(listing.amount.toString());
    if (amount > listedAmount) {
      throw new Error(`Cannot buy ${amount} tokens. Only ${listedAmount} tokens are listed.`);
    }
    
    const listedPricePerToken = listing.price;
    const expectedTotalPrice = listedPricePerToken * BigInt(amount);
    const priceInWei = ethers.parseEther(totalPriceInEth);
    
    if (expectedTotalPrice !== priceInWei) {
      const expectedEth = ethers.formatEther(expectedTotalPrice);
      throw new Error(`Price mismatch. Expected ${expectedEth} ETH but provided ${totalPriceInEth} ETH`);
    }

    const tx = await marketplace.buyFractionalTokens(listingId, amount, {
      value: priceInWei
    });
    const receipt = await tx.wait();

    return {
      success: true,
      txHash: receipt.hash ?? receipt.transactionHash
    };
  } catch (error: any) {
    const errorMessage = error.reason || error.message || "Failed to purchase fractional tokens";
    throw new Error(errorMessage);
  }
}

export async function cancelListing(listingId: number) {
  try {
    const marketplace = await getMarketplaceContract();

    const listing = await marketplace.getListing(listingId);
    if (!listing.isActive) {
      throw new Error("Listing is already inactive or cancelled");
    }

    const tx = await marketplace.cancelListing(listingId);
    const receipt = await tx.wait();

    return {
      success: true,
      txHash: receipt.hash ?? receipt.transactionHash
    };
  } catch (error: any) {
    const errorMessage = error.reason || error.message || "Failed to cancel listing";
    throw new Error(errorMessage);
  }
}

export async function getListingDetails(listingId: number) {
  try {
    const marketplace = await getMarketplaceContract();
    const listing = await marketplace.getListing(listingId);

    if (!listing) {
      throw new Error("Listing not found");
    }

    const typeNumber = Number(listing.listingType);
    const listingTypeStr = typeNumber === 0 ? "NFT" : "FRACTIONAL";

    return {
      seller: listing.seller,
      nftAddress: listing.nftAddress,
      tokenId: listing.tokenId.toString(),
      tokenAddress: listing.tokenAddress,
      price: ethers.formatEther(listing.price),
      priceRaw: listing.price.toString(),
      amount: listing.amount.toString(),
      listingType: listingTypeStr,
      isActive: listing.isActive
    };
  } catch (error: any) {
    const errorMessage = error.reason || error.message || "Failed to get listing details";
    throw new Error(errorMessage);
  }
}

export async function isListingActive(listingId: number): Promise<boolean> {
  try {
    const details = await getListingDetails(listingId);
    return details.isActive;
  } catch (error) {
    console.error("Failed to check listing status:", error);
    return false;
  }
}