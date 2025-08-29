export type Address = string;

export type Directions = "North" | "South" | "East" | "West";
export type LandType = "Paddy land" | "Highland";

export interface Tnx {
  _id: string;
  from: Address;
  to: Address;
  amount: number;
  share: number;
  timestamp: number; 
}

export interface Owner {
  address: Address;
  share: number;
}

export interface LocationPoint {
  longitude: number;
  latitude: number;
}

export interface Side {
  direction: Directions;
  deedNumber: string;
}

export interface Deed {
  _id: string;
  title: Tnx[]; 
  owners: Owner[];
  signedby: Address;
  area: number;
  value: number; 
  location: LocationPoint[];
  sides: Side[];
  deedNumber: string;
  landType: LandType;
  timestamp: number;
}

export interface Token {
  id: string;
  deedNumber: string;
  type: "NFT" | "FT";
  owner: string;
  share?: number;
  price: number;
  isMine?: boolean;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  walletAddress?: string | null;
  nic: string;
  kycDocumentHash?: string;
  kycStatus: "pending" | "verified" | "rejected";
  role: "user" | "registrar" | "admin";
  createdAt: string;
  updatedAt: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  nic: string;
  password?: string;
  walletAddress?: string;
  signature?: string;
  role?: "user" | "registrar" | "admin";
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface VerifyKYCRequest {
  status: "verified" | "rejected";
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface KYCUploadResponse {
  message: string;
  kycDocumentHash: string;
  user: User;
}

export type StorageType = "local" | "session";

export type StorageKey = "token" | "user";
