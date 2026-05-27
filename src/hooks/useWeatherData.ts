'use client';

import { useEffect, useState } from 'react';
import type { CurrentWeatherData, WeatherLocation } from './weatherTypes';

type UseWeatherDataResult = {
  data: CurrentWeatherData | null;
  loading: boolean;
  error: string | null;
  stale: boolean;
};

const POLL_MS = 10 * 60 * 1000;

function buildAlert(tempC: number, condition: string) {
  if (tempC >= 37) return 'High temperature conditions expected. Crop stress likely.';
  if (condition.toLowerCase().includes('rain')) return 'Rain expected. Adjust field operations and irrigation.';
  return 'Weather conditions are stable for regular farm operations.';
}

export function useWeatherData(location: WeatherLocation): UseWeatherDataResult {
  const [data, setData] = useState<CurrentWeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stale, setStale] = useState(false);

  useEffect(() => {
    let active = true;

    const run = async () => {
      try {
        const key = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
        if (!key) throw new Error('Missing NEXT_PUBLIC_OPENWEATHER_API_KEY');

        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lon}&appid=${key}&units=metric`,
          { cache: 'no-store' }
        );
        if (!res.ok) throw new Error(`Weather API failed (${res.status})`);
        const json = await res.json();

        if (!active) return;
        const tempC = Math.round(Number(json.main?.temp ?? 0));
        const condition = String(json.weather?.[0]?.main ?? 'Unknown');
        const description = String(json.weather?.[0]?.description ?? condition);

        setData({
          tempC,
          condition,
          description,
          fetchedAt: new Date(),
          alertText: buildAlert(tempC, condition),
        });
        setError(null);
        setStale(false);
      } catch (e) {
        if (!active) return;
        setError(e instanceof Error ? e.message : 'Failed to load weather');
        setStale(true);
      } finally {
        if (active) setLoading(false);
      }
    };

    setLoading(true);
    run();
    const timer = setInterval(run, POLL_MS);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [location.lat, location.lon]);

  return { data, loading, error, stale };
}
