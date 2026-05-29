'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Search, MapPin, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GeoResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string; // state/region
}

interface LocationSearchProps {
  onLocationSelect: (lat: number, lon: number, name: string) => void;
  currentLocation: string;
  className?: string;
}

export function LocationSearch({ onLocationSelect, currentLocation, className }: LocationSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeoResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const searchLocations = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/geocode?name=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.results || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputChange = (value: string) => {
    setQuery(value);
    setOpen(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchLocations(value), 300);
  };

  const handleSelect = (result: GeoResult) => {
    const displayName = result.admin1
      ? `${result.name}, ${result.admin1}`
      : `${result.name}, ${result.country}`;
    onLocationSelect(result.latitude, result.longitude, displayName);
    setQuery('');
    setOpen(false);
    setResults([]);
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Search Input */}
      <div className="flex items-center h-[36px] rounded-[10px] bg-[#1a1c1a]/80 backdrop-blur-md border border-white/10 overflow-hidden transition-all focus-within:border-white/30">
        <Search className="h-[14px] w-[14px] text-white/50 ml-[10px] shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => { if (results.length > 0) setOpen(true); }}
          placeholder={currentLocation || 'Search location...'}
          className="flex-1 bg-transparent px-[8px] py-[6px] text-[13px] font-montserrat text-white placeholder:text-white/40 outline-none"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setResults([]); setOpen(false); }}
            className="mr-[8px] text-white/40 hover:text-white transition-colors"
          >
            <X className="h-[14px] w-[14px]" />
          </button>
        )}
      </div>

      {/* Dropdown Results */}
      {open && (results.length > 0 || loading) && (
        <div className="absolute top-[40px] left-0 right-0 rounded-[10px] bg-[#1a1c1a]/95 backdrop-blur-md border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.6)] overflow-hidden z-50">
          {loading && (
            <div className="px-[12px] py-[10px] text-[12px] text-white/40 font-montserrat">Searching...</div>
          )}
          {!loading && results.map((r) => (
            <button
              key={r.id}
              onClick={() => handleSelect(r)}
              className="flex w-full items-center gap-[10px] px-[12px] py-[10px] text-left hover:bg-white/10 transition-colors border-b border-white/5 last:border-0"
            >
              <MapPin className="h-[14px] w-[14px] text-white/40 shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-[13px] font-montserrat font-medium text-white/90 truncate">{r.name}</span>
                <span className="text-[10px] font-montserrat text-white/40 truncate">
                  {r.admin1 ? `${r.admin1}, ` : ''}{r.country}
                </span>
              </div>
            </button>
          ))}
          {!loading && results.length === 0 && query.length >= 2 && (
            <div className="px-[12px] py-[10px] text-[12px] text-white/40 font-montserrat">No results found</div>
          )}
        </div>
      )}
    </div>
  );
}
