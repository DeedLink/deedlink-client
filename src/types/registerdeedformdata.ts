export interface RegisterDeedFormData {
  ownerFullName: string;
  ownerNIC: string;
  ownerAddress: string;
  ownerPhone: string;
  landTitleNumber: string;
  landAddress: string;
  landArea: string;
  landSizeUnit: "Perches"| "Acres"| "Hectares"| "Sqm"| "Sqft";
  landType: "Paddy land" | "Highland" | "";
  surveyPlanNumber: string;
  boundaries: string;
  district: string;
  division: string;
  deedNumber: string;
  notary: string;
  IVSL: string;
  surveyor: string;
  registrationDate: string;
  deedDocument: File | null;
  titleDocument: File | null;
}
