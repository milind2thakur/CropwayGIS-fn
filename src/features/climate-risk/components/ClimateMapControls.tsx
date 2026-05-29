import React from 'react';
import { CloudRain, Sun, Wind, Satellite, Radar, Droplets, Thermometer, Gauge, ChevronUp } from 'lucide-react';

import { cn } from '@/lib/utils';

export type ClimateLayer = 'temperature' | 'precipitation' | 'wind' | 'radar' | 'humidity' | 'pressure';
export type ClimateBaseLayer = 'satellite' | 'street' | 'topographic';

const BASE_LAYER_THUMBNAILS: Record<ClimateBaseLayer, string> = {
  satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/10/406/839',
  street: 'https://tile.openstreetmap.org/10/839/406.png',
  topographic: 'https://a.tile.opentopomap.org/10/839/406.png',
};

const BASE_LAYER_LABELS: Record<ClimateBaseLayer, string> = {
  satellite: 'Satellite',
  street: 'Street',
  topographic: 'Topographic',
};

function nextBaseLayer(baseLayer: ClimateBaseLayer): ClimateBaseLayer {
  if (baseLayer === 'satellite') return 'street';
  if (baseLayer === 'street') return 'topographic';
  return 'satellite';
}

function ClimateLayerLegend({ activeLayer }: { activeLayer: ClimateLayer }) {
  const legendByLayer: Record<ClimateLayer, { label: string, min: string, max: string, minClass: string, maxClass: string, bg: string }> = {
    temperature: {
      label: 'Temperature',
      min: '30°C',
      max: '40°C',
      minClass: 'text-black/80',
      maxClass: 'text-white',
      bg: 'bg-[linear-gradient(90deg,#E08C00_0%,#E3DE6B_50%,#EBEBC6_100%)]',
    },
    precipitation: {
      label: 'Precipitation',
      min: '0 mm',
      max: '10 mm',
      minClass: 'text-black/80',
      maxClass: 'text-white',
      bg: 'bg-[linear-gradient(90deg,#E0F2FE_0%,#0284C7_100%)]',
    },
    wind: {
      label: 'Wind',
      min: '0 mph',
      max: '40 mph',
      minClass: 'text-black/80',
      maxClass: 'text-white',
      bg: 'bg-[linear-gradient(90deg,#F0FDFA_0%,#0D9488_100%)]',
    },
    radar: {
      label: 'Radar',
      min: 'Light',
      max: 'Heavy',
      minClass: 'text-white/80',
      maxClass: 'text-white',
      bg: 'bg-[linear-gradient(90deg,#0000FF_0%,#FF0000_50%,#FFFF00_100%)]',
    },
    humidity: {
      label: 'Humidity',
      min: '0%',
      max: '100%',
      minClass: 'text-black/80',
      maxClass: 'text-white',
      bg: 'bg-[linear-gradient(90deg,#E0F2FE_0%,#0284C7_100%)]',
    },
    pressure: {
      label: 'Pressure',
      min: '980 hPa',
      max: '1040 hPa',
      minClass: 'text-black/80',
      maxClass: 'text-white',
      bg: 'bg-[linear-gradient(90deg,#F0FDFA_0%,#0D9488_100%)]',
    },
  };
  const activeLegend = legendByLayer[activeLayer];

  return (
    <div className="absolute bottom-[12px] left-[22px] z-[400] h-[28px] w-[268px] font-montserrat">
      <div className={cn('flex h-[28px] w-full items-center justify-between px-[5px] text-[12px] font-medium leading-[130%]', activeLegend.bg)}>
        <span className={activeLegend.maxClass}>{activeLegend.max}</span>
        <span className={activeLegend.minClass}>{activeLegend.min}</span>
      </div>
    </div>
  );
}

