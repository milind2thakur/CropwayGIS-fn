'use client';

import React, { useState } from 'react';
import { ChevronUp, Radar, Wind, Flame, CloudLightning, Tag, Thermometer, Grid3x3, Moon, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MapOverlays {
  radarCoverage: boolean;
  rainAnimation: boolean;
  windAnimation: boolean;
  activeFires: boolean;
  tropical: boolean;
  labels: boolean;
  temperatures: boolean;
  nightBoundary: boolean;
  crosshair: boolean;
}

export const DEFAULT_OVERLAYS: MapOverlays = {
  radarCoverage: true,
  rainAnimation: false,
  windAnimation: false,
  activeFires: false,
  tropical: false,
  labels: true,
  temperatures: false,
  nightBoundary: false,
  crosshair: false,
};

interface OverlayItemProps {
  icon: React.ReactNode;
  label: string;
  shortcut: string;
  active: boolean;
  onToggle: () => void;
}

function OverlayItem({ icon, label, shortcut, active, onToggle }: OverlayItemProps) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        'flex w-full items-center justify-between rounded-[8px] px-[12px] py-[8px] transition-colors',
        active ? 'text-white bg-white/10' : 'text-white/60 hover:bg-white/5 hover:text-white'
      )}
    >
      <div className="flex items-center gap-[12px]">
        {icon}
        <span className="text-[13px] font-medium leading-[140%]">{label}</span>
      </div>
      <span className={cn(
        'flex h-[20px] w-[20px] items-center justify-center rounded-[4px] border border-white/10 text-[9px] font-bold uppercase',
        active ? 'bg-white/20 text-white' : 'bg-white/5 text-white/40'
      )}>
        {shortcut}
      </span>
    </button>
  );
}

interface MapOverlaysPanelProps {
  overlays: MapOverlays;
  onToggle: (key: keyof MapOverlays) => void;
  className?: string;
}

export function MapOverlaysPanel({ overlays, onToggle, className }: MapOverlaysPanelProps) {
  const [open, setOpen] = useState(true);

  return (
    <div className={cn(
      'w-[220px] rounded-[12px] border border-white/10 bg-[#1e201e]/90 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.7)] text-white font-montserrat overflow-hidden transition-all',
      className
    )}>
      {/* Header */}
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-[16px] py-[12px] hover:bg-white/5 transition-colors border-b border-white/5"
      >
        <span className="text-[10px] font-bold tracking-widest text-white/70 uppercase">Map Overlays</span>
        <ChevronUp className={cn('h-4 w-4 text-white/50 transition-transform', !open && 'rotate-180')} />
      </button>

      {open && (
        <div className="px-[8px] py-[8px] flex flex-col gap-[2px]">
          <OverlayItem
            icon={<Radar className="h-[16px] w-[16px]" />}
            label="Radar Coverage"
            shortcut="Q"
            active={overlays.radarCoverage}
            onToggle={() => onToggle('radarCoverage')}
          />
          <OverlayItem
            icon={<CloudLightning className="h-[16px] w-[16px]" />}
            label="Rain Animation"
            shortcut="P"
            active={overlays.rainAnimation}
            onToggle={() => onToggle('rainAnimation')}
          />
          <OverlayItem
            icon={<Wind className="h-[16px] w-[16px]" />}
            label="Wind Animation"
            shortcut="W"
            active={overlays.windAnimation}
            onToggle={() => onToggle('windAnimation')}
          />
          <OverlayItem
            icon={<Flame className="h-[16px] w-[16px]" />}
            label="Active Fires"
            shortcut="F"
            active={overlays.activeFires}
            onToggle={() => onToggle('activeFires')}
          />
          <OverlayItem
            icon={<CloudLightning className="h-[16px] w-[16px]" />}
            label="Tropical Systems"
            shortcut="S"
            active={overlays.tropical}
            onToggle={() => onToggle('tropical')}
          />
          <OverlayItem
            icon={<Tag className="h-[16px] w-[16px]" />}
            label="Labels"
            shortcut="L"
            active={overlays.labels}
            onToggle={() => onToggle('labels')}
          />
          <OverlayItem
            icon={<Thermometer className="h-[16px] w-[16px]" />}
            label="Temperatures"
            shortcut="E"
            active={overlays.temperatures}
            onToggle={() => onToggle('temperatures')}
          />
          <OverlayItem
            icon={<Moon className="h-[16px] w-[16px]" />}
            label="Night Boundary"
            shortcut="N"
            active={overlays.nightBoundary}
            onToggle={() => onToggle('nightBoundary')}
          />
          <OverlayItem
            icon={<Plus className="h-[16px] w-[16px]" />}
            label="Crosshair"
            shortcut="C"
            active={overlays.crosshair}
            onToggle={() => onToggle('crosshair')}
          />
        </div>
      )}
    </div>
  );
}
