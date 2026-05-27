'use client';

import { MapPin, X, CalendarDays, ChevronDown, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { MapScaleBar } from '@/components/ui/map-scale-bar';
import { cn } from '@/lib/utils';
import { useCropPlanDraft } from './useCropPlanDraft';
import { getSeasons, getCrops } from '@/lib/api/crop-planning';
import { useQuery } from '@tanstack/react-query';

const DEFAULT_LOCATION_LABEL = 'Kendri, Dhamtari Rd, Raipur, CG';
const DEFAULT_CENTER = { lat: 21.2517, lng: 81.6304 };

// Hardcoded polygon from LandIntelligence
const SELECTION_PATH = [
  { lat: 21.2514, lng: 81.6296 },
  { lat: 21.252, lng: 81.6302 },
  { lat: 21.2512, lng: 81.631 },
];

function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  );
}

export function CropPlanningSelection({
  onContinue,
}: {
  onContinue: () => void;
}) {
  const { state, dispatch } = useCropPlanDraft();
  
  const seasonsQuery = useQuery({
    queryKey: ['seasons'],
    queryFn: getSeasons,
  });
  
  const cropsQuery = useQuery({
    queryKey: ['crops', state.season, state.search],
    queryFn: () => getCrops(state.season, state.search),
  });

  const availableCrops = cropsQuery.data?.data ?? [];
  const selectedCropIds = new Set(state.lines.map((line) => line.cropId));

  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    let cancelled = false;

    async function initialiseMap() {
      try {
        setMapError(null);
        if (!document.getElementById('leaflet-css')) {
          const link = document.createElement('link');
          link.id = 'leaflet-css';
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);
        }

        if (!window.L) {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Failed to load Leaflet'));
            document.head.appendChild(script);
          });
        }

        const L = window.L;

        if (cancelled || !mapContainerRef.current) return;

        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }

        const map = L.map(mapContainerRef.current, {
          center: [DEFAULT_CENTER.lat, DEFAULT_CENTER.lng],
          zoom: 16,
          zoomControl: false,
          attributionControl: false,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
        }).addTo(map);

        // Keep the scale bar tied to the live Leaflet zoom level.
        mapRef.current = map;

        // Draw selection polygon
        const latLngs = SELECTION_PATH.map((c) => [c.lat, c.lng] as [number, number]);
        const polygon = L.polygon(latLngs, {
          color: '#2B4D1A',
          weight: 2,
          fillColor: '#70927F',
          fillOpacity: 0.8,
        }).addTo(map);

        map.fitBounds(polygon.getBounds());
        setMapReady(true);
      } catch (error) {
        if (!cancelled) {
          setMapError(error instanceof Error ? error.message : 'Map error');
        }
      }
    }

    void initialiseMap();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      setMapReady(false);
    };
  }, []);

  const recenterMap = () => {
    if (!mapRef.current) return;
    mapRef.current.panTo([DEFAULT_CENTER.lat, DEFAULT_CENTER.lng]);
  };

  return (
    <div className="relative flex h-full min-h-[720px] w-full overflow-hidden bg-[#E5E5E5]">
      {/* Map Area */}
      <div className="relative flex-1">
        <div ref={mapContainerRef} className="absolute inset-0" />
        
        {!mapReady && !mapError && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#F5F5F5]">
            <div className="rounded-2xl bg-white/90 px-5 py-3 text-sm font-medium text-[#243620] shadow-sm">
              Loading Map...
            </div>
          </div>
        )}

        <div className="absolute left-6 top-6 z-10 w-[400px]">
          <div className="relative flex h-[69px] w-full items-center rounded-[8px] border border-white/10 bg-white px-4 shadow-[0_10px_22px_rgba(163,163,163,0.08)]">
            <MapPin className="h-5 w-5 text-black" />
            <input
              className="ml-3 h-full w-full bg-transparent font-['Geist'] text-[14px] text-[#2D2D2D] outline-none"
              defaultValue={DEFAULT_LOCATION_LABEL}
              readOnly
            />
            <button type="button" onClick={recenterMap}>
              <X className="h-5 w-5 text-black opacity-50" />
            </button>
            <div className="ml-4 flex gap-2">
              <button className="flex h-[26px] items-center rounded-[6px] bg-[#CA224E] px-4 font-poppins text-[10px] font-medium text-white">
                Clear
              </button>
              <button className="flex h-[26px] items-center rounded-[6px] bg-[#FAE9ED] px-4 font-poppins text-[10px] font-medium text-[#981A3B]">
                Edit
              </button>
            </div>
          </div>
          {/* Sub divisions row */}
          <div className="mt-2 flex h-[26px] items-center gap-3 opacity-50">
            <span className="font-['Geist'] text-[14px] text-[#2D2D2D]">Raipur</span>
            <div className="h-2 w-px bg-black" />
            <span className="font-['Geist'] text-[14px] text-[#2D2D2D]">Raipur City</span>
            <div className="h-2 w-px bg-black" />
            <span className="font-['Geist'] text-[14px] text-[#2D2D2D]">City Division 1</span>
            <div className="h-2 w-px bg-black" />
            <span className="font-['Geist'] text-[14px] text-[#2D2D2D]">Sub-Div 2</span>
          </div>
          <div className="font-['Geist'] text-[14px] text-[#2D2D2D] opacity-50">
            11kv Industrial area
          </div>
        </div>

        <MapScaleBar map={mapRef.current} color="black" />
      </div>

      {/* Details Panel */}
      <div className="flex w-[254px] shrink-0 flex-col bg-white">
        {/* Saved Land Parcel Section */}
        <div className="flex flex-col items-center pt-3 pb-4">
          <div className="font-montserrat text-[10px] font-medium opacity-70 mb-[11px]">
            Saved Land Parcel
          </div>
          <div className="flex h-[32px] w-[232px] items-center justify-between rounded-[7px] bg-[#F4F7FA] px-[13px]">
            <span className="font-poppins text-[12px] text-[#1E1E1E]">001</span>
            <div className="flex h-[24px] items-center gap-[10px] rounded-[4px] bg-[#EDF2EA] px-[10px]">
              <span className="font-montserrat text-[12px] font-medium">1272</span>
              <span className="font-montserrat text-[10px] font-medium opacity-50">*Sqm</span>
            </div>
          </div>
        </div>

        <div className="h-px w-full bg-black/20" />

        {/* Season Toggle */}
        <div className="flex flex-col items-center py-4">
          <div className="flex h-[26px] w-[232px] items-center rounded-[8px] bg-[#EDF2EA] p-[2px]">
            <button
              onClick={() => dispatch({ type: 'setSeason', payload: 'kharif' })}
              className={cn(
                'flex h-[22px] flex-1 items-center justify-center rounded-[6px] font-montserrat text-[12px] font-medium transition-colors',
                state.season === 'kharif' ? 'bg-[#203A13] text-white' : 'text-[#203A13]'
              )}
            >
              Kharif
            </button>
            <button
              onClick={() => dispatch({ type: 'setSeason', payload: 'rabi' })}
              className={cn(
                'flex h-[22px] flex-1 items-center justify-center rounded-[6px] font-montserrat text-[12px] font-medium transition-colors',
                state.season === 'rabi' ? 'bg-[#203A13] text-white' : 'text-[#203A13]'
              )}
            >
              Rabi
            </button>
          </div>
        </div>

        {/* Select Crops */}
        <div className="flex flex-col px-[11px] pb-4">
          <div className="flex w-[232px] items-center justify-between mb-[5px]">
            <span className="font-montserrat text-[10px] font-medium opacity-70">Select Crops</span>
            <button className="flex items-center gap-[4px] opacity-50 hover:opacity-100">
              <span className="font-montserrat text-[8px] font-medium">View all</span>
              <ChevronRight className="h-2 w-2" />
            </button>
          </div>
          <div className="relative">
            <select
              className="h-[23px] w-[232px] appearance-none rounded-[8px] bg-[#EDF2EA] pl-3 pr-8 font-montserrat text-[10px] font-medium text-[#203A13] outline-none"
              onChange={(e) => {
                const crop = availableCrops.find(c => c.id === e.target.value);
                if (crop) {
                  dispatch({ type: 'addCrop', payload: { crop, defaultUnit: 'acre' } });
                }
              }}
              value=""
            >
              <option value="" disabled>Select Crops</option>
              {availableCrops.map(crop => (
                <option key={crop.id} value={crop.id} disabled={selectedCropIds.has(crop.id)}>
                  {crop.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-[8px] top-1/2 h-3 w-3 -translate-y-1/2 text-black" />
          </div>
        </div>

        <div className="h-px w-full bg-black/20" />

        {/* Dates */}
        <div className="flex flex-col items-center gap-[18px] py-[18px]">
          <div className="flex w-[233px] flex-col gap-[7px]">
            <span className="font-montserrat text-[10px] font-medium opacity-70">Sowing</span>
            <div className="flex h-[32px] items-center justify-between rounded-[7px] bg-[#F4F7FA] px-[13px]">
              <div className="flex items-center gap-2">
                <span className="font-poppins text-[12px] text-[#1E1E1E]">June</span>
                <span className="font-poppins text-[12px] text-[#1E1E1E] opacity-30">-</span>
                <span className="font-poppins text-[12px] text-[#1E1E1E]">2026</span>
              </div>
              <CalendarDays className="h-4 w-4 text-[#222222]" />
            </div>
          </div>
          <div className="flex w-[233px] flex-col gap-[7px]">
            <span className="font-montserrat text-[10px] font-medium opacity-70">Estimated completion date</span>
            <div className="flex h-[32px] items-center justify-between rounded-[7px] bg-[#F4F7FA] px-[13px]">
              <div className="flex items-center gap-2">
                <span className="font-poppins text-[12px] text-[#1E1E1E] opacity-60">Oct</span>
                <span className="font-poppins text-[12px] text-[#1E1E1E] opacity-30">-</span>
                <span className="font-poppins text-[12px] text-[#1E1E1E] opacity-60">2026</span>
              </div>
            </div>
          </div>
          <button
            onClick={onContinue}
            className="flex h-[26px] w-[232px] items-center justify-center rounded-[6px] bg-[#356020] transition-colors hover:bg-[#203A13]"
          >
            <span className="font-montserrat text-[12px] font-medium text-white">Save details</span>
          </button>
        </div>

        <div className="h-px w-full bg-black/20" />

        {/* Agri Inputs Promo */}
        <div className="flex flex-col items-center px-[11px] pt-[10px] pb-4">
          <div className="mb-[6px] flex w-[232px] items-center justify-between">
            <span className="font-montserrat text-[10px] font-medium opacity-70">Agri Inputs</span>
            <button className="flex items-center gap-[4px] opacity-50 hover:opacity-100">
              <span className="font-montserrat text-[8px] font-medium">View all</span>
              <ChevronRight className="h-2 w-2" />
            </button>
          </div>
          <div className="relative h-[145px] w-[232px] overflow-hidden rounded-[10px] bg-[#EDF2EA]">
            <Image
              src="/consultation-image.svg"
              alt="Consultation illustration"
              fill
              className="object-cover object-center"
              unoptimized
            />
            <button className="absolute bottom-[7px] right-[7px] flex h-[19px] w-[92px] items-center justify-center gap-1 rounded-[4px] bg-[#356020] transition hover:bg-[#203A13]">
              <span className="font-montserrat text-[10px] font-medium text-white">Book a call</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
