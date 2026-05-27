// Crop Portfolio API functions (backend endpoints)

export interface CropPlanItem {
  id: number;
  crop_id: string;
  area_value: number;
  unit: string;
}

export interface CropPlan {
  id: number;
  season: string;
  sowing_date: string | null;
  estimated_completion: string | null;
  status: string;
  land_parcel: number | null;
  items: CropPlanItem[];
  created_at: string;
  updated_at: string;
}

export interface CreateCropPlanDTO {
  season: string;
  sowing_date: string | null;
  estimated_completion: string | null;
  status: string;
  land_parcel: number | null;
}

export interface UpdateCropPlanDTO {
  season?: string;
  sowing_date?: string | null;
  estimated_completion?: string | null;
  status?: string;
  land_parcel?: number | null;
}

/**
 * Fetch all crop plans for the authenticated user
 */
export async function getCropPlans(): Promise<CropPlan[]> {
  return apiFetch('/api/v1/crop-planning/crop-plans/');
}

/**
 * Create a new crop plan
 */
export async function createCropPlan(data: CreateCropPlanDTO): Promise<CropPlan> {
  return apiFetch('/api/v1/crop-planning/crop-plans/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Update an existing crop plan
 */
export async function updateCropPlan(id: number, data: UpdateCropPlanDTO): Promise<CropPlan> {
  return apiFetch(`/api/v1/crop-planning/crop-plans/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * Delete a crop plan
 */
export async function deleteCropPlan(id: number): Promise<void> {
  return apiFetch(`/api/v1/crop-planning/crop-plans/${id}/`, {
    method: 'DELETE',
  });
}

/**
 * Add a crop item to a crop plan
 */
export async function addCropPlanItem(planId: number, cropData: { crop_id: string; area_value: number; unit: string }): Promise<CropPlanItem> {
  return apiFetch(`/api/v1/crop-planning/crop-plans/${planId}/items/`, {
    method: 'POST',
    body: JSON.stringify(cropData),
  });
}

/**
 * Update a crop item in a crop plan
 */
export async function updateCropPlanItem(planId: number, itemId: number, cropData: { crop_id: string; area_value: number; unit: string }): Promise<CropPlanItem> {
  return apiFetch(`/api/v1/crop-planning/crop-plans/${planId}/items/${itemId}/`, {
    method: 'PUT',
    body: JSON.stringify(cropData),
  });
}

/**
 * Delete a crop item from a crop plan
 */
export async function deleteCropPlanItem(planId: number, itemId: number): Promise<void> {
  return apiFetch(`/api/v1/crop-planning/crop-plans/${planId}/items/${itemId}/`, {
    method: 'DELETE',
  });
}