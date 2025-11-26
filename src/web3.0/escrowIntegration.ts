// escrowIntegration.ts
import { ethers } from "ethers";
import { connectWallet } from "./wallet";
import EscrowFactoryABI from "./abis/EscrowFactory.json";
import HybridEscrowABI from "./abis/HybridEscrow.json";
import { approveNFT, nftOwnershipVerification, getNFTOwner } from "./contractService";
import { getStampPercentage } from "../constants/stampfee";

// Environment variables
const ESCROW_FACTORY_ADDRESS = import.meta.env.VITE_ESCROW_FACTORY_ADDRESS as string;
const PROPERTY_NFT_ADDRESS = import.meta.env.VITE_PROPERTY_NFT_ADDRESS as string;
const ADMIN_WALLET = import.meta.env.VITE_ADMIN_WALLET as string;

// ============================================
// Helper Functions
// ============================================

async function getSigner() {
  const wallet = await connectWallet();
  if (!wallet) throw new Error("Wallet not connected");
  return wallet.signer;
}

async function getEscrowFactoryContract() {
  const signer = await getSigner();
  return new ethers.Contract(ESCROW_FACTORY_ADDRESS, EscrowFactoryABI.abi, signer);
}

async function getEscrowContract(escrowAddress: string) {
  const signer = await getSigner();
  return new ethers.Contract(escrowAddress, HybridEscrowABI.abi, signer);
}

function calculatePaymentBreakdown(priceInEth: string) {
  const price = parseFloat(priceInEth);
  const percent = getStampPercentage(price, "Sale");
  const stampFee = price * (percent / 100);
  const sellerAmount = price - stampFee;
  
  return {
    totalPrice: priceInEth,
    stampFee: stampFee.toFixed(4),
    stampFeePercentage: percent,
    sellerAmount: sellerAmount.toFixed(4)
  };
}

// ============================================
// Main Escrow Functions
// ============================================

// Complete workflow: Create escrow and pay stamp fee
// Called by: SELLER (initiates the sale)
export async function completeFullOwnershipTransfer(
  tokenId: number,
  sellerAddress: string,
  buyerAddress: string,
  totalPriceInEth: string,
  currentAccount: string
): Promise<{
  success: boolean;
  escrowAddress?: string;
  stampFeeTxHash?: string;
  message?: string;
  error?: string;
}> {
  try {
    // Verify seller is making the call
    if (sellerAddress.toLowerCase() !== currentAccount.toLowerCase()) {
      throw new Error("Seller must be the connected wallet");
    }

    const breakdown = calculatePaymentBreakdown(totalPriceInEth);
    const sellerPriceInWei = ethers.parseEther(breakdown.sellerAmount);

    // Step 1: Send stamp fee to admin
    const signer = await getSigner();
    const stampFeeTx = await signer.sendTransaction({
      to: ADMIN_WALLET,
      value: ethers.parseEther(breakdown.stampFee)
    });
    const stampFeeReceipt = await stampFeeTx.wait();
    
    if (!stampFeeReceipt) {
      throw new Error("Failed to get stamp fee transaction receipt");
    }
    
    const stampFeeTxHash = stampFeeReceipt.hash ?? stampFeeReceipt.transactionHash;

    // Step 2: Create escrow contract
    const factory = await getEscrowFactoryContract();
    const createTx = await factory.createNFTEscrow(
      buyerAddress,
      sellerAddress,
      sellerPriceInWei,
      PROPERTY_NFT_ADDRESS,
      tokenId
    );
    const createReceipt = await createTx.wait();
    
    if (!createReceipt) {
      throw new Error("Failed to get escrow creation receipt");
    }

    // Extract escrow address from event
    let escrowAddress: string | undefined;
    for (const log of createReceipt.logs) {
      try {
        const parsed = factory.interface.parseLog(log);
        if (parsed && parsed.name === "EscrowCreated") {
          escrowAddress = parsed.args.escrow;
          break;
        }
      } catch (parseError) {
        // Continue searching for EscrowCreated event
      }
    }

    if (!escrowAddress) {
      throw new Error("Failed to get escrow address from transaction");
    }

    return {
      success: true,
      escrowAddress,
      stampFeeTxHash,
      message: `Escrow created successfully. Seller needs to deposit NFT next.`
    };

  } catch (error: any) {
    console.error("Failed to create escrow:", error);
    return {
      success: false,
      error: error.message || "Failed to create escrow"
    };
  }
}

