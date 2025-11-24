import type { Certificate } from "../types/certificate";

type CertificateResponse =
  | Certificate
  | Certificate[]
  | { data?: Certificate | Certificate[] | null }
  | null
  | undefined;

const isCertificate = (value: unknown): value is Certificate => {
  return (
    typeof value === "object" &&
    value !== null &&
    "_id" in value &&
    typeof (value as { _id?: unknown })._id === "string"
  );
};

export const normalizeCertificateResponse = (
  response: CertificateResponse
): Certificate | null => {
  if (!response) return null;

  if (Array.isArray(response)) {
    return response.length > 0 ? response[0] : null;
  }

  if (isCertificate(response)) {
    return response;
  }

  if (typeof response === "object" && response !== null && "data" in response) {
    const data = (response as { data?: Certificate | Certificate[] | null }).data;
    if (!data) return null;
    if (Array.isArray(data)) {
      return data.length > 0 ? data[0] : null;
    }
    if (isCertificate(data)) {
      return data;
    }
  }

  return null;
};

