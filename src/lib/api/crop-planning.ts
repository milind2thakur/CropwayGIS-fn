import { apiFetch } from './client';
import {
  ApiEnvelope,
  CalculationRequest,
  CalculationResponse,
  CropOption,
  Season,
  UnitOption,
} from '@/features/crop-planning/types';

export async function getSeasons(): Promise<ApiEnvelope<Array<{ id: Season; label: string }>>> {
  return apiFetch('/api/v1/reference/seasons/');
}

export async function getUnits(): Promise<ApiEnvelope<UnitOption[]>> {
  return apiFetch('/api/v1/reference/units/');
}

export async function getCrops(season: Season, query: string): Promise<ApiEnvelope<CropOption[]>> {
  const params = new URLSearchParams({ season });
  if (query) {
    params.append('q', query);
  }
  return apiFetch(`/api/v1/reference/crops/?${params.toString()}`);
}

export async function calculateCropPlan(payload: CalculationRequest): Promise<ApiEnvelope<CalculationResponse>> {
  return apiFetch('/api/v1/crop-planning/calculate/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
