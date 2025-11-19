import { connectWallet } from "./wallet";
import { ethers } from "ethers";

const ADMIN_WALLET = import.meta.env.VITE_ADMIN_WALLET as string;

export async function sendStampFee(amountInEth: string): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    const wallet = await connectWallet();
    if (!wallet) throw new Error("Wallet not connected");
    const signer = wallet.signer;
    if (!signer) throw new Error("Signer not available");

    const tx = await signer.sendTransaction({
      to: ADMIN_WALLET,
      value: ethers.parseEther(amountInEth),
    });
    const receipt = await tx.wait();
    const txHash = (receipt && (receipt as any).transactionHash) || (receipt && (receipt as any).hash) || undefined;
    return { success: true, txHash };
  } catch (err: any) {
    console.error("Failed to send stamp fee:", err);
    return { success: false, error: err?.message || String(err) };
  }
}
