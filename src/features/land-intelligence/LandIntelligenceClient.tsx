'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  Minus,
  Plus,
  ChevronDown,
  Calendar,
  Phone,
  Search,
} from 'lucide-react';
import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapScaleBar } from '@/components/ui/map-scale-bar';
import { searchLocations, type GeocodingResult } from '@/lib/api/land-intelligence';
import { cn } from '@/lib/utils';

declare global {
  interface Window {
    L: any;
  }
}

type Coord = {
  lat: number;
  lng: number;
};

type PolygonSelection = {
  id: string;
  coords: Coord[];
};

type MapTypeId = 'roadmap' | 'satellite';

const DEFAULT_LOCATION_LABEL = 'Kendri, Dhamtari Rd, Raipur, CG';
const DEFAULT_CENTER: Coord = { lat: 21.2517, lng: 81.6304 };
const SELECTION_PATH: Coord[] = [
  { lat: 21.2519, lng: 81.6301 },
  { lat: 21.2522, lng: 81.6305 },
  { lat: 21.2517, lng: 81.6308 },
];

function computePolygonAreaSqm(coords: Coord[]) {
  if (coords.length < 3) {
    return 0;
  }

  const earthRadius = 6378137;
  const lat0 = (coords.reduce((sum, coord) => sum + coord.lat, 0) / coords.length) * Math.PI / 180;
  const projected = coords.map((coord) => {
    const latRad = coord.lat * Math.PI / 180;
    const lngRad = coord.lng * Math.PI / 180;
    return {
      x: earthRadius * lngRad * Math.cos(lat0),
      y: earthRadius * latRad,
    };
  });

  let area = 0;
  for (let index = 0; index < projected.length; index += 1) {
    const current = projected[index];
    const next = projected[(index + 1) % projected.length];
    area += current.x * next.y - next.x * current.y;
  }

  return Math.abs(area / 2);
}

function formatArea(areaSqm: number) {
  return Math.round(areaSqm).toLocaleString('en-IN');
}

function flattenPolygonCoords(polygons: PolygonSelection[]) {
  return polygons.flatMap((p) => p.coords);
}

type MapTool = 'draw' | 'pin' | 'cursor';

function DrawAreaIcon({ className }: { className?: string }) {
  return (
    <svg width="17" height="18" viewBox="0 0 17 18" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* dashed rectangle */}
      <rect x="0.5" y="0.5" width="11.55" height="12.29" stroke="currentColor" strokeDasharray="2 2" />
      {/* vertical line of the + */}
      <path d="M12.57 8.49V17.34" stroke="currentColor" strokeLinecap="round" />
      {/* horizontal line of the + */}
      <path d="M17 12.92H8.14" stroke="currentColor" strokeLinecap="round" />
    </svg>
  );
}

function PinLocationIcon({ className }: { className?: string }) {
  return (
    <svg width="16" height="18" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path
        d="M15 7.5C15 12.518 9.512 15.903 7.925 16.776C7.657 16.924 7.343 16.924 7.075 16.776C5.488 15.903 0 12.518 0 7.5C0 3 3.634 0 7.5 0C11.5 0 15 3 15 7.5Z"
        stroke="currentColor"
      />
      <circle cx="7.5" cy="7.5" r="3.5" stroke="currentColor" />
    </svg>
  );
}

function CursorSelectIcon({ className }: { className?: string }) {
  return (
    <svg width="16" height="18" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path
        d="M1.374 2.611C1.233 1.315 2.699 0.468 3.751 1.238L14.785 9.312C15.934 10.153 15.373 11.973 13.949 12.021L9.83 12.16C8.997 12.188 8.233 12.629 7.793 13.336L5.613 16.834C4.859 18.044 3.003 17.62 2.849 16.203L1.374 2.611Z"
        stroke="currentColor"
      />
    </svg>
  );
}

function MapToolbar({
  activeTool,
  onToolChange,
}: {
  activeTool: MapTool;
  onToolChange: (tool: MapTool) => void;
}) {
  const tools: { id: MapTool; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'draw', label: 'Draw area', icon: DrawAreaIcon },
    { id: 'pin', label: 'Pin location', icon: PinLocationIcon },
    { id: 'cursor', label: 'Select', icon: CursorSelectIcon },
  ];

  return (
    <div
      className="absolute bottom-5 left-1/2 z-[1000] -translate-x-1/2 flex items-center justify-center gap-[18px] bg-white px-5 shadow-lg"
      style={{
        height: 52,
        borderRadius: 26,
      }}
    >
      {tools.map(({ id, label, icon: Icon }) => {
        const isActive = activeTool === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onToolChange(id)}
            aria-label={label}
            className={cn(
              'flex items-center justify-center transition-all duration-200',
              isActive
                ? 'bg-greenDark text-white w-[30px] h-[40px] rounded-[15px]'
                : 'h-[30px] w-[30px] rounded-[8px] text-ink hover:bg-greenLight'
            )}
          >
            <Icon className="w-[18px] h-[18px]" />
          </button>
        );
      })}
    </div>
  );
}

