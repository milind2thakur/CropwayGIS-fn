import { ErrorRetryPanel, LoadingPanel } from '@/components/ui/panel';
import type { WeatherForecastResponse } from '@/lib/api/climate-risk';
import { cn } from '@/lib/utils';

import { ForecastCard } from './ForecastCard';
import { WeatherIcon } from './WeatherIcon';

export function WeatherPanel({
  data,
  loading,
  error,
  onRetry,
  className,
}: {
  data: WeatherForecastResponse | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  className?: string;
}) {
  const asideClass = cn('absolute z-[400] rounded-[18px] bg-[#EAF0E6] px-[10px] py-[12px] flex flex-col shadow-[0_8px_26px_rgba(0,0,0,0.08)] border border-white/60', className);

  if (loading) {
    return (
      <aside className={asideClass}>
        <LoadingPanel message="Retrieving climate forecast..." className="border-0 bg-transparent shadow-none" />
      </aside>
    );
  }

  if (error || !data) {
    return (
      <aside className={asideClass}>
        <ErrorRetryPanel
          title="Weather API Connection Failed"
          message={error || 'An unexpected error occurred while contacting the weather service.'}
          onRetry={onRetry}
          className="border-0 bg-transparent shadow-none"
        />
      </aside>
    );
  }

  const current = data.current;

  return (
    <aside className={asideClass}>
      {current.alert_text && (
        <div className="mb-[11px] flex min-h-[30px] w-full items-center rounded-[7px] border border-[#D8CB80] bg-white px-[10px] py-1.5">
          <span className="font-montserrat text-[11px] font-semibold leading-[130%] text-[#8A7120]">{current.alert_text}</span>
        </div>
      )}

      <div className="flex h-[54px] items-center justify-between px-[2px]">
        <div className="flex items-center gap-[7px]">
          <div className="font-montserrat text-[40px] font-medium leading-[100%] text-black">{current.temp_c}°</div>
          <div className="font-montserrat font-medium text-black">
            <div className="text-[29px] leading-[100%]">{current.day_label}</div>
            <div className="text-[15px] leading-[115%]">{current.time_label}</div>
          </div>
        </div>
        <div className="relative flex h-[32px] w-[32px] items-center justify-center rounded-full bg-white/75">
          <WeatherIcon icon={current.condition} className="text-[#D6BD54]" />
        </div>
      </div>

      <div className="mt-[12px] shrink-0">
        <div className="font-montserrat text-[12px] font-medium leading-[130%] text-black/55">Suggestions</div>
        <div className="mt-[2px] flex min-h-[24px] items-center rounded-[7px] bg-[#B6A65F] px-[10px] py-[4px] font-montserrat text-[11px] font-medium leading-[130%] text-white shadow-sm">
          {data.suggestion}
        </div>
      </div>

      <div className="mt-[10px] flex flex-1 flex-col gap-[6px] overflow-y-auto pr-1">
        {data.daily.map((day, idx) => <ForecastCard key={idx} day={day} />)}
      </div>
    </aside>
  );
}
