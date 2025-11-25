import CryptoJS from "crypto-js";

const SECRET_KEY = import.meta.env.VITE_SECRET_KEY as string;

if (!SECRET_KEY) {
  throw new Error("VITE_SECRET_KEY environment variable is required for encryption/decryption");
}

export const Encryting = (obj: object): string => {
  const jsonString = JSON.stringify(obj ?? {});
  const encrypted = CryptoJS.AES.encrypt(jsonString, SECRET_KEY).toString();
  return encrypted;
};

export const Decrypting = (encryptedStr: string): any => {
  if (!encryptedStr) {
    console.log("Decrypting: Empty input");
    return null;
  }
  
  try {
    console.log("Decrypting: Attempting to decrypt string (length:", encryptedStr.length, ")");
    const bytes = CryptoJS.AES.decrypt(encryptedStr, SECRET_KEY);
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
    
    if (!decryptedString) {
      console.log("Decrypting: Decryption resulted in empty string - wrong key or corrupted data");
      return null;
    }
    
    console.log("Decrypting: Decrypted string:", decryptedString.substring(0, 100) + "...");
    
    try {
      const parsed = JSON.parse(decryptedString);
      console.log("Decrypting: Successfully parsed JSON");
      return parsed;
    } catch (parseError) {
      console.log("Decrypting: JSON parse failed, returning raw string");
      return decryptedString;
    }
  } catch (error) {
    console.error("Decrypting: Error during decryption:", error);
    return null;
  }
};