import CryptoJS from "crypto-js";

const FALLBACK_SECRET = "restatesecurekey2024!";
const SECRET_KEY =
  (import.meta.env.VITE_SECRET_KEY as string | undefined) || FALLBACK_SECRET;

export const Encryting = (obj: object): string => {
  const jsonString = JSON.stringify(obj ?? {});
  const encrypted = CryptoJS.AES.encrypt(jsonString, SECRET_KEY).toString();
  return encrypted;
};

export const Decrypting = (encryptedStr: string): any => {
  if (!encryptedStr) return null;
  const bytes = CryptoJS.AES.decrypt(encryptedStr, SECRET_KEY);
  const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
  if (!decryptedString) return null;
  try {
    return JSON.parse(decryptedString);
  } catch {
    return decryptedString;
  }
};