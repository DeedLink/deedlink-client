export interface Marketplace {
  _id?: string;
  marketPlaceId: string;
  from: string;
  to?: string;
  status?: "open_to_sale" | "pending_sale" | "sale_completed";
  amount: number;
  timestamp?: Date;
  deedId: string;
  tokenId: string;
  share: number;
  description?: string;
}
