import { useEffect, useState } from "react";
import type { Rent } from "../../types/rent";
import { getRentDetails } from "../../web3.0/rentIntegration";
import { shortAddress } from "../../utils/format";

const RentUI=({tokenId}: {tokenId: number})=>{
    const [rentDetails, setRentDetails] = useState<Rent>();

    const fetchRentDetails = async (): Promise<void> => {
        if (!tokenId) return;
        try {
        const rent = await getRentDetails(tokenId);
        console.log("Rent: ",rent);
        if (rent) setRentDetails(rent);
        } catch (error) {
        console.error(error);
        }
    };

    useEffect(()=>{
        fetchRentDetails();
    },[tokenId]);

    return(
        <div>
            {rentDetails && (
                <div className="text-black w-full h-full">
                    <p>Amount: {rentDetails.rentAmount} ETH</p>
                    <p>Period: {Number(rentDetails.rentPeriodDays)} Months</p>
                    <p>Last Paid: {new Date(Number(rentDetails.lastPaid) * 1000).toLocaleString()}</p>
                    <p>Receiver: {shortAddress(rentDetails.receiver)}</p>
                </div>
            )}
        </div>
    )
}

export default RentUI;