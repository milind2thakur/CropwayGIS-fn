'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  ChevronDown,
  Calendar,
  Phone,
  Crosshair,
  Ruler,
  Search,
  Trash2,
} from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapToolPillBar, MapZoomControls } from '@/components/ui/map-controls';
import { MapScaleBar } from '@/components/ui/map-scale-bar';
import {
  getDistrictBoundaries,
  getLandCover,
  getSavedGisAreas,
  getSoilInfo,
  getSoilIntelligence,
  getSoilPolygon,
  saveGisArea,
  searchLocations,
  type GeocodingResult,
  type GeoJsonFeature,
  type GeoJsonFeatureCollection,
  type JsonObject,
  type JsonValue,
  type LandCoverFeatureCollection,
  type LandCoverType,
  type SavedGisArea,
  type SoilPolygonProperties,
} from '@/lib/api/land-intelligence';
import {
  DEFAULT_SOIL_DEPTH,
  SOIL_DEPTH_OPTIONS,
  SOIL_KPI_DISPLAY,
  SOURCE_BADGE_CLASS,
  SOURCE_LABEL,
  UNCERTAINTY_BADGE_CLASS,
  type SoilDepthValue,
  type SoilInfoEnvelope,
  type SoilKpiKey,
} from './soilIntelligence.types';
import { cn } from '@/lib/utils';

declare global {
  interface Window {
    L: any;
  }
}

type Coord = {
  lat: number;
  lng: number;
};

type PolygonSelection = {
  id: string;
  coords: Coord[];
};

type SoilQueryTarget =
  | { type: 'polygon'; centroid: Coord; radiusKm: number; polygonId: string }
  | { type: 'pin'; coord: Coord; radiusKm: number }
  | { type: 'map-center'; coord: Coord; radiusKm: number };

type MapTypeId = 'roadmap' | 'satellite';

const DEFAULT_LOCATION_LABEL = 'Kendri, Dhamtari Rd, Raipur, CG';
const DEFAULT_CENTER: Coord = { lat: 21.2517, lng: 81.6304 };
const SELECTION_PATH: Coord[] = [
  { lat: 21.2519, lng: 81.6301 },
  { lat: 21.2522, lng: 81.6305 },
  { lat: 21.2517, lng: 81.6308 },
];

function computePolygonAreaSqm(coords: Coord[]) {
  if (coords.length < 3) {
    return 0;
  }

  const earthRadius = 6378137;
  const lat0 = (coords.reduce((sum, coord) => sum + coord.lat, 0) / coords.length) * Math.PI / 180;
  const projected = coords.map((coord) => {
    const latRad = coord.lat * Math.PI / 180;
    const lngRad = coord.lng * Math.PI / 180;
    return {
      x: earthRadius * lngRad * Math.cos(lat0),
      y: earthRadius * latRad,
    };
  });

  let area = 0;
  for (let index = 0; index < projected.length; index += 1) {
    const current = projected[index];
    const next = projected[(index + 1) % projected.length];
    area += current.x * next.y - next.x * current.y;
  }

  return Math.abs(area / 2);
}

function formatArea(areaSqm: number) {
  return Math.round(areaSqm).toLocaleString('en-IN');
}

function flattenPolygonCoords(polygons: PolygonSelection[]) {
  return polygons.flatMap((p) => p.coords);
}

function polygonToFeatureCollection(polygons: PolygonSelection[]): GeoJsonFeatureCollection {
  return {
    type: 'FeatureCollection',
    features: polygons
      .filter((polygon) => polygon.coords.length >= 3)
      .map((polygon) => ({
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [[
            ...polygon.coords.map((coord) => [coord.lng, coord.lat]),
            [polygon.coords[0].lng, polygon.coords[0].lat],
          ]],
        },
        properties: { id: polygon.id },
      })),
  };
}

function getSelectionCentroid(polygons: PolygonSelection[]): Coord {
  const coords = flattenPolygonCoords(polygons);
  if (coords.length === 0) {
    return DEFAULT_CENTER;
  }

  return {
    lat: coords.reduce((sum, coord) => sum + coord.lat, 0) / coords.length,
    lng: coords.reduce((sum, coord) => sum + coord.lng, 0) / coords.length,
  };
}

function getPolygonCentroid(coords: Coord[]): Coord {
  if (coords.length === 0) {
    return DEFAULT_CENTER;
  }

  return {
    lat: coords.reduce((sum, coord) => sum + coord.lat, 0) / coords.length,
    lng: coords.reduce((sum, coord) => sum + coord.lng, 0) / coords.length,
  };
}

function getSoilRadiusKm(coords: Coord[]) {
  const areaSqm = computePolygonAreaSqm(coords);
  if (areaSqm <= 0) {
    return 2;
  }
  return Math.max(0.5, Math.min(10, Math.sqrt(areaSqm / Math.PI) / 1000));
}

function getSoilTargetCoord(target: SoilQueryTarget) {
  return target.type === 'polygon' ? target.centroid : target.coord;
}

