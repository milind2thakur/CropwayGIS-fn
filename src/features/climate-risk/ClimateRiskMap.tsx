'use client';

import React, { useEffect } from 'react';
import { Circle, MapContainer, TileLayer, Polygon, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Coordinates for the Raipur farm parcel matching GisMapPanel.tsx and HomeHero.tsx
const FARM_POLYGON: [number, number][] = [
  [21.2519, 81.6301],
  [21.2527, 81.6307],
  [21.2519, 81.6315],
  [21.2510, 81.6307],
];

const TEMPERATURE_HEAT_ZONES: Array<{
  center: [number, number];
  radius: number;
  opacity: number;
}> = [
  { center: [21.266, 81.621], radius: 1850, opacity: 0.42 },
  { center: [21.245, 81.604], radius: 2350, opacity: 0.46 },
  { center: [21.228, 81.619], radius: 1700, opacity: 0.34 },
  { center: [21.272, 81.655], radius: 2100, opacity: 0.48 },
  { center: [21.248, 81.664], radius: 1450, opacity: 0.28 },
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
  baseLayer: 'satellite' | 'street' | 'topographic';
  activeLayer: 'temperature' | 'precipitation' | 'wind';
  zoomTrigger: 'in' | 'out' | null;
  onZoomTriggerHandled: () => void;
  onMapReady?: (map: L.Map) => void;
}

const layerMap: Record<string, string> = {
  temperature: 'temp_new',
  precipitation: 'precipitation_new',
  wind: 'wind_new',
};

export function ClimateRiskMap({
  baseLayer,
  activeLayer,
  zoomTrigger,
  onZoomTriggerHandled,
  onMapReady,
}: ClimateRiskMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;

  // Resolve Leaflet marker icons in Next.js environment
  useEffect(() => {
    // @ts-expect-error Leaflet's internal icon URL cache is not part of the public type.
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png',
    });
  }, []);

  const baseLayerUrlByType = {
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    street: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    topographic: 'https://a.tile.opentopomap.org/{z}/{x}/{y}.png',
  } as const;

  const baseLayerAttributionByType = {
    satellite: '&copy; Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    street: '&copy; OpenStreetMap contributors',
    topographic: '&copy; OpenTopoMap contributors',
  } as const;

  return (
    <div className="absolute inset-0 h-full w-full bg-[#E0E0E0]" id="gis-leaflet-map-wrapper">
      <MapContainer
        center={[21.2517, 81.6304]}
        zoom={13}
        className="climate-risk-map h-full w-full"
        zoomControl={false}
        attributionControl={false}
        scrollWheelZoom={true}
        whenReady={(event) => {
          onMapReady?.(event.target);
        }}
      >
        {/* Base Map: Satellite Imagery */}
        <TileLayer
          key={baseLayer}
          url={baseLayerUrlByType[baseLayer]}
          attribution={baseLayerAttributionByType[baseLayer]}
          className={activeLayer === 'temperature' ? 'climate-risk-light-tiles' : undefined}
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

        {activeLayer === 'temperature' && (
          <>
            {TEMPERATURE_HEAT_ZONES.map((zone) => (
              <Circle
                key={`${zone.center[0]}-${zone.center[1]}`}
                center={zone.center}
                radius={zone.radius}
                pathOptions={{
                  stroke: false,
                  fillColor: '#E8C300',
                  fillOpacity: zone.opacity,
                  className: 'climate-risk-heat-zone',
                }}
              />
            ))}
          </>
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
