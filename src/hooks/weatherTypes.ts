export type WeatherLocation = {
  lat: number;
  lon: number;
  label: string;
};

export type CurrentWeatherData = {
  tempC: number;
  condition: string;
  description: string;
  fetchedAt: Date;
  alertText: string | null;
};

export type ForecastDay = {
  dayLabel: string;
  tempC: number;
  condition: string;
};

export type WeatherForecastData = {
  current: CurrentWeatherData;
  daily: ForecastDay[];
  chartTemps: number[];
  suggestion: string;
};