function getDistanceMeters(from: Coord, to: Coord) {
  const earthRadiusMeters = 6371000;
  const fromLat = from.lat * Math.PI / 180;
  const toLat = to.lat * Math.PI / 180;
  const deltaLat = (to.lat - from.lat) * Math.PI / 180;
  const deltaLng = (to.lng - from.lng) * Math.PI / 180;
  const a = Math.sin(deltaLat / 2) ** 2
    + Math.cos(fromLat) * Math.cos(toLat) * Math.sin(deltaLng / 2) ** 2;
  return earthRadiusMeters * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(meters: number) {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(2)} km`;
  }
  return `${Math.round(meters)} m`;
}

const LAND_COVER_OPTIONS: Array<{ value: LandCoverType; label: string; color: string }> = [
  { value: 'forrest_land', label: 'Forest', color: '#2f6b3f' },
  { value: 'built_up_land', label: 'Built-up', color: '#b85b55' },
  { value: 'grass_scrub_woodland', label: 'Grass/Scrub', color: '#a4b65c' },
  { value: 'irrigated_cultivated_land', label: 'Irrigated', color: '#5d9b73' },
  { value: 'rain_fed_cultivated_land', label: 'Rain-fed', color: '#d2b45f' },
  { value: 'very_sparsely_vegetated_land', label: 'Sparse', color: '#c8b79b' },
];

function getLandCoverColor(type: LandCoverType) {
  return LAND_COVER_OPTIONS.find((option) => option.value === type)?.color ?? '#5d9b73';
}

function getTargetLabel(target: SoilQueryTarget | null) {
  if (!target) {
    return {
      title: 'Map center',
      detail: 'No active target selected',
      radius: '2.0 km',
      coord: null as Coord | null,
    };
  }

  if (target.type === 'polygon') {
    return {
      title: `Polygon ${target.polygonId}`,
      detail: 'Drawn area target',
      radius: `${target.radiusKm.toFixed(1)} km`,
      coord: target.centroid,
    };
  }

  if (target.type === 'pin') {
    return {
      title: 'Pinned point',
      detail: 'Point target',
      radius: `${target.radiusKm.toFixed(1)} km`,
      coord: target.coord,
    };
  }

  return {
    title: 'Map center',
    detail: 'Fallback target',
    radius: `${target.radiusKm.toFixed(1)} km`,
    coord: target.coord,
  };
}

function savedAreaToFeature(area: SavedGisArea): GeoJsonFeature | null {
  const geoData = area.location_geo_data;
  if (!geoData || typeof geoData !== 'object' || Array.isArray(geoData)) {
    return null;
  }

  if (geoData.type === 'Feature') {
    return geoData as GeoJsonFeature;
  }

  if (geoData.type === 'FeatureCollection') {
    const featureCollection = geoData as GeoJsonFeatureCollection;
    return featureCollection.features[0] ?? null;
  }

  if (typeof geoData.type === 'string' && 'coordinates' in geoData) {
    return {
      type: 'Feature',
      geometry: geoData as GeoJsonFeature['geometry'],
      properties: { id: area.id, label: area.label },
    };
  }

  return null;
}

function findFirstSoilGlobalId(collection: GeoJsonFeatureCollection<SoilPolygonProperties>) {
  for (const feature of collection.features) {
    const properties = feature.properties;
    const value = properties.MU_GLOBAL ?? properties.snum;
    if (value !== undefined && value !== null) {
      return String(value);
    }
  }
  return null;
}

function formatSoilInfoValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '-';
  }
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return 'Available';
}

function getSoilInfoRecord(soilInfo: unknown): JsonObject | null {
  if (Array.isArray(soilInfo)) {
    const firstRecord = soilInfo.find((item): item is JsonObject => Boolean(item) && typeof item === 'object' && !Array.isArray(item));
    return firstRecord ?? null;
  }
  if (soilInfo && typeof soilInfo === 'object' && !Array.isArray(soilInfo)) {
    return soilInfo as JsonObject;
  }
  return null;
}

function getRecordValue(record: JsonObject | null, key: string): JsonValue | undefined {
  return record?.[key];
}

type MapTool = 'draw' | 'pin' | 'cursor' | 'probe' | 'measure' | 'clear';

function DrawAreaIcon({ className }: { className?: string }) {
  return (
    <svg width="17" height="18" viewBox="0 0 17 18" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* dashed rectangle */}
      <rect x="0.5" y="0.5" width="11.55" height="12.29" stroke="currentColor" strokeDasharray="2 2" />
      {/* vertical line of the + */}
      <path d="M12.57 8.49V17.34" stroke="currentColor" strokeLinecap="round" />
      {/* horizontal line of the + */}
      <path d="M17 12.92H8.14" stroke="currentColor" strokeLinecap="round" />
    </svg>
  );
}

function PinLocationIcon({ className }: { className?: string }) {
  return (
    <svg width="16" height="18" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path
        d="M15 7.5C15 12.518 9.512 15.903 7.925 16.776C7.657 16.924 7.343 16.924 7.075 16.776C5.488 15.903 0 12.518 0 7.5C0 3 3.634 0 7.5 0C11.5 0 15 3 15 7.5Z"
        stroke="currentColor"
      />
      <circle cx="7.5" cy="7.5" r="3.5" stroke="currentColor" />
    </svg>
  );
}

function CursorSelectIcon({ className }: { className?: string }) {
  return (
    <svg width="16" height="18" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path
        d="M1.374 2.611C1.233 1.315 2.699 0.468 3.751 1.238L14.785 9.312C15.934 10.153 15.373 11.973 13.949 12.021L9.83 12.16C8.997 12.188 8.233 12.629 7.793 13.336L5.613 16.834C4.859 18.044 3.003 17.62 2.849 16.203L1.374 2.611Z"
        stroke="currentColor"
      />
    </svg>
  );
}

function SoilProbeIcon({ className }: { className?: string }) {
  return <Crosshair className={className} strokeWidth={1.8} />;
}

function MeasureIcon({ className }: { className?: string }) {
  return <Ruler className={className} strokeWidth={1.8} />;
}

function ClearIcon({ className }: { className?: string }) {
  return <Trash2 className={className} strokeWidth={1.8} />;
}

function MapToolbar({
  activeTool,
  onToolChange,
}: {
  activeTool: MapTool;
  onToolChange: (tool: MapTool) => void;
}) {
  const tools: { id: MapTool; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'draw', label: 'Draw area', icon: DrawAreaIcon },
    { id: 'pin', label: 'Pin location', icon: PinLocationIcon },
    { id: 'cursor', label: 'Select', icon: CursorSelectIcon },
    { id: 'probe', label: 'Soil probe', icon: SoilProbeIcon },
    { id: 'measure', label: 'Measure', icon: MeasureIcon },
    { id: 'clear', label: 'Clear', icon: ClearIcon },
  ];

  return (
    <MapToolPillBar tools={tools} activeTool={activeTool} onToolChange={onToolChange} />
  );
}

function GisLayerControls({
  showDistricts,
  showSoil,
  showSavedAreas,
  showLandCover,
  landCoverType,
  onToggleDistricts,
  onToggleSoil,
  onToggleSavedAreas,
  onToggleLandCover,
  onLandCoverTypeChange,
  onFetchSoil,
  onFetchLandCover,
  soilLoading,
  landCoverLoading,
}: {
  showDistricts: boolean;
  showSoil: boolean;
  showSavedAreas: boolean;
  showLandCover: boolean;
  landCoverType: LandCoverType;
  onToggleDistricts: () => void;
  onToggleSoil: () => void;
  onToggleSavedAreas: () => void;
  onToggleLandCover: () => void;
  onLandCoverTypeChange: (type: LandCoverType) => void;
  onFetchSoil: () => void;
  onFetchLandCover: () => void;
  soilLoading: boolean;
  landCoverLoading: boolean;
}) {
  const items = [
    { label: 'District Boundary', active: showDistricts, onClick: onToggleDistricts },
    { label: 'Soil Layer', active: showSoil, onClick: onToggleSoil },
    { label: 'Land Cover', active: showLandCover, onClick: onToggleLandCover },
    { label: 'Saved Areas', active: showSavedAreas, onClick: onToggleSavedAreas },
  ];

  return (
    <div className="absolute left-3 right-3 top-[84px] z-[1000] flex max-h-[38dvh] flex-col gap-2 overflow-y-auto rounded-[14px] border border-white bg-white/85 p-2 shadow-sm backdrop-blur-[12px] sm:left-6 sm:right-auto sm:w-[240px] sm:max-h-none">
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          onClick={item.onClick}
          className={cn(
            'flex h-[28px] items-center justify-between rounded-[8px] px-3 font-montserrat text-[11px] font-semibold transition',
            item.active ? 'bg-greenDark text-white' : 'bg-white/80 text-ink hover:bg-greenLight'
          )}
        >
          <span>{item.label}</span>
          <span>{item.active ? 'On' : 'Off'}</span>
        </button>
      ))}
      <button
        type="button"
        onClick={onFetchSoil}
        disabled={soilLoading}
        className="h-[30px] rounded-[8px] bg-yellowNormal px-3 font-montserrat text-[11px] font-semibold text-ink transition hover:bg-yellowNormal/80 disabled:opacity-60"
      >
        {soilLoading ? 'Fetching soil...' : 'Fetch soil intelligence'}
      </button>
      <div className="grid grid-cols-2 gap-1">
        {LAND_COVER_OPTIONS.slice(0, 6).map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onLandCoverTypeChange(option.value)}
            className={cn(
              'h-[24px] rounded-[7px] px-2 font-montserrat text-[10px] font-semibold transition',
              landCoverType === option.value ? 'bg-greenDark text-white' : 'bg-white/80 text-ink hover:bg-greenLight'
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={onFetchLandCover}
        disabled={landCoverLoading}
        className="h-[30px] rounded-[8px] bg-white px-3 font-montserrat text-[11px] font-semibold text-greenDark transition hover:bg-greenLight disabled:opacity-60"
      >
        {landCoverLoading ? 'Fetching land cover...' : 'Fetch land cover'}
      </button>
    </div>
  );
}

function ActiveTargetPanel({
  target,
  landCoverType,
}: {
  target: SoilQueryTarget | null;
  landCoverType: LandCoverType;
}) {
  const targetLabel = getTargetLabel(target);
  const landCoverLabel = LAND_COVER_OPTIONS.find((option) => option.value === landCoverType)?.label ?? 'Land cover';

  return (
    <div className="absolute left-3 right-3 top-[410px] z-[1000] rounded-[14px] border border-white bg-white/85 p-3 shadow-sm backdrop-blur-[12px] sm:left-6 sm:right-auto sm:top-[390px] sm:w-[240px]">
      <div className="flex items-center justify-between gap-3">
        <span className="font-montserrat text-[10px] font-bold uppercase tracking-[0.08em] text-greenDark">
          Active Target
        </span>
        <span className="rounded-full bg-greenLight px-2 py-[2px] font-montserrat text-[9px] font-bold text-greenDark">
          {targetLabel.radius}
        </span>
      </div>
      <div className="mt-2 font-montserrat text-[13px] font-semibold text-ink">{targetLabel.title}</div>
      <div className="mt-[2px] font-montserrat text-[10px] font-medium text-muted">{targetLabel.detail}</div>
      {targetLabel.coord ? (
        <div className="mt-2 rounded-[8px] bg-white/75 px-2 py-1 font-montserrat text-[10px] font-semibold text-ink">
          {targetLabel.coord.lat.toFixed(5)}, {targetLabel.coord.lng.toFixed(5)}
        </div>
      ) : null}
      <div className="mt-2 flex items-center justify-between border-t border-white/70 pt-2 font-montserrat text-[10px] font-medium text-muted">
        <span>Land cover</span>
        <span className="font-semibold text-ink">{landCoverLabel}</span>
      </div>
    </div>
  );
}

// ── Soil Intelligence Panel (SoilGrids-aware) ──────────────────────────────

function UncertaintyBadgeChip({ level }: { level: string }) {
  const cls = UNCERTAINTY_BADGE_CLASS[level as keyof typeof UNCERTAINTY_BADGE_CLASS]
    ?? 'bg-gray-100 text-gray-600';
  return (
    <span className={cn('rounded-full px-2 py-[2px] font-montserrat text-[9px] font-bold capitalize', cls)}>
      {level}
    </span>
  );
}

function KpiBlock({ kpiKey, entry }: { kpiKey: SoilKpiKey; entry: NonNullable<SoilInfoEnvelope['kpis']>[SoilKpiKey] }) {
  if (!entry) return null;
  const meta = SOIL_KPI_DISPLAY[kpiKey];
  const displayValue = kpiKey === 'texture'
    ? String(entry.value ?? '—')
    : entry.value != null ? Number(entry.value).toFixed(2) : '—';

  return (
    <div className="flex flex-col gap-[3px] rounded-[10px] bg-greenLight/60 p-3">
      <div className="flex items-center justify-between">
        <span className="font-montserrat text-[10px] font-bold text-greenDark">{meta.label}</span>
        <UncertaintyBadgeChip level={entry.uncertainty_badge} />
      </div>
      <div className="flex items-end gap-1">
        <span className="font-montserrat text-[20px] font-bold leading-none text-ink">{displayValue}</span>
        {meta.unit && (
          <span className="mb-[2px] font-montserrat text-[10px] font-medium text-muted">{meta.unit}</span>
        )}
      </div>
      {entry.q05 != null && entry.q95 != null && (
        <div className="mt-[2px] font-montserrat text-[9px] text-muted">
          Range: {Number(entry.q05).toFixed(2)} – {Number(entry.q95).toFixed(2)}
          {meta.unit ? ` ${meta.unit}` : ''}
        </div>
      )}
    </div>
  );
}

function SoilIntelligencePanel({
  soilFeature,
  soilInfo,
  loading,
  error,
  selectedDepth,
  onDepthChange,
  advancedMode,
}: {
  soilFeature: GeoJsonFeature<SoilPolygonProperties> | null;
  soilInfo: unknown;
  loading: boolean;
  error: string | null;
  selectedDepth: SoilDepthValue;
  onDepthChange: (depth: SoilDepthValue) => void;
  advancedMode: boolean;
}) {
  if (!loading && !error && !soilFeature && !soilInfo) {
    return null;
  }

  // Detect normalised envelope (from SoilGrids service) vs legacy node data
  const envelope = (
    soilInfo &&
    typeof soilInfo === 'object' &&
    !Array.isArray(soilInfo) &&
    'source' in (soilInfo as object)
  ) ? (soilInfo as SoilInfoEnvelope) : null;

  const hasKpis = envelope?.kpis && Object.keys(envelope.kpis).length > 0;
  const isStale = envelope?.source === 'soilgrids_cached_stale';
  const hasAdvisory = Boolean(envelope?.advisory);

  // Fallback to legacy node data display
  const legacyData = envelope?.node_data ?? soilInfo;
  const props = soilFeature?.properties;
  const soilRecord = getSoilInfoRecord(legacyData);
  const rows = [
    ['Dominant soil', props?.Dom_Soil],
    ['Soil symbol', props?.Dom_Soil_Sym],
    ['MU Global', props?.MU_GLOBAL ?? props?.snum],
    ['Classified value', props?.Indian_Classified_Value],
  ];
  const profileRows = [
    ['Texture', getRecordValue(soilRecord, 'T_TEXTURE')],
    ['Drainage', getRecordValue(soilRecord, 'DRAINAGE')],
    ['AWC class', getRecordValue(soilRecord, 'AWC_CLASS')],
    ['Rooting condition', getRecordValue(soilRecord, 'ROOTS')],
    ['Soil water regime', getRecordValue(soilRecord, 'SWR')],
    ['Topsoil USDA texture', getRecordValue(soilRecord, 'T_USDA_TEX_CLASS')],
    ['Subsoil USDA texture', getRecordValue(soilRecord, 'S_USDA_TEX_CLASS')],
    ['Additional properties', getRecordValue(soilRecord, 'ADD_PROP')],
  ].filter(([, value]) => value !== undefined && value !== null && value !== '');

  return (
    <div className={cn(
      "absolute bottom-3 left-3 right-3 z-[1000] max-h-[42dvh] overflow-y-auto rounded-[18px] border p-4 shadow-sm backdrop-blur-[12px] md:bottom-auto md:left-auto md:right-6 md:top-[84px] md:max-h-[calc(100dvh-132px)] md:w-[300px]",
      advancedMode
        ? "border-white/10 bg-[#25282c]/90 text-white shadow-[0_12px_34px_rgba(0,0,0,0.35)]"
        : "border-white bg-white/90"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className={cn("font-montserrat text-[14px] font-semibold", advancedMode ? "text-white" : "text-ink")}>Soil Intelligence</div>
        {envelope?.source && (
          <span className={cn(
            'rounded-full px-2 py-[2px] font-montserrat text-[9px] font-bold',
            SOURCE_BADGE_CLASS[envelope.source]
          )}>
            {SOURCE_LABEL[envelope.source]}
          </span>
        )}
      </div>

      {/* Stale cache warning */}
      {isStale && (
        <div className="mt-2 flex items-center gap-2 rounded-[8px] bg-amber-50 px-3 py-2">
          <span className="text-[10px] text-amber-700 font-montserrat font-medium">
            ⚠ Cached data
            {envelope?.last_updated
              ? ` · updated ${new Date(envelope.last_updated).toLocaleDateString()}`
              : ''}
          </span>
        </div>
      )}

      {loading ? (
        <p className="mt-2 font-montserrat text-[12px] text-muted">Loading soil layer and profile...</p>
      ) : null}
      {error ? (
        <p className="mt-2 rounded-[8px] bg-red-50 px-3 py-2 font-montserrat text-[12px] text-red-700">{error}</p>
      ) : null}

      {!loading && !error ? (
        <div className="mt-3 flex flex-col gap-3">

          {/* ── Depth Selector ── */}
          {advancedMode ? (
          <div>
            <div className={cn("mb-[5px] font-montserrat text-[10px] font-bold uppercase tracking-[0.08em]", advancedMode ? "text-green-300" : "text-greenDark")}>
              Depth
            </div>
            <div className="flex flex-wrap gap-1">
              {SOIL_DEPTH_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onDepthChange(opt.value)}
                  className={cn(
                    'rounded-[6px] px-2 py-[3px] font-montserrat text-[10px] font-semibold transition',
                    selectedDepth === opt.value
                      ? 'bg-greenDark text-white'
                      : advancedMode
                        ? 'bg-white/10 text-white hover:bg-white/15'
                        : 'bg-greenLight text-ink hover:bg-greenDark/20'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          ) : null}

          {/* ── KPI Block (SoilGrids) ── */}
          {advancedMode && hasKpis && envelope?.kpis && (
            <>
              <div className={cn("font-montserrat text-[10px] font-bold uppercase tracking-[0.08em]", advancedMode ? "text-green-300" : "text-greenDark")}>
                Soil KPIs · {SOIL_DEPTH_OPTIONS.find(o => o.value === (envelope.depth ?? selectedDepth))?.label ?? selectedDepth}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(envelope.kpis) as SoilKpiKey[]).map((kpiKey) => (
                  <KpiBlock key={kpiKey} kpiKey={kpiKey} entry={envelope.kpis?.[kpiKey]} />
                ))}
              </div>

              {/* Advisory */}
              {hasAdvisory && (
                <div className={cn("rounded-[8px] px-3 py-2 font-montserrat text-[10px] font-medium", advancedMode ? "bg-white/10 text-green-200" : "bg-blue-50 text-blue-700")}>
                  ℹ {envelope.advisory}
                </div>
              )}

              {/* Warnings */}
              {envelope.warnings && envelope.warnings.length > 0 && (
                <div className="flex flex-col gap-1">
                  {envelope.warnings.map((w, i) => (
                    <div key={i} className="rounded-[8px] bg-amber-50 px-3 py-2 font-montserrat text-[10px] text-amber-700">
                      {w}
                    </div>
                  ))}
                </div>
              )}

              {/* Last updated */}
              {envelope.last_updated && !isStale && (
                <div className={cn("text-right font-montserrat text-[9px]", advancedMode ? "text-white/70" : "text-muted")}>
                  Updated {new Date(envelope.last_updated).toLocaleString()}
                </div>
              )}
            </>
          )}

          {/* ── Legacy Soil Summary (always shown for context) ── */}
          <div className={cn("font-montserrat text-[10px] font-bold uppercase tracking-[0.08em]", advancedMode ? "text-green-300" : "text-greenDark")}>
            {hasKpis ? 'Soil Classification' : 'Soil Summary'}
          </div>
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-3 border-b border-lineLight pb-1 last:border-0">
              <span className={cn("font-montserrat text-[11px] font-medium", advancedMode ? "text-white/70" : "text-muted")}>{label}</span>
              <span className={cn("max-w-[150px] text-right font-montserrat text-[11px] font-semibold", advancedMode ? "text-white" : "text-ink")}>
                {formatSoilInfoValue(value)}
              </span>
            </div>
          ))}

          {profileRows.length > 0 ? (
            <div className={cn("mt-1 flex flex-col gap-2 rounded-[10px] p-3", advancedMode ? "bg-white/10" : "bg-greenLight/70")}>
              <div className="font-montserrat text-[10px] font-bold uppercase tracking-[0.08em] text-greenDark">
                Soil Profile
              </div>
              {profileRows.map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-3 border-b border-white/70 pb-1 last:border-0">
                  <span className="font-montserrat text-[10px] font-medium text-muted">{label}</span>
                  <span className="max-w-[150px] text-right font-montserrat text-[10px] font-semibold text-ink">
                    {formatSoilInfoValue(value)}
                  </span>
                </div>
              ))}
            </div>
          ) : legacyData && !hasKpis ? (
            <div className="rounded-[8px] bg-greenLight px-3 py-2 font-montserrat text-[11px] font-medium text-greenDark">
              Detailed soil profile returned, but no displayable profile fields were found.
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function SelectionSidebar({
  areaSqm,
  coords,
  polygonCount,
  hasSelection,
  onSave,
}: {
  areaSqm: number;
  coords: Coord[];
  polygonCount: number;
  hasSelection: boolean;
  onSave: () => void;
}) {
  return (
    <div className="flex w-full shrink-0 flex-col overflow-y-auto border-t border-line bg-white lg:w-[254px] lg:border-l lg:border-t-0">
      <div className="flex flex-col px-[10px] pb-[8px] pt-[10px]">
        <div className="flex flex-col gap-[6px]">
          <div className="font-montserrat text-[10px] font-medium leading-[130%] text-muted">
            Selection Area
          </div>
          <div className="flex items-center gap-[16px]">
            <div className="flex h-[24px] w-[181px] items-center rounded-[4px] bg-greenLight px-[10px] py-[4px]">
              <span className="font-montserrat text-[12px] font-medium leading-[130%] text-ink">
                {formatArea(areaSqm)}
              </span>
            </div>
            <span className="font-montserrat text-[10px] font-medium leading-[130%] text-muted">
              Sqm
            </span>
          </div>
          <div className="font-montserrat text-[10px] font-medium leading-[130%] text-muted">
            {polygonCount} polygon{polygonCount === 1 ? '' : 's'} selected
          </div>
        </div>
      </div>

      <div className="h-[0.5px] w-full bg-line" />

      {/* Middle block: Coordinates */}
      <div className="flex flex-col px-[10px] pb-[6px] pt-[8px]">
        <div className="mb-[5px] font-montserrat text-[10px] font-medium leading-[130%] text-muted">
          Coordinates
        </div>
        <div className="flex pl-[20px]">
          <div className="flex w-[113px] flex-col">
            <span className="font-montserrat text-[10px] font-medium leading-[130%] text-muted">
              Latitude
            </span>
            <div className="flex flex-col font-montserrat text-[12px] font-medium leading-[150%] text-ink">
              {coords.map((coord, index) => (
                <span key={`lat-${index}`}>{coord.lat.toFixed(4)}</span>
              ))}
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-montserrat text-[10px] font-medium leading-[130%] text-muted">
              Longitude
            </span>
            <div className="flex flex-col font-montserrat text-[12px] font-medium leading-[150%] text-ink">
              {coords.map((coord, index) => (
                <span key={`lng-${index}`}>{coord.lng.toFixed(4)}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="h-[0.5px] w-full bg-line" />

      {/* Bottom block: Save button */}
      <div className="px-[10px] pt-[9px]">
        <Button
          type="button"
          onClick={onSave}
          disabled={!hasSelection}
          className={cn(
            'h-[26px] w-[232px] rounded-[6px] px-[20px] py-[5px] font-montserrat text-[12px] font-medium leading-[130%]',
            hasSelection
              ? 'bg-greenDark text-white hover:bg-greenDarker'
              : 'bg-greenLightActive/70 text-white'
          )}
        >
          Save Selection
        </Button>
      </div>
    </div>
  );
}

function SaveSelectionModal({
  isOpen,
  onClose,
  onSaveConfirm,
  areaSqm,
  location,
  polygons,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSaveConfirm: (landId: string, owner: string) => void;
  areaSqm: number;
  location: string;
  polygons: PolygonSelection[];
}) {
  const previewMapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  
  const [landOwner, setLandOwner] = useState("Rakesh");
  const [landId, setLandId] = useState("001");

  // Dynamically update default Land Id when polygons change

  useEffect(() => {
    if (isOpen) {
      if (polygons.length > 0) {
        const ids = polygons.map(p => p.id).join(", ");
        setLandId(ids);
      } else {
        setLandId("001");
      }
    }
  }, [isOpen, polygons]);

  useEffect(() => {
    if (!isOpen || !previewMapRef.current || !window.L) return;

    const L = window.L;

    // Cleanup previous instance if any
    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.remove();
      } catch {
        // Silently ignore removal errors
      }
      mapInstanceRef.current = null;
    }

    // Initialize interactive-disabled Leaflet map
    const previewMap = L.map(previewMapRef.current, {
      zoomControl: false,
      attributionControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      touchZoom: false,
      boxZoom: false,
      keyboard: false,
    });

    // Satellite imagery layer in background
    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 19,
      }
    ).addTo(previewMap);

    mapInstanceRef.current = previewMap;

    // Add polygons and fit map bounds
    if (polygons.length > 0) {
      const featureGroup = L.featureGroup();
      let hasValidPolygon = false;

      polygons.forEach((poly) => {
        if (poly.coords.length >= 3) {
          hasValidPolygon = true;
          const latLngs = poly.coords.map(c => [c.lat, c.lng] as [number, number]);
          L.polygon(latLngs, {
            color: 'var(--yellow-normal)', // system yellow
            weight: 2.5,
            fillColor: 'var(--yellow-normal)',
            fillOpacity: 0.45,
          }).addTo(featureGroup);
        }
      });

      if (hasValidPolygon) {
        featureGroup.addTo(previewMap);
        try {
          previewMap.fitBounds(featureGroup.getBounds(), {
            padding: [25, 25],
          });
        } catch {
          // Fit bounds might fail if group is empty or invalid
        }
      } else {
        previewMap.setView([DEFAULT_CENTER.lat, DEFAULT_CENTER.lng], 16);
      }
    } else {
      previewMap.setView([DEFAULT_CENTER.lat, DEFAULT_CENTER.lng], 16);
    }

    // Force resize to ensure Leaflet renders tiles correctly inside a modal
    const timer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch {
          // Silently ignore removal errors
        }
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen, polygons]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-ink/40 p-3 backdrop-blur-sm">
      <div className="w-full max-w-[600px] rounded-[24px] bg-white p-4 shadow-2xl">
        <div className="flex flex-col gap-4 sm:flex-row">
          {/* Left: Map Preview card inset inside padding */}
          <div className="relative h-[220px] w-full shrink-0 overflow-hidden rounded-[16px] bg-canvas sm:h-[250px] sm:w-[250px]">
            <div ref={previewMapRef} className="h-full w-full z-0" />
          </div>

          {/* Right: Save Selection Form */}
          <div className="flex flex-1 flex-col justify-between">
            <div>
              <h2 className="font-montserrat text-[20px] font-medium leading-[130%] text-ink mb-2.5">
                Save Selection
              </h2>

              <div className="flex flex-col gap-2.5">
                {/* Land Owner Field */}
                <div>
                  <label className="mb-1 block font-montserrat text-[11px] font-medium text-muted">
                    Land Owner
                  </label>
                  <Input
                    type="text"
                    value={landOwner}
                    onChange={(e) => setLandOwner(e.target.value)}
                    className="h-[36px] w-full rounded-[8px] border-none bg-canvas px-3 font-montserrat text-[12px] font-medium text-ink focus:ring-1 focus:ring-greenDark"
                  />
                </div>

                {/* Land Id & Selection Area Row */}
                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="flex-1">
                    <label className="mb-1 block font-montserrat text-[11px] font-medium text-muted">
                      Land Id
                    </label>
                    <Input
                      type="text"
                      value={landId}
                      onChange={(e) => setLandId(e.target.value)}
                      className="h-[36px] w-full rounded-[8px] border-none bg-canvas px-3 font-montserrat text-[12px] font-medium text-ink focus:ring-1 focus:ring-greenDark"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="mb-1 block font-montserrat text-[11px] font-medium text-muted">
                      Selection Area
                    </label>
                    <div className="flex h-[36px] items-center rounded-[8px] bg-greenLight px-3 font-montserrat text-[12px] font-bold text-ink">
                      <span>{formatArea(areaSqm)}</span>
                      <span className="ml-1 text-[10px] font-medium text-ink/40">*Sqkm</span>
                    </div>
                  </div>
                </div>

                {/* Location Field */}
                <div>
                  <label className="mb-1 block font-montserrat text-[11px] font-medium text-muted">
                    Location
                  </label>
                  <div className="font-montserrat text-[12px] font-medium leading-[140%] text-ink">
                    {location}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions Row */}
            <div className="mt-4 flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={onClose}
                className="h-[36px] flex-[1.2] rounded-[8px] bg-greenLightHover font-montserrat text-[12px] font-semibold text-ink hover:bg-greenLightActive hover:text-ink"
              >
                Cancel
              </Button>
              <Button
                onClick={() => onSaveConfirm(landId, landOwner)}
                className="h-[36px] flex-[1.8] rounded-[8px] bg-greenDark font-montserrat text-[12px] font-semibold text-white hover:bg-greenDarkHover"
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SowingDatePicker({
  selectedDate,
  onDateSelect,
}: {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  // Default to June 2026 if no date is selected
  const [viewDate, setViewDate] = useState(selectedDate || new Date(2026, 5, 1));
  
  const toggleOpen = () => setIsOpen(!isOpen);
  
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const fullMonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const years = Array.from({length: 15}, (_, i) => 2020 + i);

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // Monday is 0, Sunday is 6
  };

  const daysInMonth = getDaysInMonth(viewDate.getFullYear(), viewDate.getMonth());
  const firstDay = getFirstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth());
  
  const days = Array.from({length: daysInMonth}, (_, i) => i + 1);
  const blanks = Array.from({length: firstDay}, (_, i) => i);

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return selectedDate.getDate() === day && 
           selectedDate.getMonth() === viewDate.getMonth() &&
           selectedDate.getFullYear() === viewDate.getFullYear();
  };

  const handleDayClick = (day: number) => {
    onDateSelect(new Date(viewDate.getFullYear(), viewDate.getMonth(), day));
    setIsOpen(false);
  };

  const displayMonth = selectedDate ? fullMonths[selectedDate.getMonth()] : 'June';
  const displayYear = selectedDate ? selectedDate.getFullYear() : '2026';

  // Close when clicking outside
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col gap-[7px] relative" ref={containerRef}>
      <span className="font-montserrat text-[10px] font-medium text-muted">Sowing</span>
      <div 
        className="flex h-[32px] w-full items-center justify-between rounded-[7px] bg-surface px-[13px] py-[7px] cursor-pointer"
        onClick={toggleOpen}
      >
        <div className="flex items-center gap-[8px]">
          {selectedDate && <span className="font-poppins text-[12px] text-inkBase">{selectedDate.getDate()}</span>}
          <span className="font-poppins text-[12px] text-inkBase">{displayMonth}</span>
          <span className="font-poppins text-[12px] text-muted">-</span>
          <span className="font-poppins text-[12px] text-inkBase">{displayYear}</span>
        </div>
        <Calendar className="h-[14px] w-[14px] text-inkDark" />
      </div>

      {isOpen && (
        <div className="absolute top-[52px] left-[-16px] z-[100] w-[280px] rounded-[12px] bg-white p-4 shadow-lg border border-lineLight">
          <div className="flex justify-end gap-2 mb-4">
            <div className="relative">
              <select 
                className="appearance-none bg-white border border-line rounded-[8px] pl-3 pr-8 py-1.5 text-[12px] font-montserrat text-inkBase focus:outline-none"
                value={viewDate.getMonth()}
                onChange={(e) => setViewDate(new Date(viewDate.getFullYear(), parseInt(e.target.value), 1))}
              >
                {months.map((m, i) => <option key={m} value={i}>{m}</option>)}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-inkBase" />
            </div>
            <div className="relative">
              <select 
                className="appearance-none bg-white border border-line rounded-[8px] pl-3 pr-8 py-1.5 text-[12px] font-montserrat text-inkBase focus:outline-none"
                value={viewDate.getFullYear()}
                onChange={(e) => setViewDate(new Date(parseInt(e.target.value), viewDate.getMonth(), 1))}
              >
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-inkBase" />
            </div>
          </div>

          <div className="grid grid-cols-7 gap-y-2 text-center mb-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="font-montserrat text-[11px] font-medium text-inkBase">{d}</div>
            ))}
            <div className="font-montserrat text-[11px] font-medium text-greenDark">Sun</div>
          </div>

          <div className="grid grid-cols-7 gap-y-1 text-center">
            {blanks.map(b => <div key={`blank-${b}`} />)}
            {days.map(d => (
              <div 
                key={d} 
                onClick={() => handleDayClick(d)}
                className={cn(
                  "flex items-center justify-center h-8 w-8 mx-auto rounded-[6px] font-montserrat text-[12px] cursor-pointer transition-colors",
                  isSelected(d) 
                    ? "bg-greenDark text-white font-medium" 
                    : "text-inkBase hover:bg-surface"
                )}
              >
                {d}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CropPlanningSidebar({
  landId,
  areaSqm,
}: {
  landId: string;
  areaSqm: number;
  onBack: () => void;
}) {
  const router = useRouter();
  const [season, setSeason] = useState<'Kharif' | 'Rabi'>('Rabi');
  const [crop, setCrop] = useState<string | null>(null);
  const [isCropDropdownOpen, setIsCropDropdownOpen] = useState(false);
  const [searchCrop, setSearchCrop] = useState('');
  const [sowingDate, setSowingDate] = useState<Date | null>(null);

  const crops = ['Tomato', 'Rice', 'Barley', 'Wheat'];
  const filteredCrops = crops.filter(c => c.toLowerCase().includes(searchCrop.toLowerCase()));

  return (
    <div className="relative flex w-full shrink-0 flex-col overflow-y-auto border-t border-line bg-white lg:w-[254px] lg:border-l lg:border-t-0">
      <div className="flex flex-col px-[10px] pb-[8px] pt-[14px]">
        
        {/* Saved Land Parcel */}
        <div className="flex flex-col gap-[11px] mb-[15px]">
          <div className="flex w-full items-center justify-start">
             <span className="font-montserrat text-[10px] font-medium leading-[130%] text-muted">
               Saved Land Parcel
             </span>
          </div>
          <div className="flex h-[32px] w-full items-center justify-between rounded-[7px] bg-surface px-[13px] py-[7px]">
            <span className="font-poppins text-[12px] text-inkBase">{landId}</span>
            <div className="flex h-[24px] items-center gap-[10px] rounded-[4px] bg-greenLight px-[10px] py-[4px]">
              <span className="font-montserrat text-[12px] font-medium text-ink">{formatArea(areaSqm)}</span>
              <span className="font-montserrat text-[10px] font-medium text-muted">*Sqm</span>
            </div>
          </div>
        </div>

        <div className="h-[0.5px] w-full bg-line mb-[10px]" />

        {/* Season Toggle */}
        <div className="flex h-[26px] w-full items-center justify-center rounded-[8px] bg-greenLight p-[2px] mb-[18px]">
          <button
            onClick={() => setSeason('Kharif')}
            className={cn(
              "flex h-[22px] flex-1 items-center justify-center rounded-[6px] font-montserrat text-[12px] font-medium transition-colors",
              season === 'Kharif' ? "bg-greenDark text-white" : "bg-transparent text-greenDark"
            )}
          >
            Kharif
          </button>
          <button
            onClick={() => setSeason('Rabi')}
            className={cn(
              "flex h-[22px] flex-1 items-center justify-center rounded-[6px] font-montserrat text-[12px] font-medium transition-colors",
              season === 'Rabi' ? "bg-greenDark text-white" : "bg-transparent text-greenDark"
            )}
          >
            Rabi
          </button>
        </div>

        {/* Select Crops */}
        <div className="flex flex-col gap-[5px] mb-[18px] relative">
          <div className="flex items-center justify-between">
            <span className="font-montserrat text-[10px] font-medium text-muted">Select Crops</span>
            <div className="flex items-center gap-[7px] opacity-50 cursor-pointer">
              <span className="font-montserrat text-[8px] font-medium">View all</span>
              <ChevronDown className="h-[8px] w-[8px] -rotate-90" />
            </div>
          </div>
          
          <button
            onClick={() => setIsCropDropdownOpen(!isCropDropdownOpen)}
            className="flex h-[23px] w-full items-center justify-between rounded-[8px] bg-greenLight px-[10px] py-[2px]"
          >
            {crop ? (
              <span className="font-montserrat text-[10px] font-medium text-greenDark">{crop}</span>
            ) : (
              <span className="font-montserrat text-[10px] font-medium text-muted">Select Crops</span>
            )}
            {crop ? (
              <div onClick={(e) => { e.stopPropagation(); setCrop(null); }} className="flex items-center justify-center cursor-pointer">
                <svg width="7" height="7" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              </div>
            ) : (
              <ChevronDown className="h-[12px] w-[12px] text-inkBase" />
            )}
          </button>

          {isCropDropdownOpen && (
            <div className="absolute top-[40px] left-0 z-50 flex w-full flex-col overflow-hidden rounded-[8px] border border-line bg-white shadow-lg">
              <div className="flex items-center gap-2 border-b border-lineLight px-[10px] py-[6px]">
                <Search className="h-[10px] w-[10px] text-muted" />
                <input
                  type="text"
                  placeholder="Search Crop"
                  value={searchCrop}
                  onChange={(e) => setSearchCrop(e.target.value)}
                  className="w-full bg-transparent font-montserrat text-[10px] outline-none placeholder:text-muted"
                />
              </div>
              <div className="flex max-h-[120px] flex-col overflow-y-auto bg-surface">
                {filteredCrops.map(c => (
                  <button
                    key={c}
                    onClick={() => { setCrop(c); setIsCropDropdownOpen(false); }}
                    className="px-[10px] py-[6px] text-left font-montserrat text-[10px] hover:bg-lineLight text-inkBase"
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="h-[0.5px] w-full bg-line mb-[10px]" />

        {/* Sowing & Estimated completion date */}
        <div className="flex flex-col gap-[12px] mb-[18px]">
          <SowingDatePicker selectedDate={sowingDate} onDateSelect={setSowingDate} />

          <div className="flex flex-col gap-[7px]">
            <span className="font-montserrat text-[10px] font-medium text-muted">Estimated completion date</span>
            <div className="flex h-[32px] w-full items-center rounded-[7px] bg-surface px-[13px] py-[7px]">
              <div className="flex items-center gap-[8px]">
                <span className="font-poppins text-[12px] text-inkBase/60">Oct</span>
                <span className="font-poppins text-[12px] text-muted">-</span>
                <span className="font-poppins text-[12px] text-inkBase/60">2026</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex w-full items-center justify-center">
          <Button
            type="button"
            className="h-[26px] w-full rounded-[6px] bg-greenDark px-[20px] py-[5px] font-montserrat text-[12px] font-medium text-white hover:bg-greenDarker"
            onClick={() => router.push('/crop-planning?step=portfolio')}
          >
            Save details
          </Button>
        </div>

        <div className="h-[0.5px] w-full bg-line my-[10px]" />

        {/* Agri Inputs */}
        <div className="flex flex-col gap-[6px]">
          <div className="flex items-center justify-between">
            <span className="font-montserrat text-[10px] font-medium text-muted">Agri Inputs</span>
            <div className="flex items-center gap-[7px] opacity-50 cursor-pointer">
              <span className="font-montserrat text-[8px] font-medium">View all</span>
              <ChevronDown className="h-[8px] w-[8px] -rotate-90" />
            </div>
          </div>

          <div className="relative h-[145px] w-full overflow-hidden rounded-[10px]">
             {/* Background Illustration */}
             <Image 
               src="/consultation-image.svg" 
               alt="Consultation Illustration" 
               fill
               className="object-cover pointer-events-none z-0" 
             />

             <div className="sr-only">
               <span>Need professional advice?</span>
               <span>Consult a Professional</span>
             </div>

             <div className="absolute bottom-[10px] right-[10px] z-10">
               <button className="flex h-[19px] items-center gap-[5px] rounded-[4px] bg-greenDark px-[10px] py-[3px]">
                 <span className="font-montserrat text-[10px] font-medium text-white">Book a call</span>
                 <Phone className="h-[8px] w-[8px] text-white" />
               </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}


export interface LandIntelligenceClientProps {
  mode?: 'land-intelligence' | 'crop-planning-selection';
  initialView?: 'soil-intelligence';
};

export function LandIntelligenceClient({ mode = 'land-intelligence', initialView }: LandIntelligenceClientProps) {
  const isCropPlanningSelection = mode === 'crop-planning-selection';
  const showGisIntelligence = !isCropPlanningSelection;
  const soilIntelligenceAdvanced = initialView === 'soil-intelligence';
  const showSelectionSidebar = isCropPlanningSelection;
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [sidebarMode, setSidebarMode] = useState<'selection' | 'crop-planning'>('selection');
  const [savedLandData, setSavedLandData] = useState<{ id: string; owner: string } | null>(null);
  const [showDistricts, setShowDistricts] = useState(false);
  const [showSoil, setShowSoil] = useState(false);
  const [showSavedAreas, setShowSavedAreas] = useState(false);
  const [showLandCover, setShowLandCover] = useState(false);
  const [landCoverType, setLandCoverType] = useState<LandCoverType>('forrest_land');
  const [districtBoundaries, setDistrictBoundaries] = useState<GeoJsonFeatureCollection | null>(null);
  const [soilCollection, setSoilCollection] = useState<GeoJsonFeatureCollection<SoilPolygonProperties> | null>(null);
  const [landCoverCollection, setLandCoverCollection] = useState<LandCoverFeatureCollection | null>(null);
  const [selectedSoilFeature, setSelectedSoilFeature] = useState<GeoJsonFeature<SoilPolygonProperties> | null>(null);
  const [soilInfo, setSoilInfo] = useState<unknown>(null);
  const [selectedSoilDepth, setSelectedSoilDepth] = useState<SoilDepthValue>(DEFAULT_SOIL_DEPTH);
  const [soilLoading, setSoilLoading] = useState(false);
  const [landCoverLoading, setLandCoverLoading] = useState(false);
  const [soilError, setSoilError] = useState<string | null>(null);
  const [landCoverError, setLandCoverError] = useState<string | null>(null);
  const [savedAreas, setSavedAreas] = useState<SavedGisArea[]>([]);
  const [savedAreaError, setSavedAreaError] = useState<string | null>(null);
  const [mapType, setMapType] = useState<MapTypeId>('roadmap');
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(16);
  const [activeTool, setActiveTool] = useState<MapTool>('cursor');
  const [polygonCoordsList, setPolygonCoordsList] = useState<PolygonSelection[]>([
    { id: '001', coords: SELECTION_PATH },
  ]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingCoords, setDrawingCoords] = useState<Coord[]>([]);
  const [pins, setPins] = useState<Coord[]>([]);
  const [mousePos, setMousePos] = useState<Coord | null>(null);
  const [measurePoints, setMeasurePoints] = useState<Coord[]>([]);
  const [soilQueryTarget, setSoilQueryTarget] = useState<SoilQueryTarget | null>({
    type: 'polygon',
    centroid: getPolygonCentroid(SELECTION_PATH),
    radiusKm: getSoilRadiusKm(SELECTION_PATH),
    polygonId: '001',
  });
  const [searchQuery, setSearchQuery] = useState(DEFAULT_LOCATION_LABEL);
  const [suggestions, setSuggestions] = useState<GeocodingResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const handleSaveConfirm = (landId: string, owner: string) => {
    setSavedLandData({ id: landId, owner });
    void saveGisArea({
      label: landId,
      user_name: owner,
      location_geo_data: polygonToFeatureCollection(polygonCoordsList),
    })
      .then(() => getSavedGisAreas())
      .then((response) => {
        setSavedAreas(response.data);
        setSavedAreaError(null);
      })
      .catch((error) => {
        setSavedAreaError(error instanceof Error ? error.message : 'Failed to save GIS area.');
      });
    setShowSaveModal(false);
    setSidebarMode('crop-planning');
  };

  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const polygonRefs = useRef<any[]>([]);
  const drawingLineRef = useRef<any>(null);
  const measureLineRef = useRef<any>(null);
  const measureMarkerRefs = useRef<any[]>([]);
  const markerRefs = useRef<any[]>([]);
  const crosshairRefs = useRef<any[]>([]);
  const tileLayerRef = useRef<any>(null);
  const liveCoordRef = useRef<HTMLSpanElement>(null);
  const districtLayerRef = useRef<any>(null);
  const soilLayerRef = useRef<any>(null);
  const landCoverLayerRef = useRef<any>(null);
  const savedAreasLayerRef = useRef<any>(null);

  const areaSqm = useMemo(
    () => polygonCoordsList.reduce((total, poly) => total + computePolygonAreaSqm(poly.coords), 0),
    [polygonCoordsList]
  );
  const sidebarCoords = useMemo(
    () => flattenPolygonCoords(polygonCoordsList),
    [polygonCoordsList]
  );
  const hasSelection = polygonCoordsList.some((poly) => poly.coords.length >= 3 && computePolygonAreaSqm(poly.coords) > 0);
  const canRemoveByClick = activeTool === 'cursor' && !isDrawing;

  const fitSelectionBounds = () => {
    if (!mapRef.current || polygonRefs.current.length === 0) {
      return;
    }
    const bounds = polygonRefs.current[0].getBounds();
    for (let index = 1; index < polygonRefs.current.length; index += 1) {
      bounds.extend(polygonRefs.current[index].getBounds());
    }
    if (bounds && Object.keys(bounds).length > 0) {
      try { mapRef.current.fitBounds(bounds); } catch {
        // Fit bounds might fail if group is empty or invalid
      }
    }
  };

  const recenterMap = () => {
    if (!mapRef.current) {
      return;
    }
    mapRef.current.panTo([DEFAULT_CENTER.lat, DEFAULT_CENTER.lng]);
    fitSelectionBounds();
  };

  const fetchSoilIntelligence = useCallback(async (targetOverride?: SoilQueryTarget, depthOverride?: SoilDepthValue) => {
    const fallbackCenter = mapRef.current?.getCenter?.();
    const target = targetOverride ?? soilQueryTarget ?? {
      type: 'map-center',
      coord: fallbackCenter ? { lat: fallbackCenter.lat, lng: fallbackCenter.lng } : getSelectionCentroid(polygonCoordsList),
      radiusKm: 2,
    };
    const coord = getSoilTargetCoord(target);

    setSoilLoading(true);
    setSoilError(null);
    setShowSoil(true);

    try {
      const soilResponse = await getSoilPolygon(coord.lat, coord.lng, target.radiusKm);
      setSoilCollection(soilResponse.data);
      const firstFeature = soilResponse.data.features[0] ?? null;
      setSelectedSoilFeature(firstFeature);

      const soilId = findFirstSoilGlobalId(soilResponse.data);
      if (soilId) {
        const infoResponse = soilIntelligenceAdvanced
          ? await getSoilIntelligence(soilId, {
            lat: coord.lat,
            lon: coord.lng,
            radius: target.radiusKm,
            depth: depthOverride ?? selectedSoilDepth,
          }).catch(() => getSoilInfo(soilId))
          : await getSoilInfo(soilId);
        setSoilInfo(infoResponse.data);
      } else {
        setSoilInfo(null);
      }
    } catch (error) {
      setSoilError(error instanceof Error ? error.message : 'Failed to fetch soil intelligence.');
    } finally {
      setSoilLoading(false);
    }
  }, [polygonCoordsList, selectedSoilDepth, soilIntelligenceAdvanced, soilQueryTarget]);

  const fetchLandCover = useCallback(async (targetOverride?: SoilQueryTarget) => {
    const fallbackCenter = mapRef.current?.getCenter?.();
    const target = targetOverride ?? soilQueryTarget ?? {
      type: 'map-center',
      coord: fallbackCenter ? { lat: fallbackCenter.lat, lng: fallbackCenter.lng } : getSelectionCentroid(polygonCoordsList),
      radiusKm: 2,
    };
    const coord = getSoilTargetCoord(target);

    setLandCoverLoading(true);
    setLandCoverError(null);
    setShowLandCover(true);

    try {
      const response = await getLandCover(coord.lat, coord.lng, target.radiusKm, landCoverType);
      setLandCoverCollection(response.data);
    } catch (error) {
      setLandCoverError(error instanceof Error ? error.message : 'Failed to fetch land cover.');
    } finally {
      setLandCoverLoading(false);
    }
  }, [landCoverType, polygonCoordsList, soilQueryTarget]);

  const clearTransientMapState = () => {
    setDrawingCoords([]);
    setIsDrawing(false);
    setPins([]);
    setMousePos(null);
    setMeasurePoints([]);
    setSoilQueryTarget(null);
    setSoilCollection(null);
    setSelectedSoilFeature(null);
    setSoilInfo(null);
    setSoilError(null);
    setLandCoverError(null);
    setShowSoil(false);
    setShowLandCover(false);
    setLandCoverCollection(null);
  };

  const setAnalysisTarget = useCallback((target: SoilQueryTarget | null, options?: { keepResults?: boolean }) => {
    setSoilQueryTarget(target);

    if (options?.keepResults) {
      return;
    }

    setSoilCollection(null);
    setSelectedSoilFeature(null);
    setSoilInfo(null);
    setSoilError(null);
    setLandCoverCollection(null);
    setLandCoverError(null);
    setShowSoil(false);
    setShowLandCover(false);
  }, []);

  const handleToolChange = (tool: MapTool) => {
    if (tool === 'clear') {
      clearTransientMapState();
      setActiveTool('cursor');
      return;
    }
    if (tool !== 'draw') {
      setDrawingCoords([]);
      setIsDrawing(false);
      setMousePos(null);
    }
    if (tool !== 'measure') {
      setMeasurePoints([]);
    }
    setActiveTool(tool);
  };

  // Debounced Nominatim geocoding search
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    if (!value.trim()) {
      setSuggestions([]);
      return;
    }
    searchDebounceRef.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const data = await searchLocations(value);
        setSuggestions(data);
      } catch {
        setSuggestions([]);
      } finally {
        setSearchLoading(false);
      }
    }, 400);
  };

  const handleSelectSuggestion = (item: GeocodingResult) => {
    setSearchQuery(item.display_name);
    setSuggestions([]);
    setSearchFocused(false);
    if (mapRef.current) {
      mapRef.current.setView([parseFloat(item.lat), parseFloat(item.lon)], 15);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSuggestions([]);
    recenterMap();
  };

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setSuggestions([]);
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!mapContainerRef.current) {
      return;
    }

    let cancelled = false;

    async function initialiseMap() {
      try {
        setMapError(null);
        
        // Dynamically load leaflet from CDN
        if (!document.getElementById('leaflet-css')) {
          const link = document.createElement('link');
          link.id = 'leaflet-css';
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);
        }

        if (!window.L) {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Failed to load Leaflet script'));
            document.head.appendChild(script);
          });
        }

        const L = window.L;

        if (cancelled || !mapContainerRef.current) {
          return;
        }

        // Cleanup any existing map instance if React Strict Mode double-invoked
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }

        const map = L.map(mapContainerRef.current, {
          center: [DEFAULT_CENTER.lat, DEFAULT_CENTER.lng],
          zoom: 16,
          zoomControl: false,
          attributionControl: false,
          doubleClickZoom: false,
        });

        // Use free OpenStreetMap tiles
        tileLayerRef.current = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
        }).addTo(map);

        mapRef.current = map;

        map.on('zoomend', () => {
          setZoom(map.getZoom());
        });

        setMapReady(true);
      } catch (error) {
        if (cancelled) {
          return;
        }
        setMapError(error instanceof Error ? error.message : 'Failed to initialise Map.');
      }
    }

    void initialiseMap();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      setMapReady(false);
    };
  }, []);

  // Map Click Handler for Interactive Tools
  useEffect(() => {
    if (!mapRef.current || !window.L || !mapReady) return;
    const map = mapRef.current;

    const onMapClick = (e: any) => {
      const coord = { lat: e.latlng.lat, lng: e.latlng.lng };

      if (activeTool === 'pin') {
        setPins(prev => [...prev, coord]);
        setAnalysisTarget({ type: 'pin', coord, radiusKm: 2 });
      } else if (activeTool === 'probe') {
        const target: SoilQueryTarget = { type: 'pin', coord, radiusKm: 2 };
        setPins(prev => [...prev, coord]);
        setAnalysisTarget(target, { keepResults: true });
        void fetchSoilIntelligence(target);
      } else if (activeTool === 'measure') {
        setMeasurePoints((prev) => {
          if (prev.length >= 2) {
            return [coord];
          }
          return [...prev, coord];
        });
      } else if (activeTool === 'draw') {
        if (!isDrawing) {
          // Start a new drawing without clearing prior polygons.
          setDrawingCoords([coord]);
          setIsDrawing(true);
        } else {
          // Check distance to first point to close polygon
          const firstPoint = map.latLngToLayerPoint([drawingCoords[0].lat, drawingCoords[0].lng]);
          const currentPoint = e.layerPoint;
          const distance = firstPoint.distanceTo(currentPoint);
          
          if (drawingCoords.length > 1 && distance < 15) {
            setPolygonCoordsList((prev) => {
              const newId = String(prev.length + 1).padStart(3, '0');
              const completedPolygon = { id: newId, coords: drawingCoords };
              setAnalysisTarget({
                type: 'polygon',
                centroid: getPolygonCentroid(completedPolygon.coords),
                radiusKm: getSoilRadiusKm(completedPolygon.coords),
                polygonId: newId,
              });
              return [...prev, completedPolygon];
            });
            setDrawingCoords([]);
            setIsDrawing(false);
            setActiveTool('cursor');
            setMousePos(null);
          } else {
            // Add point to current drawing
            setDrawingCoords(prev => [...prev, coord]);
          }
        }
      }
    };

    const onMouseMove = (e: any) => {
      if (liveCoordRef.current) {
        liveCoordRef.current.innerText = `Lat: ${e.latlng.lat.toFixed(6)}, Lng: ${e.latlng.lng.toFixed(6)}`;
      }
      if (isDrawing && activeTool === 'draw') {
        setMousePos({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    };

    map.on('click', onMapClick);
    map.on('mousemove', onMouseMove);

    // Escape to finish drawing
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDrawing) {
        if (drawingCoords.length > 2) {
          setPolygonCoordsList((prev) => {
            const newId = String(prev.length + 1).padStart(3, '0');
            const completedPolygon = { id: newId, coords: drawingCoords };
            setAnalysisTarget({
              type: 'polygon',
              centroid: getPolygonCentroid(completedPolygon.coords),
              radiusKm: getSoilRadiusKm(completedPolygon.coords),
              polygonId: newId,
            });
            return [...prev, completedPolygon];
          });
        }
        setDrawingCoords([]);
        setIsDrawing(false);
        setActiveTool('cursor');
        setMousePos(null);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      map.off('click', onMapClick);
      map.off('mousemove', onMouseMove);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [mapReady, activeTool, isDrawing, drawingCoords, fetchSoilIntelligence, setAnalysisTarget]);

  // Render dynamic elements (Polygon, Preview Line, Pins)
  useEffect(() => {
    if (!mapRef.current || !window.L || !mapReady) return;
    const L = window.L;
    const map = mapRef.current;

    // 1. Render Final Polygons
    polygonRefs.current.forEach((polygon: any) => polygon.remove());
    polygonRefs.current = [];
    polygonCoordsList.forEach((poly, polygonIndex) => {
      if (poly.coords.length < 3) {
        return;
      }
      const latLngs = poly.coords.map(c => [c.lat, c.lng] as [number, number]);
      const polygon = L.polygon(latLngs, {
        color: 'var(--yellow-normal)',
        weight: 2,
        fillColor: 'var(--yellow-normal)',
        fillOpacity: 0.5,
      }).addTo(map);

      // Bind a nice popup showing the Land ID
      polygon.bindPopup(`<strong>Land ID:</strong> ${poly.id}`);
      polygon.bindTooltip(`Land ID: ${poly.id}`, { permanent: false, direction: 'center' });

      polygon.on('click', () => {
        if (activeTool !== 'cursor') {
          return;
        }
        setAnalysisTarget({
          type: 'polygon',
          centroid: getPolygonCentroid(poly.coords),
          radiusKm: getSoilRadiusKm(poly.coords),
          polygonId: poly.id,
        });
      });

      polygon.on('dblclick', (event: any) => {
        if (!canRemoveByClick) {
          return;
        }
        event.originalEvent?.stopPropagation?.();
        setPolygonCoordsList((prev) => prev.filter((_, index) => index !== polygonIndex));
      });
      polygonRefs.current.push(polygon);
    });

    // 2. Render Drawing Preview Line
    if (drawingLineRef.current) {
      drawingLineRef.current.remove();
    }
    if (isDrawing && drawingCoords.length > 0) {
      const latLngs = drawingCoords.map(c => [c.lat, c.lng] as [number, number]);
      if (mousePos) {
        latLngs.push([mousePos.lat, mousePos.lng]);
      }
      drawingLineRef.current = L.polyline(latLngs, {
        color: 'var(--yellow-normal)',
        weight: 2,
        dashArray: '5, 5',
      }).addTo(map);
    }

    // 2.5 Render Crosshairs at vertices
    crosshairRefs.current.forEach((marker: any) => marker.remove());
    crosshairRefs.current = [];
    
    const crosshairIcon = L.divIcon({
      className: 'custom-crosshair-icon',
      html: `<svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M7.1006 0C7.3767 0 7.6006 0.224 7.6006 0.5V6.701H13.8018C14.0779 6.701 14.3018 6.925 14.3018 7.201C14.3017 7.477 14.0778 7.701 13.8018 7.701H7.6006V13.802C7.6006 14.078 7.3767 14.302 7.1006 14.302C6.8246 14.302 6.6006 14.078 6.6006 13.802V7.701H0.5C0.224 7.701 0.0001 7.477 0 7.201C0 6.925 0.224 6.701 0.5 6.701H6.6006V0.5C6.6006 0.224 6.8246 0 7.1006 0Z" fill="var(--green-dark-active)"/></svg>`,
      iconSize: [15, 15],
      iconAnchor: [7.5, 7.5],
    });

    const currentVertices = isDrawing ? drawingCoords : sidebarCoords;
    currentVertices.forEach(coord => {
      const marker = L.marker([coord.lat, coord.lng], { icon: crosshairIcon, interactive: false }).addTo(map);
      crosshairRefs.current.push(marker);
    });

    // 3. Render Pins
    markerRefs.current.forEach((marker: any) => marker.remove());
    markerRefs.current = [];
    
    // Custom icon matching Figma style slightly
    const customIcon = L.divIcon({
      className: 'custom-pin-icon',
      html: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 4C15.866 4 19 7.13401 19 11C19 16.0159 13.8819 19.0342 12.3984 19.8037C12.1456 19.9349 11.8544 19.9349 11.6016 19.8037C10.1181 19.0342 5 16.0159 5 11C5 7.13401 8.13401 4 12 4ZM12 8C10.3431 8 9 9.34315 9 11C9 12.6569 10.3431 14 12 14C13.6569 14 15 12.6569 15 11C15 9.34315 13.6569 8 12 8Z" fill="var(--ink-dark)"/></svg>`,
      iconSize: [24, 24],
      iconAnchor: [12, 24],
    });

    pins.forEach(pin => {
      const marker = L.marker([pin.lat, pin.lng], { icon: customIcon }).addTo(map);
      markerRefs.current.push(marker);
    });

    // 4. Render measurement line and endpoints
    if (measureLineRef.current) {
      measureLineRef.current.remove();
      measureLineRef.current = null;
    }
    measureMarkerRefs.current.forEach((marker: any) => marker.remove());
    measureMarkerRefs.current = [];

    if (measurePoints.length > 0) {
      const measureIcon = L.divIcon({
        className: 'custom-measure-icon',
        html: '<span style="display:block;width:10px;height:10px;border-radius:999px;background:#203A13;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,.25)"></span>',
        iconSize: [10, 10],
        iconAnchor: [5, 5],
      });

      measurePoints.forEach((point) => {
        const marker = L.marker([point.lat, point.lng], { icon: measureIcon, interactive: false }).addTo(map);
        measureMarkerRefs.current.push(marker);
      });

      if (measurePoints.length === 2) {
        const distance = getDistanceMeters(measurePoints[0], measurePoints[1]);
        const midpoint = {
          lat: (measurePoints[0].lat + measurePoints[1].lat) / 2,
          lng: (measurePoints[0].lng + measurePoints[1].lng) / 2,
        };
        measureLineRef.current = L.polyline(
          measurePoints.map(point => [point.lat, point.lng] as [number, number]),
          {
            color: 'var(--green-dark-active)',
            weight: 2,
            dashArray: '6 5',
          }
        ).addTo(map);
        const labelIcon = L.divIcon({
          className: 'custom-measure-label',
          html: `<span style="display:inline-flex;white-space:nowrap;border-radius:8px;background:white;padding:4px 8px;font:600 11px Montserrat, sans-serif;color:#203A13;box-shadow:0 2px 8px rgba(0,0,0,.16)">${formatDistance(distance)}</span>`,
          iconSize: [80, 24],
          iconAnchor: [40, 12],
        });
        const label = L.marker([midpoint.lat, midpoint.lng], { icon: labelIcon, interactive: false }).addTo(map);
        measureMarkerRefs.current.push(label);
      }
    }

  }, [polygonCoordsList, drawingCoords, isDrawing, pins, mapReady, mousePos, sidebarCoords, canRemoveByClick, activeTool, measurePoints, setAnalysisTarget]);

  // Initial fit bounds
  useEffect(() => {
    if (mapReady && polygonCoordsList.length > 0 && !isDrawing) {
      fitSelectionBounds();
    }
  }, [mapReady, polygonCoordsList, isDrawing]);

  useEffect(() => {
    if (!mapRef.current || !window.L) return;
    const L = window.L;

    // Remove current tile layer
    if (tileLayerRef.current) {
      mapRef.current.removeLayer(tileLayerRef.current);
    }

    if (mapType === 'satellite') {
      // ESRI World Imagery — free, no API key required
      tileLayerRef.current = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 19, attribution: 'Tiles © Esri' }
      ).addTo(mapRef.current);
    } else {
      // OpenStreetMap roadmap
      tileLayerRef.current = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        { maxZoom: 19 }
      ).addTo(mapRef.current);
    }

    // Re-add polygon on top after layer swap
    polygonRefs.current.forEach((polygon: any) => polygon.bringToFront());
  }, [mapType]);

  useEffect(() => {
    if (!showDistricts || districtBoundaries) {
      return;
    }

    let cancelled = false;
    getDistrictBoundaries()
      .then((response) => {
        if (!cancelled) {
          setDistrictBoundaries(response.data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setDistrictBoundaries({ type: 'FeatureCollection', features: [] });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [showDistricts, districtBoundaries]);

  useEffect(() => {
    if (!showSavedAreas) {
      return;
    }

    let cancelled = false;
    getSavedGisAreas()
      .then((response) => {
        if (!cancelled) {
          setSavedAreas(response.data);
          setSavedAreaError(null);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setSavedAreaError(error instanceof Error ? error.message : 'Failed to load saved GIS areas.');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [showSavedAreas]);

  useEffect(() => {
    if (!mapReady || !mapRef.current || !window.L) {
      return;
    }

    if (districtLayerRef.current) {
      districtLayerRef.current.remove();
      districtLayerRef.current = null;
    }

    if (!showDistricts || !districtBoundaries) {
      return;
    }

    districtLayerRef.current = window.L.geoJSON(districtBoundaries as any, {
      style: {
        color: '#356020',
        weight: 2,
        fillOpacity: 0,
        dashArray: '5 4',
      },
      onEachFeature: (feature: any, layer: any) => {
        const districtName = feature?.properties?.dtname;
        if (districtName) {
          layer.bindTooltip(String(districtName), { sticky: true });
        }
      },
    }).addTo(mapRef.current);

    return () => {
      if (districtLayerRef.current) {
        districtLayerRef.current.remove();
        districtLayerRef.current = null;
      }
    };
  }, [mapReady, showDistricts, districtBoundaries]);

  useEffect(() => {
    if (!mapReady || !mapRef.current || !window.L) {
      return;
    }

    if (soilLayerRef.current) {
      soilLayerRef.current.remove();
      soilLayerRef.current = null;
    }

    if (!showSoil || !soilCollection) {
      return;
    }

    soilLayerRef.current = window.L.geoJSON(soilCollection as any, {
      style: (feature: any) => {
        const properties = feature?.properties ?? {};
        const red = Number(properties.Red ?? 53);
        const green = Number(properties.Green ?? 96);
        const blue = Number(properties.Blue ?? 32);
        return {
          color: `rgb(${red}, ${green}, ${blue})`,
          weight: 2,
          fillColor: `rgb(${red}, ${green}, ${blue})`,
          fillOpacity: 0.34,
        };
      },
      onEachFeature: (feature: any, layer: any) => {
        layer.on('click', () => {
          setSelectedSoilFeature(feature as GeoJsonFeature<SoilPolygonProperties>);
        });
        const label = feature?.properties?.Dom_Soil ?? feature?.properties?.Indian_Classified_Value;
        if (label) {
          layer.bindTooltip(String(label), { sticky: true });
        }
      },
    }).addTo(mapRef.current);

    if (soilCollection.features.length > 0) {
      try {
        mapRef.current.fitBounds(soilLayerRef.current.getBounds(), { padding: [35, 35] });
      } catch {
        // Some upstream soil geometries can be empty.
      }
    }

    return () => {
      if (soilLayerRef.current) {
        soilLayerRef.current.remove();
        soilLayerRef.current = null;
      }
    };
  }, [mapReady, showSoil, soilCollection]);

  useEffect(() => {
    if (!mapReady || !mapRef.current || !window.L) {
      return;
    }

    if (landCoverLayerRef.current) {
      landCoverLayerRef.current.remove();
      landCoverLayerRef.current = null;
    }

    if (!showLandCover || !landCoverCollection) {
      return;
    }

    const color = getLandCoverColor(landCoverType);
    landCoverLayerRef.current = window.L.geoJSON(landCoverCollection as any, {
      style: {
        color,
        weight: 1.6,
        fillColor: color,
        fillOpacity: 0.38,
      },
      onEachFeature: (feature: any, layer: any) => {
        const label = feature?.properties?.label
          ?? feature?.properties?.gridcode
          ?? landCoverCollection.land_cover_index_type
          ?? LAND_COVER_OPTIONS.find((option) => option.value === landCoverType)?.label;
        if (label) {
          layer.bindTooltip(String(label), { sticky: true });
        }
      },
    }).addTo(mapRef.current);

    if (landCoverCollection.features.length > 0) {
      try {
        mapRef.current.fitBounds(landCoverLayerRef.current.getBounds(), { padding: [35, 35] });
      } catch {
        // Some upstream geometries can be empty.
      }
    }

    return () => {
      if (landCoverLayerRef.current) {
        landCoverLayerRef.current.remove();
        landCoverLayerRef.current = null;
      }
    };
  }, [mapReady, showLandCover, landCoverCollection, landCoverType]);

  useEffect(() => {
    if (!mapReady || !mapRef.current || !window.L) {
      return;
    }

    if (savedAreasLayerRef.current) {
      savedAreasLayerRef.current.remove();
      savedAreasLayerRef.current = null;
    }

    if (!showSavedAreas || savedAreas.length === 0) {
      return;
    }

    const featureCollection: GeoJsonFeatureCollection<JsonObject> = {
      type: 'FeatureCollection',
      features: savedAreas.map(savedAreaToFeature).filter((feature): feature is GeoJsonFeature<JsonObject> => Boolean(feature)),
    };

    savedAreasLayerRef.current = window.L.geoJSON(featureCollection as any, {
      style: {
        color: '#f3dd7e',
        weight: 2,
        fillColor: '#f3dd7e',
        fillOpacity: 0.22,
      },
      onEachFeature: (feature: any, layer: any) => {
        const label = feature?.properties?.label ?? feature?.properties?.id;
        if (label) {
          layer.bindTooltip(`Saved area: ${label}`, { sticky: true });
        }
      },
    }).addTo(mapRef.current);

    return () => {
      if (savedAreasLayerRef.current) {
        savedAreasLayerRef.current.remove();
        savedAreasLayerRef.current = null;
      }
    };
  }, [mapReady, showSavedAreas, savedAreas]);

  return (
    <div className="relative flex h-full min-h-[calc(100dvh-64px)] w-full flex-col overflow-hidden bg-panel lg:min-h-[720px] lg:flex-row">
      <div className="relative min-h-[calc(100dvh-64px)] flex-1 lg:min-h-0">
        <div ref={mapContainerRef} className="absolute inset-0" />

        {!mapReady && !mapError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-greenLight/40">
            <div className="rounded-2xl bg-white/90 px-5 py-3 text-sm font-medium text-ink shadow-sm">
              Loading Map...
            </div>
          </div>
        ) : null}

        {/* Live Coordinates (Top Right) */}
        <div className="absolute right-3 top-[74px] z-[1000] hidden items-center justify-center rounded-[10px] border border-white bg-white/80 px-[14px] py-[10px] shadow-sm backdrop-blur-[12px] sm:right-6 sm:top-6 sm:flex">
          <span ref={liveCoordRef} className="font-montserrat text-[12px] font-medium leading-[130%] text-muted tracking-wide">
            Lat: -, Lng: -
          </span>
        </div>

        {mapError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-greenLight/40 p-6">
            <div className="max-w-[440px] rounded-[24px] border border-lineActive bg-white px-6 py-5 text-center shadow-sm">
              <div className="font-montserrat text-[16px] font-semibold text-ink">Map Error</div>
              <p className="mt-2 text-sm text-muted">{mapError}</p>
            </div>
          </div>
        ) : null}

        <div className="absolute left-3 right-3 top-3 z-[1000] sm:left-6 sm:right-auto sm:top-6 sm:w-[min(417px,calc(100vw-320px))] lg:w-[417px]" ref={searchContainerRef}>
          <div className="relative">
            {/* Glassmorphism container matching Figma */}
            <div className="flex h-[46px] w-full items-center gap-[10px] rounded-[10px] border border-white bg-white/20 px-[14px] shadow-sm backdrop-blur-[12px] outline-none focus-within:outline-none focus-within:ring-0">
              {/* Figma pin SVG */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                <path d="M12 4C15.866 4 19 7.13401 19 11C19 16.0159 13.8819 19.0342 12.3984 19.8037C12.1456 19.9349 11.8544 19.9349 11.6016 19.8037C10.1181 19.0342 5 16.0159 5 11C5 7.13401 8.13401 4 12 4ZM12 8C10.3431 8 9 9.34315 9 11C9 12.6569 10.3431 14 12 14C13.6569 14 15 12.6569 15 11C15 9.34315 13.6569 8 12 8Z" fill="var(--ink-dark)"/>
              </svg>

              {/* Editable input */}
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') { setSuggestions([]); setSearchFocused(false); }
                  if (e.key === 'Enter' && suggestions.length > 0) { handleSelectSuggestion(suggestions[0]); }
                }}
                placeholder="Kendri, Dhamtari Rd, Raipur, CG"
                className="map-overlay-input min-w-0 flex-1 bg-transparent font-poppins text-[12px] font-normal leading-none text-inkBase outline-none focus:outline-none focus:ring-0 placeholder:text-muted"
              />

              {/* Right: spinner | circular X (clear) | arrow (navigate) */}
              {searchLoading ? (
                <div className="shrink-0">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-greenDarkActive border-t-transparent" />
                </div>
              ) : searchQuery ? (
                /* Circular close button when query is present */
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={handleClearSearch}
                  className="flex h-[21px] w-[21px] shrink-0 items-center justify-center rounded-full bg-white shadow-sm transition hover:scale-110 hover:bg-greenLight"
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L9 9M9 1L1 9" stroke="var(--ink-dark)" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
              ) : (
                /* Circular arrow button when empty */
                <button
                  type="button"
                  aria-label="Navigate to location"
                  onClick={recenterMap}
                  className="flex h-[21px] w-[21px] shrink-0 -rotate-45 items-center justify-center rounded-full bg-white shadow-sm transition hover:scale-110"
                >
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg" className="rotate-45">
                    <path d="M1 6.5H12M12 6.5L7 1.5M12 6.5L7 11.5" stroke="var(--green-dark-active)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              )}
            </div>

            {/* Suggestions dropdown */}
            {searchFocused && suggestions.length > 0 && (
              <div className="absolute top-[52px] left-0 w-full overflow-hidden rounded-[10px] border border-white bg-white/95 shadow-lg backdrop-blur-[12px]">
                {suggestions.map((item, i) => (
                  <button
                    key={i}
                    type="button"
                    className="flex w-full items-start gap-3 border-b border-lineLight px-4 py-3 text-left transition-colors hover:bg-greenLight last:border-0"
                    onMouseDown={(e) => { e.preventDefault(); handleSelectSuggestion(item); }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="mt-0.5 shrink-0">
                      <path d="M12 4C15.866 4 19 7.13401 19 11C19 16.0159 13.8819 19.0342 12.3984 19.8037C12.1456 19.9349 11.8544 19.9349 11.6016 19.8037C10.1181 19.0342 5 16.0159 5 11C5 7.13401 8.13401 4 12 4ZM12 8C10.3431 8 9 9.34315 9 11C9 12.6569 10.3431 14 12 14C13.6569 14 15 12.6569 15 11C15 9.34315 13.6569 8 12 8Z" fill="var(--green-dark-active)"/>
                    </svg>
                    <span className="line-clamp-2 font-montserrat text-[12px] font-medium leading-[130%] text-ink">{item.display_name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {showGisIntelligence ? (
          <>
            <GisLayerControls
              showDistricts={showDistricts}
              showSoil={showSoil}
              showSavedAreas={showSavedAreas}
              showLandCover={showLandCover}
              landCoverType={landCoverType}
              onToggleDistricts={() => setShowDistricts((current) => !current)}
              onToggleSoil={() => setShowSoil((current) => !current)}
              onToggleSavedAreas={() => setShowSavedAreas((current) => !current)}
              onToggleLandCover={() => setShowLandCover((current) => !current)}
              onLandCoverTypeChange={setLandCoverType}
              onFetchSoil={() => void fetchSoilIntelligence()}
              onFetchLandCover={() => void fetchLandCover()}
              soilLoading={soilLoading}
              landCoverLoading={landCoverLoading}
            />

            <ActiveTargetPanel target={soilQueryTarget} landCoverType={landCoverType} />

            <SoilIntelligencePanel
              soilFeature={selectedSoilFeature}
              soilInfo={soilInfo}
              loading={soilLoading}
              error={soilError ?? landCoverError ?? savedAreaError}
              selectedDepth={selectedSoilDepth}
              advancedMode={soilIntelligenceAdvanced}
              onDepthChange={(depth) => {
                setSelectedSoilDepth(depth);
                if (soilInfo && soilIntelligenceAdvanced) {
                  void fetchSoilIntelligence(undefined, depth);
                }
              }}
            />
          </>
        ) : null}

        <MapScaleBar map={mapRef.current} color={mapType === 'satellite' ? 'white' : 'black'} />

        <div className="absolute bottom-4 right-4 z-[1000] flex gap-3 drop-shadow-[0_0_10px_rgba(0,0,0,0.06)] sm:bottom-6 sm:right-8">
          <button
            type="button"
            className="relative h-[52px] w-[52px] overflow-hidden rounded-[4px] border-2 border-white shadow-md transition hover:scale-105"
            onClick={() => setMapType((current) => current === 'roadmap' ? 'satellite' : 'roadmap')}
            aria-label="Toggle map type"
            title={mapType === 'roadmap' ? 'Switch to Satellite' : 'Switch to Map'}
          >
            {/* Thumbnail changes to show the OTHER layer (what you'll switch to) */}
            {mapType === 'roadmap' ? (
              /* SAT thumbnail — shown when currently on roadmap */
              <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0">
                <rect width="52" height="52" fill="#4a7c59"/>
                <rect x="0" y="0" width="20" height="18" fill="#5a8f4a" opacity="0.9"/>
                <rect x="20" y="0" width="16" height="14" fill="#3d6b35" opacity="0.9"/>
                <rect x="36" y="0" width="16" height="22" fill="#6b9e5a" opacity="0.8"/>
                <rect x="0" y="18" width="14" height="20" fill="#8aaa6a" opacity="0.85"/>
                <rect x="14" y="14" width="22" height="18" fill="#c8b87a" opacity="0.75"/>
                <rect x="36" y="22" width="16" height="14" fill="#5a8040" opacity="0.9"/>
                <rect x="0" y="38" width="24" height="14" fill="#6b9e5a" opacity="0.8"/>
                <rect x="24" y="32" width="14" height="20" fill="#a89060" opacity="0.7"/>
                <rect x="38" y="36" width="14" height="16" fill="#4a7040" opacity="0.9"/>
                {/* Roads */}
                <path d="M0 28 Q16 24 26 26 Q36 28 52 22" stroke="rgba(255,255,255,0.55)" strokeWidth="2.5" fill="none"/>
                <path d="M30 0 Q28 16 26 26 Q24 36 22 52" stroke="rgba(255,255,255,0.45)" strokeWidth="2" fill="none"/>
              </svg>
            ) : (
              /* MAP thumbnail — shown when currently on satellite */
              <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0">
                <rect width="52" height="52" fill="#f0ede8"/>
                {/* Road network */}
                <path d="M0 26 Q13 24 26 26 Q39 28 52 25" stroke="#d4c8b0" strokeWidth="5" fill="none"/>
                <path d="M0 26 Q13 24 26 26 Q39 28 52 25" stroke="white" strokeWidth="3" fill="none"/>
                <path d="M26 0 Q24 13 26 26 Q28 39 25 52" stroke="#d4c8b0" strokeWidth="5" fill="none"/>
                <path d="M26 0 Q24 13 26 26 Q28 39 25 52" stroke="white" strokeWidth="3" fill="none"/>
                <path d="M0 8 Q18 12 30 10 Q42 8 52 14" stroke="#e0d8cc" strokeWidth="3" fill="none"/>
                <path d="M0 44 Q20 40 35 42 Q44 44 52 40" stroke="#e0d8cc" strokeWidth="3" fill="none"/>
                {/* Block fills */}
                <rect x="4" y="4" width="18" height="16" rx="1" fill="#e8e0d4" opacity="0.6"/>
                <rect x="30" y="6" width="18" height="12" rx="1" fill="#e8e0d4" opacity="0.6"/>
                <rect x="4" y="32" width="16" height="14" rx="1" fill="#e8e0d4" opacity="0.6"/>
                <rect x="32" y="32" width="16" height="14" rx="1" fill="#e8e0d4" opacity="0.6"/>
              </svg>
            )}
            {/* Label badge at bottom */}
            <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center bg-black/40 py-[3px]">
              <span className="font-['Poppins'] text-[9px] font-semibold uppercase tracking-wider text-white">
                {mapType === 'roadmap' ? 'SAT' : 'MAP'}
              </span>
            </div>
          </button>

          <MapZoomControls
            className="h-[52px] w-[23px] justify-between gap-0"
            buttonClassName="h-[24px] w-[23px] hover:bg-greenLight"
            iconClassName="h-3 w-3 text-greenDarkActive"
            onZoomIn={() => mapRef.current?.setZoom?.(zoom + 1)}
            onZoomOut={() => mapRef.current?.setZoom?.(zoom - 1)}
          />
        </div>

        {activeTool === 'draw' && (
          <div className="absolute bottom-[85px] left-3 right-3 z-[1000] text-center sm:left-1/2 sm:right-auto sm:-translate-x-1/2">
            <span className="inline-flex rounded-full border border-line bg-white/90 px-4 py-1.5 text-[11px] font-medium shadow-sm backdrop-blur-sm">
              Click points on the map, then click near the first point or press Escape to finish
            </span>
          </div>
        )}

        {activeTool === 'probe' && (
          <div className="absolute bottom-[85px] left-3 right-3 z-[1000] text-center sm:left-1/2 sm:right-auto sm:-translate-x-1/2">
            <span className="inline-flex rounded-full border border-line bg-white/90 px-4 py-1.5 text-[11px] font-medium shadow-sm backdrop-blur-sm">
              Click any map point to fetch soil intelligence
            </span>
          </div>
        )}

        {activeTool === 'measure' && (
          <div className="absolute bottom-[85px] left-3 right-3 z-[1000] text-center sm:left-1/2 sm:right-auto sm:-translate-x-1/2">
            <span className="inline-flex rounded-full border border-line bg-white/90 px-4 py-1.5 text-[11px] font-medium shadow-sm backdrop-blur-sm">
              Click two map points to measure distance
            </span>
          </div>
        )}

        {canRemoveByClick && polygonCoordsList.length > 0 && (
          <div className="absolute bottom-[85px] left-3 right-3 z-[1000] text-center sm:left-1/2 sm:right-auto sm:-translate-x-1/2">
            <span className="inline-flex rounded-full border border-line bg-white/90 px-4 py-1.5 text-[11px] font-medium shadow-sm backdrop-blur-sm">
              Double click a polygon to remove it
            </span>
          </div>
        )}

        <MapToolbar
          activeTool={activeTool}
          onToolChange={handleToolChange}
        />
      </div>

      {showSelectionSidebar && sidebarMode === 'selection' ? (
          <SelectionSidebar
            areaSqm={areaSqm}
            coords={sidebarCoords}
            polygonCount={polygonCoordsList.length}
            hasSelection={hasSelection}
            onSave={() => setShowSaveModal(true)}
          />
      ) : showSelectionSidebar ? (
        <CropPlanningSidebar
          landId={savedLandData?.id || '001'}
          areaSqm={areaSqm}
          onBack={() => setSidebarMode('selection')}
        />
      ) : null}
      <SaveSelectionModal 
        isOpen={showSaveModal} 
        onClose={() => setShowSaveModal(false)} 
        onSaveConfirm={handleSaveConfirm}
        areaSqm={areaSqm} 
        location={searchQuery} 
        polygons={polygonCoordsList} 
      />
    </div>
  );
}
