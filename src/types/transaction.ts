export interface TransactionPayload {
  deedId: string;
  from: string;
  to: string;
  amount: number;
  share: number;
  type: string;
  hash?: string;
  blockchain_identification?: string;
  description?: string;
  status?: string;
}