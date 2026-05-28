'use client';

import type { ComponentType, ReactNode } from 'react';
import { Minus, Plus, Search, X } from 'lucide-react';

import { cn } from '@/lib/utils';

export type MapToolItem<T extends string> = {
  id: T;
  label: string;
  icon: ComponentType<{ className?: string }>;
};

export function MapZoomControls({
  onZoomIn,
  onZoomOut,
  className,
  buttonClassName,
  iconClassName,
}: {
  onZoomIn: () => void;
  onZoomOut: () => void;
  className?: string;
  buttonClassName?: string;
  iconClassName?: string;
}) {
  return (
    <div className={cn('flex h-[36px] w-[18px] flex-col gap-[2px]', className)}>
      <button
        type="button"
        onClick={onZoomIn}
        className={cn('grid h-[17px] w-[18px] place-items-center rounded-[3px] bg-white text-[#203A13] shadow-sm transition hover:bg-black/5 active:bg-black/10', buttonClassName)}
        aria-label="Zoom in"
      >
        <Plus className={cn('h-[10px] w-[10px]', iconClassName)} />
      </button>
      <button
        type="button"
        onClick={onZoomOut}
        className={cn('grid h-[17px] w-[18px] place-items-center rounded-[3px] bg-white text-[#203A13] shadow-sm transition hover:bg-black/5 active:bg-black/10', buttonClassName)}
        aria-label="Zoom out"
      >
        <Minus className={cn('h-[10px] w-[10px]', iconClassName)} />
      </button>
    </div>
  );
}

export function MapLayerThumbnailToggle({
  label,
  nextLabel,
  currentPreview,
  nextPreview,
  onToggle,
  className,
}: {
  label: string;
  nextLabel?: string;
  currentPreview: ReactNode;
  nextPreview?: ReactNode;
  onToggle: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn('group relative h-[36px] w-[36px] overflow-visible rounded-[3px] border border-white shadow-sm outline-none ring-0 transition hover:scale-[1.03] focus-visible:ring-2 focus-visible:ring-[#407327]', className)}
      aria-label={nextLabel ? `Switch map layer. Current: ${label}. Next: ${nextLabel}` : `Switch map layer. Current: ${label}`}
      title={nextLabel ? `Current: ${label} | Next: ${nextLabel}` : `Current: ${label}`}
    >
      {nextPreview ? (
        <span className="pointer-events-none absolute -right-[3px] -top-[3px] z-0 h-full w-full overflow-hidden rounded-[3px] border border-white/80 opacity-90 shadow-sm">
          {nextPreview}
        </span>
      ) : null}
      <span className="pointer-events-none absolute inset-0 z-10 overflow-hidden rounded-[3px]">
        {currentPreview}
      </span>
      <span className="pointer-events-none absolute inset-0 z-20 bg-[linear-gradient(135deg,transparent_0%,transparent_49%,rgba(255,255,255,0.92)_50%,rgba(255,255,255,0.92)_57%,transparent_58%)]" />
      <span className="absolute -bottom-[9px] left-1/2 z-30 -translate-x-1/2 whitespace-nowrap rounded-[3px] bg-white/95 px-[3px] py-[1px] text-[7px] font-semibold leading-none text-[#1E3520] shadow-sm">
        {label}
      </span>
    </button>
  );
}

export function MapToolPillBar<T extends string>({
  tools,
  activeTool,
  onToolChange,
  className,
}: {
  tools: MapToolItem<T>[];
  activeTool: T;
  onToolChange: (tool: T) => void;
  className?: string;
}) {
  return (
    <div
      className={cn('absolute bottom-5 left-1/2 z-[1000] flex h-[52px] -translate-x-1/2 items-center justify-center gap-[18px] rounded-[26px] bg-white px-5 shadow-lg', className)}
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
                ? 'h-[40px] w-[30px] rounded-[15px] bg-greenDark text-white'
                : 'h-[30px] w-[30px] rounded-[8px] text-ink hover:bg-greenLight'
            )}
          >
            <Icon className="h-[18px] w-[18px]" />
          </button>
        );
      })}
    </div>
  );
}

export function MapOverlaySearchBox({
  value,
  placeholder,
  loading = false,
  onChange,
  onFocus,
  onClear,
  onSubmit,
  className,
}: {
  value: string;
  placeholder?: string;
  loading?: boolean;
  onChange: (value: string) => void;
  onFocus?: () => void;
  onClear?: () => void;
  onSubmit?: () => void;
  className?: string;
}) {
  return (
    <div className={cn('flex h-[46px] w-full items-center gap-[10px] rounded-[10px] border border-white bg-white/20 px-[14px] shadow-sm backdrop-blur-[12px]', className)}>
      <Search className="h-5 w-5 shrink-0 text-ink" strokeWidth={1.6} />
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onFocus={onFocus}
        onKeyDown={(event) => {
          if (event.key === 'Enter') onSubmit?.();
        }}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent font-poppins text-[12px] font-normal leading-none text-inkBase outline-none placeholder:text-muted"
      />
      {loading ? (
        <div className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-greenDarkActive border-t-transparent" />
      ) : value ? (
        <button
          type="button"
          aria-label="Clear search"
          onClick={onClear}
          className="flex h-[21px] w-[21px] shrink-0 items-center justify-center rounded-full bg-white shadow-sm transition hover:scale-110 hover:bg-greenLight"
        >
          <X className="h-[12px] w-[12px] text-ink" />
        </button>
      ) : (
        <button
          type="button"
          aria-label="Submit search"
          onClick={onSubmit}
          className="flex h-[21px] w-[21px] shrink-0 items-center justify-center rounded-full bg-white shadow-sm transition hover:scale-110"
        >
          <span className="block h-[8px] w-[8px] -rotate-45 border-r-[1.5px] border-t-[1.5px] border-greenDarkActive" />
        </button>
      )}
    </div>
  );
}
