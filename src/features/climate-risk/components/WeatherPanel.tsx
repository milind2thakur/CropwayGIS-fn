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
  locationName,
  className,
}: {
  data: WeatherForecastResponse | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  locationName?: string;
  className?: string;
}) {
  const asideClass = cn('absolute z-[400] rounded-[12px] bg-[#1a1c1a]/80 backdrop-blur-md px-[14px] py-[14px] flex flex-col shadow-[0_8px_30px_rgba(0,0,0,0.4)] border border-white/10', className);

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
        <div className="mb-[11px] flex min-h-[30px] w-full items-center rounded-[7px] border border-yellow-500/40 bg-black/40 px-[10px] py-1.5">
          <span className="font-montserrat text-[11px] font-semibold leading-[130%] text-yellow-300">{current.alert_text}</span>
        </div>
      )}

      {/* Header like Zoom Earth */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
        <div className="flex items-center gap-2">
          <div className="text-white/60">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
          </div>
          <span className="font-montserrat text-[15px] font-semibold text-white/90">{locationName || 'Raipur'}</span>
        </div>
        <div className="flex items-center gap-2 text-white/60">
          <button className="hover:text-white transition-colors"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
        </div>
      </div>

      <div className="flex items-center justify-between font-montserrat text-[9px] font-bold tracking-wider text-white/50 mb-2">
        <div className="flex flex-col gap-[2px]">
          <span>DAILY FORECAST</span>
          <span>UTC+5.5</span>
        </div>
        <div className="flex flex-col text-right gap-[2px]">
          <span>TEMP.</span>
          <span>°C</span>
        </div>
      </div>

      <div className="flex flex-col gap-[2px]">
        {data.daily.map((day, idx) => <ForecastCard key={idx} day={day} />)}
      </div>
    </aside>
  );
}
