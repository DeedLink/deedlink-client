import { BrowserProvider } from "ethers";
import EthereumProvider from "@walletconnect/ethereum-provider";

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;
const CHAIN_ID = Number(import.meta.env.VITE_CHAIN_ID);
const WEB_RPC = import.meta.env.VITE_RPC_URL_WEB as string;
const MOBILE_RPC = import.meta.env.VITE_RPC_URL_MOBILE as string;

// Singleton for WalletConnect provider to prevent multiple initializations
let wcProviderInstance: EthereumProvider | null = null;

export async function connectWallet() {
  try {
    if ((window as any).ethereum) {
      const eth = (window as any).ethereum;

      console.log("MetaMask detected ✅");

      const accounts = await eth.request({ method: "eth_requestAccounts" });
      if (!accounts || accounts.length === 0) {
        alert("Please connect at least one account in MetaMask.");
        return null;
      }

      const currentChainId = await eth.request({ method: "eth_chainId" });
      const current = parseInt(currentChainId, 16);

      if (current !== CHAIN_ID) {
        console.warn(`⚠️ Switching MetaMask to chainId=${CHAIN_ID}...`);
        try {
          await eth.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0x" + CHAIN_ID.toString(16) }],
          });
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            console.log("Network not found in MetaMask. Adding it...");
            await eth.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: "0x" + CHAIN_ID.toString(16),
                  chainName: "Blockchain Server",
                  rpcUrls: [WEB_RPC],
                  nativeCurrency: {
                    name: "ETH",
                    symbol: "ETH",
                    decimals: 18,
                  },
                },
              ],
            });
          } else {
            throw switchError;
          }
        }
      }

      const provider = new BrowserProvider(eth);
      const signer = await provider.getSigner();

      return { provider, signer, account: accounts[0], type: "metamask" };
    }

    //WalletConnect (mobile MetaMask or others)
    // Use singleton to prevent multiple initializations
    if (!wcProviderInstance) {
      console.log("Initializing WalletConnect...");
      wcProviderInstance = await EthereumProvider.init({
        projectId,
        chains: [CHAIN_ID],
        showQrModal: true,
        optionalChains: [CHAIN_ID],
        rpcMap: {
          [CHAIN_ID]: MOBILE_RPC,
        },
      } as any);
    } else {
      console.log("Using existing WalletConnect instance");
    }

    const wcProvider = wcProviderInstance;
    
    // Only enable if not already enabled/connected
    try {
      if (!wcProvider.session || !wcProvider.connected) {
        await wcProvider.enable();
      }
    } catch (error: any) {
      // If enable fails, try to reconnect
      if (error.message?.includes("already enabled") || error.message?.includes("session")) {
        // Session exists, continue
      } else {
        throw error;
      }
    }

    const provider = new BrowserProvider(wcProvider as any);
    const signer = await provider.getSigner();
    const account = (await signer.getAddress()).toLocaleLowerCase();

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
