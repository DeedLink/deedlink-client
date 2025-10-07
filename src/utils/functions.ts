import type { AnalaticsType } from "../types/analatics";
import type { LocationPoint } from "../types/types";

export function getCenterOfLocations(locations: LocationPoint[]): LocationPoint | null {
  if (locations.length === 0) return null;

  let totalLat = 0;
  let totalLng = 0;

  locations.forEach((loc) => {
    totalLat += loc.latitude;
    totalLng += loc.longitude;
  });

  return {
    latitude: totalLat / locations.length,
    longitude: totalLng / locations.length,
  };
}

export function roleBarier(role: string, allowedRoles: string[]): boolean {
  return allowedRoles.includes(role);
};

export const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const nicRegex = /^(?:\d{9}[VvXx]|\d{12})$/;

export const isValidPassword = (password: string) => {
  return passwordRegex.test(password);
};

export const isValidEmail = (email: string) => {
  return emailRegex.test(email);
};

export const isValidNIC = (nic: string) => {
  return nicRegex.test(nic);
};

export const calculatePolygonArea = (coordinates: [number, number][]): number => {
  if (coordinates.length < 3) return 0;
  
  let area = 0;
  const n = coordinates.length;
  
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += coordinates[i][0] * coordinates[j][1];
    area -= coordinates[j][0] * coordinates[i][1];
  }
  
  return Math.abs(area) / 2 * 111320 * 111320;
};

export const calculateAnalatics = (data:any[]) =>{
  console.log(data);
  const analatics: AnalaticsType = {
    totalDeeds: data?.length ?? 0,
    signedDeeds: 0,
    rejectedDeeds: 0,
    pendingDeeds: 0,
    monthlyGrowth: 0,
    completionRate: 0,
    avgProcessingTime: 0
  }
  return analatics;
}