import type { Deed, RequestRegisteringDeed, Token } from "../types/types";

export const LAND_TYPES = [
  "Paddy land",
  "Chena",
  "Highland",
  "Residential",
  "Commercial",
  "Industrial",
  "Tea plantation",
  "Rubber plantation",
  "Coconut plantation",
  "Garden/Plantation",
  "Forest/Reserve",
  "Wetland/Marsh",
  "State land",
  "Mixed use",
  "Other"
];

export const DEED_TYPES = [
  "Power of Attorney",
  "Gift",
  "Sale",
  "Exchange",
  "Lease",
  "Mortgage",
  "Partition Deed",
  "Last Will",
  "Trust Deed",
  "Settlement Deed",
  "Declaration of Trust",
  "Agreement to Sell",
  "Conditional Transfer",
  "Transfer Deed",
  "Deed of Assignment",
  "Deed of Disclaimer",
  "Deed of Rectification",
  "Deed of Cancellation",
  "Deed of Surrender",
  "Deed of Release",
  "Deed of Nomination",
  "Affidavit",
  "Court Order / Judgment",
  "Other"
];

export const contact = {
  location: {
    line1: "Registrar Department",
    line2: "123/A1",
    line3: "Main Road",
    line4: "Galle",
    line5: "Sri Lanka",
  },
  mail: "info@deedlink.gov.lk",
  telephone: "+94 000 000 000",
};

export const about = {
  logo: "",
  title: "DEED LINK",
  discription:
    "Streamlining Deeds with Digital Security for easy access and reliable records.",
  stats: {
    properties: 1247,
    users: 3856,
    transactions: 2193,
    value: 450, // in millions
  },
};

// Registration Fees (in ETH)
export const REGISTRATION_FEES = {
  GOVERNMENT_FEE: 0.01, // Government fee
  IVSL_FEE: 0.005,      // IVSL fee
  SURVEY_FEE: 0.005,    // Survey fee
  NOTARY_FEE: 0.005,    // Notary fee
};

// Total registration fee
export const TOTAL_REGISTRATION_FEE = 
  REGISTRATION_FEES.GOVERNMENT_FEE +
  REGISTRATION_FEES.IVSL_FEE +
  REGISTRATION_FEES.SURVEY_FEE +
  REGISTRATION_FEES.NOTARY_FEE;

// Developers information
export const DEVELOPERS = [
  {
    id: "1",
    name: "Rasindu Dulshan Siriwardhana",
    role: "Full Stack Developer & System Architect",
    bio: "Created the complete DeedLink platform including backend services, smart contracts, and frontend applications. Led system architecture, Web3 integration, microservices, and API development from conception to implementation.",
    github: "https://github.com/DulshanSiriwardhana",
  },
  {
    id: "2",
    name: "Seran Vishwa Sovis",
    role: "Smart Contract & Backend Developer",
    bio: "Developed smart contracts and notification services while implementing key features across client applications. Focused on creating secure blockchain solutions that enhance platform functionality and user experience.",
    github: "https://github.com/VishSeran",
  },
  {
    id: "3",
    name: "Udeshi Imasha",
    role: "UI/UX Designer & Frontend Developer",
    bio: "Designed intuitive user interfaces and implemented frontend features for enhanced user experience. Specialized in creating responsive and accessible designs that simplify complex blockchain interactions for all users.",
    github: "https://github.com/Udeshiimasha",
  },
  {
    id: "4",
    name: "Madhavi Hindagoda",
    role: "UI/UX Designer & Frontend Developer",
    bio: "Created beautiful and functional user interfaces while developing client application features. Committed to delivering exceptional user experiences through thoughtful design and seamless frontend implementation.",
    github: "https://github.com/MadhaviHindagoda",
  },
];

