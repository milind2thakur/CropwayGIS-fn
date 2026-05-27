'use client';

import { useEffect, useMemo, useState } from 'react';

type LeafletLikeMap = {
  on: (event: string, handler: () => void) => void;
  off: (event: string, handler: () => void) => void;
  getSize: () => { x: number; y: number };
  containerPointToLatLng: (point: [number, number]) => unknown;
  distance: (from: unknown, to: unknown) => number;
};

const BAR_WIDTH = 268;
const MINOR_TICK_X = [4, 24, 44, 84, 104, 124, 164, 184, 204, 244, 264];
const MAJOR_TICK_X = [64, 144, 224];
const LABEL_X = [0, 56, 140, 216];

function getNiceScaleMeters(maxMeters: number) {
  if (!Number.isFinite(maxMeters) || maxMeters <= 0) {
    return 1500;
  }

  const normalizedSteps = [1, 1.5, 2, 2.5, 3, 5, 7.5];
  const magnitude = 10 ** Math.floor(Math.log10(maxMeters));
  let best = magnitude;

  for (const step of normalizedSteps) {
    const candidate = step * magnitude;
    if (candidate <= maxMeters) {
      best = candidate;
    }
  }

  return Math.max(best, 1);
}

function formatScaleValue(valueMeters: number) {
  if (valueMeters >= 1000) {
    const km = valueMeters / 1000;
    return Number.isInteger(km) ? `${km}` : `${km.toFixed(1)}`;
  }

  return `${Math.round(valueMeters)}`;
}

function getUnitLabel(totalMeters: number) {
  return totalMeters >= 1000 ? 'Kilometer' : 'Meter';
}

function measureScaleMeters(map: LeafletLikeMap) {
  const size = map.getSize();
  const y = Math.max(size.y - 48, 0);
  const maxWidth = Math.min(BAR_WIDTH, size.x);
  const left = map.containerPointToLatLng([0, y]);
  const right = map.containerPointToLatLng([maxWidth, y]);
  return map.distance(left, right);
}

export function MapScaleBar({
  map,
  color = 'black',
}: {
  map: LeafletLikeMap | null;
  color?: 'black' | 'white';
}) {
  const [totalMeters, setTotalMeters] = useState(1500);

  useEffect(() => {
    if (!map) {
      return;
    }

    const updateScale = () => {
      const measuredMeters = measureScaleMeters(map);
      setTotalMeters(getNiceScaleMeters(measuredMeters));
    };

    updateScale();
    map.on('zoomend', updateScale);
    map.on('moveend', updateScale);
    map.on('resize', updateScale);

    return () => {
      map.off('zoomend', updateScale);
      map.off('moveend', updateScale);
      map.off('resize', updateScale);
    };
  }, [map]);

  const labels = useMemo(() => {
    const step = totalMeters / 3;
    return [0, step, step * 2, totalMeters].map(formatScaleValue);
  }, [totalMeters]);

  const unitLabel = getUnitLabel(totalMeters);

  return (
    <div
      className="pointer-events-none absolute bottom-6 left-6 z-[1000] h-[56px] w-[268px]"
      style={{ color }}
    >
      <div className="font-montserrat text-[10px] font-medium leading-[130%]">
        1 Inch = 1 KM
      </div>

      <svg width="269" height="56" viewBox="0 0 269 56" fill="none" className="absolute left-0 top-0 overflow-visible">
        <line x1="0.25" y1="28.75" x2="267.75" y2="28.75" stroke={color} strokeWidth="0.5" strokeLinecap="round" />
        {MINOR_TICK_X.map((x) => (
          <line key={`minor-${x}`} x1={x + 0.25} y1="19.25" x2={x + 0.25} y2="25.75" stroke={color} strokeWidth="0.5" strokeLinecap="round" />
        ))}
        {MAJOR_TICK_X.map((x) => (
          <line key={`major-${x}`} x1={x + 0.25} y1="15.25" x2={x + 0.25} y2="25.75" stroke={color} strokeWidth="0.5" strokeLinecap="round" />
        ))}
        <line x1="0.25" y1="25.25" x2="0.25" y2="31.75" stroke={color} strokeWidth="0.5" strokeLinecap="round" />
        <line x1="268.25" y1="25.25" x2="268.25" y2="31.75" stroke={color} strokeWidth="0.5" strokeLinecap="round" />
      </svg>

      <div className="absolute left-[2px] top-[29px] w-full font-montserrat text-[10px] font-medium leading-[130%]">
        {labels.map((label, index) => (
          <span key={`${label}-${index}`} className="absolute" style={{ left: LABEL_X[index] }}>
            {label}
          </span>
        ))}
      </div>

      <div className="absolute left-1/2 top-[43px] -translate-x-1/2 font-montserrat text-[10px] font-medium leading-[130%]">
        {unitLabel}
      </div>
    </div>
  );
}
