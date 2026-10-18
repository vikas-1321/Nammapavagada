import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, Copy, Check } from 'lucide-react';

interface MapPickerProps {
  latitude: number;
  longitude: number;
  onChange: (lat: number, lng: number) => void;
  title?: string;
}

const PRESET_LOCATIONS = [
  { name: 'Town Center', lat: 14.1025, lng: 77.2798 },
  { name: 'KSRTC Bus Stand', lat: 14.0984, lng: 77.2765 },
  { name: 'Taluk Hospital', lat: 14.1042, lng: 77.2810 },
  { name: 'Pavagada Fort', lat: 14.1008, lng: 77.2736 },
  { name: 'Mini Vidhana Soudha', lat: 14.1018, lng: 77.2801 },
  { name: 'Solar Park (Thirumani)', lat: 14.2810, lng: 77.4120 },
];

export const MapPicker: React.FC<MapPickerProps> = ({
  latitude,
  longitude,
  onChange,
  title = 'Pick Location on Map',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [copied, setCopied] = useState(false);

  const curLat = latitude || 14.1025;
  const curLng = longitude || 77.2798;

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Clean up if already initialized
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Custom SVG Pin Icon for Leaflet
    const customIcon = L.divIcon({
      className: 'custom-leaflet-marker',
      html: `
        <div style="
          width: 34px;
          height: 34px;
          background: #10b981;
          border: 3px solid #ffffff;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 4px 12px rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            width: 10px;
            height: 10px;
            background: #ffffff;
            border-radius: 50%;
            transform: rotate(45deg);
          "></div>
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 34],
    });

    const map = L.map(mapContainerRef.current, {
      center: [curLat, curLng],
      zoom: 15,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    const marker = L.marker([curLat, curLng], {
      draggable: true,
      icon: customIcon,
    }).addTo(map);

    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      onChange(Number(pos.lat.toFixed(6)), Number(pos.lng.toFixed(6)));
    });

    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      marker.setLatLng([lat, lng]);
      onChange(Number(lat.toFixed(6)), Number(lng.toFixed(6)));
    });

    mapInstanceRef.current = map;
    markerRef.current = marker;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update marker when coords change from props
  useEffect(() => {
    if (markerRef.current && mapInstanceRef.current) {
      const pos = markerRef.current.getLatLng();
      if (Math.abs(pos.lat - curLat) > 0.00001 || Math.abs(pos.lng - curLng) > 0.00001) {
        markerRef.current.setLatLng([curLat, curLng]);
        mapInstanceRef.current.panTo([curLat, curLng]);
      }
    }
  }, [curLat, curLng]);

  const handleCopyCoords = () => {
    navigator.clipboard.writeText(`${curLat}, ${curLng}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const setPreset = (lat: number, lng: number) => {
    onChange(lat, lng);
    if (mapInstanceRef.current && markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
      mapInstanceRef.current.setView([lat, lng], 16);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <MapPin size={14} className="text-emerald-400" />
            <span>{title}</span>
            <span className="text-rose-400 font-bold">*</span>
          </label>
          <p className="text-[11px] text-slate-500">
            Click anywhere on the map or drag the pin to set exact coordinates.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCopyCoords}
          className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
        >
          {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
          <span>{copied ? 'Copied' : 'Copy Coordinates'}</span>
        </button>
      </div>

      {/* Preset Quick Buttons */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mr-1">
          Quick Points:
        </span>
        {PRESET_LOCATIONS.map((p) => (
          <button
            key={p.name}
            type="button"
            onClick={() => setPreset(p.lat, p.lng)}
            className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 hover:border-emerald-500/50 text-[10px] text-slate-300 hover:text-white transition-colors"
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Interactive Map Container */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-inner h-64 z-0">
        <div ref={mapContainerRef} className="w-full h-full" />
      </div>

      {/* Exact Coordinate Input Readouts */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Latitude (WGS84 Decimal)
          </label>
          <div className="relative">
            <input
              type="number"
              step="any"
              value={curLat}
              onChange={(e) => onChange(parseFloat(e.target.value) || 0, curLng)}
              className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Longitude (WGS84 Decimal)
          </label>
          <div className="relative">
            <input
              type="number"
              step="any"
              value={curLng}
              onChange={(e) => onChange(curLat, parseFloat(e.target.value) || 0)}
              className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
