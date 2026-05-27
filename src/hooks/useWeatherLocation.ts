'use client';

import { useEffect, useMemo, useState } from 'react';
import type { WeatherLocation } from './weatherTypes';

type UseWeatherLocationResult = {
  location: WeatherLocation;
  source: 'gis' | 'browser' | 'default';
};

const DEFAULT_LOCATION: WeatherLocation = {
  lat: 21.2517,
  lon: 81.6304,
  label: 'Kendri, Dhamtari Rd, Raipur, CG',
};

export function useWeatherLocation(gisLocation?: WeatherLocation): UseWeatherLocationResult {
  const [browserLocation, setBrowserLocation] = useState<WeatherLocation | null>(null);

  useEffect(() => {
    if (!navigator.geolocation || gisLocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setBrowserLocation({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          label: 'Current location',
        });
      },
      () => {
        setBrowserLocation(null);
      },
      { timeout: 5000 }
    );
  }, [gisLocation]);

  return useMemo(() => {
    if (gisLocation) return { location: gisLocation, source: 'gis' as const };
    if (browserLocation) return { location: browserLocation, source: 'browser' as const };
    return { location: DEFAULT_LOCATION, source: 'default' as const };
  }, [browserLocation, gisLocation]);
}
