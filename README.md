# DeedLink — Web Client

This repository is the React + TypeScript frontend for the DeedLink application (Vite-based). It provides the user interface for viewing deeds, registering new deeds, interacting with the marketplace, and performing on-chain actions (fractionalization, transfers, escrow flows) via the built-in web3 helpers.

Quick overview
- **Framework**: React + TypeScript with Vite
- **Styling**: Tailwind CSS
- **Web3**: Ethers-based helpers in `src/web3.0/` (factory/property/FT helpers)
- **API**: Axios-based API clients under `src/api/`

Important files & locations
- `src/pages/DeedRegistrationPage.tsx` — page that opens the deed registration popup.
- `src/components/deed-registration/DeedRegistrationPopup.tsx` — the registration form UI used to submit new deeds.
- `src/constants/sriLankaLocations.ts` — Sri Lankan districts and divisional secretariat lists (used by the registration form).
- `src/hooks/useDeedData.ts` — shared hook that fetches deed details, fractional token info, and marketplace data.
- `src/web3.0/contractService.ts` — on-chain helpers for fractionalization, balances, transfers and factory interactions.

Setup (development)

1. Install dependencies

```bash
yarn install
```

2. Copy environment variables

Create a `.env` or set the following variables in your environment (example keys used by the app):

```
VITE_PROPERTY_NFT_ADDRESS=0x...
VITE_FACTORY_ADDRESS=0x...
VITE_RPC_URL=https://...
```

3. Start dev server

```bash
yarn dev
```

Build / production

```bash
yarn build
```

Notes on the Deed Registration form
- The registration form uses district/division constants defined in `src/constants/sriLankaLocations.ts`.
- The form exposes two select boxes: `district` and `division`. When a district is selected, `division` options are populated from `SRI_LANKA_DIVISIONS_BY_DISTRICT`.
- If you need to update the district or division lists, edit `src/constants/sriLankaLocations.ts`. The app reads the arrays at runtime and will update automatically after a rebuild.

Web3 and fractionalization tips
- Fractionalization is handled by `createFractionalToken` in `src/web3.0/contractService.ts`.
- After fractionalization the UI polls for the mapping from NFT to fractional token and then reads the user's fractional token balance; see `useDeedData.pollForFractionalization`.

Testing the registration flow
- Open the Deed Registration page in the app and fill the form. The district select uses `SRI_LANKA_DISTRICTS` and the division select uses `SRI_LANKA_DIVISIONS_BY_DISTRICT`.
- Payment of the registration fee is performed via `src/web3.0/stampService.ts` and the UI expects a successful on-chain payment before submitting the deed data.

Contributing
- Follow existing code style and TypeScript patterns.
- If you add or change location constants, prefer updating `src/constants/sriLankaLocations.ts` and avoid hardcoding locations in components.

If you want, I can add a small script to validate the locations JSON or provide a compact TypeScript type for the constants; tell me which you'd prefer.
