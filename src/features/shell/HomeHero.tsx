'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
const yAxisLabels = ['7.5', '7', '6.5', '6', '5.5', '5', '4.5', '4', '3.5', '3', '2.5'];
const monthLabels = ['June', 'June', 'June', 'July', 'July', 'July', 'Oct', 'Oct', 'Oct', 'Oct'];

function GreetingPinIcon() {
  return (
    <svg aria-hidden="true" className="h-6 w-6 shrink-0 text-[#222222]" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.75a7 7 0 0 0-7 7c0 4.86 5.49 10.32 6.12 10.92a1.25 1.25 0 0 0 1.76 0C13.51 20.07 19 14.61 19 9.75a7 7 0 0 0-7-7Zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z" />
    </svg>
  );
}

function CropCatalogueCard() {
  return (
    <div className="h-[308px] w-full rounded-[20px] bg-white shadow-sm border border-line/10">
      <div className="px-6 py-4 font-montserrat text-[18px] font-medium leading-tight text-[#222222]">
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

  return (
    <div className="relative h-[308px] w-full overflow-hidden rounded-[20px] shadow-sm border border-line/10 bg-white">
      <div className="absolute inset-0 bg-[#f5f5f5]" />
      <svg viewBox="0 0 487 308" className="absolute inset-0 h-full w-full">
        <g fill="none" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" opacity="0.95">
          <path d="M11 27 C87 83, 158 55, 236 99 S374 160, 509 89" />
          <path d="M-21 92 C72 132, 158 116, 244 162 S402 202, 525 146" />
          <path d="M14 159 C106 192, 184 174, 279 220 S422 263, 510 235" />
          <path d="M21 238 C108 267, 171 253, 259 277 S389 297, 495 287" />
          <path d="M72 -18 C79 57, 61 124, 85 203 S118 296, 137 341" />
          <path d="M163 -14 C168 42, 135 125, 169 193 S219 289, 263 334" />
          <path d="M253 -16 C262 58, 227 126, 262 194 S319 283, 369 333" />
          <path d="M352 -11 C361 52, 328 129, 360 196 S411 283, 458 337" />
          <path d="M35 54 L214 286" />
          <path d="M110 17 L381 289" />
          <path d="M242 1 L472 206" />
          <path d="M29 120 L444 27" />
          <path d="M13 286 L286 89" />
          <path d="M214 262 L487 130" />
        </g>
        <path d="M251 189 L306 118 L354 183 L286 226 Z" fill="#a0be8c" stroke="#ffffff" strokeWidth="6" />
      </svg>

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
            className="w-full min-w-0 bg-transparent font-poppins text-[12px] font-medium leading-none text-black/70 outline-none placeholder:text-black/50"
          />
        </div>
        
        {/* Frame 1261156410 (Close button) */}
        <div className="flex h-[21px] w-[21px] shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
          <div className="relative h-[13px] w-[13px] rotate-0">
            <div className="absolute h-full w-px left-1/2 -translate-x-1/2 bg-[#203A13] rotate-45" />
            <div className="absolute h-full w-px left-1/2 -translate-x-1/2 bg-[#203A13] -rotate-45" />
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
                  className="block w-full rounded-[8px] px-3 py-2 text-left font-poppins text-[12px] font-medium text-black/70 transition hover:bg-[#eaf0e5]"
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
              <div className="px-3 py-2 font-poppins text-[12px] text-black/50">No matches found</div>
            )}
          </div>
        ) : null}
      </div>

    </div>
  );
}

