import { apiFetch } from './client';

export interface WeatherCurrent {
  temp_c: number;
  day_label: string;
  time_label: string;
  condition: 'sun' | 'cloud' | 'rain' | 'storm';
  alert_text: string | null;
}

export interface WeatherDailyItem {
  day_label: string;
  temp_c: number;
  condition: 'sun' | 'cloud' | 'rain' | 'storm';
  wind_mph: number;
  rain_mm: number;
  humidity_gm3: number;
  highlighted: boolean;
}

export interface WeatherForecastResponse {
  current: WeatherCurrent;
  suggestion: string;
  daily: WeatherDailyItem[];
  layers_meta?: {
    default_layer?: string;
    supported_layers?: string[];
  };
}

/**
 * Fetch the weather forecast for the specified coordinates from the Django backend.
 */
export async function getWeatherForecast(lat: number, lon: number): Promise<WeatherForecastResponse> {
  return apiFetch(`/api/v1/climate-risk/forecast/?lat=${lat}&lon=${lon}`);
}
