const setLastWill = async (
  tokenId: number,
  beneficiary: string,
  notary: string,
  estimatedValue: number
) => {
  // Placeholder for smart contract interaction
  // const tx = await propertyContract.methods
  //   .setLastWill(tokenId, beneficiary, notary, estimatedValue)
  //   .send({ from: window.ethereum.selectedAddress });

  return { message: "Last Will set successfully" /*, tx*/ };
};

export { setLastWill };