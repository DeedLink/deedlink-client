import axios, { type AxiosResponse } from "axios";
import { getItem, setItem } from "../storage/storage";
import type { AuthResponse, KYCUploadResponse, LoginRequest, RegisterRequest, SetPasswordRequest, User, userPasswordStatusResponse, userStatusNotRegisteredResponse, userStatusResponse, VerifyKYCRequest } from "../types/types";
import type { RegisterDeedRequest } from "../types/regitseringdeedtype";

const USER_API_URL = import.meta.env.VITE_USER_API_URL || "http://localhost:5000/api/users";
const DEED_API_URL = import.meta.env.VITE_DEED_API_URL || "http://localhost:5000/api/deeds";

const api = axios.create({
  baseURL: USER_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = getItem("local", "token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Register user
export const registerUser = async (data: RegisterRequest): Promise<AuthResponse> => {
  const res: AxiosResponse<AuthResponse> = await api.post("/register", data);
  setItem("local", "token", res.data.token);
  return res.data;
};

// Set password for user
export const setPasswordForUser = async (data: SetPasswordRequest): Promise<AuthResponse> => {
  const res: AxiosResponse<AuthResponse> = await api.post("/set-password", data);
  setItem("local", "token", res.data.token);
  return res.data;
};

// Login user
export const loginUser = async (data: LoginRequest): Promise<AuthResponse> => {
  const res: AxiosResponse<AuthResponse> = await api.post("/login", data);
  setItem("local", "token", res.data.token);
  return res.data;
};

// Get profile (protected)
export const getProfile = async (): Promise<User> => {
  const res: AxiosResponse<User> = await api.get("/profile");
  return res.data;
};

// Upload KYC documents (protected, multipart/form-data)
export const uploadKYC = async (
    id: string,
    nic: string,
    nicFrontSide: File | null,
    nicBackSide: File | null,
    userFrontImage: File | null
): Promise<KYCUploadResponse> => {
    const formData = new FormData();
    formData.append("nic", nic);
    formData.append("userId", id);
    if (nicFrontSide) formData.append("nicFrontSide", nicFrontSide);
    if (nicBackSide) formData.append("nicBackSide", nicBackSide);
    if (userFrontImage) formData.append("userFrontImage", userFrontImage);
    console.log("form data: ", formData.get("nicFrontSide"));

    const res: AxiosResponse<KYCUploadResponse> = await api.post(
        "/upload-kyc",
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${getItem("local", "token") || ""}`,
            },
        }
    );

    return res.data;
};

// Verify KYC (registrar/admin only)
export const verifyKYC = async (
  id: string,
  data: VerifyKYCRequest
): Promise<{ message: string; user: User }> => {
  const res: AxiosResponse<{ message: string; user: User }> = await api.patch(
    `/${id}/verify-kyc`,
    data
  );
  return res.data;
};

// List pending KYC (registrar/admin only)
export const listPendingKYC = async (): Promise<User[]> => {
  const res: AxiosResponse<User[]> = await api.get("/pending-kyc");
  return res.data;
};

// Get user state by wallet address (public)
export const getUserState = async (walletAddress: string): Promise<userStatusResponse | userStatusNotRegisteredResponse> => {
  const res: AxiosResponse<userStatusResponse | userStatusNotRegisteredResponse> = await api.get(`/status/${walletAddress}`);
  return res.data;
};

// Get user password state by wallet address (public)
export const getUserPasswordState = async (walletAddress: string): Promise<userPasswordStatusResponse> => {
  const res: AxiosResponse<userPasswordStatusResponse> = await api.get(`/status/password/${walletAddress}`);
  return res.data;
};

// Get all users (only for testing)
export const getUsers = async (): Promise<User[]> => {
  const res: AxiosResponse<User[]> = await api.get("/");
  return res.data;
};

// Search users by name, email or wallet address (public)
export const searchUsers = async (query: string): Promise<User[]> => {
  const res: AxiosResponse<User[]> = await api.get(`/search-user?query=${encodeURIComponent(query)}`);
  return res.data;
};

// Deed related api calls
const deedApi = axios.create({
  baseURL: DEED_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

deedApi.interceptors.request.use((config) => {
  const token = getItem("local", "token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Register a deed (protected)
export const registerDeed = async (data: RegisterDeedRequest) => {
  console.log("Registering deed with data:", data);
  const res: AxiosResponse<{ status: Number; deed: any }> = await deedApi.post("/", data);
  return res;
};

// Get deeds by owner ID (protected)
export const getDeedsByOwner = async (ownerId: string): Promise<any[]> => {
  const res: AxiosResponse<any[]> = await deedApi.get(`/owner/${ownerId}`);
  return res.data;
};

// Get deed by ID (protected)
export const getDeedById = async (deedId: string): Promise<any> => {
  const res: AxiosResponse<any> = await deedApi.get(`/${deedId}`);
  return res.data;
};


// -------------------- Pinata API Calls --------------------
const PINATA_API_URL = import.meta.env.VITE_PINATA_API_URL || "http://localhost:6000/ipfs";

const pinataApi = axios.create({
  baseURL: PINATA_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const uploadMetadata = async (data: object, type: 'NFT' | 'FT' | 'USER'): Promise<{ uri: string }> => {
  const res: AxiosResponse<{ uri: string }> = await pinataApi.post(`/upload/metadata?type=${type}`, data);
  return res.data;
};

export const uploadFile = async (file: File): Promise<{ uri: string }> => {
  const formData = new FormData();
  formData.append('file', file);

  const res: AxiosResponse<{ uri: string }> = await pinataApi.post('/upload/file', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
}