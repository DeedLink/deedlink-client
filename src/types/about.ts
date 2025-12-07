export interface AboutPageData {
  title: string;
  description: string;
  logo?: string;
  stats: {
    properties: number;
    users: number;
    transactions: number;
    value: number; // in millions
  };
}

export interface Developer {
  id: string;
  name: string;
  role: string;
  bio: string;
  image?: string;
  email?: string;
  github?: string;
  linkedin?: string;
  portfolio?: string;
}

