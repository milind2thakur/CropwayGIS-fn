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

function mapCondition(code: number): 'sun' | 'cloud' | 'rain' | 'storm' {
  if (code <= 1) return 'sun'; // clear
  if (code <= 3) return 'cloud'; // mainly clear, partly cloudy, overcast
  if (code === 45 || code === 48) return 'cloud'; // fog
  if (code >= 51 && code <= 67) return 'rain'; // drizzle/rain
  if (code >= 71 && code <= 77) return 'rain'; // snow
  if (code >= 80 && code <= 82) return 'rain'; // rain showers
  if (code >= 95 && code <= 99) return 'storm'; // thunderstorm
  return 'sun';
}

/**
 * Fetch the weather forecast for the specified coordinates using Open-Meteo (Free, No Key).
 */
export async function getWeatherForecast(lat: number, lon: number): Promise<WeatherForecastResponse> {
  const url = `/api/weather?lat=${lat}&lon=${lon}`;
  
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch weather from Open-Meteo');
  }
  const data = await res.json();
  
  const currentTemp = data.current?.temperature_2m || 0;
  const currentCode = data.current?.weather_code || 0;
  
  const daily: WeatherDailyItem[] = [];
  // Take up to 5 days
  const numDays = Math.min(5, data.daily?.time?.length || 0);
  for (let i = 0; i < numDays; i++) {
    const d = new Date(data.daily.time[i]);
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
    const maxTemp = data.daily.temperature_2m_max[i] || 0;
    const code = data.daily.weather_code[i] || 0;
    const windKm = data.daily.wind_speed_10m_max[i] || 0;
    const rain = data.daily.precipitation_sum[i] || 0;
    const humidity = data.daily.relative_humidity_2m_max[i] || 50;
    
    daily.push({
      day_label: i === 0 ? 'Today' : dayLabel,
      temp_c: Math.round(maxTemp),
      condition: mapCondition(code),
      wind_mph: Math.round(windKm * 0.621371), // convert km/h to mph
      rain_mm: rain,
      humidity_gm3: humidity, // Using % for humidity
      highlighted: i === 0,
    });
  }
  
  let alert = null;
  if (mapCondition(currentCode) === 'storm') {
    alert = 'Thunderstorm warning in effect.';
  } else if (mapCondition(currentCode) === 'rain' && daily[0]?.rain_mm > 10) {
    alert = 'Heavy rain expected today.';
  }
  
  return {
    current: {
      temp_c: Math.round(currentTemp),
      day_label: 'Today',
      time_label: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      condition: mapCondition(currentCode),
      alert_text: alert,
    },
    suggestion: 'Conditions look stable for current activities.',
    daily,
    layers_meta: {
      default_layer: 'temperature',
      supported_layers: ['temperature', 'precipitation', 'wind']
    }
  };
}
