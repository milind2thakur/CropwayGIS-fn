'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { MapContainer, Polygon, TileLayer, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { LandIntelligenceIcon } from './config';
const yAxisLabels = ['7.5', '7', '6.5', '6', '5.5', '5', '4.5', '4', '3.5', '3', '2.5'];
const monthLabels = ['June', 'June', 'June', 'July', 'July', 'July', 'Oct', 'Oct', 'Oct', 'Oct'];

function GreetingPinIcon() {
  return (
    <svg aria-hidden="true" className="h-6 w-6 shrink-0 text-ink" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.75a7 7 0 0 0-7 7c0 4.86 5.49 10.32 6.12 10.92a1.25 1.25 0 0 0 1.76 0C13.51 20.07 19 14.61 19 9.75a7 7 0 0 0-7-7Zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z" />
    </svg>
  );
}

function CropCatalogueCard() {
  return (
    <div className="h-[308px] w-full rounded-[24px] border border-black/10 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="px-6 py-5 font-montserrat text-[18px] font-medium leading-[130%] text-ink">
        Crop Catalogue
      </div>
    </div>
  );
}

function MapCard() {
  const [searchTerm, setSearchTerm] = useState('Kendri, Dhamtari Rd, Raipur, CG');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const locationSuggestions = useMemo(
    () => [
      'Kendri, Dhamtari Rd, Raipur, CG',
      'Dhamtari Chowk, Raipur, CG',
      'Telibandha, Raipur, CG',
      'Naya Raipur, Atal Nagar, CG',
      'Abhanpur, Raipur, CG',
    ],
    []
  );

  const filteredSuggestions = useMemo(() => {
    const normalizedTerm = searchTerm.trim().toLowerCase();
    if (!normalizedTerm) {
      return locationSuggestions;
    }
    return locationSuggestions.filter((item) => item.toLowerCase().includes(normalizedTerm));
  }, [locationSuggestions, searchTerm]);

  const mapPolygon: [number, number][] = [
    [21.2519, 81.6301],
    [21.2527, 81.6307],
    [21.2519, 81.6315],
    [21.2510, 81.6307],
  ];

  return (
    <div className="relative h-[308px] w-full overflow-hidden rounded-[24px] border border-black/10 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <MapContainer
        center={[21.2517, 81.6304]}
        zoom={15}
        className="absolute inset-0 h-full w-full"
        scrollWheelZoom={false}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
        <Polygon
          positions={mapPolygon}
          pathOptions={{ color: '#ffffff', weight: 2, fillColor: '#a0be8c', fillOpacity: 0.65 }}
        />
        <ZoomControl position="bottomright" />
      </MapContainer>

      {/* Location Bar (Frame 1948761248) */}
      <div className="absolute left-[11px] top-[9px] w-[calc(100%-22px)] max-w-[417px]">
        <div className="h-[46px] rounded-[10px] border border-white bg-white/20 shadow-[0_2px_4px_rgba(0,0,0,0.1)] backdrop-blur-[12px] flex items-center px-[14px] justify-between">
        <div className="flex flex-1 items-center gap-[10px]">
          {/* Pin_fill */}
          <div className="relative h-6 w-6 shrink-0">
            <svg width="14" height="16" viewBox="0 0 14 16" fill="none" className="absolute left-[5px] top-[4px]">
              <path d="M7 0C3.13 0 0 3.13 0 7C0 12.25 7 16 7 16C7 16 14 12.25 14 7C14 3.13 10.87 0 7 0ZM7 9.5C5.62 9.5 4.5 8.38 4.5 7C4.5 5.62 5.62 4.5 7 4.5C8.38 4.5 9.5 5.62 9.5 7C9.5 8.38 8.38 9.5 7 9.5Z" fill="#222222" />
            </svg>
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => {
              setSearchTerm(event.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => {
              setTimeout(() => setShowSuggestions(false), 120);
            }}
            placeholder="Search location..."
            className="w-full min-w-0 bg-transparent font-montserrat text-[12px] font-medium leading-[130%] text-ink/70 outline-none placeholder:text-ink/50"
          />
        </div>
        
        {/* Frame 1261156410 (Close button) */}
        <div className="flex h-[21px] w-[21px] shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
          <div className="relative h-[13px] w-[13px] rotate-0">
            <div className="absolute left-1/2 h-full w-px -translate-x-1/2 rotate-45 bg-greenDarkActive" />
            <div className="absolute left-1/2 h-full w-px -translate-x-1/2 -rotate-45 bg-greenDarkActive" />
          </div>
        </div>
      </div>
        {showSuggestions ? (
          <div className="mt-2 max-h-[140px] overflow-y-auto rounded-[10px] border border-white/70 bg-white/90 p-1 shadow-[0_6px_24px_rgba(0,0,0,0.14)] backdrop-blur-[12px]">
            {filteredSuggestions.length ? (
              filteredSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  className="block w-full rounded-[8px] px-3 py-2 text-left font-montserrat text-[12px] font-medium leading-[130%] text-ink/70 transition hover:bg-greenLight"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    setSearchTerm(suggestion);
                    setShowSuggestions(false);
                  }}
                >
                  {suggestion}
                </button>
              ))
            ) : (
              <div className="px-3 py-2 font-montserrat text-[12px] font-medium leading-[130%] text-ink/50">No matches found</div>
            )}
          </div>
        ) : null}
      </div>

    </div>
  );
}

