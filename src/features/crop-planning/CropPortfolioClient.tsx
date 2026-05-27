'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { CropDetailCard } from './CropDetailCard';

const GisMapPanel = dynamic(
  () => import('./GisMapPanel').then((mod) => mod.GisMapPanel),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 flex items-center justify-center bg-greenLight/40">
        <div className="rounded-2xl bg-white/90 px-5 py-3 text-sm font-medium text-ink shadow-sm">
          Loading Map...
        </div>
      </div>
    ),
  }
);

const MONTHS = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Nov', 'Oct', 'Dec'];

/**
 * Crop-series colors: unique per-crop data visualization colors.
 * These are NOT part of the green/yellow brand scale — they are distinct
 * chart series colors to differentiate crops. Kept here as a single
 * source of truth rather than scattered across multiple hardcoded arrays.
 */
const CROP_SERIES_COLORS: Record<string, string> = {
  Wheat:  '#5992C0',
  Rice:   '#59C09C',
  Barley: '#59C060',
  Tomato: '#99C059',
  Corn:   '#C0A859',
  Potato: '#C07159',
};

/**
 * Gantt bar fill colors map to the design system green scale from globals.css.
 * greenNormal=#47802B, greenNormalHover=#407327, greenNormalActive=#396622
 * greenDark=#356020,   greenDarkHover=#2B4D1A,   greenDarkActive=#203A13
 */
const BAR_FILL_CSS_VAR: Record<string, string> = {
  Wheat:  'var(--green-normal)',        // #47802B
  Rice:   'var(--green-normal-hover)',  // #407327
  Barley: 'var(--green-normal-active)', // #396622
  Tomato: 'var(--green-dark)',          // #356020
  Corn:   'var(--green-dark-hover)',    // #2B4D1A
  Potato: 'var(--green-dark-active)',   // #203A13
};

// Each row height matches Figma row gaps: rows at 106, 172, 246, 324, 394, 474
// Row gaps: 66, 74, 78, 70, 80 → we use a uniform row height of 75px
const ROW_HEIGHT = 75;

// Gantt total area width (matches Figma: 401px for 8 months)
const GANTT_W = 401;
// Each month column width
// Bar definitions from Figma absolute coords.
// offsetPx: left px offset inside the 401px gantt zone
// widthPx: total (background) bar width
// filledPx: progress (filled) bar width
// edgeRounded: bars that start at left edge get right-only rounding (Corn, Potato)
const portfolioData = [
  {
    name: 'Wheat',  area: '1.5 Acres', location: 'Kendri, Dhamtari\nRd, Raipur, CG', date: 'June - 2026',
    amount: 145000, offsetPx: 128, widthPx: 173, filledPx: 12, progressLabel: '4%',  edgeRounded: false,
  },
  {
    name: 'Rice',   area: '1.5 Acres', location: 'Kendri, Dhamtari\nRd, Raipur, CG', date: 'June - 2026',
    amount: 254610, offsetPx: 128, widthPx: 143, filledPx: 12, progressLabel: '3%',  edgeRounded: false,
  },
  {
    name: 'Barley', area: '1.5 Acres', location: 'Kendri, Dhamtari\nRd, Raipur, CG', date: 'Apr - 2026',
    amount: 148634, offsetPx: 18,  widthPx: 163, filledPx: 44, progressLabel: '18%', edgeRounded: false,
  },
  {
    name: 'Tomato', area: '1.5 Acres', location: 'Kendri, Dhamtari\nRd, Raipur, CG', date: 'May - 2026',
    amount: 257895, offsetPx: 68,  widthPx: 123, filledPx: 54, progressLabel: '38%', edgeRounded: false,
  },
  {
    name: 'Corn',   area: '1.5 Acres', location: 'Kendri, Dhamtari\nRd, Raipur, CG', date: 'Mar - 2026',
    amount: 345691, offsetPx: 4,   widthPx: 223, filledPx: 44, progressLabel: '29%', edgeRounded: true,
  },
  {
    name: 'Potato', area: '1.5 Acres', location: 'Kendri, Dhamtari\nRd, Raipur, CG', date: 'Apr - 2026',
    amount: 102000, offsetPx: 4,   widthPx: 43,  filledPx: 12, progressLabel: '74%', edgeRounded: true,
  },
];

