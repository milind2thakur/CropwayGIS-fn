'use client';

import { 
  MapPin, 
  X, 
  Square, 
  Navigation, 
  Plus, 
  Minus 
} from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// --- Sub-components ---

function MapToolbar() {
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white rounded-2xl p-2 shadow-lg border border-line">
      <button className="p-2 rounded-xl hover:bg-[#eff4eb] text-[#243620] transition-colors">
        <Square className="h-5 w-5" />
      </button>
      <button className="p-2 rounded-xl bg-[#2B4D1A] text-white transition-colors">
        <MapPin className="h-5 w-5" />
      </button>
      <button className="p-2 rounded-xl hover:bg-[#eff4eb] text-[#243620] transition-colors">
        <Navigation className="h-5 w-5" />
      </button>
    </div>
  );
}

function SelectionSidebar() {
  const coords = [
    { lat: '21.2514', lng: '81.6296' },
    { lat: '21.2520', lng: '81.6302' },
    { lat: '21.2512', lng: '81.6310' },
  ];

  return (
    <div className="w-[300px] bg-white border-l border-line p-6 flex flex-col gap-6">
      <div>
        <label className="text-[10px] uppercase tracking-wider text-muted mb-2 block">Selection Area</label>
        <div className="flex items-center justify-between bg-[#eff4eb] rounded-lg px-4 py-2">
          <span className="text-sm font-semibold text-[#243620]">1272</span>
          <span className="text-[10px] text-muted">Sqm</span>
        </div>
      </div>

      <div>
        <label className="text-[10px] uppercase tracking-wider text-muted mb-3 block">Coordinates</label>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          <span className="text-[10px] text-muted">Latitude</span>
          <span className="text-[10px] text-muted">Longitude</span>
          {coords.map((c, i) => (
            <div key={i} className="contents font-mono text-[11px] text-[#243620]">
              <span>{c.lat}</span>
              <span>{c.lng}</span>
            </div>
          ))}
        </div>
      </div>

      <Button className="mt-auto bg-[#2B4D1A] hover:bg-[#203a13] text-white rounded-xl py-6">
        Save Selection
      </Button>
    </div>
  );
}

function SaveSelectionModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-[32px] w-[600px] overflow-hidden shadow-2xl">
        <div className="flex">
          {/* Map Preview */}
          <div className="w-1/2 bg-[#e0e0e0] relative min-h-[300px]">
             {/* Mock map background */}
             <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/light-v10/static/81.630,21.252,14,0/300x300?access_token=pk.mock')] bg-cover" />
             {/* Polygon overlay */}
             <svg className="absolute inset-0 w-full h-full">
                <path d="M120,100 L180,150 L140,220 Z" fill="#2B4D1A" fillOpacity="0.5" stroke="#2B4D1A" strokeWidth="2" />
             </svg>
          </div>

          {/* Form Content */}
          <div className="w-1/2 p-8 flex flex-col gap-6">
            <h2 className="text-xl font-semibold text-[#243620]">Save Selection</h2>
            
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted mb-1.5 block">Land Owner</label>
                <input 
                  type="text" 
                  defaultValue="Rakesh"
                  className="w-full bg-[#f3f6f0] border-none rounded-lg px-4 py-2 text-sm text-[#243620] focus:ring-1 focus:ring-[#2B4D1A]" 
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-[10px] uppercase tracking-wider text-muted mb-1.5 block">Land Id</label>
                  <input 
                    type="text" 
                    defaultValue="001"
                    className="w-full bg-[#f3f6f0] border-none rounded-lg px-4 py-2 text-sm text-[#243620]" 
                  />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] uppercase tracking-wider text-muted mb-1.5 block">Selection Area</label>
                  <div className="bg-[#eff4eb] rounded-lg px-3 py-2 text-xs font-semibold text-[#243620] flex items-center justify-between">
                    <span>1272</span>
                    <span className="text-[8px] opacity-60">*Sqkm</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted mb-1.5 block">Location</label>
                <div className="text-[11px] text-[#243620] leading-tight">
                  Kendri, Dhamtari Rd, Raipur, CG
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <Button 
                variant="ghost" 
                onClick={onClose}
                className="flex-1 bg-[#eff4eb] hover:bg-[#dbe6d4] text-[#243620] rounded-xl"
              >
                Cancel
              </Button>
              <Button 
                onClick={onClose}
                className="flex-1 bg-[#2B4D1A] hover:bg-[#203a13] text-white rounded-xl"
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Main Page Component ---

