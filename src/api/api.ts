import axios, { type AxiosResponse } from "axios";
import { getItem, setItem } from "../storage/storage";
import type { AuthResponse, KYCUploadResponse, LoginRequest, RegisterRequest, SetPasswordRequest, User, userPasswordStatusResponse, userStatusNotRegisteredResponse, userStatusResponse, VerifyKYCRequest } from "../types/types";
import type { RegisterDeedRequest } from "../types/regitseringdeedtype";
import type { IDeed } from "../types/responseDeed";
import type { TransactionPayload } from "../types/transaction";
import type { Marketplace } from "../types/marketplace";

// Later added when vercel testing
const isVercelTest = import.meta.env.VITE_VERCEL_TEST === true || import.meta.env.VITE_VERCEL_TEST === "true";
const serviceMapPassword = import.meta.env.VITE_SERVICE_MAP_PASSWORD || "";

export const API = {
  user: isVercelTest ? import.meta.env.VITE_VERCEL_USER_API_URL : import.meta.env.VITE_USER_API_URL,
  deed: isVercelTest ? import.meta.env.VITE_VERCEL_DEED_API_URL : import.meta.env.VITE_DEED_API_URL,
  tnx: isVercelTest ? import.meta.env.VITE_VERCEL_TNX_API_URL : import.meta.env.VITE_TNX_API_URL,
  pinata: isVercelTest ? import.meta.env.VITE_VERCEL_PINATA_API_URL : import.meta.env.VITE_PINATA_API_URL,
  survey: isVercelTest ? import.meta.env.VITE_VERCEL_SURVEY_PLAN_API_URL : import.meta.env.VITE_SURVEY_PLAN_API_URL,
  //notification: isVercelTest ? import.meta.env.VITE_VERCEL_NOTIFICATION_API_URL : import.meta.env.VITE_VERCEL_NOTIFICATION_API_URL,
  market: isVercelTest ? import.meta.env.VITE_MARKETPLACE_API_URL: import.meta.env.VITE_MARKETPLACE_API_URL,
  certificate: isVercelTest ? import.meta.env.VITE_CERTIFICATE_SERVICE_URL : import.meta.env.VITE_CERTIFICATE_SERVICE_URL,
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

    const token = getItem("local", "token") || "";
    
    const headers: Record<string, string> = {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    };

    if (isVercelTest && serviceMapPassword) {
      headers["x-service-map-password"] = serviceMapPassword;
    }
    const res: AxiosResponse<KYCUploadResponse> = await api.post(
        "/upload-kyc",
        formData,
        { headers }
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

// Upload profile picture (protected, multipart/form-data)
export const uploadProfilePicture = async (file: File): Promise<{ dp: string; user: User }> => {
  const formData = new FormData();
  formData.append("profilePicture", file);

  const token = getItem("local", "token") || "";
  const headers: Record<string, string> = {
    "Content-Type": "multipart/form-data",
    Authorization: `Bearer ${token}`,
  };

  if (isVercelTest && serviceMapPassword) {
    headers["x-service-map-password"] = serviceMapPassword;
  }

  const res: AxiosResponse<{ dp: string; user: User }> = await api.post(
    "/profile-picture",
    formData,
    { headers }
  );

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

  const headers: Record<string, string> = {
    'Content-Type': 'multipart/form-data',
  };

  if (isVercelTest && serviceMapPassword) {
    headers["x-service-map-password"] = serviceMapPassword;
  }

  const res: AxiosResponse<{ uri: string }> = await pinataApi.post('/upload/file', formData, {
    headers,
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
export const createTransaction = async (payload: TransactionPayload): Promise<any> => {
  const res = await tnxApi.post(`/`, payload);
  return res.data;
};

// Update tnx status by id
export const transactionStatus = async (blockchain_identification: string, status: string): Promise<any> => {
  const res = await tnxApi.post(`/status/${blockchain_identification}`, { status });
  return res.data;
};

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

// Update deed owners array (protected)
export const updateDeedOwners = async (
  deedId: string,
  owners: Array<{ address: string; share: number }>
): Promise<any> => {
  const res: AxiosResponse<any> = await deedApi.put(`/${deedId}/owners`, { owners });
  return res.data;
};

// Safe wrapper: if the deed service returns 404 for the owners update endpoint
// we queue the update locally so it can be retried later. This avoids leaving
// the frontend in an inconsistent state when the backend route is missing or
// temporarily unavailable.
export const updateDeedOwnersSafe = async (
  deedId: string,
  owners: Array<{ address: string; share: number }>
): Promise<any> => {
  try {
    return await updateDeedOwners(deedId, owners);
  } catch (err: any) {
    const status = err?.response?.status;
    const requestUrl = deedApi.getUri({ url: `/${deedId}/owners` });
    console.error("updateDeedOwners failed", { status, requestUrl, err });

    // If it's a 404, the backend route may not exist. Queue the update locally
    // so it can be retried by the client or an operator later.
    if (status === 404) {
      try {
        const pendingKey = "pendingOwnerUpdates" as any;
        const existing = getItem<any[]>("local", pendingKey) || [];
        existing.push({ deedId, owners, timestamp: Date.now(), requestUrl });
        setItem("local", pendingKey, existing);

        // Log a transaction record so this situation is visible in the tnx service
        try {
          await createTransaction({
            deedId,
            from: "",
            to: "",
            amount: 0,
            share: 0,
            type: "owner_update_failed",
            hash: "",
            description: "Owner update queued in client due to 404 response",
            status: "failed",
          } as any);
        } catch (logErr) {
          console.warn("Failed to log pending owner update transaction:", logErr);
        }

        return { queued: true };
      } catch (queueErr) {
        console.error("Failed to queue owner update:", queueErr);
        throw err;
      }
    }

    // For other errors, rethrow so callers can handle them as before.
    throw err;
  }
};

// Retry pending owner updates stored in localStorage. This can be called on app
// startup or manually from a diagnostics screen. Successful retries are removed
// from the queue.
export const processPendingOwnerUpdates = async (): Promise<{ success: number; failed: number }> => {
  const pendingKey = "pendingOwnerUpdates" as any;
  const list = getItem<any[]>("local", pendingKey) || [];
  if (!Array.isArray(list) || list.length === 0) return { success: 0, failed: 0 };

  const remaining: any[] = [];
  let success = 0;
  let failed = 0;

  for (const item of list) {
    try {
      await updateDeedOwners(item.deedId, item.owners);
      success++;
    } catch (e) {
      console.warn("Retry owner update failed for", item.deedId, e);
      remaining.push(item);
      failed++;
    }
  }

  try {
    setItem("local", pendingKey, remaining);
  } catch (e) {
    console.error("Failed to persist pending owner updates:", e);
  }

  return { success, failed };
};

//Notification API

// const notificationApi = axios.create({
//   baseURL: API.notification,
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// export const sendNotification =(data: any)=>{
//   return "ok";
// }

// MarketPlace API

const marketplaceApi = axios.create({
  baseURL: API.market,
  headers: {
    "Content-Type": "application/json",
  },
});


// Get all marketplaces
export const getMarketPlaces = async (): Promise<Marketplace[]> => {
  const res: AxiosResponse<Marketplace[]> = await marketplaceApi.get("/");
  return res.data;
};

// Get marketplace by ID
export const getMarketPlaceById = async (id: string): Promise<Marketplace> => {
  const res: AxiosResponse<Marketplace> = await marketplaceApi.get(`/${id}`);
  return res.data;
};

// Create a new marketplace
export const createMarketPlace = async (marketplaceData: Omit<Marketplace, "_id" | "timestamp" | "status">): Promise<Marketplace> => {
  const res: AxiosResponse<Marketplace> = await marketplaceApi.post("/", marketplaceData);
  return res.data;
};

// update an existing marketplace
export const updateMarketPlace = async (id: string, marketplaceData: Partial<Marketplace>): Promise<Marketplace> => {
  const res: AxiosResponse<Marketplace> = await marketplaceApi.put(`/${id}`, marketplaceData);
  return res.data;
};

// Delete a marketplace by ID
export const deleteMarketPlace = async (id: string): Promise<{ message: string }> => {
  const res: AxiosResponse<{ message: string }> = await marketplaceApi.delete(`/${id}`);
  return res.data;
};

// Get marketplace by Deed ID
export const getMarketPlaceByDeedId = async (deedId: string): Promise<Marketplace[]> => {
  const res: AxiosResponse<Marketplace[]> = await marketplaceApi.get(`/deed/${deedId}`);
  return res.data;
};

// Get marketplace by Token ID
export const getMarketPlaceByTokenId = async (tokenId: string): Promise<Marketplace[]> => {
  const res: AxiosResponse<Marketplace[]> = await marketplaceApi.get(`/token/${tokenId}`);
  return res.data;
};

// Delete marketplaces by Deed ID
export const deleteMarketPlacesById = async (marketPlaceId: string): Promise<{ message: string }> => {
  const res: AxiosResponse<{ message: string }> = await marketplaceApi.delete(`/${marketPlaceId}`);
  return res.data;
};

// Certificate related api calls

const certificateApi = axios.create({
  baseURL: API.certificate,
  headers: {
    "Content-Type": "application/json",
  },
});

certificateApi.interceptors.request.use((config) => {
  const token = getItem("local", "token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return withVercelHeaders(config);
});

// Create certificate
export const createCertificate = async (payload: any) => {
  const res = await certificateApi.post("/", payload);
  return res.data;
};

// List certificates with pagination + filtering + search
export const listCertificates = async ({
  type,
  q,
  page = 1,
  limit = 20,
}: {
  type?: string;
  q?: string;
  page?: number;
  limit?: number;
}) => {
  const res = await certificateApi.get("/", {
    params: { type, q, page, limit },
  });
  return res.data;
};

// Get certificate by ID
export const getCertificateById = async (id: string) => {
  const res = await certificateApi.get(`/${id}`);
  return res.data;
};

// Update certificate
export const updateCertificate = async (id: string, payload: any) => {
  const res = await certificateApi.put(`/${id}`, payload);
  return res.data;
};

// Delete certificate
export const deleteCertificate = async (id: string) => {
  const res = await certificateApi.delete(`/${id}`);
  return res.data;
};

// Get certificates by token ID
export const getCertificatesByTokenId = async (tokenId: number) => {
  const res = await certificateApi.get(`/token/${tokenId}`);
  return res.data;
};