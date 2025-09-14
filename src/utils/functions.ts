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