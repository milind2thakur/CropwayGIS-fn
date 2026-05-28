'use client';

import React, { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import type L from 'leaflet';

import { cn } from '@/lib/utils';
import { getWeatherForecast, type WeatherForecastResponse } from '@/lib/api/climate-risk';
import { MapScaleBar } from '@/components/ui/map-scale-bar';

import { ClimateMapControls, type ClimateBaseLayer, type ClimateLayer } from './components/ClimateMapControls';
import { WeatherPanel } from './components/WeatherPanel';

const ClimateRiskMap = dynamic(
  () => import('./ClimateRiskMap').then((mod) => mod.ClimateRiskMap),
  { ssr: false }
);

const CLIMATE_RISK_LAYOUT = {
  panelWidth: 'w-[324px] xl:w-[342px]',
  panelInset: 'right-[10px] top-[10px] bottom-[10px]',
  mapHeaderInset: 'left-[16px] top-[12px]',
} as const;

export function ClimateRiskClient() {
  const router = useRouter();
  const [weatherData, setWeatherData] = useState<WeatherForecastResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [baseLayer, setBaseLayer] = useState<ClimateBaseLayer>('street');
  const [activeLayer, setActiveLayer] = useState<ClimateLayer>('temperature');
  const [zoomTrigger, setZoomTrigger] = useState<'in' | 'out' | null>(null);
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);

  const loadForecast = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getWeatherForecast(21.2517, 81.6304);
      setWeatherData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to retrieve weather data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadForecast();
  }, []);

  const cycleBaseLayer = () => {
    setBaseLayer((current) => {
      if (current === 'satellite') return 'street';
      if (current === 'street') return 'topographic';
      return 'satellite';
    });
  };

  return (
    <div className="relative isolate h-full min-h-[870px] overflow-hidden bg-[#EFEFEF]" id="climate-risk-page-container">
      <ClimateRiskMap
        baseLayer={baseLayer}
        activeLayer={activeLayer}
        zoomTrigger={zoomTrigger}
        onZoomTriggerHandled={() => setZoomTrigger(null)}
        onMapReady={setMapInstance}
      />

      <MapScaleBar map={mapInstance} color="black" className="bottom-[76px] left-[22px] z-[410]" />

      <div className={cn('absolute z-[400]', CLIMATE_RISK_LAYOUT.mapHeaderInset)}>
        <button type="button" onClick={() => router.back()} className="flex h-[22px] items-center gap-[5px] rounded-[10px] bg-[#DDEAD6] px-[8px] font-montserrat text-[11px] font-medium leading-[130%] text-[#203A13] transition hover:bg-[#d6e5d0]">
          <ArrowLeft className="h-[12px] w-[12px]" />
          Back
        </button>

        <h1 className="mt-[10px] font-montserrat text-[36px] font-medium leading-[110%] text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)] pointer-events-none">Weather alerts</h1>
      </div>

      <ClimateMapControls
        activeLayer={activeLayer}
        baseLayer={baseLayer}
        setActiveLayer={setActiveLayer}
        onCycleBaseLayer={cycleBaseLayer}
        onZoomIn={() => setZoomTrigger('in')}
        onZoomOut={() => setZoomTrigger('out')}
      />
      <WeatherPanel
        data={weatherData}
        loading={loading}
        error={error}
        onRetry={loadForecast}
        className={cn(CLIMATE_RISK_LAYOUT.panelInset, CLIMATE_RISK_LAYOUT.panelWidth)}
      />
    </div>
  );
}
