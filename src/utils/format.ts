import type { RegisterDeedFormData } from "../types/registerdeedformdata";
import type { RegisterDeedRequest } from "../types/regitseringdeedtype";

export const shortAddress = (addr: string, left = 6, right = 4) =>
  addr.length > left + right ? `${addr.slice(0, left)}…${addr.slice(-right)}` : addr;

export const formatNumber = (n: number) =>
  Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(n);

export const formatCurrency = (n: number, currency: string = "USD") =>
  Intl.NumberFormat(undefined, { style: "currency", currency, maximumFractionDigits: 0 }).format(n);

export const timeAgo = (ts: number) => {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  const mo = Math.floor(d / 30);
  if (mo < 12) return `${mo}mo ago`;
  const y = Math.floor(mo / 12);
  return `${y}y ago`;
};

export const percentBarClass = (pct: number) => {
  if (pct >= 67) return "bg-green-600";
  if (pct >= 34) return "bg-yellow-500";
  return "bg-red-500";
};

export const compressAddress = (address : string) => {
  return `${address.slice(0, 6)}`+'...'+`${address.slice(-4)}`
};

export const deedRequestDataFormatter = (
  data: RegisterDeedFormData
): RegisterDeedRequest => {
  return {
    owners: [
      {
        address: data.ownerWalletAddress,
        share: 100,
      }], 
    location: [],
    deedType: {
      deedType: "Other",
      deedNumber: data.deedNumber,
    },
    value: 0,
    deedNumber: data.deedNumber,
    landType: data.landType === "" ? "Paddy land" : data.landType,
    timestamp: Date.now(),
    ownerFullName: data.ownerFullName,
    ownerNIC: data.ownerNIC,
    ownerAddress: data.ownerAddress,
    ownerPhone: data.ownerPhone,
    landTitleNumber: data.landTitleNumber,
    landAddress: data.landAddress,
    landArea: parseFloat(data.landArea) || 0,
    landSizeUnit: data.landSizeUnit,
    surveyPlanNumber: data.surveyPlanNumber || undefined,
    boundaries: data.boundaries || undefined,
    district: data.district,
    division: data.division,
    surveyAssigned: data.surveyor,
    notaryAssigned: data.notary,
    ivslAssigned: data.IVSL,
    registrationDate: new Date(data.registrationDate).toISOString(),
  };
};