export const SAMPLE_DEEDS: Deed[] = [
  {
    _id: "1",
    deedNumber: "A-2024-0001",
    landType: "Highland",
    title: [
      {
        _id: "t1",
        from: "0xAAAAAA1111111111111111111111111111111111",
        to: "0xBBBBBB2222222222222222222222222222222222",
        amount: 120000,
        share: 100,
        timestamp: Date.now() - 1000 * 60 * 60 * 24 * 400,
      },
      {
        _id: "t2",
        from: "0xBBBBBB2222222222222222222222222222222222",
        to: "0x1234567890abcdef1234567890abcdef12345678",
        amount: 220000,
        share: 60,
        timestamp: Date.now() - 1000 * 60 * 60 * 24 * 200,
      },
    ],
    owners: [
      { address: "0x1234567890abcdef1234567890abcdef12345678", share: 60 },
      { address: "0x9999999999999999999999999999999999999999", share: 40 },
    ],
    signedby: "0xFEDcba0987654321FEDcba0987654321FEDcba09",
    area: 550.2,
    value: 420000,
    location: [
      { latitude: 6.9271, longitude: 79.8612 },
      { latitude: 6.9273, longitude: 79.8616 },
      { latitude: 6.9269, longitude: 79.8619 },
      { latitude: 6.9267, longitude: 79.8613 },
    ],
    sides: [
      { direction: "North", deedNumber: "A-2023-0555" },
      { direction: "South", deedNumber: "A-2020-0999" },
      { direction: "East", deedNumber: "A-2018-0021" },
      { direction: "West", deedNumber: "A-2017-0042" },
    ],
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 30,
  },
  {
    _id: "2",
    deedNumber: "B-2021-3410",
    landType: "Paddy land",
    title: [],
    owners: [
      { address: "0x1234567890abcdef1234567890abcdef12345678", share: 100 },
    ],
    signedby: "0x1111111111111111111111111111111111111111",
    area: 1200,
    value: 980000,
    location: [
      { latitude: 7.2920, longitude: 80.6335 },
      { latitude: 7.2915, longitude: 80.6343 },
      { latitude: 7.2905, longitude: 80.6343 },
      { latitude: 7.2900, longitude: 80.6335 },
      { latitude: 7.2905, longitude: 80.6327 },
      { latitude: 7.2915, longitude: 80.6327 },
    ],

    sides: [
      { direction: "North", deedNumber: "C-2019-1200" },
      { direction: "South", deedNumber: "C-2018-9999" },
      { direction: "East", deedNumber: "C-2017-7777" },
      { direction: "West", deedNumber: "C-2016-3333" },
    ],
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 400,
  },
  {
    _id: "3",
    deedNumber: "C-2020-7777",
    landType: "Highland",
    title: [],
    owners: [
      {
        address: "0xAAAAAA1111111111111111111111111111111111",
        share: 30,
      },
      {
        address: "0x1234567890abcdef1234567890abcdef12345678",
        share: 70,
      },
    ],
    signedby: "0x2222222222222222222222222222222222222222",
    area: 300.5,
    value: 250000,
    location: [
      { latitude: 6.0535, longitude: 80.2210 },
      { latitude: 6.0537, longitude: 80.2213 },
      { latitude: 6.0533, longitude: 80.2214 },
      { latitude: 6.0532, longitude: 80.2211 },
    ],
    sides: [
      { direction: "North", deedNumber: "D-2010-1111" },
      { direction: "South", deedNumber: "D-2010-2222" },
      { direction: "East", deedNumber: "D-2010-3333" },
      { direction: "West", deedNumber: "D-2010-4444" },
    ],
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 800,
  },
  {
    _id: "4",
    deedNumber: "D-2022-5555",
    landType: "Paddy land",
    title: [
      {
        _id: "t3",
        from: "0x3333333333333333333333333333333333333333",
        to: "0x1234567890abcdef1234567890abcdef12345678",
        amount: 500000,
        share: 100,
        timestamp: Date.now() - 1000 * 60 * 60 * 24 * 100,
      },
    ],
    owners: [
      { address: "0x1234567890abcdef1234567890abcdef12345678", share: 100 },
    ],
    signedby: "0x4444444444444444444444444444444444444444",
    area: 750,
    value: 650000,
    location: [
      { latitude: 6.905, longitude: 79.864 },
      { latitude: 6.9053, longitude: 79.8644 },
      { latitude: 6.9048, longitude: 79.8646 },
      { latitude: 6.9046, longitude: 79.8641 },
    ],
    sides: [
      { direction: "North", deedNumber: "D-2020-0010" },
      { direction: "South", deedNumber: "D-2019-0020" },
      { direction: "East", deedNumber: "D-2018-0030" },
      { direction: "West", deedNumber: "D-2017-0040" },
    ],
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 50,
  },
];

export const CURRENT_USER = "0x1234567890abcdef1234567890abcdef12345678";

export const sampleTokens: Token[] = [
  {
    id: "1",
    deedNumber: "A-2024-0001",
    type: "NFT",
    owner: "0x9999999999999999999999999999999999999999",
    price: 50000,
  },
  {
    id: "2",
    deedNumber: "A-2024-0001",
    type: "FT",
    owner: "0x1234567890abcdef1234567890abcdef12345678",
    share: 60,
    price: 25000,
    isMine: true,
  },
  {
    id: "3",
    deedNumber: "C-2020-7777",
    type: "FT",
    owner: "0xAAAAAA1111111111111111111111111111111111",
    share: 30,
    price: 12000,
  },
  {
    id: "4",
    deedNumber: "D-2022-5555",
    type: "NFT",
    owner: "0x1234567890abcdef1234567890abcdef12345678",
    price: 70000,
    isMine: true,
  },
];

export const mockDeeds: RequestRegisteringDeed[] = [
  { id: "D001", owner: "Alice Smith", address: "123 Green St", status: "Pending" },
  { id: "D002", owner: "Bob Johnson", address: "45 Maple Ave", status: "Approved" },
  { id: "D003", owner: "Catherine Lee", address: "78 Pine Rd", status: "Approved" },
  { id: "D004", owner: "David Kim", address: "90 Oak Blvd", status: "Rejected" },
  { id: "D005", owner: "Eve Williams", address: "12 Elm St", status: "Pending" },
  { id: "D006", owner: "Frank Brown", address: "99 Cedar Ln", status: "Pending" },
];