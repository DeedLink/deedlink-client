export interface QRData {
  deedId: string;
  escrowAddress: string;
  seller: string;
  hash?: string;
}

export type QRPermissionType = "public" | "restricted" | "owner_only";

export interface DeedQRData {
  qrId: string;
  deedId: string;
  tokenId?: number;
  deedNumber: string;
  permissionType: QRPermissionType;
  allowedAddresses?: string[];
  encryptedData: string;
}

export interface QRCodeResponse {
  success: boolean;
  qrCode: {
    qrId: string;
    deedId: string;
    tokenId?: number;
    deedNumber: string;
    permissionType: QRPermissionType;
    allowedAddresses: string[];
    createdAt: string;
    updatedAt?: string;
  };
  encryptedData: string;
}

export interface QRPermissionCheckResponse {
  success: boolean;
  hasAccess: boolean;
  reason: string;
  permissionType: QRPermissionType;
  qrId: string;
}

export interface QRDeedResponse {
  success: boolean;
  deed: any;
  qrCode: {
    qrId: string;
    permissionType: QRPermissionType;
    createdAt: string;
  };
}

export interface MyQRCodesResponse {
  success: boolean;
  qrCodes: Array<{
    qrId: string;
    deedId: string;
    tokenId?: number;
    deedNumber: string;
    permissionType: QRPermissionType;
    allowedAddresses: string[];
    encryptedData?: string;
    createdAt: string;
    updatedAt?: string;
  }>;
}