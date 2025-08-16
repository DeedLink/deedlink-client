export type Address = string;

export type Directions = "North" | "South" | "East" | "West";

export interface Tnx {
  _id: string;
  from: Address;
  to: Address;
  amount: number;
  share: number;
  timestamp: number; 
}

export interface Owner {
  address: Address;
  share: number;
}

export interface Location {
  longitude: number;
  latitude: number;
}

export interface Side {
  direction: Directions;
  deedNumber: string;
}

export interface Deed {
  _id: string;
  title: Tnx[]; 
  owners: Owner[];
  signedby: Address;
  area: number;
  value: number; 
  location: Location;
  sides: Side[];
  deedNumber: string;
  timestamp: number;
}

export interface Token {
  id: string;
  deedNumber: string;
  type: "NFT" | "FT";
  owner: string;
  share?: number;
  price: number;
  isMine?: boolean;
}