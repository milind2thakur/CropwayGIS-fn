'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Coordinates for the Raipur farm parcel matching GisMapPanel.tsx and HomeHero.tsx
const FARM_POLYGON: [number, number][] = [
  [21.2519, 81.6301],
  [21.2527, 81.6307],
  [21.2519, 81.6315],
  [21.2510, 81.6307],
];

// Helper component to command map zoom level externally
function MapZoomController({
  zoomTrigger,
  onTriggerHandled,
}: {
  zoomTrigger: 'in' | 'out' | null;
  onTriggerHandled: () => void;
}) {
  const map = useMap();

  useEffect(() => {
    if (zoomTrigger === 'in') {
      map.zoomIn();
      onTriggerHandled();
    } else if (zoomTrigger === 'out') {
      map.zoomOut();
      onTriggerHandled();
    }
  }, [zoomTrigger, map, onTriggerHandled]);

  return null;
}

interface ClimateRiskMapProps {
  activeLayer: 'temperature' | 'precipitation' | 'wind';
  zoomTrigger: 'in' | 'out' | null;
  onZoomTriggerHandled: () => void;
}

const layerMap: Record<string, string> = {
  temperature: 'temp_new',
  precipitation: 'precipitation_new',
  wind: 'wind_new',
};

export function ClimateRiskMap({
  activeLayer,
  zoomTrigger,
  onZoomTriggerHandled,
}: ClimateRiskMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;

  // Resolve Leaflet marker icons in Next.js environment
  useEffect(() => {
    // @ts-ignore
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png',
    });
  }, []);

  return (
    <div className="absolute inset-0 h-full w-full bg-[#E0E0E0]" id="gis-leaflet-map-wrapper">
      <MapContainer
        center={[21.2517, 81.6304]}
        zoom={13}
        className="h-full w-full"
        zoomControl={false}
        attributionControl={false}
        scrollWheelZoom={true}
      >
        {/* Base Map: Satellite Imagery */}
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution="&copy; Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
        />

        {/* OpenWeather Map overlay layer if key is present */}
        {apiKey && (
          <TileLayer
            key={activeLayer}
            url={`https://tile.openweathermap.org/map/${layerMap[activeLayer]}/{z}/{x}/{y}.png?appid=${apiKey}`}
            opacity={0.55}
            attribution="&copy; OpenWeatherMap"
          />
        )}

        {/* Farm Parcel Polygon */}
        <Polygon
          positions={FARM_POLYGON}
          pathOptions={{
            color: '#FFFFFF',
            weight: 2.5,
            fillColor: '#82C26E',
            fillOpacity: 0.45,
          }}
        />

        {/* Map Zoom Controller */}
        <MapZoomController zoomTrigger={zoomTrigger} onTriggerHandled={onZoomTriggerHandled} />
      </MapContainer>
    </div>
  );
}
