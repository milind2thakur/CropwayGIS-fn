'use client';

import React, { useEffect, useState } from 'react';
import { ArrowLeft, Cloud, CloudRain, Droplets, Minus, Plus, Sun, Thermometer, Wind, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

import { cn } from '@/lib/utils';
import { getWeatherForecast, WeatherForecastResponse, WeatherDailyItem } from '@/lib/api/climate-risk';

// Dynamically load the Leaflet Map component with SSR disabled
const ClimateRiskMap = dynamic(
  () => import('./ClimateRiskMap').then((mod) => mod.ClimateRiskMap),
  { ssr: false }
);

function WeatherIcon({ icon, className }: { icon: 'sun' | 'cloud' | 'rain' | 'storm'; className?: string }) {
  if (icon === 'storm') {
    return <Zap className={cn('h-[34px] w-[34px]', className)} strokeWidth={1.5} />;
  }

  if (icon === 'sun') {
    return <Sun className={cn('h-[34px] w-[34px]', className)} strokeWidth={1.5} />;
  }

  if (icon === 'rain') {
    return <CloudRain className={cn('h-[34px] w-[34px]', className)} strokeWidth={1.5} />;
  }

  return <Cloud className={cn('h-[34px] w-[34px]', className)} strokeWidth={1.5} />;
}

function Metric({ type, label, value, active = false }: { type: 'wind' | 'rain' | 'humidity'; label: string; value: string; active?: boolean }) {
  const iconClass = active ? 'text-white' : 'text-[#222222]';
  const labelClass = active ? 'text-white/55' : 'text-black/50';
  const valueClass = active ? 'text-white' : 'text-black';

  return (
    <div className="flex h-[32px] flex-col gap-[3px]">
      <div className={cn('flex h-[13px] items-center gap-[4px] font-montserrat text-[10px] font-medium leading-[130%]', labelClass)}>
        {type === 'wind' ? <Wind className={cn('h-[16px] w-[16px]', iconClass)} strokeWidth={1.2} /> : null}
        {type === 'rain' ? <CloudRain className={cn('h-[15px] w-[15px]', iconClass)} strokeWidth={1.2} /> : null}
        {type === 'humidity' ? <Droplets className={cn('h-[12px] w-[12px]', iconClass)} strokeWidth={1.2} /> : null}
        <span>{label}</span>
      </div>
      <div className={cn('font-montserrat text-[12px] font-medium leading-[130%]', valueClass)}>{value}</div>
    </div>
  );
}

function ForecastCard({ day }: { day: WeatherDailyItem }) {
  const active = day.highlighted === true;

  // Dynamically derive context card comments based on day metrics
  const getAlertMessage = () => {
    if (day.temp_c >= 37) return 'Extreme heat expected. Ensure high hydration levels.';
    if (day.rain_mm >= 5.0) return 'Heavy rainfall expected. Risk of soil waterlogging.';
    if (day.wind_mph >= 15) return 'Strong winds forecasted. Secure fragile plants.';
    return 'Ideal growing weather. Perfect for standard field tasks.';
  };

  return (
    <div className={cn('relative h-[95px] w-full shrink-0 rounded-[12px] transition-all duration-300', active ? 'bg-[#407327] shadow-md' : 'bg-white border border-black/5')}>
      <WeatherIcon icon={day.condition} className={cn('absolute left-[20px] top-[20px] opacity-70', active ? 'text-white' : 'text-[#222222]')} />
      <div className="absolute left-[77px] top-[15px] flex flex-col">
        <div className={cn('font-montserrat text-[24px] font-medium leading-[130%]', active ? 'text-white' : 'text-black')}>
          {day.temp_c}°
        </div>
        <div className={cn('font-montserrat text-[10px] font-medium leading-[130%] opacity-70', active ? 'text-white' : 'text-black')}>
          {day.day_label}
        </div>
      </div>
      <Thermometer className={cn('absolute left-[118px] top-[21px] h-[19px] w-[20px]', active ? 'text-white' : 'text-[#222222]')} strokeWidth={1.3} />
      <div className="absolute left-[169px] top-[9px] flex h-[32px] w-[211px] items-center gap-[16px]">
        <Metric type="wind" label="Wind" value={`${day.wind_mph} mph`} active={active} />
        <Metric type="rain" label="Rain" value={`${day.rain_mm} mm`} active={active} />
        <Metric type="humidity" label="Humidity" value={`${day.humidity_gm3} g/m³`} active={active} />
      </div>
      <p className={cn('absolute left-[20px] top-[56px] font-montserrat text-[10px] font-medium leading-[130%]', active ? 'text-white' : 'text-[#222222]')}>
        {getAlertMessage()}
      </p>
    </div>
  );
}

function WeatherPanel({
  data,
  loading,
  error,
  onRetry,
}: {
  data: WeatherForecastResponse | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}) {
  if (loading) {
    return (
      <aside className="absolute right-[22px] top-[14px] z-20 h-[calc(100%-28px)] w-[431px] rounded-[20px] bg-[#EDF2EA]/95 shadow-[0_4px_24px_rgba(0,0,0,0.06)] backdrop-blur-md px-[13px] py-[20px] flex flex-col justify-center items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#407327] border-t-transparent" />
        <p className="font-montserrat text-sm text-black/55">Retrieving climate forecast...</p>
      </aside>
    );
  }

  if (error || !data) {
    return (
      <aside className="absolute right-[22px] top-[14px] z-20 h-[calc(100%-28px)] w-[431px] rounded-[20px] bg-[#EDF2EA]/95 shadow-[0_4px_24px_rgba(0,0,0,0.06)] backdrop-blur-md px-[13px] py-[20px] flex flex-col justify-between">
        <div className="flex-1 flex flex-col justify-center items-center text-center px-4">
          <CloudRain className="h-16 w-16 text-black/30 mb-4" strokeWidth={1} />
          <h3 className="font-montserrat font-semibold text-black text-lg mb-2">Weather API Connection Failed</h3>
          <p className="font-montserrat text-xs text-black/60 mb-6 leading-relaxed">
            {error || 'An unexpected error occurred while contacting the weather service.'}
          </p>
          <button
            onClick={onRetry}
            className="rounded-[10px] bg-[#407327] px-5 py-2.5 font-montserrat text-xs font-semibold text-white hover:bg-[#345c20] transition duration-200"
          >
            Retry Connection
          </button>
        </div>
      </aside>
    );
  }

  const current = data.current;

  return (
    <aside className="absolute right-[22px] top-[14px] z-20 h-[calc(100%-28px)] w-[431px] rounded-[20px] bg-[#EDF2EA] px-[13px] py-[20px] flex flex-col shadow-[0_4px_24px_rgba(0,0,0,0.05)] border border-white/40">
      {/* Alert Header Box */}
      {current.alert_text && (
        <div className="flex min-h-[32px] py-1.5 w-full items-center rounded-[7px] bg-white px-[10px] mb-[15px] border border-[#FEF08A]">
          <span className="font-montserrat text-[11px] font-semibold leading-[130%] text-[#a37912]">
            {current.alert_text}
          </span>
        </div>
      )}

      <div className="flex h-[52px] items-center justify-between px-[3px]">
        <div className="flex items-center gap-[9px]">
          <div className="font-montserrat text-[40px] font-medium leading-[130%] text-black">{current.temp_c}°</div>
          <div className="font-montserrat font-medium text-black">
            <div className="text-[24px] leading-[130%]">{current.day_label}</div>
            <div className="text-[14px] leading-[130%]">{current.time_label}</div>
          </div>
        </div>
        <div className="relative h-[52px] w-[52px] flex items-center justify-center">
          <WeatherIcon icon={current.condition} className="h-10 w-10 text-[#407327]" />
        </div>
      </div>

      <div className="mt-[20px] shrink-0">
        <div className="font-montserrat text-[12px] font-medium leading-[130%] text-black/50">Suggestions</div>
        <div className="mt-[2px] flex min-h-[28px] items-center rounded-[7px] bg-[#B6A65F] px-[10px] py-[6px] font-montserrat text-[12px] font-medium leading-[130%] text-white shadow-sm">
          {data.suggestion}
        </div>
      </div>

      {/* Daily Forecast list - scrollable, containing all 7 items */}
      <div className="mt-[20px] flex-1 flex flex-col gap-[9px] overflow-y-auto pr-1">
        {data.daily.map((day, idx) => (
          <ForecastCard key={idx} day={day} />
        ))}
      </div>
    </aside>
  );
}

function MapControls({
  activeLayer,
  setActiveLayer,
  onZoomIn,
  onZoomOut,
}: {
  activeLayer: 'temperature' | 'precipitation' | 'wind';
  setActiveLayer: (layer: 'temperature' | 'precipitation' | 'wind') => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
}) {
  return (
    <>
      {/* Legend Box in Bottom-Left */}
      <div className="absolute bottom-[68px] left-[40px] z-10 font-montserrat text-[10px] font-medium leading-[130%] text-black bg-white/70 backdrop-blur-sm p-3.5 rounded-lg shadow-sm border border-white/50">
        <div>1 Inch = 1 KM</div>
        <div className="mt-[9px] h-px w-[268px] bg-black/10" />
        <div className="mt-[3px] flex w-[268px] justify-between text-[9px] text-black/60">
          <span>0</span>
          <span>0.5</span>
          <span>1</span>
          <span>1.5</span>
        </div>
        <div className="ml-[108px] mt-[2px] text-black/50">Kilometer</div>

        {/* Dynamic gradient bar depending on the active overlay layer */}
        {activeLayer === 'temperature' && (
          <div className="mt-[14px] flex h-[28px] w-[268px] items-center justify-between bg-[linear-gradient(90deg,#E08C00_0%,#E3DE6B_50%,#EBEBC6_100%)] px-[8px] text-[11px] rounded-sm font-semibold">
            <span className="text-white">40°C</span>
            <span className="text-black/80">30°C</span>
          </div>
        )}
        {activeLayer === 'precipitation' && (
          <div className="mt-[14px] flex h-[28px] w-[268px] items-center justify-between bg-[linear-gradient(90deg,#E0F2FE_0%,#0284C7_100%)] px-[8px] text-[11px] rounded-sm font-semibold">
            <span className="text-black/80">0 mm</span>
            <span className="text-white">10 mm</span>
          </div>
        )}
        {activeLayer === 'wind' && (
          <div className="mt-[14px] flex h-[28px] w-[268px] items-center justify-between bg-[linear-gradient(90deg,#F0FDFA_0%,#0D9488_100%)] px-[8px] text-[11px] rounded-sm font-semibold">
            <span className="text-black/80">0 mph</span>
            <span className="text-white">40 mph</span>
          </div>
        )}
      </div>

      {/* Layer Toggle Bar in Bottom-Center */}
      <div className="absolute bottom-[20px] left-1/2 z-10 flex h-[53px] w-[150px] -translate-x-1/2 items-center rounded-[20px] bg-white px-[6px] shadow-[0_4px_14px_rgba(0,0,0,0.1)] border border-black/5">
        <button
          onClick={() => setActiveLayer('temperature')}
          className={cn(
            'grid h-[42px] w-[42px] place-items-center rounded-[15px] transition duration-200',
            activeLayer === 'temperature' ? 'bg-[#407327] text-white shadow-sm' : 'text-black/50 hover:bg-black/5'
          )}
          aria-label="Temperature layer"
        >
          <Sun className="h-5 w-5" strokeWidth={1.5} />
        </button>
        <button
          onClick={() => setActiveLayer('wind')}
          className={cn(
            'grid h-[42px] w-[44px] place-items-center rounded-[15px] transition duration-200',
            activeLayer === 'wind' ? 'bg-[#407327] text-white shadow-sm' : 'text-black/50 hover:bg-black/5'
          )}
          aria-label="Wind layer"
        >
          <Wind className="h-5 w-5" strokeWidth={1.4} />
        </button>
        <button
          onClick={() => setActiveLayer('precipitation')}
          className={cn(
            'grid h-[42px] w-[42px] place-items-center rounded-[15px] transition duration-200',
            activeLayer === 'precipitation' ? 'bg-[#407327] text-white shadow-sm' : 'text-black/50 hover:bg-black/5'
          )}
          aria-label="Rain layer"
        >
          <CloudRain className="h-5 w-5" strokeWidth={1.5} />
        </button>
      </div>

      {/* Zoom and Map Indicators in Bottom-Right */}
      <div className="absolute bottom-[20px] right-[455px] z-10 flex h-[53px] items-start gap-[5px]">
        <div className="h-[53px] w-[53px] rounded-[3px] border border-white bg-[linear-gradient(135deg,#82C26E_0%,#F2F2F2_35%,#407327_36%,#C9E7B8_60%,#2B4D1A_100%)] shadow-sm" />
        <div className="flex h-[53px] w-[23px] flex-col gap-[5px]">
          <button
            onClick={onZoomIn}
            className="grid h-[24px] w-[23px] place-items-center rounded-[3px] bg-white text-[#203A13] hover:bg-black/5 active:bg-black/10 transition shadow-sm"
            aria-label="Zoom in"
          >
            <Plus className="h-[13px] w-[13px]" />
          </button>
          <button
            onClick={onZoomOut}
            className="grid h-[24px] w-[23px] place-items-center rounded-[3px] bg-white text-[#203A13] hover:bg-black/5 active:bg-black/10 transition shadow-sm"
            aria-label="Zoom out"
          >
            <Minus className="h-[13px] w-[13px]" />
          </button>
        </div>
      </div>
    </>
  );
}

export function ClimateRiskClient() {
  const router = useRouter();

  const [weatherData, setWeatherData] = useState<WeatherForecastResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeLayer, setActiveLayer] = useState<'temperature' | 'precipitation' | 'wind'>('temperature');
  const [zoomTrigger, setZoomTrigger] = useState<'in' | 'out' | null>(null);

  // Fetch forecast weather data centered on the Raipur farm parcel [21.2517, 81.6304]
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

  return (
    <div className="relative h-full min-h-[933px] overflow-hidden bg-[#F5F5F5]" id="climate-risk-page-container">
      {/* Real Leaflet map overlay */}
      <ClimateRiskMap
        activeLayer={activeLayer}
        zoomTrigger={zoomTrigger}
        onZoomTriggerHandled={() => setZoomTrigger(null)}
      />

      {/* Navigation and Title */}
      <button
        type="button"
        onClick={() => router.back()}
        className="absolute left-[24px] top-[11px] z-10 flex h-[22px] items-center gap-[5px] rounded-[6px] bg-[#E3ECDF] px-[8px] font-montserrat text-[12px] font-medium leading-[130%] text-[#203A13] hover:bg-[#d6e5d0] transition"
      >
        <ArrowLeft className="h-[12px] w-[12px]" />
        Back
      </button>

      <h1 className="absolute left-[24px] top-[51px] z-10 font-montserrat text-[28px] font-medium leading-[130%] text-black pointer-events-none drop-shadow-[0_2px_4px_rgba(255,255,255,0.4)]">
        Weather alerts
      </h1>

      <MapControls
        activeLayer={activeLayer}
        setActiveLayer={setActiveLayer}
        onZoomIn={() => setZoomTrigger('in')}
        onZoomOut={() => setZoomTrigger('out')}
      />

      <WeatherPanel
        data={weatherData}
        loading={loading}
        error={error}
        onRetry={loadForecast}
      />
    </div>
  );
}