function ForecastChart() {
  return (
    <div className="relative h-[392px] w-full rounded-[20px] bg-white shadow-sm border border-line/10 p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <h2 className="font-montserrat text-[18px] font-medium leading-tight text-[#222222]">
            Crop Yield Forecasting
          </h2>
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#222222]/10 text-[10px] font-bold text-[#222222]">
            i
          </span>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="h-2 w-4 rounded-full bg-[#F3DD7E]" />
            <span className="text-[10px] font-medium text-[#222222]/60">Predicted</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-4 rounded-full bg-[#47802B]" />
            <span className="text-[10px] font-medium text-[#222222]/60">Actual</span>
          </div>
        </div>
      </div>

      <div className="relative flex-1 h-[260px] mt-4">
        {/* Y-Axis Labels */}
        <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-right text-[10px] text-black/40 w-8 pr-2">
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
            className="absolute inset-0 h-full w-full overflow-visible"
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
        <div className="absolute left-8 right-0 bottom-0 flex justify-between text-[10px] text-black/40">
          {monthLabels.map((label, index) => (
            <span key={`${label}-${index}`}>{label}</span>
          ))}
        </div>
      </div>

      <div className="absolute left-2 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] font-medium text-black/30">
        In Ton
      </div>
    </div>
  );
}

function WeatherCard() {
  return (
    <div className="relative h-full min-h-[355px] w-full rounded-[20px] bg-[#EDF2EA]">
      {/* Weather alerts title */}
      <div className="absolute left-[16px] top-[12px] w-[105px] h-[18px] font-montserrat text-[14px] font-medium leading-[1.3] text-black">
        Weather alerts
      </div>

      {/* Frame 1948761662 (Top Alert Box) */}
      <div className="absolute left-[16px] top-[40px] flex h-[24px] w-[calc(100%-32px)] items-center rounded-[7px] bg-white px-[10px] gap-[10px]">
        <span className="font-montserrat text-[12px] font-medium leading-[1.3] text-[#554D2C] w-full h-[16px] truncate">
          High temperature conditions expected. Crop stress likely.
        </span>
      </div>

      {/* Frame 1948761651 (Temp & Cloud Section) */}
      <div className="absolute left-[16px] top-[68px] flex h-[52px] w-[calc(100%-32px)] items-center justify-between">
        {/* Frame 1948761653 (Left part) */}
        <div className="flex h-[52px] w-[151px] items-center gap-[9px]">
          {/* Temperature text */}
          <div className="font-montserrat text-[40px] font-medium leading-[1.3] text-black w-[66px] h-[52px] flex items-center">
            38°
          </div>
          {/* Frame 1948761652 (Friday & time) */}
          <div className="flex h-[49px] w-[76px] flex-col justify-center">
            <span className="font-montserrat text-[24px] font-medium leading-[1.3] text-black w-[76px] h-[31px]">
              Friday
            </span>
            <span className="font-montserrat text-[14px] font-medium leading-[1.3] text-black w-[65px] h-[18px]">
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
      <div className="absolute left-[16px] top-[147px] flex h-[24px] w-[calc(100%-32px)] max-w-[404px] items-center rounded-[7px] bg-[#C6D8BD] px-[10px] gap-[10px]">
        <span className="font-montserrat text-[12px] font-medium leading-[1.3] text-[#192D0F] w-full h-[16px] truncate">
          Irrigate during early morning or evening hours.
        </span>
      </div>

      {/* Frame 1948760941 (Open GIS view button) */}
      <Link
        href="/land-intelligence"
        className="absolute bottom-[16px] left-[16px] flex h-[28px] w-[calc(100%-32px)] items-center justify-center gap-[10px] rounded-[15px] bg-[#396622] font-montserrat text-[12px] font-medium leading-[1.3] text-white"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
          <rect x="1.66" y="1.66" width="12.67" height="12.67" rx="2" stroke="white" strokeWidth="1"/>
          <path d="M1.66 3H14.33" stroke="white" strokeWidth="1" />
          <path d="M8.33 4.33V14.33" stroke="white" strokeWidth="1" />
          <path d="M1.66 8H10" stroke="white" strokeWidth="1" />
        </svg>
        <span className="w-[89px] h-[16px] flex items-center justify-center">Open GIS view</span>
      </Link>
    </div>
  );
}

export function HomeHero() {
  return (
    <section className="h-full overflow-hidden bg-canvas p-6 lg:px-6 lg:py-8">
      <div className="flex h-full w-full flex-col gap-10 overflow-hidden">
        {/* Greeting Section */}
        <div>
          <div className="font-montserrat flex items-center gap-3 text-[32px] leading-tight text-[#222222]">
            <p className="font-medium opacity-50">Good morning</p>
            <p className="font-bold italic">Deovrat</p>
          </div>
          <div className="mt-2 flex items-center gap-[10px]">
            <GreetingPinIcon />
            <p className="font-poppins text-[14px] leading-none text-black opacity-50">
              Kendri, Dhamtari Rd, Raipur, CG
            </p>
          </div>
        </div>

        {/* First Row: Crop Catalogue & Map */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          <div className="xl:col-span-7">
            <CropCatalogueCard />
          </div>
          <div className="xl:col-span-5">
            <MapCard />
          </div>
        </div>

        {/* Second Row: Forecast & Weather */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-stretch">
          <div className="xl:col-span-8">
            <ForecastChart />
          </div>
          <div className="xl:col-span-4">
            <WeatherCard />
          </div>
        </div>
      </div>
    </section>
  );
}
