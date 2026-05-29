'use client';

import React, { useEffect } from 'react';
import { Circle, MapContainer, TileLayer, Polygon, Marker, useMap, useMapEvents } from 'react-leaflet';
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

import type { ClimateLayer } from './components/ClimateMapControls';
import type { MapOverlays } from './components/MapOverlaysPanel';

const RADAR_STATIONS = [
  { name: 'Raipur', center: [21.2517, 81.6304] as [number, number] },
  { name: 'Delhi', center: [28.6139, 77.2090] as [number, number] },
  { name: 'Mumbai', center: [19.0760, 72.8777] as [number, number] },
  { name: 'Kolkata', center: [22.5726, 88.3639] as [number, number] },
  { name: 'Chennai', center: [13.0827, 80.2707] as [number, number] },
];

const ACTIVE_FIRES_ZONES = [
  { center: [21.35, 81.75] as [number, number], name: 'Raipur Farm Area' },
  { center: [21.15, 81.5] as [number, number], name: 'Bhilai Outskirts' },
  { center: [21.45, 81.4] as [number, number], name: 'Dhamdha Farms' },
];

interface ClimateRiskMapProps {
  baseLayer: 'satellite' | 'street' | 'topographic';
  activeLayer: ClimateLayer;
  radarTimestamp?: number | null;
  selectedLocation?: { lat: number; lon: number } | null;
  zoomTrigger: 'in' | 'out' | null;
  onZoomTriggerHandled: () => void;
  onMapReady?: (map: L.Map) => void;
  onLocationClick?: (lat: number, lon: number) => void;
  overlays?: MapOverlays;
}

// Click handler component
function MapClickHandler({ onClick }: { onClick: (lat: number, lon: number) => void }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Fly-to component for when location changes
function FlyToLocation({ lat, lon }: { lat: number; lon: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lon], map.getZoom(), { duration: 1.5 });
  }, [lat, lon, map]);
  return null;
}


import Script from 'next/script';

const layerMap: Record<string, string> = {
  temperature: 'temp_new',
  precipitation: 'precipitation_new',
  wind: 'wind_new',
};

function RainViewerLayer({ timestamp }: { timestamp: number }) {
  return (
    <TileLayer
      key={timestamp}
      url={`https://tilecache.rainviewer.com/v2/radar/${timestamp}/256/{z}/{x}/{y}/2/1_1.png`}
      opacity={0.6}
      attribution="&copy; RainViewer"
      zIndex={10}
    />
  );
}

function WindVelocityLayer() {
  const map = useMap();
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    // Expose L to window for leaflet-velocity
    if (typeof window !== 'undefined' && !window.L) {
      window.L = L;
    }
  }, []);

  React.useEffect(() => {
    if (!loaded) return;
    // @ts-expect-error L.velocityLayer is added by plugin
    if (typeof window === 'undefined' || !window.L || !window.L.velocityLayer) return;

    let velocityLayer: any;
    
    // Using a sample public GFS wind dataset for the demo
    fetch('https://raw.githubusercontent.com/danwild/wind-js-server/master/demo/weather/water-gfs.json')
      .then(res => res.json())
      .then(data => {
        // @ts-expect-error L.velocityLayer is added by plugin
        velocityLayer = window.L.velocityLayer({
          displayValues: true,
          displayOptions: {
            velocityType: 'Global Wind',
            displayPosition: 'bottomleft',
            displayEmptyString: 'No wind data'
          },
          data: data,
          maxVelocity: 15,
          colorScale: ['#ffffff', '#e0f7fa', '#b2ebf2', '#80deea', '#4dd0e1', '#26c6da', '#00bcd4', '#00acc1', '#0097a7', '#00838f', '#006064']
        });
        
        velocityLayer.addTo(map);
      })
      .catch(console.error);

    return () => {
      if (velocityLayer && map) {
        map.removeLayer(velocityLayer);
      }
    };
  }, [loaded, map]);

  return (
    <>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/leaflet-velocity@1.6.0/dist/leaflet-velocity.min.css" />
      <Script 
        src="https://cdn.jsdelivr.net/npm/leaflet-velocity@1.6.0/dist/leaflet-velocity.min.js" 
        strategy="lazyOnload"
        onLoad={() => setLoaded(true)}
      />
    </>
  );
}