// Seller deposits NFT into escrow
// Called by: SELLER
export async function sellerDepositNFT(
  escrowAddress: string,
  tokenId: number
): Promise<{ 
  success: boolean;
  txHash?: string;
  error?: string;
}> {
  try {
    // Verify seller owns the NFT
    const signer = await getSigner();
    const sellerAddress = await signer.getAddress();
    const ownsNFT = await nftOwnershipVerification(tokenId, sellerAddress);
    if (!ownsNFT) {
      let currentOwner = "unknown";
      try {
        currentOwner = await getNFTOwner(tokenId);
      } catch (e) {
        // Continue with error message
      }
      throw new Error(`Seller does not own the specified NFT. Current owner: ${currentOwner}`);
    }

    // Approve NFT to escrow contract
    await approveNFT(escrowAddress, tokenId);

    // Deposit NFT
    const escrow = await getEscrowContract(escrowAddress);
    const depositTx = await escrow.depositNFTAsset();
    const depositReceipt = await depositTx.wait();
    
    if (!depositReceipt) {
      throw new Error("Failed to get NFT deposit receipt");
    }
    
    const txHash = depositReceipt.hash ?? depositReceipt.transactionHash;

    return {
      success: true,
      txHash
    };

  } catch (error: any) {
    console.error("Failed to deposit NFT:", error);
    return {
      success: false,
      error: error.message || "Failed to deposit NFT"
    };
  }
}

// Buyer deposits payment into escrow
// Called by: BUYER
export async function buyerDepositPayment(
  escrowAddress: string,
  amountInEth: string
): Promise<{ 
  success: boolean;
  txHash?: string;
  error?: string;
}> {
  try {
    const escrow = await getEscrowContract(escrowAddress);
    const amountInWei = ethers.parseEther(amountInEth);
    
    const tx = await escrow.depositPayment({ value: amountInWei });
    const receipt = await tx.wait();
    
    if (!receipt) {
      throw new Error("Failed to get payment deposit receipt");
    }
    
    const txHash = receipt.hash ?? receipt.transactionHash;

    return {
      success: true,
      txHash
    };

  } catch (error: any) {
    console.error("Failed to deposit payment:", error);
    return {
      success: false,
      error: error.message || "Failed to deposit payment"
    };
  }
}

// Finalize escrow - releases payment and transfers NFT
// Called by: BUYER
export async function finalizeEscrow(
  escrowAddress: string
): Promise<{ 
  success: boolean;
  txHash?: string;
  error?: string;
}> {
  try {
    const escrow = await getEscrowContract(escrowAddress);
    
    // Check if both parties deposited
    const status = await escrow.getStatus();
    if (!status._isBuyerDeposited || !status._isSellerDeposited) {
      throw new Error("Cannot finalize: Both parties must deposit first");
    }

    const tx = await escrow.finalize();
    const receipt = await tx.wait();
    
    if (!receipt) {
      throw new Error("Failed to get finalize receipt");
    }
    
    const txHash = receipt.hash ?? receipt.transactionHash;

    return {
      success: true,
      txHash
    };

  } catch (error: any) {
    console.error("Failed to finalize escrow:", error);
    return {
      success: false,
      error: error.message || "Failed to finalize escrow"
    };
  }
}

