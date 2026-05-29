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
  const iconClass = active ? 'text-white' : 'text-white/60';
  const labelClass = active ? 'text-white/80' : 'text-white/50';
  const valueClass = active ? 'text-white' : 'text-white/90';

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
    <div className={cn('flex h-[42px] w-full shrink-0 items-center justify-between rounded-[8px] px-[12px] transition-all duration-200', active ? 'bg-white/10 border border-white/20' : 'bg-transparent border border-transparent')}>
      
      {/* Day label */}
      <div className="w-[40px] shrink-0 font-montserrat text-[12px] font-medium text-white/90">
        {day.day_label}
      </div>

      {/* Icon */}
      <WeatherIcon icon={day.condition} className={cn('h-[20px] w-[20px] shrink-0', active ? 'text-white' : 'text-white/70')} />

      {/* Wind & Rain Mini-Metrics */}
      <div className="flex w-[80px] shrink-0 items-center gap-[8px] opacity-80">
        <div className="flex items-center gap-[3px] text-white/80">
          <Wind className="h-[10px] w-[10px]" strokeWidth={1.5} />
          <span className="font-montserrat text-[9px]">{day.wind_mph}</span>
        </div>
        <div className="flex items-center gap-[3px] text-white/80">
          <CloudRain className="h-[10px] w-[10px]" strokeWidth={1.5} />
          <span className="font-montserrat text-[9px]">{day.rain_mm}</span>
        </div>
      </div>

      {/* Temperature */}
      <div className="w-[45px] shrink-0 text-right font-montserrat text-[14px] font-semibold text-white/90">
        {day.temp_c}°
      </div>
    </div>
  );
}

