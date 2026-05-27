'use client';
import React from 'react';
import { MapContainer, TileLayer, useMap, Polygon, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Coordinates for the land parcels matching the Figma shape layout around the center [21.2517, 81.6304]
const RICE_POLY: [number, number][] = [
  [21.2519, 81.6301],
  [21.2527, 81.6307],
  [21.2519, 81.6315],
  [21.2510, 81.6307],
];

const ADJACENT_POLY_1: [number, number][] = [
  [21.2510, 81.6307],
  [21.2519, 81.6315],
  [21.2513, 81.6322],
  [21.2505, 81.6314],
];

const ADJACENT_POLY_2: [number, number][] = [
  [21.2519, 81.6301],
  [21.2510, 81.6307],
  [21.2504, 81.6301],
  [21.2512, 81.6294],
];

function MapResizer() {
  const map = useMap();
  React.useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

export function GisMapPanel() {
  // Ensure code runs only in the browser – Leaflet relies on `window`.
  return (
    <div className="relative w-full h-full bg-[#F5F5F5] overflow-hidden" style={{ borderRadius: '20px' }}>
      
      {/* Real Light Vector Map – rendered only on client side */}
      {typeof window !== 'undefined' && (
        <MapContainer
          center={[21.2517, 81.6304]}
          zoom={16}
          className="absolute inset-0 w-full h-full"
          style={{ borderRadius: '0 0 20px 20px' }}
          scrollWheelZoom={true}
          zoomControl={false}
          attributionControl={false}
        >
          <ZoomControl position="bottomright" />
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
          <Polygon
            positions={RICE_POLY}
            pathOptions={{
              color: '#FEF08A',
              weight: 3,
              fillColor: '#FEF08A',
              fillOpacity: 0.7,
            }}
          />
          <Polygon
            positions={ADJACENT_POLY_1}
            pathOptions={{
              color: '#FEF08A',
              weight: 1.5,
              fillColor: '#FEF08A',
              fillOpacity: 0.35,
            }}
          />
          <Polygon
            positions={ADJACENT_POLY_2}
            pathOptions={{
              color: '#FEF08A',
              weight: 1.5,
              fillColor: '#FEF08A',
              fillOpacity: 0.35,
            }}
          />
          <MapResizer />
        </MapContainer>
      )}

      {/* Map Marker Tooltip styled to match Figma speech-bubble design */}
      <div 
        className="absolute z-[1000] bg-white flex flex-col items-center justify-center rounded-lg shadow-lg px-3 py-1.5" 
        style={{ 
          top: '46%', 
          left: '50%', 
          transform: 'translate(-50%, -100%)', 
          border: '1px solid #DADADA' 
        }}
      >
        <div className="flex items-center gap-1">
          <span className="font-montserrat font-semibold text-black" style={{ fontSize: 10 }}>Rice</span>
          <span className="font-montserrat text-black opacity-60" style={{ fontSize: 8 }}>1.5 acres</span>
        </div>
        <div className="flex items-center gap-1 mt-1">
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--green-normal)]" />
          <span className="font-montserrat font-bold text-black" style={{ fontSize: 10 }}>38°</span>
        </div>
        {/* Custom speech bubble triangle pointer at bottom */}
        <div 
          className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-white rotate-45" 
          style={{ 
            borderRight: '1px solid #DADADA', 
            borderBottom: '1px solid #DADADA',
            zIndex: -1 
          }} 
        />
      </div>

      {/* Weather Forecasting Panel (absolute overlay floating at the bottom) */}
      <div 
        className="absolute z-[1000] bg-white flex flex-col overflow-hidden" 
        style={{ 
          left: '12px',
          width: '1216px',
          height: '326px', 
          bottom: '12px',
          borderRadius: '10px',
          border: '1px solid #DADADA',
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
          transform: 'scale(0.6)',
          transformOrigin: 'bottom left',
        }}
      >
        
        {/* Frame 1948761902: Header Tabs */}
        <div 
          className="absolute flex items-start"
          style={{
            width: 247,
            height: 24,
            left: 8,
            top: 6,
            background: '#F4F7FA',
            border: '0.5px solid #DADADA',
            borderRadius: 5,
            padding: 2,
            gap: 10,
          }}
        >
          {/* Active Weather Forecasting Tab */}
          <div 
            className="flex items-center justify-center"
            style={{
              width: 146,
              height: 20,
              background: '#396622',
              borderRadius: 4,
              padding: '4px 10px',
              gap: 10,
            }}
          >
            <span className="text-white font-poppins text-[12px] font-normal leading-[100%]">
              Whether Forecasting
            </span>
          </div>

          {/* Sibling Categories Tab */}
          <div 
            className="flex items-center justify-center"
            style={{
              width: 87,
              height: 20,
              borderRadius: 4,
              padding: '4px 10px',
              gap: 10,
            }}
          >
            <span className="font-poppins text-[12px] font-medium leading-[100%] text-[#356020]">
              Categories
            </span>
          </div>
        </div>

        {/* Frame 1948761872: Location Pin Row */}
        <div 
          className="absolute flex items-center"
          style={{
            width: 215,
            height: 24,
            left: 15,
            top: 40,
            gap: 4,
          }}
        >
          {/* Location Pin SVG */}
          <svg width="14" height="16" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 0C10.866 0 14 3.134 14 7C14 12.0159 8.8819 15.0342 7.3984 15.8037C7.1456 15.9349 6.8544 15.9349 6.6016 15.8037C5.1181 15.0342 0 12.0159 0 7C0 3.134 3.134 0 7 0ZM7 4C5.3431 4 4 5.3431 4 7C4 8.6569 5.3431 10 7 10C8.6569 10 10 8.6569 10 7C10 5.3431 8.6569 4 7 4Z" fill="#222222"/>
          </svg>
          <span className="font-poppins text-[12px] font-normal leading-[100%] text-black whitespace-nowrap">
            Kendri, Dhamtari Rd, Raipur, CG
          </span>
        </div>

        {/* Left Section (Friday Current Weather) */}
        {/* Cloud duotone SVG */}
        <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute" style={{ left: 27, top: 72 }}>
          {/* Sun (Ellipse 185) */}
          <circle cx="36.5" cy="19.5" r="8.5" fill="#F3DD7E" stroke="#F3DD7E" strokeWidth="3" strokeDasharray="2" />
          {/* Cloud (Union) */}
          <path d="M12 36C8.68629 36 6 33.3137 6 30C6 27.2479 7.85419 24.9288 10.3957 24.2252C11.134 19.0159 15.6181 15 21 15C25.1181 15 28.6569 17.5 30 21.084C31.3431 20.34 32.8819 20 34.5 20C38.6421 20 42 23.3579 42 27.5C42 27.8351 41.9779 28.1651 41.9351 28.489C43.7224 29.8329 44.5 31.848 44.5 33.5C44.5 34.8807 43.3807 36 42 36H12Z" fill="#DEDEDE" />
        </svg>

        {/* Frame 1948761653: Friday Current Details */}
        <div 
          className="absolute flex items-center"
          style={{
            width: 151,
            height: 52,
            left: 88,
            top: 72,
            gap: 9,
          }}
        >
          {/* 38° Temperature */}
          <span className="font-montserrat text-[40px] font-medium leading-[130%] text-black">
            38°
          </span>
          {/* Frame 1948761652: Day and Time */}
          <div className="flex flex-col justify-center items-start h-[49px]">
            <span className="font-montserrat text-[24px] font-medium leading-[130%] text-black">
              Friday
            </span>
            <span className="font-montserrat text-[14px] font-medium leading-[130%] text-black opacity-70">
              03:45 PM
            </span>
          </div>
        </div>

        {/* Frame 1948761663: Suggestions box */}
        <div 
          className="absolute flex flex-col items-start gap-[2px]"
          style={{
            width: 224,
            height: 58,
            left: 20,
            top: 191,
          }}
        >
          <span className="font-montserrat text-[12px] font-medium leading-[130%] text-black opacity-50">
            Suggestions
          </span>
          {/* Frame 1948761661 */}
          <div 
            className="flex items-center"
            style={{
              width: 224,
              height: 40,
              background: '#B6A65F',
              borderRadius: 7,
              padding: '4px 10px',
            }}
          >
            <span className="font-montserrat text-[12px] font-medium leading-[130%] text-white">
              Irrigate during early morning or evening hours.
            </span>
          </div>
        </div>

        {/* Right Section (5-Day Chart & Weekdays) */}
        
        {/* Frame 1948761882: Friday Highlight Pill */}
        <div 
          className="absolute"
          style={{
            width: 79,
            height: 83,
            left: 832,
            top: 65,
            background: '#EDF2EA',
            borderRadius: 10,
          }}
        />

        {/* Mon Column (centered at 309px) */}
        <div className="absolute flex flex-col items-center justify-between" style={{ width: 34, height: 47, top: 83, left: 292 }}>
          <span className="font-montserrat text-[10px] font-medium leading-[130%] text-black opacity-70">Mon</span>
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="opacity-70 text-black">
            <path d="M17.5 19A3.5 3.5 0 0 0 21 15.5c0-2.79-2.54-4.5-5-4.5-.42 0-.83.05-1.22.14C13.6 7.42 9.9 5 6 5c-4.42 0-8 3.58-8 8s3.58 8 8 8h11.5z" />
          </svg>
        </div>

        {/* Tue Column (centered at 450px) */}
        <div className="absolute flex flex-col items-center justify-between" style={{ width: 34, height: 47, top: 83, left: 433 }}>
          <span className="font-montserrat text-[10px] font-medium leading-[130%] text-black opacity-70">Tue</span>
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="opacity-70 text-black">
            <path d="M17.5 19A3.5 3.5 0 0 0 21 15.5c0-2.79-2.54-4.5-5-4.5-.42 0-.83.05-1.22.14C13.6 7.42 9.9 5 6 5c-4.42 0-8 3.58-8 8s3.58 8 8 8h11.5z" />
          </svg>
        </div>

        {/* Wed Column (centered at 589px) */}
        <div className="absolute flex flex-col items-center justify-between" style={{ width: 34, height: 47, top: 83, left: 572 }}>
          <span className="font-montserrat text-[10px] font-medium leading-[130%] text-black opacity-70">Wed</span>
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="opacity-70 text-black">
            <path d="M17.5 19A3.5 3.5 0 0 0 21 15.5c0-2.79-2.54-4.5-5-4.5-.42 0-.83.05-1.22.14C13.6 7.42 9.9 5 6 5c-4.42 0-8 3.58-8 8s3.58 8 8 8h11.5z" />
            <path d="M13 10l-4 6h3l-2 5" stroke="#222" />
          </svg>
        </div>

        {/* Thu Column (centered at 727px) */}
        <div className="absolute flex flex-col items-center justify-between" style={{ width: 34, height: 47, top: 83, left: 710 }}>
          <span className="font-montserrat text-[10px] font-medium leading-[130%] text-black opacity-70">Thu</span>
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="opacity-70 text-black">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
          </svg>
        </div>

        {/* Fri Column (centered at 870px, inside highlight pill) */}
        <div className="absolute flex flex-col items-center justify-between z-10" style={{ width: 34, height: 47, top: 83, left: 853 }}>
          <span className="font-montserrat text-[10px] font-bold leading-[130%] text-[#2B4D1A]">Fri</span>
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[#2B4D1A]">
            <path d="M17.5 19A3.5 3.5 0 0 0 21 15.5c0-2.79-2.54-4.5-5-4.5-.42 0-.83.05-1.22.14C13.6 7.42 9.9 5 6 5c-4.42 0-8 3.58-8 8s3.58 8 8 8h11.5z" />
            <path d="M8 20v2M12 20v2M16 20v2" />
          </svg>
        </div>

        {/* Sat Column (centered at 1002px) */}
        <div className="absolute flex flex-col items-center justify-between" style={{ width: 34, height: 47, top: 83, left: 985 }}>
          <span className="font-montserrat text-[10px] font-medium leading-[130%] text-black opacity-70">Sat</span>
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="opacity-70 text-black">
            <path d="M17.5 19A3.5 3.5 0 0 0 21 15.5c0-2.79-2.54-4.5-5-4.5-.42 0-.83.05-1.22.14C13.6 7.42 9.9 5 6 5c-4.42 0-8 3.58-8 8s3.58 8 8 8h11.5z" />
            <path d="M8 20v2M12 20v2M16 20v2" />
          </svg>
        </div>

        {/* Sun Column (centered at 1145px) */}
        <div className="absolute flex flex-col items-center justify-between" style={{ width: 34, height: 47, top: 83, left: 1128 }}>
          <span className="font-montserrat text-[10px] font-medium leading-[130%] text-black opacity-70">Sun</span>
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="opacity-70 text-black">
            <path d="M12 2v2M4.93 4.93l1.41 1.41M2 12h2M6.34 17.66l-1.41 1.41" />
            <path d="M17.5 19A3.5 3.5 0 0 0 21 15.5c0-2.79-2.54-4.5-5-4.5-.42 0-.83.05-1.22.14C13.6 7.42 9.9 5 6 5c-4.42 0-8 3.58-8 8s3.58 8 8 8h11.5z" />
          </svg>
        </div>

        {/* Frame 1948761881: Temperatures Row */}
        {/* Centers align perfectly with the columns and chart dots */}
        <div className="absolute flex items-center" style={{ width: 34, height: 18, top: 132, left: 292, justify: 'center' }}>
          <span className="font-montserrat text-[14px] font-medium leading-[130%] text-[#222222] w-full text-center">32°</span>
        </div>
        <div className="absolute flex items-center" style={{ width: 34, height: 18, top: 132, left: 433, justify: 'center' }}>
          <span className="font-montserrat text-[14px] font-medium leading-[130%] text-[#222222] w-full text-center">34°</span>
        </div>
        <div className="absolute flex items-center" style={{ width: 34, height: 18, top: 132, left: 572, justify: 'center' }}>
          <span className="font-montserrat text-[14px] font-medium leading-[130%] text-[#222222] w-full text-center">28°</span>
        </div>
        <div className="absolute flex items-center" style={{ width: 34, height: 18, top: 132, left: 710, justify: 'center' }}>
          <span className="font-montserrat text-[14px] font-medium leading-[130%] text-[#222222] w-full text-center">38°</span>
        </div>
        {/* Friday Active Temperature */}
        <div className="absolute flex items-center z-10" style={{ width: 34, height: 18, top: 132, left: 853, justify: 'center' }}>
          <span className="font-montserrat text-[14px] font-bold leading-[130%] text-[#2B4D1A] w-full text-center">28°</span>
        </div>
        <div className="absolute flex items-center" style={{ width: 34, height: 18, top: 132, left: 985, justify: 'center' }}>
          <span className="font-montserrat text-[14px] font-medium leading-[130%] text-[#222222] w-full text-center">26°</span>
        </div>
        <div className="absolute flex items-center" style={{ width: 34, height: 18, top: 132, left: 1128, justify: 'center' }}>
          <span className="font-montserrat text-[14px] font-medium leading-[130%] text-[#222222] w-full text-center">30°</span>
        </div>

        {/* Area Line Chart & Dots */}
        <svg width="100%" height="100%" viewBox="0 0 1216 272" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 pointer-events-none">
          <defs>
            <linearGradient id="chartFillGradient" x1="589" y1="168" x2="589" y2="266" gradientUnits="userSpaceOnUse">
              <stop offset="14.43%" stopColor="#47802B" stopOpacity="0.7"/>
              <stop offset="108.05%" stopColor="#47802B" stopOpacity="0"/>
            </linearGradient>
          </defs>
          
          {/* Area Fill under line */}
          <path d="M 309 231 C 379.5 225.5, 379.5 225.5, 450 220 C 519.5 214.5, 519.5 202, 589 196 C 658 190, 658 174, 727 168 C 798.5 162, 798.5 182, 870 187 C 936 192, 936 202, 1002 207 C 1073.5 212, 1073.5 210, 1145 211 L 1145 266 L 309 266 Z" fill="url(#chartFillGradient)" />
          
          {/* Stroke Line */}
          <path d="M 309 231 C 379.5 225.5, 379.5 225.5, 450 220 C 519.5 214.5, 519.5 202, 589 196 C 658 190, 658 174, 727 168 C 798.5 162, 798.5 182, 870 187 C 936 192, 936 202, 1002 207 C 1073.5 212, 1073.5 210, 1145 211" fill="none" stroke="#47802B" strokeWidth="1.5" />
          
          {/* Dots (Ellipse 203 to 209) */}
          <circle cx="309" cy="231" r="4.5" fill="#47802B" stroke="white" strokeWidth="1" />
          <circle cx="450" cy="220" r="4.5" fill="#47802B" stroke="white" strokeWidth="1" />
          <circle cx="589" cy="196" r="4.5" fill="#47802B" stroke="white" strokeWidth="1" />
          <circle cx="727" cy="168" r="4.5" fill="#47802B" stroke="white" strokeWidth="1" />
          <circle cx="870" cy="187" r="4.5" fill="#47802B" stroke="white" strokeWidth="1" />
          <circle cx="1002" cy="207" r="4.5" fill="#47802B" stroke="white" strokeWidth="1" />
          <circle cx="1145" cy="211" r="4.5" fill="#47802B" stroke="white" strokeWidth="1" />
        </svg>

      </div>
    </div>
  );
}
