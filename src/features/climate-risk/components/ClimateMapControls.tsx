import { CloudRain, Sun, Wind } from 'lucide-react';

import { MapLayerThumbnailToggle, MapZoomControls } from '@/components/ui/map-controls';
import { cn } from '@/lib/utils';

export type ClimateLayer = 'temperature' | 'precipitation' | 'wind';
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
  const legendByLayer = {
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
  } as const;
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

  return (
    <>
      <ClimateLayerLegend activeLayer={activeLayer} />

      <div className="absolute bottom-[13px] left-1/2 z-[400] flex h-[42px] w-[105px] -translate-x-1/2 items-center rounded-[14px] border border-black/5 bg-white px-[4px] shadow-[0_4px_14px_rgba(0,0,0,0.1)]">
        <button onClick={() => setActiveLayer('temperature')} className={cn('grid h-[33px] w-[32px] place-items-center rounded-[10px] transition duration-200', activeLayer === 'temperature' ? 'bg-[#407327] text-white shadow-sm' : 'text-black/50 hover:bg-black/5')} aria-label="Temperature layer"><Sun className="h-4 w-4" strokeWidth={1.5} /></button>
        <button onClick={() => setActiveLayer('wind')} className={cn('grid h-[33px] w-[33px] place-items-center rounded-[10px] transition duration-200', activeLayer === 'wind' ? 'bg-[#407327] text-white shadow-sm' : 'text-black/50 hover:bg-black/5')} aria-label="Wind layer"><Wind className="h-4 w-4" strokeWidth={1.4} /></button>
        <button onClick={() => setActiveLayer('precipitation')} className={cn('grid h-[33px] w-[32px] place-items-center rounded-[10px] transition duration-200', activeLayer === 'precipitation' ? 'bg-[#407327] text-white shadow-sm' : 'text-black/50 hover:bg-black/5')} aria-label="Rain layer"><CloudRain className="h-4 w-4" strokeWidth={1.5} /></button>
      </div>

      <div className="absolute bottom-[13px] right-[346px] z-[400] flex h-[36px] items-start gap-[4px] xl:right-[364px]">
        <MapLayerThumbnailToggle
          label={BASE_LAYER_LABELS[baseLayer]}
          nextLabel={BASE_LAYER_LABELS[nextLayer]}
          onToggle={onCycleBaseLayer}
          currentPreview={
            <img src={BASE_LAYER_THUMBNAILS[baseLayer]} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" draggable={false} />
          }
          nextPreview={
            <img src={BASE_LAYER_THUMBNAILS[nextLayer]} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" draggable={false} />
          }
        />
        <MapZoomControls onZoomIn={onZoomIn} onZoomOut={onZoomOut} />
      </div>
    </>
  );
}


