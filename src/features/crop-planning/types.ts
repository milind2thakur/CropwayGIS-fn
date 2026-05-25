export type Season = 'kharif' | 'rabi';

export type CropOption = {
  id: string;
  name: string;
  durationLabel: string;
  seasons: Season[];
  active: boolean;
};

export type UnitOption = {
  id: string;
  label: string;
  multiplier_to_acre: number;
};

export type CropPlanLineDraft = {
  cropId: string;
  cropName: string;
  durationLabel: string;
  areaValue: number;
  unit: string;
};

export type DraftState = {
  season: Season;
  search: string;
  lines: CropPlanLineDraft[];
};

export type CalculationRequest = {
  season: Season;
  selected_crops: Array<{
    crop_id: string;
    area_value: number;
    unit: string;
  }>;
};

export type CalculationRow = {
  cropId: string;
  cropName: string;
  durationLabel: string;
  area: {
    value: number;
    unit: string;
    normalizedAcres: number;
  };
  breakdown: Record<string, number>;
  rowTotal: number;
};

export type CostComponent = {
  key: string;
  label: string;
};

export type CalculationResponse = {
  season: Season;
  currency: string;
  components: CostComponent[];
  rows: CalculationRow[];
  grandTotal: number;
  assumptions: {
    draftPersistence: string;
    costTemplateVersion: string;
  };
};

export type ApiEnvelope<T> = {
  data: T;
  meta?: Record<string, string>;
};

