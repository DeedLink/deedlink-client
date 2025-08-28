import React, { createContext, useContext, useState } from "react";
import { BrowserProvider, JsonRpcSigner } from "ethers";
import { connectWallet } from "../web3.0/wallet";

interface WalletContextProps {
  account: string | null;
  provider: BrowserProvider | null;
  signer: JsonRpcSigner | null;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextProps | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);

  const connect = async () => {
    const res = await connectWallet();
    if (res) {
      setAccount(res.account);
      setProvider(res.provider);
      setSigner(res.signer);
      localStorage.setItem("walletConnected", "true");
    }
  };

  const disconnect = () => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    localStorage.removeItem("walletConnected");
  };

  return (
    <WalletContext.Provider value={{ account, provider, signer, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be inside WalletProvider");
  return ctx;
};
