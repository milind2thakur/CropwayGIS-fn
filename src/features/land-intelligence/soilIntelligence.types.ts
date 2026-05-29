/**
 * Shared TypeScript types and enums for the Soil Intelligence feature.
 * These are the canonical source of truth for depth intervals, source states,
 * KPI names, and the normalised soil-info API envelope shape.
 */

// ---------------------------------------------------------------------------
// Depth interval enum (strict — mirrors SoilDepth in Django constants.py)
// ---------------------------------------------------------------------------
export const SOIL_DEPTH_OPTIONS = [
  { value: '0-5', label: '0–5 cm' },
  { value: '5-15', label: '5–15 cm' },
  { value: '15-30', label: '15–30 cm' },
  { value: '30-60', label: '30–60 cm' },
  { value: '60-100', label: '60–100 cm' },
  { value: '100-200', label: '100–200 cm' },
] as const;

export type SoilDepthValue = (typeof SOIL_DEPTH_OPTIONS)[number]['value'];

export const DEFAULT_SOIL_DEPTH: SoilDepthValue = '0-5';

// ---------------------------------------------------------------------------
// Source state enum (mirrors SoilSource in Django constants.py)
// ---------------------------------------------------------------------------
export type SoilSourceState =
  | 'node'
  | 'soilgrids'
  | 'hybrid'
  | 'soilgrids_cached_stale';

// ---------------------------------------------------------------------------
// KPI names (v1 scope)
// ---------------------------------------------------------------------------
export type SoilKpiKey = 'ph' | 'soc' | 'nitrogen' | 'texture';

export const SOIL_KPI_DISPLAY: Record<SoilKpiKey, { label: string; unit: string | null }> = {
  ph: { label: 'Soil pH', unit: 'pH' },
  soc: { label: 'Organic Carbon', unit: 'g/kg' },
  nitrogen: { label: 'Nitrogen', unit: 'g/kg' },
  texture: { label: 'Texture', unit: null },
};

// ---------------------------------------------------------------------------
// Uncertainty badge type
// ---------------------------------------------------------------------------
export type UncertaintyBadge = 'low' | 'medium' | 'high';

// ---------------------------------------------------------------------------
// Normalised KPI entry (from backend)
// ---------------------------------------------------------------------------
export interface SoilKpiEntry {
  display_name: string;
  value: number | string | null;
  unit: string | null;
  q05: number | null;
  q50: number | null;
  q95: number | null;
  uncertainty: UncertaintyBadge;
  uncertainty_badge: UncertaintyBadge;
}

// ---------------------------------------------------------------------------
// Normalised soil-info envelope (the full API response body under `data`)
// ---------------------------------------------------------------------------
export interface SoilInfoEnvelope {
  /** v1 KPIs from SoilGrids — null when source is 'node' only */
  kpis: Partial<Record<SoilKpiKey, SoilKpiEntry>> | null;
  /** Depth interval used for this response */
  depth: SoilDepthValue;
  /** Where the data came from */
  source: SoilSourceState;
  /** Advisory text shown when SoilGrids data is present */
  advisory: string | null;
  /** Non-fatal warnings (e.g. stale cache, fallback triggered) */
  warnings: string[];
  /** ISO timestamp of when SoilGrids data was fetched/cached */
  last_updated: string | null;
  /** Raw Node backend payload — always present for backward compat */
  node_data: unknown;
}

// ---------------------------------------------------------------------------
// Source label helpers
// ---------------------------------------------------------------------------
export const SOURCE_LABEL: Record<SoilSourceState, string> = {
  node: 'Legacy data',
  soilgrids: 'SoilGrids (live)',
  hybrid: 'SoilGrids + Local',
  soilgrids_cached_stale: 'SoilGrids (cached)',
};

export const SOURCE_BADGE_CLASS: Record<SoilSourceState, string> = {
  node: 'bg-gray-100 text-gray-600',
  soilgrids: 'bg-green-100 text-green-700',
  hybrid: 'bg-blue-100 text-blue-700',
  soilgrids_cached_stale: 'bg-amber-100 text-amber-700',
};

export const UNCERTAINTY_BADGE_CLASS: Record<UncertaintyBadge, string> = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-red-100 text-red-700',
};
