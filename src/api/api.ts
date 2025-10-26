import axios, { type AxiosResponse } from "axios";
import { getItem, setItem } from "../storage/storage";
import type { AuthResponse, KYCUploadResponse, LoginRequest, RegisterRequest, SetPasswordRequest, User, userPasswordStatusResponse, userStatusNotRegisteredResponse, userStatusResponse, VerifyKYCRequest } from "../types/types";
import type { RegisterDeedRequest } from "../types/regitseringdeedtype";
import type { IDeed } from "../types/responseDeed";

// Later added when vercel testing
const isVercelTest = import.meta.env.VITE_VERCEL_TEST === "true";
const serviceMapPassword = import.meta.env.VITE_SERVICE_MAP_PASSWORD || "";

export const API = {
  user: isVercelTest
    ? import.meta.env.VITE_VERCEL_USER_API_URL
    : import.meta.env.VITE_USER_API_URL,
  deed: isVercelTest
    ? import.meta.env.VITE_VERCEL_DEED_API_URL
    : import.meta.env.VITE_DEED_API_URL,
  tnx: isVercelTest
    ? import.meta.env.VITE_VERCEL_TNX_API_URL
    : import.meta.env.VITE_TNX_API_URL,
  pinata: isVercelTest
    ? import.meta.env.VITE_VERCEL_PINATA_API_URL
    : import.meta.env.VITE_PINATA_API_URL,
  survey: isVercelTest
    ? import.meta.env.VITE_VERCEL_SURVEY_PLAN_API_URL
    : import.meta.env.VITE_SURVEY_PLAN_API_URL,
};

console.log("isVercelTest:", isVercelTest);


function withVercelHeaders(config: any) {
  if (isVercelTest && serviceMapPassword) {
    config.headers["x-service-map-password"] = serviceMapPassword;
  }
  return config;
}



const api = axios.create({
  baseURL: API.user,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = getItem("local", "token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return withVercelHeaders(config);
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
  baseURL: API.deed,
  headers: {
    "Content-Type": "application/json",
  },
});

deedApi.interceptors.request.use((config) => {
  const token = getItem("local", "token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return withVercelHeaders(config);
});

// Register a deed (protected)
export const registerDeed = async (data: RegisterDeedRequest) => {
  console.log("Registering deed with data:", data);
  const res: AxiosResponse = await deedApi.post("/", data);
  return res;
};

// Register a deed (protected)
export const updateTokenId = async (deedNumber: string, tokenId: string) => {
  console.log("Registering deed with data:", {deedNumber, tokenId});
  const res: AxiosResponse = await deedApi.post("/set-token", {deedNumber, tokenId});
  return res;
};

// Get deeds by owner ID (protected)
export const getDeedsByOwner = async (ownerId: string): Promise<IDeed[]> => {
  const res: AxiosResponse<any[]> = await deedApi.get(`/owner/${ownerId}`);
  return res.data;
};

// Get deed by ID (protected)
export const getDeedById = async (deedId: string): Promise<any> => {
  const res: AxiosResponse<any> = await deedApi.get(`/${deedId}`);
  return res.data;
};

// Get deed by ID (protected)
export const getDeedByDeedNumber = async (deedNumber: string): Promise<any> => {
  const res: AxiosResponse<any> = await deedApi.get(`/deed/${deedNumber}`);
  return res.data;
};

// Add transaction to a deed (protected)
export const addTransactionToDeed = async (
  deedId: string,
  from: string,
  to: string,
  amount: number,
  share: number
): Promise<any> => {
  const res: AxiosResponse<any> = await deedApi.post(`/${deedId}/transaction`, {
    from,
    to,
    amount,
    share,
  });
  return res.data;
};

// -------------------- Pinata API Calls --------------------

const pinataApi = axios.create({
  baseURL: API.pinata,
  headers: {
    "Content-Type": "application/json",
  },
});

pinataApi.interceptors.request.use((config) => {
  return withVercelHeaders(config);
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

// Request Valuation (Owner)
export const requestValuation = async (
  id: string,
  requestedValue: number
): Promise<any> => {
  const res = await deedApi.post(`/ivsl/${id}`, {
    requestedValue,
    mode: "request",
  });
  return res.data;
};

// Plan related api calls
const planApi = axios.create({
  baseURL: API.survey,
  headers: {
    "Content-Type": "application/json",
  },
});

planApi.interceptors.request.use((config) => {
  const token = getItem("local", "token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return withVercelHeaders(config);
});

// Get plan by deed ID (protected)
export const getPlanByDeedNumber = async (deedNumber: string): Promise<any> => {
  const res = await planApi.get(`/deed/${deedNumber}`, {
    validateStatus: () => true,
  });
  return res.data;
};

// Get plan by plan number (protected)
export const getPlanByPlanNumber = async (planId: string): Promise<any> => {
  const res = await planApi.get(`/plan/${planId}`, {
    validateStatus: () => true,
  });
  return res.data;
};

// Transaction related api calls

const tnxApi = axios.create({
  baseURL: API.tnx,
  headers: {
    "Content-Type": "application/json",
  },
});

tnxApi.interceptors.request.use((config) => {
  const token = getItem("local", "token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return withVercelHeaders(config);
});

// Get transactions by deed ID (protected)
export const getTransactionsByDeedId = async (deedId: string): Promise<any[]> => {
  const res = await tnxApi.get(`/deed/${deedId}`, {
    validateStatus: () => true,
  });
  return res.data;
};

// Get transaction by transaction ID (protected)
export const getTransactionById = async (tnxId: string): Promise<any> => {
  const res = await tnxApi.get(`/transaction/${tnxId}`, {
    validateStatus: () => true,
  });
  return res.data;
};

// Create a new transaction (protected)
export const createTransaction = async (
  deedId: string,
  from: string,
  to: string,
  amount: number,
  share: number,
  hash: string,
  type: string,
  description?: string
): Promise<any> => {
  const res = await tnxApi.post(`/`, {
    deedId,
    from,
    to,
    amount,
    share,
    hash,
    description,
    type
  });
  return res.data;
}

// Update deed owner address (protected)
export const updateOwnerAddress = async (
  tokenId: number,
  newOwnerAddress: string
): Promise<any> => {
  const res: AxiosResponse<any> = await deedApi.put(`/update-owner/${tokenId}`, {
    newOwnerAddress,
  });
  return res.data;
};

// Update deed full owner address (protected)
export const updateFullOwnerAddress = async (
  tokenId: number,
  newOwnerAddress: string,
  newOwnerFullName?: string,
  newOwnerNIC?: string,
  newOwnerAddressDetail?: string,
  newOwnerPhone?: string
): Promise<any> => {
  const res: AxiosResponse<any> = await deedApi.put(`/update-full-owner/${tokenId}`, {
    newOwnerAddress,
    newOwnerFullName,
    newOwnerNIC,
    newOwnerAddressDetail,
    newOwnerPhone
  });
  return res.data;
};