export function ClimateMapControls({
  activeLayer,
  baseLayer,
  setActiveLayer,
  onCycleBaseLayer,
  onZoomIn,
  onZoomOut,
}: {
  activeLayer: ClimateLayer;
  baseLayer: ClimateBaseLayer;
  setActiveLayer: (layer: ClimateLayer) => void;
  onCycleBaseLayer: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
}) {
  const nextLayer = nextBaseLayer(baseLayer);

  const [menuOpen, setMenuOpen] = React.useState(true);

  return (
    <>
      <ClimateLayerLegend activeLayer={activeLayer} />

      {/* Layer Controls (Zoom Earth Style) */}
      <div className="absolute top-[20px] left-[20px] z-[400] w-[210px] rounded-[12px] border border-white/10 bg-[#2a2d2a]/95 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.6)] text-white font-montserrat overflow-hidden transition-all">
        
        {/* Header */}
        <button 
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex w-full items-center justify-between px-[16px] py-[14px] hover:bg-white/5 transition-colors"
        >
          <span className="text-[11px] font-bold tracking-widest text-white/80 uppercase">Weather Maps</span>
          <ChevronUp className={cn("h-4 w-4 text-white/60 transition-transform", !menuOpen && "rotate-180")} />
        </button>

        {menuOpen && (
          <div className="px-[12px] pb-[12px] flex flex-col gap-[2px]">
            {/* Base Layer Selection */}
            <button 
              onClick={onCycleBaseLayer}
              className={cn("flex items-center gap-[12px] rounded-full px-[12px] py-[8px] transition-colors mb-[8px]", baseLayer === 'satellite' ? "bg-white/20" : "hover:bg-white/10")}
            >
              <Satellite className="h-[18px] w-[18px] text-white/90" />
              <span className="text-[14px] font-medium text-white/90">{BASE_LAYER_LABELS[baseLayer]}</span>
            </button>

            {/* Live/HD mock links */}
            <div className="flex flex-col gap-2 pl-[42px] mb-[16px]">
              <div className="flex items-center gap-2 text-[13px] font-medium text-white/90">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Live
              </div>
              <div className="flex items-center gap-2 text-[13px] font-medium text-white/40">
                <span className="w-[12px]"></span>
                HD
              </div>
            </div>

            {/* Weather Layers */}
            <LayerMenuItem icon={<Radar className="h-[18px] w-[18px]" />} label="Radar" layerId="radar" activeLayer={activeLayer} setActiveLayer={setActiveLayer} />
            <LayerMenuItem icon={<CloudRain className="h-[18px] w-[18px]" />} label="Precipitation" layerId="precipitation" activeLayer={activeLayer} setActiveLayer={setActiveLayer} />
            <LayerMenuItem icon={<Wind className="h-[18px] w-[18px]" />} label="Wind" layerId="wind" activeLayer={activeLayer} setActiveLayer={setActiveLayer} />
            <LayerMenuItem icon={<Thermometer className="h-[18px] w-[18px]" />} label="Temperature" layerId="temperature" activeLayer={activeLayer} setActiveLayer={setActiveLayer} />
            <LayerMenuItem icon={<Droplets className="h-[18px] w-[18px]" />} label="Humidity" layerId="humidity" activeLayer={activeLayer} setActiveLayer={setActiveLayer} />
            <LayerMenuItem icon={<Gauge className="h-[18px] w-[18px]" />} label="Pressure" layerId="pressure" activeLayer={activeLayer} setActiveLayer={setActiveLayer} />

          </div>
        )}
      </div>

      {/* Zoom Controls (Bottom Right) */}
      <div className="absolute bottom-[20px] right-[20px] z-[400] rounded-[8px] border border-white/10 bg-[#1a1c1a]/80 backdrop-blur-md shadow-lg overflow-hidden flex flex-col">
        <button onClick={onZoomIn} className="flex h-[32px] w-[32px] items-center justify-center text-white/70 hover:bg-white/10 hover:text-white transition-colors border-b border-white/10 font-bold">+</button>
        <button onClick={onZoomOut} className="flex h-[32px] w-[32px] items-center justify-center text-white/70 hover:bg-white/10 hover:text-white transition-colors font-bold">−</button>
      </div>
    </>
  );
}

function LayerMenuItem({ icon, label, layerId, activeLayer, setActiveLayer }: { icon: React.ReactNode, label: string, layerId: ClimateLayer, activeLayer: ClimateLayer, setActiveLayer: (l: ClimateLayer) => void }) {
  const active = activeLayer === layerId;
  return (
    <button 
      onClick={() => setActiveLayer(layerId)}
      className={cn("flex items-center gap-[12px] rounded-[8px] px-[12px] py-[10px] transition-colors", active ? "text-white bg-white/10" : "text-white/70 hover:bg-white/5 hover:text-white")}
    >
      {icon}
      <span className="text-[14px] font-medium">{label}</span>
    </button>
  );
}


