export interface Title {
  _id?: string;
  deedId: string;
  from: string;
  to: string;
  status: "pending" | "completed" | "failed";
  hash?: string;
  blockchain_identification?: string;
  amount: number;
  type:
    | "gift"
    | "open_market"
    | "direct_transfer"
    | "closed"
    | "init"
    | "sale_transfer"
    | "escrow_sale";
  date?: string;
  description?: string;
  share: number;
  createdAt?: string;
  updatedAt?: string;
}
