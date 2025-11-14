import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { getPlanByPlanNumber, getDeedByDeedNumber, getTransactionsByDeedId, getMarketPlaceByDeedId } from "../api/api";
import { getFractionalTokenAddress, getFTBalance, getSignatures } from "../web3.0/contractService";
import { useToast } from "../contexts/ToastContext";
import { useLoader } from "../contexts/LoaderContext";
import { useWallet } from "../contexts/WalletContext";
import { defaultPlan, type Plan } from "../types/plan";
import type { IDeed } from "../types/responseDeed";
import type { Marketplace } from "../types/marketplace";

interface ISignatures {
  surveyor: boolean;
  notary: boolean;
  ivsl: boolean;
  fully: boolean;
}

export const useDeedData = (deedNumber: string | undefined) => {
  const [deed, setDeed] = useState<IDeed | null>(null);
  const [plan, setPlan] = useState<Plan>(defaultPlan);
  const [signatures, setSignatures] = useState<ISignatures | null>(null);
  const [numberOfFT, setNumberOfFT] = useState(0);
  const [tnx, setTnx] = useState<any[]>([]);
  const [marketPlaceData, setMarketPlaceData] = useState<Marketplace[]>();
  
  const { showToast } = useToast();
  const { showLoader, hideLoader } = useLoader();
  const { account } = useWallet();

  const getNumberOfFT = async () => {
    try {
      if (!deed?.tokenId || !account) return;

      const tokenAddress = await getFractionalTokenAddress(deed.tokenId);
      if (!ethers.isAddress(tokenAddress)) {
        console.error("Invalid token address:", tokenAddress);
        return;
      }

      const balance = await getFTBalance(tokenAddress, account);
      const formattedBalance = ethers.formatUnits(balance, 0);
      setNumberOfFT(parseInt(formattedBalance));
    } catch (err) {
      console.error("Failed to get fractional token balance:", err);
    }
  };

  const getMarketPlaceData = async () => {
    try {
      if (!deed?._id) return;
      const res = await getMarketPlaceByDeedId(deed._id);
      setMarketPlaceData(res);
    } catch (error) {
      console.error("Error fetching marketplace data:", error);
    }
  };

  const getTransactions = async () => {
    if (deed && deed._id) {
      const tnx = await getTransactionsByDeedId(deed._id);
      if (tnx && tnx.length) {
        const sortedTnx = tnx.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setTnx(sortedTnx);
      }
    }
  };

  const fetchDeed = async () => {
    if (!deedNumber) return;
    
    showLoader();
    try {
      const res = await getDeedByDeedNumber(deedNumber);
      if (res) {
        setDeed(res);
        
        if (res.tokenId !== undefined) {
          try {
            const sigs = await getSignatures(res.tokenId);
            setSignatures(sigs);
          } catch (error) {
            console.error("Failed to fetch signatures:", error);
          }
        }

        if (res.surveyPlanNumber) {
          try {
            const plan_res = await getPlanByPlanNumber(res.surveyPlanNumber);
            if (plan_res.data) {
              setPlan(plan_res.data);
            }
          } catch (error) {
            console.error("Failed to fetch survey plan:", error);
          }
        }
      } else {
        showToast("Deed not found", "error");
      }
    } catch (error) {
      console.error("Failed to fetch deed:", error);
    } finally {
      hideLoader();
    }
  };

  useEffect(() => {
    fetchDeed();
  }, [deedNumber]);

  useEffect(() => {
    getTransactions();
  }, [deed]);

  useEffect(() => {
    if (deed) {
      getMarketPlaceData();
    }
  }, [deed]);

  useEffect(() => {
    getNumberOfFT();
  }, [deedNumber]);

  return {
    deed,
    plan,
    signatures,
    numberOfFT,
    tnx,
    marketPlaceData,
    getNumberOfFT,
    getMarketPlaceData,
    fetchDeed
  };
};