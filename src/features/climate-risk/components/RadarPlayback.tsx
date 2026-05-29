'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Play, Pause, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface RadarFrame {
  time: number;
  path: string;
}

interface RadarPlaybackProps {
  frames: RadarFrame[];
  activeIndex: number;
  onFrameChange: (index: number) => void;
  className?: string;
}

export function RadarPlayback({ frames, activeIndex, onFrameChange, className }: RadarPlaybackProps) {
  const [playing, setPlaying] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-advance frames when playing
  useEffect(() => {
    if (playing && frames.length > 0) {
      intervalRef.current = setInterval(() => {
        onFrameChange(-1); // Signal to advance
      }, 600);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [playing, frames.length, onFrameChange]);

  const togglePlay = useCallback(() => {
    setPlaying((p) => !p);
  }, []);

  const stepBack = useCallback(() => {
    setPlaying(false);
    const newIdx = activeIndex > 0 ? activeIndex - 1 : frames.length - 1;
    onFrameChange(newIdx);
  }, [activeIndex, frames.length, onFrameChange]);

  const stepForward = useCallback(() => {
    setPlaying(false);
    const newIdx = activeIndex < frames.length - 1 ? activeIndex + 1 : 0;
    onFrameChange(newIdx);
  }, [activeIndex, frames.length, onFrameChange]);

  if (frames.length === 0) return null;

  const currentFrame = frames[activeIndex];
  const date = currentFrame ? new Date(currentFrame.time * 1000) : new Date();

  const day = date.getDate();
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return (
    <div className={cn(
      'absolute bottom-[16px] left-1/2 -translate-x-1/2 z-[400] flex items-center gap-[6px] rounded-full bg-[#1a1c1a]/85 backdrop-blur-md border border-white/10 px-[6px] py-[5px] shadow-[0_8px_30px_rgba(0,0,0,0.5)] font-montserrat',
      className
    )}>
      {/* Play/Pause */}
      <button
        onClick={togglePlay}
        className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
        aria-label={playing ? 'Pause' : 'Play'}
      >
        {playing ? <Pause className="h-[16px] w-[16px]" /> : <Play className="h-[16px] w-[16px] ml-[2px]" />}
      </button>

      {/* Timeline Scrubber */}
      <div className="relative flex items-center w-[180px] h-[34px] px-[4px]">
        {/* Track */}
        <div className="absolute left-[4px] right-[4px] h-[3px] rounded-full bg-white/15" />
        {/* Progress */}
        <div
          className="absolute left-[4px] h-[3px] rounded-full bg-[#4dd0e1] transition-all duration-200"
          style={{ width: `${(activeIndex / Math.max(frames.length - 1, 1)) * 100}%` }}
        />
        {/* Scrubber Input */}
        <input
          type="range"
          min={0}
          max={frames.length - 1}
          value={activeIndex}
          onChange={(e) => {
            setPlaying(false);
            onFrameChange(Number(e.target.value));
          }}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          aria-label="Radar timeline"
        />
        {/* Thumb indicator */}
        <div
          className="absolute h-[12px] w-[12px] rounded-full bg-[#4dd0e1] shadow-[0_0_8px_rgba(77,208,225,0.5)] border-2 border-white/30 pointer-events-none transition-all duration-200"
          style={{ left: `calc(${(activeIndex / Math.max(frames.length - 1, 1)) * 100}% - 6px + 4px)` }}
        />
      </div>

      {/* Date/Time Display */}
      <div className="flex items-center gap-[8px] px-[8px]">
        <span className="text-[13px] font-medium text-white/90 tabular-nums">
          {day} {month}
        </span>
        <div className="flex items-center gap-[3px] text-white/90">
          <span className="text-[13px] font-medium tabular-nums">{hours}</span>
          <span className="text-[13px] text-white/40">:</span>
          <span className="text-[13px] font-medium tabular-nums">{minutes}</span>
        </div>
      </div>

      {/* Step Controls */}
      <div className="flex items-center gap-[2px]">
        <button
          onClick={stepBack}
          className="flex h-[28px] w-[28px] items-center justify-center rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Previous frame"
        >
          <ChevronLeft className="h-[16px] w-[16px]" />
        </button>
        <button
          onClick={stepForward}
          className="flex h-[28px] w-[28px] items-center justify-center rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Next frame"
        >
          <ChevronRight className="h-[16px] w-[16px]" />
        </button>
      </div>
    </div>
  );
}