export function ClimateRiskMap({
  baseLayer,
  activeLayer,
  radarTimestamp,
  selectedLocation,
  zoomTrigger,
  onZoomTriggerHandled,
  onMapReady,
  onLocationClick,
  overlays,
}: ClimateRiskMapProps) {
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
        {/* Base Map */}
        <TileLayer
          key={baseLayer}
          url={baseLayerUrlByType[baseLayer]}
          attribution={baseLayerAttributionByType[baseLayer]}
          className={activeLayer === 'temperature' ? 'climate-risk-light-tiles' : undefined}
        />

        {/* Labels Overlay */}
        {overlays?.labels && baseLayer === 'satellite' && (
          <TileLayer
            url="https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
            attribution="&copy; Esri, HERE, Garmin"
            zIndex={20}
          />
        )}

        {/* Rain Radar Animation */}
        {((activeLayer === 'precipitation' || activeLayer === 'radar') || overlays?.rainAnimation) && radarTimestamp && (
          <RainViewerLayer timestamp={radarTimestamp} />
        )}
        
        {/* Wind Animation */}
        {(activeLayer === 'wind' || overlays?.windAnimation) && <WindVelocityLayer />}

        {/* Radar Coverage Circles */}
        {overlays?.radarCoverage && (
          <>
            {RADAR_STATIONS.map((station) => (
              <React.Fragment key={station.name}>
                <Circle
                  center={station.center}
                  radius={250000} // 250km
                  pathOptions={{
                    color: 'rgba(34, 197, 94, 0.4)',
                    weight: 1.5,
                    dashArray: '5, 5',
                    fillColor: 'rgba(34, 197, 94, 0.04)',
                    fillOpacity: 0.15,
                  }}
                />
                <Circle
                  center={station.center}
                  radius={3000} // 3km center point
                  pathOptions={{
                    color: '#22c55e',
                    weight: 2,
                    fillColor: '#ffffff',
                    fillOpacity: 1,
                  }}
                />
              </React.Fragment>
            ))}
          </>
        )}

        {/* Active Fires Circles */}
        {overlays?.activeFires && (
          <>
            {ACTIVE_FIRES_ZONES.map((fire, idx) => (
              <Circle
                key={idx}
                center={fire.center}
                radius={12000}
                pathOptions={{
                  color: '#ef4444',
                  weight: 1.5,
                  fillColor: '#f97316',
                  fillOpacity: 0.6,
                }}
              />
            ))}
          </>
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

        {/* Location Marker */}
        {selectedLocation && (
          <>
            <Marker position={[selectedLocation.lat, selectedLocation.lon]} />
            <FlyToLocation lat={selectedLocation.lat} lon={selectedLocation.lon} />
          </>
        )}

        {/* Map Click Handler */}
        {onLocationClick && <MapClickHandler onClick={onLocationClick} />}

        {/* Map Zoom Controller */}
        <MapZoomController zoomTrigger={zoomTrigger} onTriggerHandled={onZoomTriggerHandled} />
      </MapContainer>

      {/* Crosshair Overlay */}
      {overlays?.crosshair && (
        <div className="absolute inset-0 pointer-events-none z-[500] flex items-center justify-center">
          <div className="relative h-[24px] w-[24px]">
            <div className="absolute left-[11px] top-0 bottom-0 w-[2px] bg-white shadow-[0_0_3px_rgba(0,0,0,0.8)]" />
            <div className="absolute top-[11px] left-0 right-0 h-[2px] bg-white shadow-[0_0_3px_rgba(0,0,0,0.8)]" />
            <div className="absolute left-[7px] top-[7px] h-[10px] w-[10px] rounded-full border-2 border-white shadow-[0_0_3px_rgba(0,0,0,0.8)]" />
          </div>
        </div>
      )}
    </div>
  );
}
