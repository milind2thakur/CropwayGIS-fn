'use client';

import { useEffect, useState } from 'react';
import type { ForecastDay, WeatherForecastData, WeatherLocation } from './weatherTypes';

type UseWeatherForecastResult = {
  data: WeatherForecastData | null;
  loading: boolean;
  error: string | null;
  stale: boolean;
};

const POLL_MS = 10 * 60 * 1000;
const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function forecastSuggestion(temps: number[]) {
  const maxTemp = Math.max(...temps);
  if (maxTemp >= 37) return 'Irrigate during early morning or evening hours.';
  return 'Weather is moderate. Continue planned field tasks.';
}

export function useWeatherForecast(location: WeatherLocation): UseWeatherForecastResult {
  const [data, setData] = useState<WeatherForecastData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stale, setStale] = useState(false);

  useEffect(() => {
    let active = true;

    const run = async () => {
      try {
        const key = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
        if (!key) throw new Error('Missing NEXT_PUBLIC_OPENWEATHER_API_KEY');

        const [currentRes, forecastRes] = await Promise.all([
          fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lon}&appid=${key}&units=metric`,
            { cache: 'no-store' }
          ),
          fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${location.lat}&lon=${location.lon}&appid=${key}&units=metric`,
            { cache: 'no-store' }
          ),
        ]);

        if (!currentRes.ok || !forecastRes.ok) {
          throw new Error('Weather forecast API failed');
        }

        const currentJson = await currentRes.json();
        const forecastJson = await forecastRes.json();

        const byDay = new Map<string, { temp: number; condition: string; dt: number }>();
        for (const item of forecastJson.list ?? []) {
          const dt = Number(item.dt ?? 0) * 1000;
          const date = new Date(dt);
          const keyDate = date.toISOString().slice(0, 10);
          if (!byDay.has(keyDate)) {
            byDay.set(keyDate, {
              temp: Math.round(Number(item.main?.temp ?? 0)),
              condition: String(item.weather?.[0]?.main ?? 'Unknown'),
              dt,
            });
          }
        }

        const daily: ForecastDay[] = Array.from(byDay.values())
          .slice(0, 7)
          .map((entry) => ({
            dayLabel: WEEK_DAYS[new Date(entry.dt).getDay()],
            tempC: entry.temp,
            condition: entry.condition,
          }));

        if (!daily.length) throw new Error('No forecast data returned');
        const chartTemps = daily.map((d) => d.tempC);
        const currentTemp = Math.round(Number(currentJson.main?.temp ?? chartTemps[0]));
        const condition = String(currentJson.weather?.[0]?.main ?? daily[0].condition);
        const description = String(currentJson.weather?.[0]?.description ?? condition);

        if (!active) return;
        setData({
          current: {
            tempC: currentTemp,
            condition,
            description,
            fetchedAt: new Date(),
            alertText: currentTemp >= 37 ? 'High temperature conditions expected. Crop stress likely.' : null,
          },
          daily,
          chartTemps,
          suggestion: forecastSuggestion(chartTemps),
        });
        setError(null);
        setStale(false);
      } catch (e) {
        if (!active) return;
        setError(e instanceof Error ? e.message : 'Failed to load forecast');
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
