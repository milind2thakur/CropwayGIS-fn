import { CloudRain, Droplets, Thermometer, Wind } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { WeatherDailyItem } from '@/lib/api/climate-risk';

import { WeatherIcon } from './WeatherIcon';

function Metric({
  type,
  label,
  value,
  active = false,
}: {
  type: 'wind' | 'rain' | 'humidity';
  label: string;
  value: string;
  active?: boolean;
}) {
  const iconClass = active ? 'text-white' : 'text-[#222222]';
  const labelClass = active ? 'text-white/60' : 'text-black/55';
  const valueClass = active ? 'text-white' : 'text-black';

  return (
    <div className="flex min-w-0 flex-col gap-[2px]">
      <div className={cn('flex items-center gap-[2px] whitespace-nowrap font-montserrat text-[8px] font-medium leading-[120%]', labelClass)}>
        {type === 'wind' ? <Wind className={cn('h-[10px] w-[10px]', iconClass)} strokeWidth={1.2} /> : null}
        {type === 'rain' ? <CloudRain className={cn('h-[10px] w-[10px]', iconClass)} strokeWidth={1.2} /> : null}
        {type === 'humidity' ? <Droplets className={cn('h-[9px] w-[9px]', iconClass)} strokeWidth={1.2} /> : null}
        <span>{label}</span>
      </div>
      <div className={cn('whitespace-nowrap font-montserrat text-[9px] font-semibold leading-[120%]', valueClass)}>{value}</div>
    </div>
  );
}

export function ForecastCard({ day }: { day: WeatherDailyItem }) {
  const active = day.highlighted === true;

  const getAlertMessage = () => {
    if (day.temp_c >= 37) return 'High temperature conditions expected. Crop stress likely.';
    if (day.rain_mm >= 5.0) return 'Heavy rainfall expected. Risk of soil waterlogging.';
    if (day.wind_mph >= 15) return 'Strong winds forecasted. Secure fragile plants.';
    return 'Ideal growing weather. Perfect for standard field tasks.';
  };

  return (
    <div className={cn('flex h-[90px] w-full shrink-0 flex-col rounded-[11px] px-[11px] py-[9px] transition-all duration-200', active ? 'bg-[#407327] shadow-[0_5px_14px_rgba(32,58,19,0.26)]' : 'bg-[#F0F2EF] border border-black/5')}>
      <div className="flex min-w-0 items-start gap-[8px]">
        <WeatherIcon icon={day.condition} className={cn('mt-[5px] h-[24px] w-[24px] shrink-0 opacity-70', active ? 'text-white' : 'text-[#222222]')} />
        <div className="flex w-[58px] shrink-0 items-start gap-[1px]">
          <div className={cn('font-montserrat text-[28px] font-medium leading-none', active ? 'text-white' : 'text-black')}>
            {day.temp_c}°
          </div>
          <Thermometer className={cn('mt-[3px] h-[11px] w-[11px] shrink-0', active ? 'text-white' : 'text-[#222222]')} strokeWidth={1.3} />
        </div>
        <div className="grid min-w-0 flex-1 grid-cols-[0.84fr_0.78fr_1.15fr] gap-[5px] pt-[1px]">
          <Metric type="wind" label="Wind" value={`${day.wind_mph} mph`} active={active} />
          <Metric type="rain" label="Rain" value={`${day.rain_mm} mm`} active={active} />
          <Metric type="humidity" label="Humidity" value={`${day.humidity_gm3} g/m³`} active={active} />
        </div>
      </div>
      <div className="mt-[6px] flex min-w-0 items-start gap-[8px] pl-[34px]">
        <span className={cn('w-[36px] shrink-0 font-montserrat text-[9px] font-semibold leading-[120%] opacity-70', active ? 'text-white' : 'text-black')}>
          {day.day_label}
        </span>
        <p className={cn('line-clamp-2 min-w-0 font-montserrat text-[9px] font-medium leading-[125%]', active ? 'text-white' : 'text-[#222222]')}>
          {getAlertMessage()}
        </p>
      </div>
    </div>
  );
}

