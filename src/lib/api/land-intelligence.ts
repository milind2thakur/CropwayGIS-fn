import { apiFetch } from './client';
import type { SoilDepthValue, SoilInfoEnvelope } from '@/features/land-intelligence/soilIntelligence.types';

export type { SoilInfoEnvelope, SoilDepthValue };


export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
export type JsonObject = { [key: string]: JsonValue | undefined };

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
  polygon_geojson: JsonObject | null;
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
  polygon_geojson?: JsonObject | null;
}

export interface UpdateLandParcelDTO {
  label?: string;
  location_label?: string;
  area_value?: number;
  area_unit?: string;
  latitude?: number;
  longitude?: number;
  polygon_geojson?: JsonObject | null;
}

export interface ApiEnvelope<T> {
  data: T;
  meta?: JsonObject;
}

export interface GeoJsonGeometry {
  type: string;
  coordinates: JsonValue;
}

export interface GeoJsonFeature<TProperties extends JsonObject = JsonObject> {
  type: 'Feature';
  geometry: GeoJsonGeometry | null;
  properties: TProperties;
}

export interface GeoJsonFeatureCollection<TProperties extends JsonObject = JsonObject> {
  type: 'FeatureCollection';
  features: Array<GeoJsonFeature<TProperties>>;
}

export interface DistrictBoundaryProperties extends JsonObject {
  dtname?: string;
  district_id?: number;
}

export interface SoilPolygonProperties extends JsonObject {
  snum?: string | number;
  MU_GLOBAL?: string | number;
  Dom_Soil?: string;
  Dom_Soil_Sym?: string;
  Indian_Classified_Value?: string;
  Red?: number;
  Green?: number;
  Blue?: number;
  Alpha?: number;
}

export type LandCoverType =
  | 'rain_fed_cultivated_land'
  | 'irrigated_cultivated_land'
  | 'total_cultivated_land'
  | 'forrest_land'
  | 'grass_scrub_woodland'
  | 'built_up_land'
  | 'very_sparsely_vegetated_land';

export interface LandCoverProperties extends JsonObject {
  gridcode?: string | number;
  grid_code?: string | number;
  value?: string | number;
  label?: string;
}

export interface LandCoverFeatureCollection extends GeoJsonFeatureCollection<LandCoverProperties> {
  grid_code?: JsonValue;
  land_cover_index_type?: string;
}

export interface SavedGisArea {
  id: number;
  location_geo_data: GeoJsonGeometry | GeoJsonFeature | GeoJsonFeatureCollection | JsonObject;
  user_name: string;
  user_id: number;
  label: string;
}

export interface CreateSavedGisAreaDTO {
  location_geo_data: GeoJsonFeatureCollection | GeoJsonFeature | GeoJsonGeometry | JsonObject;
  label: string;
  user_name?: string;
}

export type SoilInfoResponse = JsonValue;

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

export async function getDistrictBoundaries(): Promise<ApiEnvelope<GeoJsonFeatureCollection<DistrictBoundaryProperties>>> {
  return apiFetch('/api/v1/land-intelligence/gis/district-boundaries/');
}

export async function getSoilPolygon(
  lat: number,
  lon: number,
  radiusKm = 2
): Promise<ApiEnvelope<GeoJsonFeatureCollection<SoilPolygonProperties>>> {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
    radius: String(radiusKm),
  });
  return apiFetch(`/api/v1/land-intelligence/gis/soil-polygon/?${params.toString()}`);
}

export async function getSoilInfo(muGlobalId: string | number): Promise<ApiEnvelope<SoilInfoResponse>> {
  return apiFetch(`/api/v1/land-intelligence/gis/soil-info/${encodeURIComponent(String(muGlobalId))}/`);
}

export async function getLandCover(
  lat: number,
  lon: number,
  radiusKm = 2,
  landCoverType: LandCoverType = 'forrest_land'
): Promise<ApiEnvelope<LandCoverFeatureCollection>> {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
    radius: String(radiusKm),
    type: landCoverType,
  });
  return apiFetch(`/api/v1/land-intelligence/gis/land-cover/?${params.toString()}`);
}

export async function getSavedGisAreas(): Promise<ApiEnvelope<SavedGisArea[]>> {
  return apiFetch('/api/v1/land-intelligence/gis/saved-areas/');
}

export async function saveGisArea(payload: CreateSavedGisAreaDTO): Promise<ApiEnvelope<{ message: string }>> {
  return apiFetch('/api/v1/land-intelligence/gis/saved-areas/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function deleteSavedGisArea(id: number): Promise<ApiEnvelope<JsonObject>> {
  return apiFetch(`/api/v1/land-intelligence/gis/saved-areas/${id}/`, {
    method: 'DELETE',
  });
}

/**
 * Fetch normalised soil intelligence (SoilGrids hybrid envelope).
 *
 * Passes lat/lon/depth/radius to the backend service, which will:
 *   - Always call the Node backend for the legacy mu_global_id soil record.
 *   - Optionally enrich with SoilGrids (when SOILGRIDS_ENABLED on server).
 *   - Return a normalised SoilInfoEnvelope with kpis, source, uncertainty, advisory.
 */
export async function getSoilIntelligence(
  muGlobalId: string | number,
  options: {
    lat: number;
    lon: number;
    depth?: SoilDepthValue;
    radius?: number;
  }
): Promise<ApiEnvelope<SoilInfoEnvelope>> {
  const params = new URLSearchParams({
    lat: String(options.lat),
    lon: String(options.lon),
    ...(options.depth ? { depth: options.depth } : {}),
    ...(options.radius != null ? { radius: String(options.radius) } : {}),
  });
  return apiFetch(
    `/api/v1/land-intelligence/gis/soil-info/${encodeURIComponent(String(muGlobalId))}/?${params.toString()}`
  );
}
