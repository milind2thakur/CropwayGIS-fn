import { apiFetch } from '@/lib/api/client';
import {
  ApiEnvelope,
  CalculationRequest,
  CalculationResponse,
  CropOption,
  Season,
  UnitOption,
} from '@/features/crop-planning/types';

export function getSeasons() {
  return apiFetch<ApiEnvelope<Array<{ id: Season; label: string }>>>('/api/v1/reference/seasons/');
}

export function getUnits() {
  return apiFetch<ApiEnvelope<UnitOption[]>>('/api/v1/reference/units/');
}

export function getCrops(season: Season, query: string) {
  const params = new URLSearchParams();
  params.set('season', season);
  if (query.trim()) {
    params.set('q', query.trim());
  }
  return apiFetch<ApiEnvelope<CropOption[]>>(`/api/v1/reference/crops/?${params.toString()}`);
}

export function calculateCropPlan(payload: CalculationRequest) {
  return apiFetch<ApiEnvelope<CalculationResponse>>('/api/v1/crop-planning/calculate/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

