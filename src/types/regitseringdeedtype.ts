export interface Transaction {
  from: string;
  to: string;
  amount: number;
  share: number;
  timestamp: number;
}

export interface Owner {
  address: string;
  share: number;
}

export interface LocationPoint {
  longitude: number;
  latitude: number;
}

export interface Sides {
  North?: string;
  South?: string;
  East?: string;
  West?: string;
}

export interface DeedType {
  deedType:
    | "Power of Attorney"
    | "Gift"
    | "Sale"
    | "Exchange"
    | "Lease"
    | "Mortgage"
    | "Partition Deed"
    | "Last Will"
    | "Trust Deed"
    | "Settlement Deed"
    | "Declaration of Trust"
    | "Agreement to Sell"
    | "Conditional Transfer"
    | "Transfer Deed"
    | "Deed of Assignment"
    | "Deed of Disclaimer"
    | "Deed of Rectification"
    | "Deed of Cancellation"
    | "Deed of Surrender"
    | "Deed of Release"
    | "Deed of Nomination"
    | "Affidavit"
    | "Court Order / Judgment"
    | "Other";
  deedNumber: string;
}

export interface RegisterDeedRequest {
  title?: Transaction[];
  owners: Owner[];
  deedType: DeedType;
  value: number;
  location: LocationPoint[];
  sides?: Sides;
  deedNumber: string;
  landType: "Paddy land" | "Highland";
  timestamp: number;

  ownerFullName: string;
  ownerNIC: string;
  ownerAddress: string;
  ownerPhone: string;

  landTitleNumber: string;
  landAddress: string;
  landArea: number;
  landSizeUnit?: "Perches" | "Acres" | "Hectares";
  surveyPlanNumber?: string;
  boundaries?: string;

  district: string;
  division: string;

  registrationDate: string;
}
