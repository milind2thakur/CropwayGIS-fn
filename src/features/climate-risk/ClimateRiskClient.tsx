'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import type L from 'leaflet';

import { cn } from '@/lib/utils';
import { getWeatherForecast, type WeatherForecastResponse } from '@/lib/api/climate-risk';
import { MapScaleBar } from '@/components/ui/map-scale-bar';

import { ClimateMapControls, type ClimateBaseLayer, type ClimateLayer } from './components/ClimateMapControls';
import { WeatherPanel } from './components/WeatherPanel';
import { RadarPlayback, type RadarFrame } from './components/RadarPlayback';
import { LocationSearch } from './components/LocationSearch';
import { MapOverlaysPanel, type MapOverlays, DEFAULT_OVERLAYS } from './components/MapOverlaysPanel';

const ClimateRiskMap = dynamic(
  () => import('./ClimateRiskMap').then((mod) => mod.ClimateRiskMap),
  { ssr: false }
);

const CLIMATE_RISK_LAYOUT = {
  panelWidth: 'w-[300px]',
  panelInset: 'right-[20px] top-[20px]',
  mapHeaderInset: 'left-[240px] top-[20px]',
} as const;

export function ClimateRiskClient() {
  const router = useRouter();
  const [weatherData, setWeatherData] = useState<WeatherForecastResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [baseLayer, setBaseLayer] = useState<ClimateBaseLayer>('satellite');
  const [activeLayer, setActiveLayer] = useState<ClimateLayer>('radar');
  const [zoomTrigger, setZoomTrigger] = useState<'in' | 'out' | null>(null);
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);

  // Map overlays state
  const [overlays, setOverlays] = useState<MapOverlays>(DEFAULT_OVERLAYS);

  const handleToggleOverlay = useCallback((key: keyof MapOverlays) => {
    setOverlays((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }, []);

  // Radar playback state
  const [radarFrames, setRadarFrames] = useState<RadarFrame[]>([]);
  const [radarIndex, setRadarIndex] = useState(0);

  // Fetch radar frames from RainViewer
  useEffect(() => {
    fetch('https://api.rainviewer.com/public/weather-maps.json')
      .then(res => res.json())
      .then(data => {
        const past = data?.radar?.past || [];
        const nowcast = data?.radar?.nowcast || [];
        const allFrames: RadarFrame[] = [...past, ...nowcast].map((f: any) => ({
          time: f.time,
          path: f.path,
        }));
        setRadarFrames(allFrames);
        // Start at the last "past" frame (most recent actual data)
        setRadarIndex(Math.max(0, past.length - 1));
      })
      .catch(console.error);
  }, []);

  const handleFrameChange = useCallback((index: number) => {
    if (index === -1) {
      // Auto-advance (from playback)
      setRadarIndex((prev) => (prev < radarFrames.length - 1 ? prev + 1 : 0));
    } else {
      setRadarIndex(index);
    }
  }, [radarFrames.length]);

  const currentRadarTimestamp = radarFrames[radarIndex]?.time ?? null;

  // Location state
  const [location, setLocation] = useState({ lat: 21.2517, lon: 81.6304, name: 'Raipur' });

  const handleLocationSelect = useCallback((lat: number, lon: number, name: string) => {
    setLocation({ lat, lon, name });
  }, []);

  const handleMapClick = useCallback((lat: number, lon: number) => {
    const name = `${lat.toFixed(4)}°, ${lon.toFixed(4)}°`;
    setLocation({ lat, lon, name });
  }, []);

  const loadForecast = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getWeatherForecast(location.lat, location.lon);
      setWeatherData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to retrieve weather data.');
    } finally {
      setLoading(false);
    }
  }, [location.lat, location.lon]);

  useEffect(() => {
    loadForecast();
  }, [loadForecast]);

  const cycleBaseLayer = () => {
    setBaseLayer((current) => {
      if (current === 'satellite') return 'street';
      if (current === 'street') return 'topographic';
      return 'satellite';
    });
  };

  const showPlayback = activeLayer === 'radar' || activeLayer === 'precipitation';

  return (
    <div className="relative isolate h-full min-h-[870px] overflow-hidden bg-[#EFEFEF]" id="climate-risk-page-container">
      <ClimateRiskMap
        baseLayer={baseLayer}
        activeLayer={activeLayer}
        radarTimestamp={currentRadarTimestamp}
        selectedLocation={location}
        zoomTrigger={zoomTrigger}
        onZoomTriggerHandled={() => setZoomTrigger(null)}
        onMapReady={setMapInstance}
        onLocationClick={handleMapClick}
        overlays={overlays}
      />

      <MapScaleBar map={mapInstance} color="white" className="bottom-[76px] left-[22px] z-[410]" />

      <div className={cn('absolute z-[400]', CLIMATE_RISK_LAYOUT.mapHeaderInset)}>
        <LocationSearch
          onLocationSelect={handleLocationSelect}
          currentLocation={location.name}
          className="w-[260px] mb-[10px]"
        />
        <button type="button" onClick={() => router.back()} className="flex h-[22px] items-center gap-[5px] rounded-[10px] bg-white/10 backdrop-blur-sm border border-white/20 px-[8px] font-montserrat text-[11px] font-medium leading-[130%] text-white transition hover:bg-white/20">
          <ArrowLeft className="h-[12px] w-[12px]" />
          Back
        </button>
      </div>

      <ClimateMapControls
        activeLayer={activeLayer}
        baseLayer={baseLayer}
        setActiveLayer={setActiveLayer}
        onCycleBaseLayer={cycleBaseLayer}
        onZoomIn={() => setZoomTrigger('in')}
        onZoomOut={() => setZoomTrigger('out')}
      />

      {/* Map Overlays Panel */}
      <MapOverlaysPanel
        overlays={overlays}
        onToggle={handleToggleOverlay}
        className="absolute right-[340px] top-[20px] z-[400] transition-all"
      />

      {/* Radar Playback Slider */}
      {showPlayback && (
        <RadarPlayback
          frames={radarFrames}
          activeIndex={radarIndex}
          onFrameChange={handleFrameChange}
        />
      )}

      <WeatherPanel
        data={weatherData}
        loading={loading}
        error={error}
        onRetry={loadForecast}
        locationName={location.name}
        className={cn(CLIMATE_RISK_LAYOUT.panelInset, CLIMATE_RISK_LAYOUT.panelWidth)}
      />
    </div>
  );
}