function ForecastChart() {
  return (
    <div className="relative flex h-[308px] w-full flex-col overflow-hidden rounded-[24px] border border-black/10 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-2">
          <h2 className="font-montserrat text-[18px] font-medium leading-[130%] text-ink">
            Crop Yield Forecasting
          </h2>
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path opacity="0.5" fillRule="evenodd" clipRule="evenodd" d="M5.5 0C8.53757 0 11 2.46243 11 5.5C11 8.53757 8.53757 11 5.5 11C2.46243 11 0 8.53757 0 5.5C0 2.46243 2.46243 0 5.5 0ZM6.21282 3.7214C6.08033 3.73214 5.95501 3.75005 5.83684 3.77511C5.733 3.7966 5.62737 3.82882 5.51995 3.87179C5.41253 3.91118 5.32301 3.9631 5.25139 4.02755C5.21559 4.05978 5.16367 4.15646 5.09563 4.31759C5.03118 4.47872 4.95778 4.67387 4.87542 4.90304C4.79664 5.13221 4.71608 5.38107 4.63372 5.64962C4.54778 5.91818 4.4708 6.17599 4.40276 6.42306C4.33473 6.66655 4.27923 6.88497 4.23626 7.07833C4.18971 7.27169 4.16643 7.40955 4.16643 7.49191C4.16643 7.5492 4.17001 7.6047 4.17718 7.65841C4.18076 7.71212 4.21298 7.77479 4.27386 7.8464C4.29176 7.8643 4.31324 7.88221 4.33831 7.90011C4.36337 7.9216 4.39023 7.93234 4.41888 7.93234C4.5263 7.93234 4.66057 7.89653 4.82171 7.82492C4.98284 7.7533 5.15293 7.65483 5.33196 7.52951C5.51458 7.4006 5.6972 7.252 5.87981 7.08371C6.06601 6.91183 6.23789 6.72563 6.39544 6.52511L6.27727 6.41769C6.14837 6.57166 6.02304 6.70415 5.9013 6.81515C5.77955 6.92615 5.66676 7.01746 5.56292 7.08908C5.46266 7.16069 5.37314 7.2144 5.29436 7.25021C5.21559 7.28602 5.15472 7.30571 5.11175 7.30929C5.05804 7.30929 5.03118 7.27527 5.03118 7.20724C5.03118 7.17501 5.04371 7.10698 5.06878 7.00314C5.09384 6.89572 5.12786 6.76681 5.17083 6.61642C5.21738 6.46245 5.2693 6.29415 5.32659 6.11154C5.38388 5.92534 5.44475 5.73556 5.50921 5.5422C5.57724 5.34526 5.64528 5.1519 5.71331 4.96212C5.78134 4.77234 5.84759 4.59689 5.91204 4.43576C5.97649 4.27104 6.03557 4.1296 6.08929 4.01144C6.14658 3.89328 6.19492 3.80734 6.2343 3.75363L6.21282 3.7214ZM6.49749 1.83078C6.40439 1.83078 6.31308 1.85584 6.22356 1.90597C6.13404 1.9561 6.05169 2.02234 5.97649 2.1047C5.90488 2.18348 5.8458 2.27479 5.79925 2.37863C5.75628 2.47889 5.73479 2.58094 5.73479 2.68478C5.73479 2.75639 5.74554 2.81548 5.76702 2.86203C5.7885 2.90858 5.81536 2.94617 5.84759 2.97482C5.87981 2.99988 5.91383 3.01779 5.94964 3.02853C5.98903 3.03569 6.02483 3.03927 6.05706 3.03927C6.13225 3.03927 6.21282 3.016 6.29876 2.96945C6.38828 2.9229 6.46884 2.86024 6.54046 2.78146C6.61207 2.70268 6.67115 2.61316 6.7177 2.5129C6.76783 2.40906 6.7929 2.30164 6.7929 2.19064C6.7929 2.07606 6.76246 1.98833 6.70159 1.92746C6.64072 1.863 6.57268 1.83078 6.49749 1.83078Z" fill="#222222"/>
          </svg>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="h-2 w-4 rounded-full bg-yellowNormal" />
            <span className="font-montserrat text-[10px] font-medium leading-[130%] text-muted">Predicted</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-4 rounded-full bg-greenNormal" />
            <span className="font-montserrat text-[10px] font-medium leading-[130%] text-muted">Actual</span>
          </div>
        </div>
      </div>

      <div className="relative flex-1 min-h-0 mt-2">
        {/* Y-Axis Labels */}
        <div className="absolute bottom-6 left-0 top-0 flex w-8 flex-col justify-between pr-2 text-right font-montserrat text-[10px] font-medium leading-[130%] text-muted">
          {yAxisLabels.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>

        {/* Chart Content Area */}
        <div className="absolute left-8 right-0 top-0 bottom-6">
          {/* Horizontal Grid Lines */}
          <div className="absolute inset-0 flex flex-col justify-between">
            {Array.from({ length: 11 }).map((_, index) => (
              <div key={index} className="w-full border-t border-line/10" />
            ))}
          </div>

          {/* SVG Chart */}
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 717 267"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="forecastArea" x1="358.5" y1="69.3434" x2="358.5" y2="212.398" gradientUnits="userSpaceOnUse">
                <stop stopColor="#F3DD7E" />
                <stop offset="1" stopColor="#F3DD7E" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M0 160.727L8.76333 157.856L27.0867 125.8L39.8333 110.011H51.7833L78.87 124.843L91.6167 126.757L96.4265 121.215L101.592 107.564L104.692 96.098L109.169 77.5336L113.301 56.2392L121.628 21.0863L124.321 13.6503L127.421 6.55214L130.176 2.18405L133.275 0L136.719 0.546012L142.229 7.09815L147.739 21.8405L152.216 38.2208L156.693 57.3312L163.581 85.7238L167.713 99.3741L172.535 109.748L176.86 115.274L184.827 116.231L192.793 119.58L205.54 130.106L219.083 137.761L233.423 138.24L255.73 143.024L270.07 143.981L279.63 141.963L293.173 136.503L302.733 133.227L309.107 132.498L317.073 132.02L326.633 128.192L344.16 117.667L355.313 115.274L363.28 116.71L372.043 120.123L379.213 124.843L391.163 131.063L401.52 132.498L406.713 128.313L411.19 117.393L415.667 104.288L424.277 65.5215L428.754 46.9571L433.919 29.4847L437.707 21.2946L439.579 18.0185L443.906 15.2884L448.039 16.3805L452.171 22.3866L456.993 33.3068L459.748 44.227L466.291 68.7976L473.867 101.012L477.656 113.024L481.788 123.945L486.763 131.589L494.176 132.506L499.51 132.681L517.833 135.957L536.046 138.037C536.65 138.106 537.258 138.12 537.865 138.079L544.92 137.595L552.09 136.503L564.04 134.319L572.007 132.681L580.77 132.498L589.533 133.455L617.417 142.509L627.773 143.981L635.74 144.459L662.03 154.028L672.188 155.045L677.167 153.55L681.947 150.201L697.88 120.059L709.83 100.443L717 98.0503V267H0V160.727Z"
              fill="url(#forecastArea)"
              fillOpacity="0.5"
              style={{ vectorEffect: 'non-scaling-stroke' }}
            />
            <path
              d="M0 160.727C17.925 160.727 26.8875 109.593 44.8125 109.593C62.7375 109.593 71.7 126.637 89.625 126.637"
              fill="none"
              stroke="#47802B"
              strokeWidth="2"
              style={{ vectorEffect: 'non-scaling-stroke' }}
            />
          </svg>
        </div>

        {/* X-Axis Labels */}
        <div className="absolute bottom-0 left-8 right-0 flex justify-between font-montserrat text-[10px] font-medium leading-[130%] text-muted">
          {monthLabels.map((label, index) => (
            <span key={`${label}-${index}`}>{label}</span>
          ))}
        </div>
      </div>

      <div 
        className="absolute flex h-[13px] w-[32px] items-center justify-center whitespace-nowrap font-montserrat text-[10px] font-medium leading-[130%] text-muted"
        style={{ left: '4px', top: 'calc(50% - 13px/2 - 9.5px)', transform: 'rotate(-90deg)' }}
      >
        In Ton
      </div>
    </div>
  );
}

function WeatherCard() {
  return (
    <div className="relative h-[308px] w-full rounded-[20px] bg-greenLight">
      {/* Weather alerts title */}
      <div className="absolute left-[16px] top-[12px] h-[18px] w-[105px] font-montserrat text-[14px] font-medium leading-[130%] text-ink">
        Weather alerts
      </div>

      {/* Frame 1948761662 (Top Alert Box) */}
      <div className="absolute left-[16px] top-[40px] flex h-[24px] w-[calc(100%-32px)] items-center rounded-[7px] bg-white px-[10px] gap-[10px]">
        <span className="h-[16px] w-full truncate font-montserrat text-[12px] font-medium leading-[130%] text-yellowDarker">
          High temperature conditions expected. Crop stress likely.
        </span>
      </div>

      {/* Frame 1948761651 (Temp & Cloud Section) */}
      <div className="absolute left-[16px] top-[68px] flex h-[52px] w-[calc(100%-32px)] items-center justify-between">
        {/* Frame 1948761653 (Left part) */}
        <div className="flex h-[52px] w-[151px] items-center gap-[9px]">
          {/* Temperature text */}
          <div className="flex h-[52px] w-[66px] items-center font-montserrat text-[40px] font-medium leading-[130%] text-ink">
            38°
          </div>
          {/* Frame 1948761652 (Friday & time) */}
          <div className="flex h-[49px] w-[76px] flex-col justify-center">
            <span className="h-[31px] w-[76px] font-montserrat text-[24px] font-medium leading-[130%] text-ink">
              Friday
            </span>
            <span className="h-[18px] w-[65px] font-montserrat text-[14px] font-medium leading-[130%] text-ink">
              03:45 PM
            </span>
          </div>
        </div>

        {/* Cloud_duotone (Right part) */}
        <div className="relative h-[52px] w-[52px] shrink-0">
          <svg viewBox="0 0 52 52" className="absolute inset-0 h-full w-full">
            {/* Ellipse 185 (Sun) */}
            <circle cx="34" cy="19" r="6" stroke="#F3DD7E" strokeWidth="3" strokeDasharray="3 3" fill="#F3DD7E" />
            {/* Union (Cloud) */}
            <path d="M16 37C13.24 37 11 34.76 11 32C11 29.72 12.52 27.8 14.6 27.2C14.85 24 17.43 21.5 20.6 21.5C22.68 21.5 24.52 22.6 25.5 24.3C26.4 23.1 27.8 22.4 29.4 22.4C32.16 22.4 34.4 24.64 34.4 27.4C34.4 27.6 34.39 27.8 34.38 28C36.98 28.18 39 30.32 39 32.96C39 35.72 36.76 37.96 34 37.96H16V37Z" fill="white" />
          </svg>
        </div>
      </div>

      {/* Frame 1948761661 (Bottom Alert Box) */}
      <div className="absolute left-[16px] top-[147px] flex h-[24px] w-[calc(100%-32px)] max-w-[404px] items-center gap-[10px] rounded-[7px] bg-greenLightActive px-[10px]">
        <span className="h-[16px] w-full truncate font-montserrat text-[12px] font-medium leading-[130%] text-greenDarker">
          Irrigate during early morning or evening hours.
        </span>
      </div>

      {/* Frame 1948760941 (Open GIS view button) */}
      <Link
        href="/land-intelligence"
        className="absolute bottom-[16px] left-[16px] flex h-[28px] w-[calc(100%-32px)] items-center justify-center gap-[10px] rounded-[15px] bg-greenNormalActive font-montserrat text-[12px] font-medium leading-[130%] text-white transition-colors hover:bg-greenDark"
      >
        <LandIntelligenceIcon className="h-4 w-4 shrink-0 text-white" />
        <span className="w-[89px] h-[16px] flex items-center justify-center">Open GIS view</span>
      </Link>
    </div>
  );
}

export function HomeHero() {
  return (
    <section className="bg-canvas px-5 py-6 lg:px-5 lg:py-7">
      <div className="flex w-full flex-col gap-7">
        {/* Greeting Section */}
        <div>
          <div className="flex items-center gap-3 font-montserrat text-[32px] leading-tight text-ink">
            <p className="font-medium opacity-50">Good morning</p>
            <p className="font-bold italic">Deovrat</p>
          </div>
          <div className="mt-2 flex items-center gap-[10px]">
            <GreetingPinIcon />
            <p className="font-montserrat text-[14px] font-medium leading-[130%] text-muted">
              Kendri, Dhamtari Rd, Raipur, CG
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          {/* First Row: Crop Catalogue & Map */}
          <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-12">
            <div className="min-w-0 xl:col-span-7">
              <CropCatalogueCard />
            </div>
            <div className="min-w-0 xl:col-span-5">
              <MapCard />
            </div>
          </div>

          {/* Second Row: Forecast & Weather */}
          <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-12">
            <div className="min-w-0 xl:col-span-8">
              <ForecastChart />
            </div>
            <div className="min-w-0 xl:col-span-4">
              <WeatherCard />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
