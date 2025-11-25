import { Decrypting } from "./encryption";

export const validateEscrowString = (typed: string): [boolean, any] => {
  if (!typed || typed.trim().length === 0) {
    console.log("validateEscrowString: Empty input");
    return [false, null];
  }
  
  try {
    console.log("validateEscrowString: Attempting decryption...");
    const decrypted = Decrypting(typed);
    console.log("validateEscrowString: Decryption result:", decrypted);
    
    // Decrypting already returns parsed JSON or null
    if (!decrypted) {
      console.log("validateEscrowString: Decryption returned null or empty");
      return [false, null];
    }

    if (typeof decrypted !== "object") {
      console.log("validateEscrowString: Decrypted data is not an object:", typeof decrypted);
      return [false, null];
    }

    // Validate it has the expected QRData structure
    const data = decrypted as { deedId?: string; escrowAddress?: string; seller?: string; hash?: string };
    console.log("validateEscrowString: Validating structure:", {
      hasDeedId: !!data.deedId,
      hasEscrowAddress: !!data.escrowAddress,
      hasSeller: !!data.seller,
      escrowAddress: data.escrowAddress
    });

    if (!data.deedId || !data.escrowAddress || !data.seller) {
      console.log("validateEscrowString: Missing required fields");
      return [false, null];
    }

    // Validate escrow address format
    if (!data.escrowAddress.startsWith("0x") || data.escrowAddress.length !== 42) {
      console.log("validateEscrowString: Invalid escrow address format:", data.escrowAddress);
      return [false, null];
    }

    console.log("validateEscrowString: Validation successful");
    return [true, decrypted];
  } catch (error) {
    console.error("validateEscrowString error:", error);
    return [false, null];
  }
};