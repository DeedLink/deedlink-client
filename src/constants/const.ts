import type { Deed, Token } from "../types/types";

export const contact = {
    location: {
        line1: "Registrar Department",
        line2: "123/A1",
        line3: "Main Road",
        line4: "Galle",
        line5: "Sri Lanka"
    },
    mail: "info@deedlink.gov.lk",
    telephone: "+94 000 000 000"
}

export const about = {
    logo: "",
    title: "DEED REGISTRY",
    discription: "Streamlining Deeds with Digital Security for easy access and reliable records."
}

export const SAMPLE_DEEDS: Deed[] = [
  {
    _id: "1",
    deedNumber: "A-2024-0001",
    title: [
      { _id: "t1", from: "0xAAAAAA1111111111111111111111111111111111", to: "0xBBBBBB2222222222222222222222222222222222", amount: 120000, share: 100, timestamp: Date.now() - 1000 * 60 * 60 * 24 * 400 },
      { _id: "t2", from: "0xBBBBBB2222222222222222222222222222222222", to: "0x1234567890abcdef1234567890abcdef12345678", amount: 220000, share: 60, timestamp: Date.now() - 1000 * 60 * 60 * 24 * 200 },
    ],
    owners: [
      { address: "0x1234567890abcdef1234567890abcdef12345678", share: 60 },
      { address: "0x9999999999999999999999999999999999999999", share: 40 },
    ],
    signedby: "0xFEDcba0987654321FEDcba0987654321FEDcba09",
    area: 550.2,
    value: 420000,
    location: { latitude: 6.9271, longitude: 79.8612 },
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
    title: [],
    owners: [
      { address: "0x1234567890abcdef1234567890abcdef12345678", share: 100 },
    ],
    signedby: "0x1111111111111111111111111111111111111111",
    area: 1200,
    value: 980000,
    location: { latitude: 7.2906, longitude: 80.6337 },
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
    title: [],
    owners: [
      { address: "0xAAAAAA1111111111111111111111111111111111", share: 30 },
      { address: "0x1234567890abcdef1234567890abcdef12345678", share: 70 },
    ],
    signedby: "0x2222222222222222222222222222222222222222",
    area: 300.5,
    value: 250000,
    location: { latitude: 6.0535, longitude: 80.2210 },
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
    title: [
      { _id: "t3", from: "0x3333333333333333333333333333333333333333", to: "0x1234567890abcdef1234567890abcdef12345678", amount: 500000, share: 100, timestamp: Date.now() - 1000 * 60 * 60 * 24 * 100 },
    ],
    owners: [
      { address: "0x1234567890abcdef1234567890abcdef12345678", share: 100 },
    ],
    signedby: "0x4444444444444444444444444444444444444444",
    area: 750,
    value: 650000,
    location: { latitude: 6.905, longitude: 79.864 },
    sides: [
      { direction: "North", deedNumber: "D-2020-0010" },
      { direction: "South", deedNumber: "D-2019-0020" },
      { direction: "East", deedNumber: "D-2018-0030" },
      { direction: "West", deedNumber: "D-2017-0040" },
    ],
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 50,
  },
  {
    _id: "5",
    deedNumber: "E-2023-1122",
    title: [],
    owners: [
      { address: "0x5555555555555555555555555555555555555555", share: 50 },
      { address: "0x1234567890abcdef1234567890abcdef12345678", share: 50 },
    ],
    signedby: "0x6666666666666666666666666666666666666666",
    area: 980,
    value: 870000,
    location: { latitude: 7.2906, longitude: 81.6337 },
    sides: [
      { direction: "North", deedNumber: "E-2020-0100" },
      { direction: "South", deedNumber: "E-2020-0200" },
      { direction: "East", deedNumber: "E-2020-0300" },
      { direction: "West", deedNumber: "E-2020-0400" },
    ],
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 150,
  },
  {
    _id: "6",
    deedNumber: "F-2024-9900",
    title: [
      { _id: "t4", from: "0x7777777777777777777777777777777777777777", to: "0x8888888888888888888888888888888888888888", amount: 300000, share: 100, timestamp: Date.now() - 1000 * 60 * 60 * 24 * 60 },
    ],
    owners: [
      { address: "0x8888888888888888888888888888888888888888", share: 60 },
      { address: "0x1234567890abcdef1234567890abcdef12345678", share: 40 },
    ],
    signedby: "0x9999999999999999999999999999999999999999",
    area: 420.5,
    value: 380000,
    location: { latitude: 6.927, longitude: 79.872 },
    sides: [
      { direction: "North", deedNumber: "F-2023-1001" },
      { direction: "South", deedNumber: "F-2022-1002" },
      { direction: "East", deedNumber: "F-2021-1003" },
      { direction: "West", deedNumber: "F-2020-1004" },
    ],
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 20,
  },
];

export const CURRENT_USER = "0x1234567890abcdef1234567890abcdef12345678";

export const sampleTokens: Token[] = [
  { id: "1", deedNumber: "A-2024-0001", type: "NFT", owner: "0xAAAA...1111", price: 50000, isMine: true },
  { id: "2", deedNumber: "B-2024-0002", type: "FT", owner: "0xBBBB...2222", share: 25, price: 15000 },
  { id: "3", deedNumber: "C-2024-0003", type: "FT", owner: "0xCCCC...3333", share: 10, price: 6000 },
  { id: "4", deedNumber: "D-2024-0004", type: "NFT", owner: "0xDDDD...4444", price: 70000 },
  { id: "5", deedNumber: "E-2024-0005", type: "FT", owner: "0xEEEE...5555", share: 50, price: 30000, isMine: true },
];