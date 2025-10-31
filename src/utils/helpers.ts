import { Decrypting } from "./encryption";

export const validateEscrowString = (typed: string): [boolean, any] => {
  if (!typed) return [false, null];
  try {
    const decrypted = Decrypting(typed);
    if (typeof decrypted === "string") {
      const parsed = JSON.parse(decrypted);
      return [true, parsed];
    }
    return [true, decrypted];
  } catch {
    return [false, null];
  }
};