import CryptoJS from "crypto-js";

const SECRET_KEY = import.meta.env.VITE_SECRET_KEY as string;

export const Encryting = (obj: object): string => {
  const jsonString = JSON.stringify(obj);
  const encrypted = CryptoJS.AES.encrypt(jsonString, SECRET_KEY).toString();
  return encrypted;
};

export const Decrypting = (encryptedStr: string): any => {
  const bytes = CryptoJS.AES.decrypt(encryptedStr, SECRET_KEY);
  const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
  try {
    return JSON.parse(decryptedString);
  } catch {
    return decryptedString;
  }
};