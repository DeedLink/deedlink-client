import type { /*IDeed ,*/ ILocationPoint } from "../types/responseDeed";
//import type { Deed } from "../types/types";

/*
export const convertIDeedToDeed = (iDeed: IDeed): Deed => {
  const latestValue = iDeed.valuation && iDeed.valuation.length > 0
    ? iDeed.valuation.slice().sort((a, b) => b.timestamp - a.timestamp)[0]?.estimatedValue || 0
    : 0;

  const location = iDeed.location || [];

  const sides = iDeed.sides 
    ? Object.entries(iDeed.sides).map(([direction, deedNumber]) => ({
        direction,
        deedNumber: deedNumber || ""
      }))
    : [];

  return {
    _id: iDeed._id,
    deedNumber: iDeed.deedNumber,
    signedby: iDeed.owners[0]?.address || "",
    timestamp: iDeed.timestamp,
    owners: iDeed.owners,
    title: iDeed.title || [],
    value: latestValue,
    area: iDeed.landArea,
    landType: iDeed.landType,
    location: location,
    sides: Any
  };
};
*/

export const getCenterOfLocations = (locations: ILocationPoint[]) => {
  if (!locations || locations.length === 0) return null;

  const sum = locations.reduce(
    (acc, loc) => ({
      latitude: acc.latitude + loc.latitude,
      longitude: acc.longitude + loc.longitude,
    }),
    { latitude: 0, longitude: 0 }
  );

  return {
    latitude: sum.latitude / locations.length,
    longitude: sum.longitude / locations.length,
  };
};

export const convertArea = (
  area: number,
  fromUnit: string,
  toUnit: string
): number => {
  const conversions: Record<string, number> = {
    "Sqm": 1,
    "Square Meter": 1,
    "Sqft": 0.092903,
    "Square Foot": 0.092903,
    "Perches": 25.293,
    "Acres": 4046.86,
    "Hectares": 10000,
  };

  const fromValue = conversions[fromUnit] || 1;
  const toValue = conversions[toUnit] || 1;

  return (area * fromValue) / toValue;
};

export const formatAreaWithUnit = (
  area: number,
  unit?: string
): string => {
  const unitMap: Record<string, string> = {
    "Sqm": "m²",
    "Square Meter": "m²",
    "Sqft": "ft²",
    "Square Foot": "ft²",
    "Perches": "perch",
    "Acres": "acre",
    "Hectares": "ha",
  };

  const displayUnit = unit ? (unitMap[unit] || unit) : "m²";
  return `${area.toLocaleString()} ${displayUnit}`;
};