export function LandIntelligenceClient() {
  const [showSaveModal, setShowSaveModal] = useState(false);

  return (
    <div className="relative flex h-[calc(100vh-49px)] w-full overflow-hidden bg-[#f0f0f0]">
      {/* Map Area */}
      <div className="relative flex-1 cursor-crosshair">
        {/* Mock Map Texture */}
        <div className="absolute inset-0 bg-[#e8e8e8] opacity-50" 
             style={{ backgroundImage: 'radial-gradient(#d1d1d1 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        
        {/* Mock Roads/Paths */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
          <path d="M0,100 L1500,800 M200,0 L800,1000 M500,0 L500,1000" stroke="white" strokeWidth="40" fill="none" />
          <path d="M0,100 L1500,800 M200,0 L800,1000 M500,0 L500,1000" stroke="#d1d1d1" strokeWidth="2" fill="none" />
        </svg>

        {/* Selected Area Polygon */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <path 
            d="M 600 300 L 750 400 L 650 550 Z" 
            fill="#2B4D1A" 
            fillOpacity="0.4" 
            stroke="#2B4D1A" 
            strokeWidth="2" 
          />
          {/* Active selection cursor point */}
          <line x1="640" y1="540" x2="660" y2="560" stroke="#2B4D1A" strokeWidth="2" />
          <line x1="660" y1="540" x2="640" y2="560" stroke="#2B4D1A" strokeWidth="2" />
        </svg>

        {/* Search Bar */}
        <div className="absolute top-6 left-6 w-[400px]">
          <div className="relative">
            <Input 
              className="bg-white rounded-xl border-none shadow-md pl-10 pr-10 py-6 text-sm"
              placeholder="Kendri, Dhamtari Rd, Raipur, CG"
              readOnly
            />
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#2B4D1A]" />
            <button className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="h-4 w-4 text-muted" />
            </button>
          </div>
        </div>

        {/* Scale Info */}
        <div className="absolute bottom-6 left-6 flex flex-col gap-1">
          <span className="text-[10px] text-muted">1 Inch = 1 KM</span>
          <div className="flex items-center gap-0 w-[200px]">
            {[0, 0.5, 1, 1.5].map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div className="h-2 w-px bg-muted" />
                <span className="text-[10px] text-muted mt-1">{v}</span>
              </div>
            ))}
          </div>
          <div className="h-px w-full bg-muted mt-1" />
          <span className="text-[10px] text-muted text-center">Kilometer</span>
        </div>

        {/* Map Controls */}
        <div className="absolute bottom-6 right-36 flex flex-col gap-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden border border-line">
            <button className="p-2 hover:bg-[#eff4eb] border-b border-line block"><Plus className="h-4 w-4" /></button>
            <button className="p-2 hover:bg-[#eff4eb] block"><Minus className="h-4 w-4" /></button>
          </div>
          <div className="bg-white rounded-lg shadow-md overflow-hidden border border-line p-1">
             <div className="w-10 h-10 bg-[url('https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/81.63,21.25,14,0/40x40?access_token=pk.mock')] bg-cover rounded-sm" />
          </div>
        </div>

        {/* Bottom Tooltips */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2">
          <span className="bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full text-[11px] font-medium shadow-sm border border-line">
            Press Esc to complete Geo-tagging
          </span>
        </div>

        <MapToolbar />
      </div>

      {/* Right Sidebar */}
      <SelectionSidebar />

      {/* Modal - Controlled via button in SelectionSidebar (mocked for now) */}
      <Button 
        onClick={() => setShowSaveModal(true)}
        className="fixed bottom-10 right-80 z-50 bg-moss text-white opacity-0 hover:opacity-100"
      >
        Open Save Dialog
      </Button>

      <SaveSelectionModal isOpen={showSaveModal} onClose={() => setShowSaveModal(false)} />
    </div>
  );
}

function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}
