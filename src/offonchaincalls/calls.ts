// This was create by me to reduce the complexity of the api and abi calls
// This below function will be used to call abi and api calls by passing the function name and parameters and will choose what data to be send to offchain and onchain

import { registerDeed, updateTokenId, uploadMetadata } from "../api/api"
import { deedRequestDataFormatter } from "../utils/format";
import { mintNFT } from "../web3.0/contractService";

export const reg_mintNFT = async (to: string, data: any) => {
    console.log({
        to: to,
        data: data
    });
    const reg = await registerDeed(deedRequestDataFormatter(data));
    if(!(reg.status==201)){
        throw new Error("Failed to register deed");
    };
    const pinata_res = await uploadMetadata(data, 'NFT');
    if(pinata_res.uri){
        const nft = await mintNFT(to, pinata_res.uri, reg.data._id);
        console.log({
            to: to,
            pinata_uri: pinata_res.uri,
            db_uri: reg.data._id
        });

        if(nft){
            const update_res = await updateTokenId(reg.data.deedNumber, nft.tokenId)
            console.log(update_res);
        }

        return nft;
    } else {
        throw new Error("Failed to upload metadata");
    }
};