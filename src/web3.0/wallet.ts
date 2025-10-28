import { BrowserProvider } from "ethers";
import EthereumProvider from "@walletconnect/ethereum-provider";

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;

export async function connectWallet() {
  try {
    //Try MetaMask first
    if ((window as any).ethereum) {
      const provider = new BrowserProvider((window as any).ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      return { provider, signer, account: accounts[0], type: "metamask" };
    }

    //Fallback: Use WalletConnect
    const wcProvider = await EthereumProvider.init({
      projectId,
      chains: [31337], // I use my own anvil testnet with the chainId=31337
      showQrModal: true,
    });

    await wcProvider.enable();

    const provider = new BrowserProvider(wcProvider as any);
    const signer = await provider.getSigner();
    const account = await signer.getAddress();

    return { provider, signer, account, type: "walletconnect" };
  } catch (err) {
    console.error("Wallet connection failed:", err);
    return null;
  }
}

export async function getSignature(message: string) {
  const wallet = await connectWallet();
  if (!wallet) throw new Error("Wallet not connected");

  const signature = await wallet.signer.signMessage(message);
  return signature;
}
