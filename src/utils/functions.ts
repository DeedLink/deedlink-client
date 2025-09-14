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