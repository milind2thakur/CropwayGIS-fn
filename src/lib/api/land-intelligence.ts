export interface GeocodingResult {
  display_name: string;
  lat: string;
  lon: string;
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  boundingbox: string[];
  class: string;
  type: string;
  importance: number;
}

/**
 * Search for locations using Nominatim OpenStreetMap API.
 * This is an external API call, not hitting our backend.
 */
export async function searchLocations(query: string): Promise<GeocodingResult[]> {
  if (!query.trim()) return [];

  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      query
    )}&limit=5`,
    {
      headers: {
        'Accept-Language': 'en',
      },
    }
  );

  if (!res.ok) {
    throw new Error('Failed to fetch locations from geocoding service');
  }

  return res.json();
}

// Land Parcel API functions (backend endpoints)

export interface LandParcel {
  id: number;
  label: string;
  location_label: string;
  area_value: number;
  area_unit: string;
  latitude: number;
  longitude: number;
  polygon_geojson: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export interface CreateLandParcelDTO {
  label: string;
  location_label: string;
  area_value: number;
  area_unit: string;
  latitude: number;
  longitude: number;
  polygon_geojson?: Record<string, any> | null;
}

export interface UpdateLandParcelDTO {
  label?: string;
  location_label?: string;
  area_value?: number;
  area_unit?: string;
  latitude?: number;
  longitude?: number;
  polygon_geojson?: Record<string, any> | null;
}

/**
 * Fetch all land parcels for the authenticated user
 */
export async function getLandParcels(): Promise<LandParcel[]> {
  return apiFetch('/api/v1/crop-planning/land-parcels/');
}

/**
 * Create a new land parcel
 */
export async function createLandParcel(data: CreateLandParcelDTO): Promise<LandParcel> {
  return apiFetch('/api/v1/crop-planning/land-parcels/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Update an existing land parcel
 */
export async function updateLandParcel(id: number, data: UpdateLandParcelDTO): Promise<LandParcel> {
  return apiFetch(`/api/v1/crop-planning/land-parcels/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * Delete a land parcel
 */
export async function deleteLandParcel(id: number): Promise<void> {
  return apiFetch(`/api/v1/crop-planning/land-parcels/${id}/`, {
    method: 'DELETE',
  });
}