// Cancel escrow and refund both parties
// Called by: BUYER or SELLER
export async function cancelEscrow(
  escrowAddress: string
): Promise<{ 
  success: boolean;
  txHash?: string;
  error?: string;
}> {
  try {
    const escrow = await getEscrowContract(escrowAddress);
    
    const tx = await escrow.cancel();
    const receipt = await tx.wait();
    
    if (!receipt) {
      throw new Error("Failed to get cancel receipt");
    }
    
    const txHash = receipt.hash ?? receipt.transactionHash;

    return {
      success: true,
      txHash
    };

  } catch (error: any) {
    console.error("Failed to cancel escrow:", error);
    return {
      success: false,
      error: error.message || "Failed to cancel escrow"
    };
  }
}

// ============================================
// Query Functions
// ============================================

// Get escrow status
export async function getEscrowStatus(escrowAddress: string): Promise<{
  isBuyerDeposited: boolean;
  isSellerDeposited: boolean;
  isFinalized: boolean;
}> {
  const escrow = await getEscrowContract(escrowAddress);
  const status = await escrow.getStatus();
  
  return {
    isBuyerDeposited: status._isBuyerDeposited,
    isSellerDeposited: status._isSellerDeposited,
    isFinalized: status._isFinalized
  };
}

// Get complete escrow details
export async function getEscrowDetails(escrowAddress: string): Promise<{
  buyer: string;
  seller: string;
  price: string;
  priceRaw: string;
  tokenId: string;
  escrowType: string;
  isBuyerDeposited: boolean;
  isSellerDeposited: boolean;
  isFinalized: boolean;
}> {
  const escrow = await getEscrowContract(escrowAddress);
  
  const [buyer, seller, price, escrowType, tokenId, status] = await Promise.all([
    escrow.buyer(),
    escrow.seller(),
    escrow.price(),
    escrow.escrowType(),
    escrow.tokenId(),
    escrow.getStatus()
  ]);

  return {
    buyer,
    seller,
    price: ethers.formatEther(price),
    priceRaw: price.toString(),
    tokenId: tokenId.toString(),
    escrowType: escrowType === 0 ? "NFT" : "FRACTIONAL",
    isBuyerDeposited: status._isBuyerDeposited,
    isSellerDeposited: status._isSellerDeposited,
    isFinalized: status._isFinalized
  };
}

// Get all escrows for a user
export async function getUserEscrows(userAddress: string): Promise<string[]> {
  const factory = await getEscrowFactoryContract();
  return await factory.getUserEscrows(userAddress);
}

//  Calculate payment breakdown (for display purposes)
export function getPaymentBreakdown(priceInEth: string): {
  totalPrice: string;
  stampFee: string;
  sellerAmount: string;
  stampFeePercentage: number;
} {
  return calculatePaymentBreakdown(priceInEth);
}

// ============================================
// Event Listeners
// ============================================

// Listen to escrow events
export async function onEscrowCreated(
  callback: (escrow: string, buyer: string, seller: string, type: number) => void
) {
  const factory = await getEscrowFactoryContract();
  factory.on("EscrowCreated", callback);
}

// Listen to payment deposited
export async function onPaymentDeposited(
  escrowAddress: string,
  callback: (buyer: string, amount: bigint) => void
) {
  const escrow = await getEscrowContract(escrowAddress);
  escrow.on("PaymentDeposited", callback);
}

// Listen to asset deposited
export async function onAssetDeposited(
  escrowAddress: string,
  callback: (seller: string, type: number) => void
) {
  const escrow = await getEscrowContract(escrowAddress);
  escrow.on("AssetDeposited", callback);
}

// Listen to escrow finalized
export async function onEscrowFinalized(
  escrowAddress: string,
  callback: (buyer: string, seller: string) => void
) {
  const escrow = await getEscrowContract(escrowAddress);
  escrow.on("EscrowFinalized", callback);
}

// Remove all event listeners
export async function removeEscrowListeners(escrowAddress?: string) {
  if (escrowAddress) {
    const escrow = await getEscrowContract(escrowAddress);
    escrow.removeAllListeners();
  } else {
    const factory = await getEscrowFactoryContract();
    factory.removeAllListeners();
  }
}