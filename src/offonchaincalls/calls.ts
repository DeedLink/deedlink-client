// This was create by me to reduce the complexity of the api and abi calls
// This below function will be used to call abi and api calls by passing the function name and parameters and will choose what data to be send to offchain and onchain

import { uploadMetadata } from "../api/api"
import { mintNFT } from "../web3.0/contractService";

export const reg_mintNFT = async (to: string, data: any) => {
    console.log({
        to: to,
        data: data
    })
    const pinata_res = await uploadMetadata(data, 'NFT');
    if(pinata_res.uri){
        const nft = await mintNFT(to, pinata_res.uri);
        return nft;
    } else {
        throw new Error("Failed to upload metadata");
    }
};