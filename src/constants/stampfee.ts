// Centralized stamp fee percentages per deed/transaction type (percentage values)
export const STAMP_PERCENTAGE_BY_TYPE: Record<string, number> = {
  "Sale": 2,
  "Gift": 2,
  "Transfer": 2,
  "Exchange": 2,
  "Lease": 2,
  "Mortgage": 2,
  "Default": 2,
};

export const DEFAULT_STAMP_PERCENTAGE = 2;

export function getStampPercentage(type?: string) {
  if (!type) return DEFAULT_STAMP_PERCENTAGE;
  return STAMP_PERCENTAGE_BY_TYPE[type] ?? DEFAULT_STAMP_PERCENTAGE;
}
