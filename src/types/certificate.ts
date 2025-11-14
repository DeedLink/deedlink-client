export interface Certificate {
  _id: string;
  type: "power_of_attorney" | "last_will" | "rent_agreement" | "other";
  title: string;
  description?: string;
  parties: { name: string; role: string; contact: string }[];
  data: any;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}