// Right panel chart bar heights in px from Figma.
// Colors resolved from CROP_SERIES_COLORS above — no hardcoding here.
const chartBars = [
  { name: 'Wheat',  height: 77  },
  { name: 'Rice',   height: 149 },
  { name: 'Tomato', height: 142 },
  { name: 'Barley', height: 84  },
  { name: 'Corn',   height: 208 },
  { name: 'Potato', height: 52  },
];

const Y_LABELS = ['4,00,000', '3,50,000', '3,00,000', '2,50,000', '2,00,000', '1,50,000', '1,00,000', '50,000'];

// Left column widths (fixed, from Figma)
const COL_CROPS    = 127; // Planted Crops column (left:22 + ~105)
const COL_LOCATION = 140; // Location column
const COL_DATE     = 112; // Planting dates column

export function CropPortfolioClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialView = searchParams.get('view') === 'gis' ? 'gis' : 'tabular';
  const [viewMode, setViewMode] = useState<'tabular' | 'gis'>(initialView);

  return (
    <div className="h-full w-full overflow-auto bg-canvas" style={{ padding: 20 }}>
      {viewMode === 'gis' ? (
        <div
          className="relative w-full bg-[#F5F5F5] overflow-hidden flex flex-col"
          style={{ border: '1px solid #DADADA', borderRadius: 20, minWidth: 1100, height: 'calc(100vh - 100px)' }}
        >
          {/* Map as global background */}
          <GisMapPanel />

          {/* Header Bar */}
          <div
            className="absolute left-0 right-0 top-0 z-[1000] flex items-center justify-between bg-white"
            style={{ height: 60, paddingLeft: 37, paddingRight: 38, borderBottom: '1px solid rgba(0,0,0,0.06)' }}
          >
            <span className="font-montserrat font-semibold text-black" style={{ fontSize: 14, lineHeight: '130%' }}>
              Crop Portfolio
            </span>

            <div className="flex items-center" style={{ gap: 13 }}>
              <div
                className="flex items-center justify-center"
                style={{ width: 153, height: 26, background: '#EDF2EA', borderRadius: 8, padding: 2, gap: 2 }}
              >
                <button
                  type="button"
                  className="flex cursor-pointer items-center justify-center transition-colors"
                  onClick={() => setViewMode('gis')}
                  style={{ width: 61, height: 22, background: '#203A13', borderRadius: 6, padding: '3px 20px' }}
                >
                  <span className="font-montserrat text-[12px] font-medium leading-[130%] text-white">GIS</span>
                </button>
                <button
                  type="button"
                  className="flex cursor-pointer items-center justify-center transition-colors"
                  onClick={() => setViewMode('tabular')}
                  style={{ width: 86, height: 22, borderRadius: 6, padding: '3px 20px' }}
                >
                  <span className="font-montserrat text-[12px] font-medium leading-[130%] text-[#203A13]">Tabular</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => router.push('/crop-planning?step=selection')}
                className="flex cursor-pointer items-center justify-center transition-colors"
                style={{
                  width: 116,
                  height: 26,
                  border: '0.7px solid #356020',
                  borderRadius: 6,
                  background: 'transparent',
                  padding: '5px 12px',
                  gap: 8,
                }}
              >
                <span className="whitespace-nowrap font-montserrat text-[12px] font-medium leading-[130%] text-[#2B4D1A]">Add Crop</span>
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
                  <path d="M4 0V8M8 4H0" stroke="#2B4D1A" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>

          {/* Floating Crop Detail Card on the Right */}
          <div
            className="absolute right-6 top-[78px] z-[1000] overflow-hidden rounded-[10px] bg-white shadow-xl outline-none"
            style={{ 
              width: 308, 
              height: 510, 
              border: '0.5px solid #DADADA', 
              borderRadius: 10,
              transform: 'scale(1.2)',
              transformOrigin: 'top right'
            }}
          >
            <CropDetailCard />
          </div>
        </div>
      ) : (
        <div className="flex gap-5" style={{ minWidth: 1100 }}>

          {/* ══════════════════════════════════════════
              LEFT PANEL — Crop Portfolio (Tabular)
          ══════════════════════════════════════════ */}
          <div
            className="relative flex-[2] bg-white overflow-hidden flex flex-col"
            style={{ border: '1px solid #DADADA', borderRadius: 20, minWidth: 640, height: 'calc(100vh - 100px)' }}
          >
            {/* ── Title + controls row ── */}
            <div
              className="relative flex items-center shrink-0"
              style={{ height: 49, paddingLeft: 27, paddingRight: 10, borderBottom: '1px solid #F4F7FA' }}
            >
              <span className="font-montserrat font-semibold text-black" style={{ fontSize: 14, lineHeight: '130%' }}>
                Crop Portfolio
              </span>

              {/* Controls — right side */}
              <div
                className="ml-auto flex items-center"
                style={{
                  width: 282,
                  height: 26,
                  gap: 13,
                }}
              >
                {/* Frame 1948761712: Toggle Wrapper */}
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: 153,
                    height: 26,
                    background: '#EDF2EA',
                    borderRadius: 8,
                    padding: 2,
                    gap: 2,
                  }}
                >
                  {/* GIS Tab */}
                  <div
                    className="flex items-center justify-center cursor-pointer transition-colors"
                    onClick={() => setViewMode('gis')}
                    style={{
                      width: 61,
                      height: 22,
                      background: viewMode === 'gis' ? '#203A13' : 'transparent',
                      borderRadius: 6,
                      padding: '3px 20px',
                    }}
                  >
                    <span className="font-montserrat font-medium" style={{ fontSize: 12, color: viewMode === 'gis' ? '#FFFFFF' : '#203A13', lineHeight: '130%' }}>
                      GIS
                    </span>
                  </div>
                  {/* Tabular Tab */}
                  <div
                    className="flex items-center justify-center cursor-pointer transition-colors"
                    onClick={() => setViewMode('tabular')}
                    style={{
                      width: 86,
                      height: 22,
                      background: viewMode === 'tabular' ? '#203A13' : 'transparent',
                      borderRadius: 6,
                      padding: '3px 20px',
                    }}
                  >
                    <span className="font-montserrat font-medium" style={{ fontSize: 12, color: viewMode === 'tabular' ? '#FFFFFF' : '#203A13', lineHeight: '130%' }}>
                      Tabular
                    </span>
                  </div>
                </div>

                {/* Frame 1948761788: Add Crop Button */}
                <button
                  type="button"
                  onClick={() => router.push('/crop-planning?step=selection')}
                  className="flex items-center justify-center cursor-pointer transition-colors"
                  style={{
                    width: 116,
                    height: 26,
                    border: '0.7px solid #356020',
                    borderRadius: 6,
                    background: 'transparent',
                    padding: '5px 12px',
                    gap: 8,
                  }}
                >
                  <span className="whitespace-nowrap font-montserrat font-medium" style={{ fontSize: 12, color: '#2B4D1A', lineHeight: '130%' }}>
                    Add Crop
                  </span>
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
                    <path d="M4 0V8M8 4H0" stroke="#2B4D1A" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </div>

            {/* ── Header row (Planted Crops / Location / Planting dates / Months) ── */}
            <div
              className="relative flex items-center shrink-0"
              style={{ height: 40, background: '#F4F7FA', borderBottom: '1px solid rgba(0,0,0,0.06)' }}
            >
              <div className="flex items-center" style={{ width: COL_CROPS, paddingLeft: 22 }}>
                <span className="font-montserrat font-medium text-black" style={{ fontSize: 10, lineHeight: '130%' }}>Planted Crops</span>
              </div>
              <div className="flex items-center" style={{ width: COL_LOCATION }}>
                <span className="font-montserrat font-medium text-black" style={{ fontSize: 10, lineHeight: '130%' }}>Location</span>
              </div>
              <div className="flex items-center" style={{ width: COL_DATE }}>
                <span className="font-montserrat font-medium text-black" style={{ fontSize: 10, lineHeight: '130%' }}>Planting dates</span>
              </div>

              {/* Month labels — fills remaining width */}
              <div className="flex-1 flex items-center justify-between" style={{ paddingRight: 8 }}>
                {MONTHS.map((m) => (
                  <span key={m} className="font-montserrat font-medium text-black" style={{ fontSize: 10, lineHeight: '130%', minWidth: 20, textAlign: 'center' }}>
                    {m}
                  </span>
                ))}
              </div>
            </div>

            {/* ── Body: crop rows + gantt ── */}
            <div className="flex-1 overflow-hidden relative">
              {/* Light green gantt zone background (covers the gantt columns area) */}
              <div
                className="absolute top-0 bottom-0"
                style={{
                  left: COL_CROPS + COL_LOCATION + COL_DATE,
                  right: 0,
                  background: 'var(--green-light)',
                  opacity: 0.5,
                }}
              />

              {/* Crop rows */}
              {portfolioData.map((crop) => {
                const bgRadius = crop.edgeRounded ? '0 30px 30px 0' : '30px';
                const filledRadius = crop.edgeRounded ? '0 30px 30px 0' : '30px';
                const openTaskCalendar = () => router.push('/monitoring-detection');

                return (
                  <div
                    key={crop.name}
                    className="relative flex items-start"
                    style={{
                      height: ROW_HEIGHT,
                      borderBottom: '1px solid rgba(0,0,0,0.08)',
                    }}
                  >
                    {/* Planted Crops cell */}
                    <div
                      className="flex flex-col justify-center shrink-0 cursor-pointer hover:bg-[#F8FAF7]"
                      style={{ width: COL_CROPS, paddingLeft: 22, height: '100%', gap: 3 }}
                      onClick={openTaskCalendar}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          openTaskCalendar();
                        }
                      }}
                    >
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, lineHeight: '15px', color: '#000' }}>
                        {crop.name}
                      </span>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, lineHeight: '15px', color: 'rgba(0,0,0,0.6)' }}>
                        {crop.area}
                      </span>
                    </div>

                    {/* Location cell */}
                    <div
                      className="flex items-center shrink-0 cursor-pointer hover:bg-[#F8FAF7]"
                      style={{ width: COL_LOCATION, height: '100%' }}
                      onClick={openTaskCalendar}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          openTaskCalendar();
                        }
                      }}
                    >
                      <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: 12, lineHeight: '100%', color: '#000', whiteSpace: 'pre-wrap' }}>
                        {crop.location}
                      </span>
                    </div>

                    {/* Planting date cell */}
                    <div
                      className="flex items-center shrink-0 cursor-pointer hover:bg-[#F8FAF7]"
                      style={{ width: COL_DATE, height: '100%' }}
                      onClick={openTaskCalendar}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          openTaskCalendar();
                        }
                      }}
                    >
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, lineHeight: '15px', color: '#000' }}>
                        {crop.date}
                      </span>
                    </div>

                    {/* Gantt cell — fills remaining width, uses relative positioning for bars */}
                    <div className="flex-1 relative" style={{ height: '100%' }}>
                      {/* Column grid lines inside gantt */}
                      <div className="absolute inset-0 flex">
                        {MONTHS.map((m) => (
                          <div
                            key={`vgrid-${crop.name}-${m}`}
                            className="flex-1 border-r"
                            style={{ borderColor: 'rgba(0,0,0,0.07)' }}
                          />
                        ))}
                      </div>

                      {/* Bar container — positioned at 32% from top to vertically center */}
                      <div className="absolute inset-0 flex items-center">
                        <div className="relative w-full" style={{ height: 16 }}>
                          {/* The gantt zone is flex-1 but internally we need to map offsetPx
                              relative to the 401px Figma reference width.
                              We use percentage: (offsetPx / 401) * 100% */}

                          {/* Background (faded) bar */}
                          <div
                            className="absolute"
                            style={{
                              left: `${(crop.offsetPx / GANTT_W) * 100}%`,
                              width: `${(crop.widthPx / GANTT_W) * 100}%`,
                              height: 16,
                              background: BAR_FILL_CSS_VAR[crop.name],
                              opacity: 0.2,
                              borderRadius: bgRadius,
                            }}
                          />

                          {/* Filled (progress) bar */}
                          <div
                            className="absolute"
                            style={{
                              left: `${(crop.offsetPx / GANTT_W) * 100}%`,
                              width: `${(crop.filledPx / GANTT_W) * 100}%`,
                              height: 16,
                              background: BAR_FILL_CSS_VAR[crop.name],
                              borderRadius: filledRadius,
                            }}
                          />

                          {/* Progress % label (below the bar) */}
                          <span
                            className="absolute font-montserrat"
                            style={{
                              fontSize: 8,
                              lineHeight: '10px',
                              left: `calc(${(crop.offsetPx / GANTT_W) * 100}% + 4px)`,
                              top: 18,
                              color: '#000',
                              opacity: 0.5,
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {crop.progressLabel}
                          </span>

                          {/* 100% label (at right end of bg bar) */}
                          <span
                            className="absolute font-montserrat"
                            style={{
                              fontSize: 8,
                              lineHeight: '10px',
                              left: `calc(${((crop.offsetPx + crop.widthPx) / GANTT_W) * 100}% - 22px)`,
                              top: 3,
                              color: '#000',
                              opacity: 0.5,
                              whiteSpace: 'nowrap',
                            }}
                          >
                            100%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Two extra empty rows to match Figma */}
              {[0, 1].map((i) => (
                <div
                  key={`empty-${i}`}
                  className="flex"
                  style={{ height: ROW_HEIGHT, borderBottom: '1px solid rgba(0,0,0,0.08)' }}
                >
                  <div style={{ width: COL_CROPS }} />
                  <div style={{ width: COL_LOCATION }} />
                  <div style={{ width: COL_DATE }} />
                  <div className="flex-1 flex">
                    {MONTHS.map((m) => (
                      <div key={`eg-${i}-${m}`} className="flex-1 border-r" style={{ borderColor: 'rgba(0,0,0,0.07)' }} />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* ── Bottom progress bar ── */}
            <div className="shrink-0 relative" style={{ height: 8 }}>
              {/* Gray full track */}
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2" style={{ height: 4, background: '#D5DAD3', left: COL_CROPS + COL_LOCATION + COL_DATE }} />
              {/* Green progress (~52% filled, matching Figma Line 365 208/398) */}
              <div
                className="absolute top-1/2 -translate-y-1/2"
                style={{ height: 4, background: 'var(--green-normal-active)', width: '52%', left: COL_CROPS + COL_LOCATION + COL_DATE }}
              />
            </div>
          </div>

          {/* ══════════════════════════════════════════
              RIGHT PANEL — Expanses by Crop (Tabular)
          ══════════════════════════════════════════ */}
          <div
            className="flex flex-col bg-white"
            style={{ width: 390, flexShrink: 0, border: '1px solid #DADADA', borderRadius: 20, height: 'calc(100vh - 100px)' }}
          >
            {/* Title */}
            <div className="shrink-0" style={{ padding: '18px 27px 0' }}>
              <span className="font-montserrat font-semibold text-black" style={{ fontSize: 14, lineHeight: '130%' }}>
                Expanses by Crop
              </span>
            </div>

            {/* Table header */}
            <div
              className="flex items-center justify-between shrink-0"
              style={{ padding: '10px 24px 8px', marginTop: 12, borderBottom: '1px solid rgba(0,0,0,0.1)' }}
            >
              <span className="font-montserrat font-medium text-black" style={{ fontSize: 10, lineHeight: '130%' }}>
                Planted Crops
              </span>
              <div className="flex items-center gap-2">
                <span className="font-montserrat font-medium text-black" style={{ fontSize: 10 }}>Amount</span>
                <span className="font-montserrat font-medium italic text-black" style={{ fontSize: 10, opacity: 0.5 }}>inr</span>
              </div>
            </div>

            {/* Crop rows list */}
            <div className="flex flex-col shrink-0" style={{ padding: '0 24px', gap: 0 }}>
              {portfolioData.map((c) => (
                <div
                  key={c.name}
                  className="flex items-center justify-between"
                  style={{ height: 33, borderBottom: '1px solid rgba(0,0,0,0.04)' }}
                >
                  <div className="flex items-center gap-2">
                    {/* Color dot — from CROP_SERIES_COLORS */}
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: CROP_SERIES_COLORS[c.name], flexShrink: 0 }} />
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, lineHeight: '15px', color: '#000' }}>{c.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: 'rgba(0,0,0,0.4)' }}>₹</span>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, lineHeight: '15px', color: '#000' }}>
                      {c.amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Bar Chart Card ── */}
            <div
              className="flex-1 mx-4 mb-4 mt-4 relative flex flex-col overflow-hidden"
              style={{ border: '1px solid #DADADA', borderRadius: 15, minHeight: 0 }}
            >
              {/* Y-axis label (rotated) */}
              <span
                className="absolute font-montserrat font-medium"
                style={{
                  fontSize: 8,
                  color: '#000',
                  left: -22,
                  top: '50%',
                  transform: 'rotate(-90deg) translateX(50%)',
                  transformOrigin: 'center center',
                  whiteSpace: 'nowrap',
                  opacity: 0.7,
                }}
              >
                Amount inr
              </span>

              {/* Chart body */}
              <div className="flex flex-1 min-h-0" style={{ padding: '14px 14px 20px 52px' }}>
                {/* Y-axis labels */}
                <div className="flex flex-col justify-between items-end shrink-0" style={{ width: 32, marginRight: 6 }}>
                  {Y_LABELS.map((label) => (
                    <span key={label} className="font-montserrat" style={{ fontSize: 6, lineHeight: '7px', color: '#000' }}>
                      {label}
                    </span>
                  ))}
                </div>

                {/* Chart area */}
                <div className="relative flex-1 flex flex-col min-h-0">
                  {/* Horizontal grid lines */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                    {Y_LABELS.map((l) => (
                      <div key={`hg-${l}`} className="w-full border-t" style={{ borderColor: 'rgba(0,0,0,0.06)' }} />
                    ))}
                  </div>

                  {/* Left axis line */}
                  <div
                    className="absolute left-0 top-0 bottom-6"
                    style={{ width: 1, background: 'rgba(0,0,0,0.15)' }}
                  />
                  {/* Bottom axis line */}
                  <div
                    className="absolute left-0 right-0 bottom-6"
                    style={{ height: 1, background: 'rgba(0,0,0,0.15)' }}
                  />

                  {/* Bars */}
                  <div
                    className="absolute left-2 right-2 flex items-end justify-between"
                    style={{ bottom: 7, top: 0 }}
                  >
                    {chartBars.map((bar) => {
                      const maxH = 208; // Corn is the tallest at 208px in Figma
                      return (
                        <div
                          key={bar.name}
                          className="flex flex-col items-center h-full justify-end"
                          style={{ gap: 3 }}
                        >
                          <div
                            style={{
                              width: 18,
                              // Scale height proportionally: bar.height/208 of the available area
                              height: `${(bar.height / maxH) * 100}%`,
                              background: CROP_SERIES_COLORS[bar.name],
                              borderRadius: '3px 3px 0 0',
                            }}
                          />
                          <span
                            className="font-montserrat text-center"
                            style={{ fontSize: 6, lineHeight: '7px', color: '#000', whiteSpace: 'nowrap' }}
                          >
                            {bar.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
