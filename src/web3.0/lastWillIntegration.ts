import { ethers } from "ethers";
import { connectWallet } from "./wallet";
import LastWillABI from "./abis/LastWillRegistry.json";

const LAST_WILL_ADDRESS = import.meta.env.VITE_LASTWILL_REGISTRY_ADDRESS as string;

async function getSigner() {
  const wallet = await connectWallet();
  if (!wallet) throw new Error("Wallet not connected");
  return wallet.signer;
}

async function getLastWillContract() {
  const signer = await getSigner();
  return new ethers.Contract(LAST_WILL_ADDRESS, LastWillABI.abi, signer);
}

// Create a last will
export async function createWill(
  tokenId: number,
  beneficiary: string,
  witness1: string,
  witness2: string,
  ipfsHash: string
) {
  const contract = await getLastWillContract();
  const tx = await contract.createWill(tokenId, beneficiary, witness1, witness2, ipfsHash);
  const receipt = await tx.wait();

  return {
    success: true,
    txHash: receipt.hash,
    message: `Will created for token #${tokenId}`
  };
}

// Witness a will
export async function witnessWill(tokenId: number, approve: boolean) {
  const contract = await getLastWillContract();
  const tx = await contract.witnessWill(tokenId, approve);
  const receipt = await tx.wait();

  return {
    success: true,
    txHash: receipt.hash,
    message: `Will witnessed for token #${tokenId}`
  };
}

// Execute a will
export async function executeWill(tokenId: number) {
  const contract = await getLastWillContract();
  const tx = await contract.executeWill(tokenId);
  const receipt = await tx.wait();

  return {
    success: true,
    txHash: receipt.hash,
    message: `Will executed for token #${tokenId}`
  };
}

// Revoke a will
export async function revokeWill(tokenId: number) {
  const contract = await getLastWillContract();
  const tx = await contract.revokeWill(tokenId);
  const receipt = await tx.wait();

  return {
    success: true,
    txHash: receipt.hash,
    message: `Will revoked for token #${tokenId}`
  };
}

// Update beneficiary
export async function updateBeneficiary(tokenId: number, newBeneficiary: string) {
  const contract = await getLastWillContract();
  const tx = await contract.updateBeneficiary(tokenId, newBeneficiary);
  const receipt = await tx.wait();

  return {
    success: true,
    txHash: receipt.hash,
    message: `Beneficiary updated for token #${tokenId}`
  };
}

// View will details
export async function getWill(tokenId: number) {
  const contract = await getLastWillContract();
  const will = await contract.getWill(tokenId);

  return {
    beneficiary: will[0],
    witness1: will[1],
    witness2: will[2],
    createdAt: Number(will[3]),
    executionDate: Number(will[4]),
    isActive: will[5],
    isExecuted: will[6],
    ipfsHash: will[7],
    witness1Status: Number(will[8]),
    witness2Status: Number(will[9])
  };
}

// Check if ready for execution
export async function isWillReadyForExecution(tokenId: number) {
  const contract = await getLastWillContract();
  return await contract.isWillReadyForExecution(tokenId);
}
