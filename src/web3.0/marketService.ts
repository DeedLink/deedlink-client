export const buyFromMarketplace=(
        marketPlaceId: string,
        tokenId: string,
        share: number,
        amountInWei: bigint         
        )=>{

    console.log("Buying from marketplace:", { marketPlaceId, tokenId, share, amountInWei });
    return true;
}