function SelectionSidebar({
  areaSqm,
  coords,
  polygonCount,
  hasSelection,
  onSave,
}: {
  areaSqm: number;
  coords: Coord[];
  polygonCount: number;
  hasSelection: boolean;
  onSave: () => void;
}) {
  return (
    <div className="flex w-[254px] shrink-0 flex-col border-l border-line bg-white">
      <div className="flex flex-col px-[10px] pb-[8px] pt-[10px]">
        <div className="flex flex-col gap-[6px]">
          <div className="font-montserrat text-[10px] font-medium leading-[130%] text-muted">
            Selection Area
          </div>
          <div className="flex items-center gap-[16px]">
            <div className="flex h-[24px] w-[181px] items-center rounded-[4px] bg-greenLight px-[10px] py-[4px]">
              <span className="font-montserrat text-[12px] font-medium leading-[130%] text-ink">
                {formatArea(areaSqm)}
              </span>
            </div>
            <span className="font-montserrat text-[10px] font-medium leading-[130%] text-muted">
              Sqm
            </span>
          </div>
          <div className="font-montserrat text-[10px] font-medium leading-[130%] text-muted">
            {polygonCount} polygon{polygonCount === 1 ? '' : 's'} selected
          </div>
        </div>
      </div>

      <div className="h-[0.5px] w-full bg-line" />

      {/* Middle block: Coordinates */}
      <div className="flex flex-col px-[10px] pb-[6px] pt-[8px]">
        <div className="mb-[5px] font-montserrat text-[10px] font-medium leading-[130%] text-muted">
          Coordinates
        </div>
        <div className="flex pl-[20px]">
          <div className="flex w-[113px] flex-col">
            <span className="font-montserrat text-[10px] font-medium leading-[130%] text-muted">
              Latitude
            </span>
            <div className="flex flex-col font-montserrat text-[12px] font-medium leading-[150%] text-ink">
              {coords.map((coord, index) => (
                <span key={`lat-${index}`}>{coord.lat.toFixed(4)}</span>
              ))}
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-montserrat text-[10px] font-medium leading-[130%] text-muted">
              Longitude
            </span>
            <div className="flex flex-col font-montserrat text-[12px] font-medium leading-[150%] text-ink">
              {coords.map((coord, index) => (
                <span key={`lng-${index}`}>{coord.lng.toFixed(4)}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="h-[0.5px] w-full bg-line" />

      {/* Bottom block: Save button */}
      <div className="px-[10px] pt-[9px]">
        <Button
          type="button"
          onClick={onSave}
          disabled={!hasSelection}
          className={cn(
            'h-[26px] w-[232px] rounded-[6px] px-[20px] py-[5px] font-montserrat text-[12px] font-medium leading-[130%]',
            hasSelection
              ? 'bg-greenDark text-white hover:bg-greenDarker'
              : 'bg-greenLightActive/70 text-white'
          )}
        >
          Save Selection
        </Button>
      </div>
    </div>
  );
}

function SaveSelectionModal({
  isOpen,
  onClose,
  onSaveConfirm,
  areaSqm,
  location,
  polygons,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSaveConfirm: (landId: string, owner: string) => void;
  areaSqm: number;
  location: string;
  polygons: PolygonSelection[];
}) {
  const previewMapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  
  const [landOwner, setLandOwner] = useState("Rakesh");
  const [landId, setLandId] = useState("001");

  // Dynamically update default Land Id when polygons change
  useEffect(() => {
    if (isOpen) {
      if (polygons.length > 0) {
        const ids = polygons.map(p => p.id).join(", ");
        setLandId(ids);
      } else {
        setLandId("001");
      }
    }
  }, [isOpen, polygons]);

  useEffect(() => {
    if (!isOpen || !previewMapRef.current || !window.L) return;

    const L = window.L;

    // Cleanup previous instance if any
    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.remove();
      } catch {
        // Silently ignore removal errors
      }
      mapInstanceRef.current = null;
    }

    // Initialize interactive-disabled Leaflet map
    const previewMap = L.map(previewMapRef.current, {
      zoomControl: false,
      attributionControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      touchZoom: false,
      boxZoom: false,
      keyboard: false,
    });

    // Satellite imagery layer in background
    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 19,
      }
    ).addTo(previewMap);

    mapInstanceRef.current = previewMap;

    // Add polygons and fit map bounds
    if (polygons.length > 0) {
      const featureGroup = L.featureGroup();
      let hasValidPolygon = false;

      polygons.forEach((poly) => {
        if (poly.coords.length >= 3) {
          hasValidPolygon = true;
          const latLngs = poly.coords.map(c => [c.lat, c.lng] as [number, number]);
          L.polygon(latLngs, {
            color: 'var(--yellow-normal)', // system yellow
            weight: 2.5,
            fillColor: 'var(--yellow-normal)',
            fillOpacity: 0.45,
          }).addTo(featureGroup);
        }
      });

      if (hasValidPolygon) {
        featureGroup.addTo(previewMap);
        try {
          previewMap.fitBounds(featureGroup.getBounds(), {
            padding: [25, 25],
          });
        } catch {
          // Fit bounds might fail if group is empty or invalid
        }
      } else {
        previewMap.setView([DEFAULT_CENTER.lat, DEFAULT_CENTER.lng], 16);
      }
    } else {
      previewMap.setView([DEFAULT_CENTER.lat, DEFAULT_CENTER.lng], 16);
    }

    // Force resize to ensure Leaflet renders tiles correctly inside a modal
    const timer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch {
          // Silently ignore removal errors
        }
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen, polygons]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-ink/40 backdrop-blur-sm">
      <div className="w-[600px] rounded-[24px] bg-white p-4 shadow-2xl">
        <div className="flex gap-4">
          {/* Left: Map Preview card inset inside padding */}
          <div className="relative h-[250px] w-[250px] shrink-0 overflow-hidden rounded-[16px] bg-canvas">
            <div ref={previewMapRef} className="h-full w-full z-0" />
          </div>

          {/* Right: Save Selection Form */}
          <div className="flex flex-1 flex-col justify-between">
            <div>
              <h2 className="font-montserrat text-[20px] font-medium leading-[130%] text-ink mb-2.5">
                Save Selection
              </h2>

              <div className="flex flex-col gap-2.5">
                {/* Land Owner Field */}
                <div>
                  <label className="mb-1 block font-montserrat text-[11px] font-medium text-muted">
                    Land Owner
                  </label>
                  <Input
                    type="text"
                    value={landOwner}
                    onChange={(e) => setLandOwner(e.target.value)}
                    className="h-[36px] w-full rounded-[8px] border-none bg-canvas px-3 font-montserrat text-[12px] font-medium text-ink focus:ring-1 focus:ring-greenDark"
                  />
                </div>

                {/* Land Id & Selection Area Row */}
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="mb-1 block font-montserrat text-[11px] font-medium text-muted">
                      Land Id
                    </label>
                    <Input
                      type="text"
                      value={landId}
                      onChange={(e) => setLandId(e.target.value)}
                      className="h-[36px] w-full rounded-[8px] border-none bg-canvas px-3 font-montserrat text-[12px] font-medium text-ink focus:ring-1 focus:ring-greenDark"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="mb-1 block font-montserrat text-[11px] font-medium text-muted">
                      Selection Area
                    </label>
                    <div className="flex h-[36px] items-center rounded-[8px] bg-greenLight px-3 font-montserrat text-[12px] font-bold text-ink">
                      <span>{formatArea(areaSqm)}</span>
                      <span className="ml-1 text-[10px] font-medium text-ink/40">*Sqkm</span>
                    </div>
                  </div>
                </div>

                {/* Location Field */}
                <div>
                  <label className="mb-1 block font-montserrat text-[11px] font-medium text-muted">
                    Location
                  </label>
                  <div className="font-montserrat text-[12px] font-medium leading-[140%] text-ink">
                    {location}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions Row */}
            <div className="mt-4 flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={onClose}
                className="h-[36px] flex-[1.2] rounded-[8px] bg-greenLightHover font-montserrat text-[12px] font-semibold text-ink hover:bg-greenLightActive hover:text-ink"
              >
                Cancel
              </Button>
              <Button
                onClick={() => onSaveConfirm(landId, landOwner)}
                className="h-[36px] flex-[1.8] rounded-[8px] bg-greenDark font-montserrat text-[12px] font-semibold text-white hover:bg-greenDarkHover"
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SowingDatePicker({
  selectedDate,
  onDateSelect,
}: {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  // Default to June 2026 if no date is selected
  const [viewDate, setViewDate] = useState(selectedDate || new Date(2026, 5, 1));
  
  const toggleOpen = () => setIsOpen(!isOpen);
  
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const fullMonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const years = Array.from({length: 15}, (_, i) => 2020 + i);

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // Monday is 0, Sunday is 6
  };

  const daysInMonth = getDaysInMonth(viewDate.getFullYear(), viewDate.getMonth());
  const firstDay = getFirstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth());
  
  const days = Array.from({length: daysInMonth}, (_, i) => i + 1);
  const blanks = Array.from({length: firstDay}, (_, i) => i);

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return selectedDate.getDate() === day && 
           selectedDate.getMonth() === viewDate.getMonth() &&
           selectedDate.getFullYear() === viewDate.getFullYear();
  };

  const handleDayClick = (day: number) => {
    onDateSelect(new Date(viewDate.getFullYear(), viewDate.getMonth(), day));
    setIsOpen(false);
  };

  const displayMonth = selectedDate ? fullMonths[selectedDate.getMonth()] : 'June';
  const displayYear = selectedDate ? selectedDate.getFullYear() : '2026';

  // Close when clicking outside
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col gap-[7px] relative" ref={containerRef}>
      <span className="font-montserrat text-[10px] font-medium text-muted">Sowing</span>
      <div 
        className="flex h-[32px] w-full items-center justify-between rounded-[7px] bg-surface px-[13px] py-[7px] cursor-pointer"
        onClick={toggleOpen}
      >
        <div className="flex items-center gap-[8px]">
          {selectedDate && <span className="font-poppins text-[12px] text-inkBase">{selectedDate.getDate()}</span>}
          <span className="font-poppins text-[12px] text-inkBase">{displayMonth}</span>
          <span className="font-poppins text-[12px] text-muted">-</span>
          <span className="font-poppins text-[12px] text-inkBase">{displayYear}</span>
        </div>
        <Calendar className="h-[14px] w-[14px] text-inkDark" />
      </div>

      {isOpen && (
        <div className="absolute top-[52px] left-[-16px] z-[100] w-[280px] rounded-[12px] bg-white p-4 shadow-lg border border-lineLight">
          <div className="flex justify-end gap-2 mb-4">
            <div className="relative">
              <select 
                className="appearance-none bg-white border border-line rounded-[8px] pl-3 pr-8 py-1.5 text-[12px] font-montserrat text-inkBase focus:outline-none"
                value={viewDate.getMonth()}
                onChange={(e) => setViewDate(new Date(viewDate.getFullYear(), parseInt(e.target.value), 1))}
              >
                {months.map((m, i) => <option key={m} value={i}>{m}</option>)}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-inkBase" />
            </div>
            <div className="relative">
              <select 
                className="appearance-none bg-white border border-line rounded-[8px] pl-3 pr-8 py-1.5 text-[12px] font-montserrat text-inkBase focus:outline-none"
                value={viewDate.getFullYear()}
                onChange={(e) => setViewDate(new Date(parseInt(e.target.value), viewDate.getMonth(), 1))}
              >
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-inkBase" />
            </div>
          </div>

          <div className="grid grid-cols-7 gap-y-2 text-center mb-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="font-montserrat text-[11px] font-medium text-inkBase">{d}</div>
            ))}
            <div className="font-montserrat text-[11px] font-medium text-greenDark">Sun</div>
          </div>

          <div className="grid grid-cols-7 gap-y-1 text-center">
            {blanks.map(b => <div key={`blank-${b}`} />)}
            {days.map(d => (
              <div 
                key={d} 
                onClick={() => handleDayClick(d)}
                className={cn(
                  "flex items-center justify-center h-8 w-8 mx-auto rounded-[6px] font-montserrat text-[12px] cursor-pointer transition-colors",
                  isSelected(d) 
                    ? "bg-greenDark text-white font-medium" 
                    : "text-inkBase hover:bg-surface"
                )}
              >
                {d}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CropPlanningSidebar({
  landId,
  areaSqm,
}: {
  landId: string;
  areaSqm: number;
  onBack: () => void;
}) {
  const router = useRouter();
  const [season, setSeason] = useState<'Kharif' | 'Rabi'>('Rabi');
  const [crop, setCrop] = useState<string | null>(null);
  const [isCropDropdownOpen, setIsCropDropdownOpen] = useState(false);
  const [searchCrop, setSearchCrop] = useState('');
  const [sowingDate, setSowingDate] = useState<Date | null>(null);

  const crops = ['Tomato', 'Rice', 'Barley', 'Wheat'];
  const filteredCrops = crops.filter(c => c.toLowerCase().includes(searchCrop.toLowerCase()));

  return (
    <div className="flex w-[254px] shrink-0 flex-col border-l border-line bg-white relative">
      <div className="flex flex-col px-[10px] pb-[8px] pt-[14px]">
        
        {/* Saved Land Parcel */}
        <div className="flex flex-col gap-[11px] mb-[15px]">
          <div className="flex w-full items-center justify-start">
             <span className="font-montserrat text-[10px] font-medium leading-[130%] text-muted">
               Saved Land Parcel
             </span>
          </div>
          <div className="flex h-[32px] w-full items-center justify-between rounded-[7px] bg-surface px-[13px] py-[7px]">
            <span className="font-poppins text-[12px] text-inkBase">{landId}</span>
            <div className="flex h-[24px] items-center gap-[10px] rounded-[4px] bg-greenLight px-[10px] py-[4px]">
              <span className="font-montserrat text-[12px] font-medium text-ink">{formatArea(areaSqm)}</span>
              <span className="font-montserrat text-[10px] font-medium text-muted">*Sqm</span>
            </div>
          </div>
        </div>

        <div className="h-[0.5px] w-full bg-line mb-[10px]" />

        {/* Season Toggle */}
        <div className="flex h-[26px] w-full items-center justify-center rounded-[8px] bg-greenLight p-[2px] mb-[18px]">
          <button
            onClick={() => setSeason('Kharif')}
            className={cn(
              "flex h-[22px] flex-1 items-center justify-center rounded-[6px] font-montserrat text-[12px] font-medium transition-colors",
              season === 'Kharif' ? "bg-greenDark text-white" : "bg-transparent text-greenDark"
            )}
          >
            Kharif
          </button>
          <button
            onClick={() => setSeason('Rabi')}
            className={cn(
              "flex h-[22px] flex-1 items-center justify-center rounded-[6px] font-montserrat text-[12px] font-medium transition-colors",
              season === 'Rabi' ? "bg-greenDark text-white" : "bg-transparent text-greenDark"
            )}
          >
            Rabi
          </button>
        </div>

        {/* Select Crops */}
        <div className="flex flex-col gap-[5px] mb-[18px] relative">
          <div className="flex items-center justify-between">
            <span className="font-montserrat text-[10px] font-medium text-muted">Select Crops</span>
            <div className="flex items-center gap-[7px] opacity-50 cursor-pointer">
              <span className="font-montserrat text-[8px] font-medium">View all</span>
              <ChevronDown className="h-[8px] w-[8px] -rotate-90" />
            </div>
          </div>
          
          <button
            onClick={() => setIsCropDropdownOpen(!isCropDropdownOpen)}
            className="flex h-[23px] w-full items-center justify-between rounded-[8px] bg-greenLight px-[10px] py-[2px]"
          >
            {crop ? (
              <span className="font-montserrat text-[10px] font-medium text-greenDark">{crop}</span>
            ) : (
              <span className="font-montserrat text-[10px] font-medium text-muted">Select Crops</span>
            )}
            {crop ? (
              <div onClick={(e) => { e.stopPropagation(); setCrop(null); }} className="flex items-center justify-center cursor-pointer">
                <svg width="7" height="7" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              </div>
            ) : (
              <ChevronDown className="h-[12px] w-[12px] text-inkBase" />
            )}
          </button>

          {isCropDropdownOpen && (
            <div className="absolute top-[40px] left-0 z-50 flex w-full flex-col overflow-hidden rounded-[8px] border border-line bg-white shadow-lg">
              <div className="flex items-center gap-2 border-b border-lineLight px-[10px] py-[6px]">
                <Search className="h-[10px] w-[10px] text-muted" />
                <input
                  type="text"
                  placeholder="Search Crop"
                  value={searchCrop}
                  onChange={(e) => setSearchCrop(e.target.value)}
                  className="w-full bg-transparent font-montserrat text-[10px] outline-none placeholder:text-muted"
                />
              </div>
              <div className="flex max-h-[120px] flex-col overflow-y-auto bg-surface">
                {filteredCrops.map(c => (
                  <button
                    key={c}
                    onClick={() => { setCrop(c); setIsCropDropdownOpen(false); }}
                    className="px-[10px] py-[6px] text-left font-montserrat text-[10px] hover:bg-lineLight text-inkBase"
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="h-[0.5px] w-full bg-line mb-[10px]" />

        {/* Sowing & Estimated completion date */}
        <div className="flex flex-col gap-[12px] mb-[18px]">
          <SowingDatePicker selectedDate={sowingDate} onDateSelect={setSowingDate} />

          <div className="flex flex-col gap-[7px]">
            <span className="font-montserrat text-[10px] font-medium text-muted">Estimated completion date</span>
            <div className="flex h-[32px] w-full items-center rounded-[7px] bg-surface px-[13px] py-[7px]">
              <div className="flex items-center gap-[8px]">
                <span className="font-poppins text-[12px] text-inkBase/60">Oct</span>
                <span className="font-poppins text-[12px] text-muted">-</span>
                <span className="font-poppins text-[12px] text-inkBase/60">2026</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex w-full items-center justify-center">
          <Button
            type="button"
            className="h-[26px] w-full rounded-[6px] bg-greenDark px-[20px] py-[5px] font-montserrat text-[12px] font-medium text-white hover:bg-greenDarker"
            onClick={() => router.push('/crop-planning?step=portfolio')}
          >
            Save details
          </Button>
        </div>

        <div className="h-[0.5px] w-full bg-line my-[10px]" />

        {/* Agri Inputs */}
        <div className="flex flex-col gap-[6px]">
          <div className="flex items-center justify-between">
            <span className="font-montserrat text-[10px] font-medium text-muted">Agri Inputs</span>
            <div className="flex items-center gap-[7px] opacity-50 cursor-pointer">
              <span className="font-montserrat text-[8px] font-medium">View all</span>
              <ChevronDown className="h-[8px] w-[8px] -rotate-90" />
            </div>
          </div>

          <div className="relative h-[145px] w-full overflow-hidden rounded-[10px]">
             {/* Background Illustration */}
             <Image 
               src="/consultation-image.svg" 
               alt="Consultation Illustration" 
               fill
               className="object-cover pointer-events-none z-0" 
             />

             <div className="sr-only">
               <span>Need professional advice?</span>
               <span>Consult a Professional</span>
             </div>

             <div className="absolute bottom-[10px] right-[10px] z-10">
               <button className="flex h-[19px] items-center gap-[5px] rounded-[4px] bg-greenDark px-[10px] py-[3px]">
                 <span className="font-montserrat text-[10px] font-medium text-white">Book a call</span>
                 <Phone className="h-[8px] w-[8px] text-white" />
               </button>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}


export function LandIntelligenceClient() {
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [sidebarMode, setSidebarMode] = useState<'selection' | 'crop-planning'>('selection');
  const [savedLandData, setSavedLandData] = useState<{ id: string; owner: string } | null>(null);
  
  const handleSaveConfirm = (landId: string, owner: string) => {
    setSavedLandData({ id: landId, owner });
    setShowSaveModal(false);
    setSidebarMode('crop-planning');
  };

  const [mapType, setMapType] = useState<MapTypeId>('roadmap');
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(16);
  const [activeTool, setActiveTool] = useState<MapTool>('cursor');

  // Use states for polygon and markers
  const [polygonCoordsList, setPolygonCoordsList] = useState<PolygonSelection[]>([
    { id: '001', coords: SELECTION_PATH }
  ]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingCoords, setDrawingCoords] = useState<Coord[]>([]);
  const [pins, setPins] = useState<Coord[]>([]);
  const [mousePos, setMousePos] = useState<Coord | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState(DEFAULT_LOCATION_LABEL);
  const [suggestions, setSuggestions] = useState<Array<{ display_name: string; lat: string; lon: string }>>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const polygonRefs = useRef<any[]>([]);
  const drawingLineRef = useRef<any>(null);
  const markerRefs = useRef<any[]>([]);
  const crosshairRefs = useRef<any[]>([]);
  const tileLayerRef = useRef<any>(null);
  const liveCoordRef = useRef<HTMLSpanElement>(null);

  const areaSqm = useMemo(
    () => polygonCoordsList.reduce((total, poly) => total + computePolygonAreaSqm(poly.coords), 0),
    [polygonCoordsList]
  );
  const sidebarCoords = useMemo(
    () => flattenPolygonCoords(polygonCoordsList),
    [polygonCoordsList]
  );
  const hasSelection = polygonCoordsList.some((poly) => poly.coords.length >= 3 && computePolygonAreaSqm(poly.coords) > 0);
  const canRemoveByClick = activeTool === 'cursor' && !isDrawing;

  const fitSelectionBounds = () => {
    if (!mapRef.current || polygonRefs.current.length === 0) {
      return;
    }
    const bounds = polygonRefs.current[0].getBounds();
    for (let index = 1; index < polygonRefs.current.length; index += 1) {
      bounds.extend(polygonRefs.current[index].getBounds());
    }
    if (bounds && Object.keys(bounds).length > 0) {
      try { mapRef.current.fitBounds(bounds); } catch {
        // Fit bounds might fail if group is empty or invalid
      }
    }
  };

  const recenterMap = () => {
    if (!mapRef.current) {
      return;
    }
    mapRef.current.panTo([DEFAULT_CENTER.lat, DEFAULT_CENTER.lng]);
    fitSelectionBounds();
  };

  // Debounced Nominatim geocoding search
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    if (!value.trim()) {
      setSuggestions([]);
      return;
    }
    searchDebounceRef.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const data = await searchLocations(value);
        setSuggestions(data);
      } catch {
        setSuggestions([]);
      } finally {
        setSearchLoading(false);
      }
    }, 400);
  };

  const handleSelectSuggestion = (item: GeocodingResult) => {
    setSearchQuery(item.display_name);
    setSuggestions([]);
    setSearchFocused(false);
    if (mapRef.current) {
      mapRef.current.setView([parseFloat(item.lat), parseFloat(item.lon)], 15);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSuggestions([]);
    recenterMap();
  };

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setSuggestions([]);
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!mapContainerRef.current) {
      return;
    }

    let cancelled = false;

    async function initialiseMap() {
      try {
        setMapError(null);
        
        // Dynamically load leaflet from CDN
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
            script.onerror = () => reject(new Error('Failed to load Leaflet script'));
            document.head.appendChild(script);
          });
        }

        const L = window.L;

        if (cancelled || !mapContainerRef.current) {
          return;
        }

        // Cleanup any existing map instance if React Strict Mode double-invoked
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }

        const map = L.map(mapContainerRef.current, {
          center: [DEFAULT_CENTER.lat, DEFAULT_CENTER.lng],
          zoom: 16,
          zoomControl: false,
          attributionControl: false,
          doubleClickZoom: false,
        });

        // Use free OpenStreetMap tiles
        tileLayerRef.current = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
        }).addTo(map);

        mapRef.current = map;

        map.on('zoomend', () => {
          setZoom(map.getZoom());
        });

        setMapReady(true);
      } catch (error) {
        if (cancelled) {
          return;
        }
        setMapError(error instanceof Error ? error.message : 'Failed to initialise Map.');
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

  // Map Click Handler for Interactive Tools
  useEffect(() => {
    if (!mapRef.current || !window.L || !mapReady) return;
    const map = mapRef.current;

    const onMapClick = (e: any) => {
      const coord = { lat: e.latlng.lat, lng: e.latlng.lng };

      if (activeTool === 'pin') {
        setPins(prev => [...prev, coord]);
      } else if (activeTool === 'draw') {
        if (!isDrawing) {
          // Start a new drawing without clearing prior polygons.
          setDrawingCoords([coord]);
          setIsDrawing(true);
        } else {
          // Check distance to first point to close polygon
          const firstPoint = map.latLngToLayerPoint([drawingCoords[0].lat, drawingCoords[0].lng]);
          const currentPoint = e.layerPoint;
          const distance = firstPoint.distanceTo(currentPoint);
          
          if (drawingCoords.length > 1 && distance < 15) {
            setPolygonCoordsList((prev) => {
              const newId = String(prev.length + 1).padStart(3, '0');
              return [...prev, { id: newId, coords: drawingCoords }];
            });
            setDrawingCoords([]);
            setIsDrawing(false);
            setActiveTool('cursor');
            setMousePos(null);
          } else {
            // Add point to current drawing
            setDrawingCoords(prev => [...prev, coord]);
          }
        }
      }
    };

    const onMouseMove = (e: any) => {
      if (liveCoordRef.current) {
        liveCoordRef.current.innerText = `Lat: ${e.latlng.lat.toFixed(6)}, Lng: ${e.latlng.lng.toFixed(6)}`;
      }
      if (isDrawing && activeTool === 'draw') {
        setMousePos({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    };

    map.on('click', onMapClick);
    map.on('mousemove', onMouseMove);

    // Escape to finish drawing
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDrawing) {
        if (drawingCoords.length > 2) {
          setPolygonCoordsList((prev) => {
            const newId = String(prev.length + 1).padStart(3, '0');
            return [...prev, { id: newId, coords: drawingCoords }];
          });
        }
        setDrawingCoords([]);
        setIsDrawing(false);
        setActiveTool('cursor');
        setMousePos(null);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      map.off('click', onMapClick);
      map.off('mousemove', onMouseMove);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [mapReady, activeTool, isDrawing, drawingCoords]);

  // Render dynamic elements (Polygon, Preview Line, Pins)
  useEffect(() => {
    if (!mapRef.current || !window.L || !mapReady) return;
    const L = window.L;
    const map = mapRef.current;

    // 1. Render Final Polygons
    polygonRefs.current.forEach((polygon: any) => polygon.remove());
    polygonRefs.current = [];
    polygonCoordsList.forEach((poly, polygonIndex) => {
      if (poly.coords.length < 3) {
        return;
      }
      const latLngs = poly.coords.map(c => [c.lat, c.lng] as [number, number]);
      const polygon = L.polygon(latLngs, {
        color: 'var(--yellow-normal)',
        weight: 2,
        fillColor: 'var(--yellow-normal)',
        fillOpacity: 0.5,
      }).addTo(map);

      // Bind a nice popup showing the Land ID
      polygon.bindPopup(`<strong>Land ID:</strong> ${poly.id}`);
      polygon.bindTooltip(`Land ID: ${poly.id}`, { permanent: false, direction: 'center' });

      polygon.on('dblclick', (event: any) => {
        if (!canRemoveByClick) {
          return;
        }
        event.originalEvent?.stopPropagation?.();
        setPolygonCoordsList((prev) => prev.filter((_, index) => index !== polygonIndex));
      });
      polygonRefs.current.push(polygon);
    });

    // 2. Render Drawing Preview Line
    if (drawingLineRef.current) {
      drawingLineRef.current.remove();
    }
    if (isDrawing && drawingCoords.length > 0) {
      const latLngs = drawingCoords.map(c => [c.lat, c.lng] as [number, number]);
      if (mousePos) {
        latLngs.push([mousePos.lat, mousePos.lng]);
      }
      drawingLineRef.current = L.polyline(latLngs, {
        color: 'var(--yellow-normal)',
        weight: 2,
        dashArray: '5, 5',
      }).addTo(map);
    }

    // 2.5 Render Crosshairs at vertices
    crosshairRefs.current.forEach((marker: any) => marker.remove());
    crosshairRefs.current = [];
    
    const crosshairIcon = L.divIcon({
      className: 'custom-crosshair-icon',
      html: `<svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M7.1006 0C7.3767 0 7.6006 0.224 7.6006 0.5V6.701H13.8018C14.0779 6.701 14.3018 6.925 14.3018 7.201C14.3017 7.477 14.0778 7.701 13.8018 7.701H7.6006V13.802C7.6006 14.078 7.3767 14.302 7.1006 14.302C6.8246 14.302 6.6006 14.078 6.6006 13.802V7.701H0.5C0.224 7.701 0.0001 7.477 0 7.201C0 6.925 0.224 6.701 0.5 6.701H6.6006V0.5C6.6006 0.224 6.8246 0 7.1006 0Z" fill="var(--green-dark-active)"/></svg>`,
      iconSize: [15, 15],
      iconAnchor: [7.5, 7.5],
    });

    const currentVertices = isDrawing ? drawingCoords : sidebarCoords;
    currentVertices.forEach(coord => {
      const marker = L.marker([coord.lat, coord.lng], { icon: crosshairIcon, interactive: false }).addTo(map);
      crosshairRefs.current.push(marker);
    });

    // 3. Render Pins
    markerRefs.current.forEach((marker: any) => marker.remove());
    markerRefs.current = [];
    
    // Custom icon matching Figma style slightly
    const customIcon = L.divIcon({
      className: 'custom-pin-icon',
      html: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 4C15.866 4 19 7.13401 19 11C19 16.0159 13.8819 19.0342 12.3984 19.8037C12.1456 19.9349 11.8544 19.9349 11.6016 19.8037C10.1181 19.0342 5 16.0159 5 11C5 7.13401 8.13401 4 12 4ZM12 8C10.3431 8 9 9.34315 9 11C9 12.6569 10.3431 14 12 14C13.6569 14 15 12.6569 15 11C15 9.34315 13.6569 8 12 8Z" fill="var(--ink-dark)"/></svg>`,
      iconSize: [24, 24],
      iconAnchor: [12, 24],
    });

    pins.forEach(pin => {
      const marker = L.marker([pin.lat, pin.lng], { icon: customIcon }).addTo(map);
      markerRefs.current.push(marker);
    });

  }, [polygonCoordsList, drawingCoords, isDrawing, pins, mapReady, mousePos, sidebarCoords, canRemoveByClick]);

  // Initial fit bounds
  useEffect(() => {
    if (mapReady && polygonCoordsList.length > 0 && !isDrawing) {
      fitSelectionBounds();
    }
  }, [mapReady, polygonCoordsList, isDrawing]);

  useEffect(() => {
    if (!mapRef.current || !window.L) return;
    const L = window.L;

    // Remove current tile layer
    if (tileLayerRef.current) {
      mapRef.current.removeLayer(tileLayerRef.current);
    }

    if (mapType === 'satellite') {
      // ESRI World Imagery — free, no API key required
      tileLayerRef.current = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 19, attribution: 'Tiles © Esri' }
      ).addTo(mapRef.current);
    } else {
      // OpenStreetMap roadmap
      tileLayerRef.current = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        { maxZoom: 19 }
      ).addTo(mapRef.current);
    }

    // Re-add polygon on top after layer swap
    polygonRefs.current.forEach((polygon: any) => polygon.bringToFront());
  }, [mapType]);

  return (
    <div className="relative flex h-full min-h-[720px] w-full overflow-hidden bg-panel">
      <div className="relative flex-1">
        <div ref={mapContainerRef} className="absolute inset-0" />

        {!mapReady && !mapError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-greenLight/40">
            <div className="rounded-2xl bg-white/90 px-5 py-3 text-sm font-medium text-ink shadow-sm">
              Loading Map...
            </div>
          </div>
        ) : null}

        {/* Live Coordinates (Top Right) */}
        <div className="absolute right-6 top-6 z-[1000] flex items-center justify-center rounded-[10px] border border-white bg-white/80 px-[14px] py-[10px] shadow-sm backdrop-blur-[12px]">
          <span ref={liveCoordRef} className="font-montserrat text-[12px] font-medium leading-[130%] text-muted tracking-wide">
            Lat: -, Lng: -
          </span>
        </div>

        {mapError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-greenLight/40 p-6">
            <div className="max-w-[440px] rounded-[24px] border border-lineActive bg-white px-6 py-5 text-center shadow-sm">
              <div className="font-montserrat text-[16px] font-semibold text-ink">Map Error</div>
              <p className="mt-2 text-sm text-muted">{mapError}</p>
            </div>
          </div>
        ) : null}

        <div className="absolute left-6 top-6 z-[1000] w-[417px]" ref={searchContainerRef}>
          <div className="relative">
            {/* Glassmorphism container matching Figma */}
            <div className="flex h-[46px] w-full items-center gap-[10px] rounded-[10px] border border-white bg-white/20 px-[14px] shadow-sm backdrop-blur-[12px] outline-none focus-within:outline-none focus-within:ring-0">
              {/* Figma pin SVG */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                <path d="M12 4C15.866 4 19 7.13401 19 11C19 16.0159 13.8819 19.0342 12.3984 19.8037C12.1456 19.9349 11.8544 19.9349 11.6016 19.8037C10.1181 19.0342 5 16.0159 5 11C5 7.13401 8.13401 4 12 4ZM12 8C10.3431 8 9 9.34315 9 11C9 12.6569 10.3431 14 12 14C13.6569 14 15 12.6569 15 11C15 9.34315 13.6569 8 12 8Z" fill="var(--ink-dark)"/>
              </svg>

              {/* Editable input */}
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') { setSuggestions([]); setSearchFocused(false); }
                  if (e.key === 'Enter' && suggestions.length > 0) { handleSelectSuggestion(suggestions[0]); }
                }}
                placeholder="Kendri, Dhamtari Rd, Raipur, CG"
                className="map-overlay-input min-w-0 flex-1 bg-transparent font-poppins text-[12px] font-normal leading-none text-inkBase outline-none focus:outline-none focus:ring-0 placeholder:text-muted"
              />

              {/* Right: spinner | circular X (clear) | arrow (navigate) */}
              {searchLoading ? (
                <div className="shrink-0">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-greenDarkActive border-t-transparent" />
                </div>
              ) : searchQuery ? (
                /* Circular close button when query is present */
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={handleClearSearch}
                  className="flex h-[21px] w-[21px] shrink-0 items-center justify-center rounded-full bg-white shadow-sm transition hover:scale-110 hover:bg-greenLight"
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L9 9M9 1L1 9" stroke="var(--ink-dark)" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
              ) : (
                /* Circular arrow button when empty */
                <button
                  type="button"
                  aria-label="Navigate to location"
                  onClick={recenterMap}
                  className="flex h-[21px] w-[21px] shrink-0 -rotate-45 items-center justify-center rounded-full bg-white shadow-sm transition hover:scale-110"
                >
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg" className="rotate-45">
                    <path d="M1 6.5H12M12 6.5L7 1.5M12 6.5L7 11.5" stroke="var(--green-dark-active)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              )}
            </div>

            {/* Suggestions dropdown */}
            {searchFocused && suggestions.length > 0 && (
              <div className="absolute top-[52px] left-0 w-full overflow-hidden rounded-[10px] border border-white bg-white/95 shadow-lg backdrop-blur-[12px]">
                {suggestions.map((item, i) => (
                  <button
                    key={i}
                    type="button"
                    className="flex w-full items-start gap-3 border-b border-lineLight px-4 py-3 text-left transition-colors hover:bg-greenLight last:border-0"
                    onMouseDown={(e) => { e.preventDefault(); handleSelectSuggestion(item); }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="mt-0.5 shrink-0">
                      <path d="M12 4C15.866 4 19 7.13401 19 11C19 16.0159 13.8819 19.0342 12.3984 19.8037C12.1456 19.9349 11.8544 19.9349 11.6016 19.8037C10.1181 19.0342 5 16.0159 5 11C5 7.13401 8.13401 4 12 4ZM12 8C10.3431 8 9 9.34315 9 11C9 12.6569 10.3431 14 12 14C13.6569 14 15 12.6569 15 11C15 9.34315 13.6569 8 12 8Z" fill="var(--green-dark-active)"/>
                    </svg>
                    <span className="line-clamp-2 font-montserrat text-[12px] font-medium leading-[130%] text-ink">{item.display_name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <MapScaleBar map={mapRef.current} color={mapType === 'satellite' ? 'white' : 'black'} />

        <div className="absolute bottom-6 right-8 z-[1000] flex gap-3 drop-shadow-[0_0_10px_rgba(0,0,0,0.06)]">
          <button
            type="button"
            className="relative h-[52px] w-[52px] overflow-hidden rounded-[4px] border-2 border-white shadow-md transition hover:scale-105"
            onClick={() => setMapType((current) => current === 'roadmap' ? 'satellite' : 'roadmap')}
            aria-label="Toggle map type"
            title={mapType === 'roadmap' ? 'Switch to Satellite' : 'Switch to Map'}
          >
            {/* Thumbnail changes to show the OTHER layer (what you'll switch to) */}
            {mapType === 'roadmap' ? (
              /* SAT thumbnail — shown when currently on roadmap */
              <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0">
                <rect width="52" height="52" fill="#4a7c59"/>
                <rect x="0" y="0" width="20" height="18" fill="#5a8f4a" opacity="0.9"/>
                <rect x="20" y="0" width="16" height="14" fill="#3d6b35" opacity="0.9"/>
                <rect x="36" y="0" width="16" height="22" fill="#6b9e5a" opacity="0.8"/>
                <rect x="0" y="18" width="14" height="20" fill="#8aaa6a" opacity="0.85"/>
                <rect x="14" y="14" width="22" height="18" fill="#c8b87a" opacity="0.75"/>
                <rect x="36" y="22" width="16" height="14" fill="#5a8040" opacity="0.9"/>
                <rect x="0" y="38" width="24" height="14" fill="#6b9e5a" opacity="0.8"/>
                <rect x="24" y="32" width="14" height="20" fill="#a89060" opacity="0.7"/>
                <rect x="38" y="36" width="14" height="16" fill="#4a7040" opacity="0.9"/>
                {/* Roads */}
                <path d="M0 28 Q16 24 26 26 Q36 28 52 22" stroke="rgba(255,255,255,0.55)" strokeWidth="2.5" fill="none"/>
                <path d="M30 0 Q28 16 26 26 Q24 36 22 52" stroke="rgba(255,255,255,0.45)" strokeWidth="2" fill="none"/>
              </svg>
            ) : (
              /* MAP thumbnail — shown when currently on satellite */
              <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0">
                <rect width="52" height="52" fill="#f0ede8"/>
                {/* Road network */}
                <path d="M0 26 Q13 24 26 26 Q39 28 52 25" stroke="#d4c8b0" strokeWidth="5" fill="none"/>
                <path d="M0 26 Q13 24 26 26 Q39 28 52 25" stroke="white" strokeWidth="3" fill="none"/>
                <path d="M26 0 Q24 13 26 26 Q28 39 25 52" stroke="#d4c8b0" strokeWidth="5" fill="none"/>
                <path d="M26 0 Q24 13 26 26 Q28 39 25 52" stroke="white" strokeWidth="3" fill="none"/>
                <path d="M0 8 Q18 12 30 10 Q42 8 52 14" stroke="#e0d8cc" strokeWidth="3" fill="none"/>
                <path d="M0 44 Q20 40 35 42 Q44 44 52 40" stroke="#e0d8cc" strokeWidth="3" fill="none"/>
                {/* Block fills */}
                <rect x="4" y="4" width="18" height="16" rx="1" fill="#e8e0d4" opacity="0.6"/>
                <rect x="30" y="6" width="18" height="12" rx="1" fill="#e8e0d4" opacity="0.6"/>
                <rect x="4" y="32" width="16" height="14" rx="1" fill="#e8e0d4" opacity="0.6"/>
                <rect x="32" y="32" width="16" height="14" rx="1" fill="#e8e0d4" opacity="0.6"/>
              </svg>
            )}
            {/* Label badge at bottom */}
            <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center bg-black/40 py-[3px]">
              <span className="font-['Poppins'] text-[9px] font-semibold uppercase tracking-wider text-white">
                {mapType === 'roadmap' ? 'SAT' : 'MAP'}
              </span>
            </div>
          </button>

          <div className="flex flex-col justify-between h-[52px]">
            <button
              type="button"
              className="flex h-[24px] w-[23px] items-center justify-center rounded-[3px] bg-white transition-colors hover:bg-greenLight"
              onClick={() => mapRef.current?.setZoom?.(zoom + 1)}
              aria-label="Zoom in"
            >
              <Plus className="h-3 w-3 text-greenDarkActive" strokeWidth={2.5} />
            </button>
            <button
              type="button"
              className="flex h-[24px] w-[23px] items-center justify-center rounded-[3px] bg-white transition-colors hover:bg-greenLight"
              onClick={() => mapRef.current?.setZoom?.(zoom - 1)}
              aria-label="Zoom out"
            >
              <Minus className="h-3 w-3 text-greenDarkActive" strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {activeTool === 'draw' && (
          <div className="absolute bottom-[85px] left-1/2 z-[1000] -translate-x-1/2">
            <span className="rounded-full border border-line bg-white/90 px-4 py-1.5 text-[11px] font-medium shadow-sm backdrop-blur-sm">
              Release left mouse button to complete polygon
            </span>
          </div>
        )}

        {canRemoveByClick && polygonCoordsList.length > 0 && (
          <div className="absolute bottom-[85px] left-1/2 z-[1000] -translate-x-1/2">
            <span className="rounded-full border border-line bg-white/90 px-4 py-1.5 text-[11px] font-medium shadow-sm backdrop-blur-sm">
              Double click a polygon to remove it
            </span>
          </div>
        )}

        <MapToolbar
          activeTool={activeTool}
          onToolChange={setActiveTool}
        />
      </div>

      {sidebarMode === 'selection' ? (
        <SelectionSidebar
          areaSqm={areaSqm}
          coords={sidebarCoords}
          polygonCount={polygonCoordsList.length}
          hasSelection={hasSelection}
          onSave={() => setShowSaveModal(true)}
        />
      ) : (
        <CropPlanningSidebar
          landId={savedLandData?.id || '001'}
          areaSqm={areaSqm}
          onBack={() => setSidebarMode('selection')}
        />
      )}
      <SaveSelectionModal 
        isOpen={showSaveModal} 
        onClose={() => setShowSaveModal(false)} 
        onSaveConfirm={handleSaveConfirm}
        areaSqm={areaSqm} 
        location={searchQuery} 
        polygons={polygonCoordsList} 
      />
    </div>
  );
}
