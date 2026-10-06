import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LocationDetail, LocationCategory } from '../../types/location';
import { locationService } from '../../services/locationService';
import { formatCoordinates } from '../../utils/formatting';
import { CATEGORY_REGISTRY } from '../../data/categoriesData';
import { LocationDetailModal } from '../locations/LocationDetailModal';
import {
  Map as MapIcon,
  Compass,
  Globe2,
  Crosshair,
  RotateCcw,
  Search,
  Layers,
  MapPin,
  ChevronDown,
  Mountain,
} from 'lucide-react';

// Fix Leaflet default icon asset paths in Vite / bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

type BaseMapStyle = 'osm' | 'satellite' | 'terrain';

const TILE_LAYERS: Record<BaseMapStyle, { url: string; options: L.TileLayerOptions; label: string }> = {
  osm: {
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    options: {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    },
    label: 'Street',
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    options: {
      maxZoom: 18,
      attribution: '&copy; Esri, Maxar, Earthstar Geographics',
    },
    label: 'Satellite',
  },
  terrain: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    options: {
      maxZoom: 18,
      attribution: '&copy; Esri, HERE, Garmin, USGS',
    },
    label: 'Terrain',
  },
};

export interface InteractiveMapProps {
  initialSelectedLocation?: LocationDetail | null;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({ initialSelectedLocation }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.FeatureGroup | null>(null);
  const markerInstancesRef = useRef<Map<string, L.Marker>>(new Map());

  const [activeCategory, setActiveCategory] = useState<LocationCategory | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<LocationDetail | null>(initialSelectedLocation || null);
  const [detailModalLocation, setDetailModalLocation] = useState<LocationDetail | null>(null);
  const [baseStyle, setBaseStyle] = useState<BaseMapStyle>('osm');
  const [isMapReady, setIsMapReady] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  const categories = locationService.getCategories();

  const filteredLocations = locationService.getLocations({
    category: activeCategory,
    searchQuery: searchQuery,
  });

  // Close map category dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setIsCategoryOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 1. Initialize Map Container & Core Controls
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Centered at Pavagada Hill Fort
    const map = L.map(mapContainerRef.current, {
      center: [14.1025, 77.2798],
      zoom: 12,
      zoomControl: false,
      attributionControl: true,
      fadeAnimation: true,
    });

    // Custom positioned Zoom Control at top right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Initial Tile Layer
    const tileConfig = TILE_LAYERS[baseStyle];
    const initialTileLayer = L.tileLayer(tileConfig.url, tileConfig.options).addTo(map);
    tileLayerRef.current = initialTileLayer;

    // Feature group for markers
    const markersGroup = L.featureGroup().addTo(map);
    markersLayerRef.current = markersGroup;
    mapInstanceRef.current = map;
    setIsMapReady(true);

    // Multi-pass size invalidation to completely prevent grey tiles in flex/grid
    const triggerInvalidate = () => {
      map.invalidateSize();
    };

    requestAnimationFrame(triggerInvalidate);
    const timer1 = setTimeout(triggerInvalidate, 100);
    const timer2 = setTimeout(triggerInvalidate, 350);
    const timer3 = setTimeout(triggerInvalidate, 750);
    const timer4 = setTimeout(triggerInvalidate, 1500);

    // ResizeObserver ensures continuous responsiveness
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    const handleResize = () => {
      map.invalidateSize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      map.remove();
      mapInstanceRef.current = null;
      setIsMapReady(false);
    };
  }, []);

  // 2. Handle Base Layer Style Switcher
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }
    const tileConfig = TILE_LAYERS[baseStyle];
    const newLayer = L.tileLayer(tileConfig.url, tileConfig.options).addTo(mapInstanceRef.current);
    tileLayerRef.current = newLayer;
    newLayer.bringToBack();
  }, [baseStyle]);

  // 3. Render Markers & Popups whenever filteredLocations or selectedLocation changes
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();
    markerInstancesRef.current.clear();

    filteredLocations.forEach((loc) => {
      const isSelected = selectedLocation?.id === loc.id;
      const isSolar = loc.category === 'SOLAR_INFRASTRUCTURE';
      const isHeritage = loc.category === 'FORT_HERITAGE' || loc.category === 'MEGALITHIC_SITE';
      const isReligious = loc.category === 'RELIGIOUS';

      // Category SVG Icon
      const iconSvg = isSolar
        ? '<svg class="w-3 h-3 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>'
        : isHeritage
        ? '<svg class="w-3 h-3 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 2l9 4.5v5.5c0 5-3.5 9.5-9 11-5.5-1.5-9-6-9-11V6.5L12 2z"/></svg>'
        : isReligious
        ? '<svg class="w-3 h-3 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v18m-9-9h18"/></svg>'
        : '<svg class="w-3 h-3 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>';

      // Visual color token for map pin badge
      const pinBorder = isSelected
        ? 'border-2 border-[#C65D3A] ring-2 ring-[#C65D3A]/40 shadow-xl'
        : isSolar
        ? 'border border-[#C65D3A]/70 shadow-md'
        : isHeritage
        ? 'border border-[#7A5135]/70 shadow-md'
        : 'border border-slate-300 shadow-md';

      const iconBg = isSelected
        ? 'bg-[#C65D3A] text-white'
        : isSolar
        ? 'bg-[#C65D3A] text-white'
        : isHeritage
        ? 'bg-[#7A5135] text-white'
        : 'bg-[#1F3A2E] text-white';

      const pointerBg = isSelected ? 'bg-[#C65D3A]' : 'bg-white border-b border-r border-slate-300';

      const shortName = loc.name.length > 20 ? loc.name.substring(0, 18) + '…' : loc.name;

      // Custom divIcon with crisp white pill badge and black location name
      const customIcon = L.divIcon({
        className: 'custom-map-pin !bg-transparent !border-0',
        html: `
          <div class="relative group cursor-pointer" style="transform: translate(-50%, -100%);">
            <div class="bg-white text-black ${pinBorder} px-2.5 py-1 rounded-full text-[11px] font-sans font-bold whitespace-nowrap flex items-center gap-1.5 transition-transform duration-200 group-hover:scale-105 select-none shadow-md">
              <span class="w-4 h-4 rounded-full ${iconBg} flex items-center justify-center p-0.5 text-white shrink-0">${iconSvg}</span>
              <span class="tracking-normal font-bold text-black">${shortName}</span>
            </div>
            <div class="w-2.5 h-2.5 ${pointerBg} rotate-45 mx-auto -mt-1 rounded-[1px] shadow-xs"></div>
          </div>
        `,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });

      const marker = L.marker([loc.coordinates.latitude, loc.coordinates.longitude], {
        icon: customIcon,
        title: loc.name,
      });

      // Accessible Warm Dossier Popup
      const popupHtml = `
        <div class="font-sans text-xs p-1 min-w-[220px] max-w-[280px]">
          <div class="flex items-center justify-between gap-2 mb-1">
            <span class="font-mono text-[10px] text-terracotta font-bold uppercase tracking-wider">${loc.code}</span>
            <span class="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-forest-green text-warm-cream">
              ${loc.category.replace('_', ' ')}
            </span>
          </div>
          <h4 class="font-serif font-bold text-sm text-black leading-snug mb-0.5">${loc.name}</h4>
          ${loc.kannadaName ? `<div class="text-[11px] font-kannada text-earth-brown mb-1.5">${loc.kannadaName}</div>` : ''}
          <p class="text-dark-text/80 text-[11px] leading-relaxed mb-2 line-clamp-3">${loc.summary}</p>
          <div class="font-mono text-[10px] text-forest-green bg-warm-cream p-1.5 rounded border border-soft-sand flex items-center justify-between mb-2.5">
            <span class="flex items-center gap-1">
              <svg class="w-3 h-3 text-terracotta shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              <span>${formatCoordinates(loc.coordinates.latitude, loc.coordinates.longitude)}</span>
            </span>
            ${loc.coordinates.elevationMeters ? `<span>${loc.coordinates.elevationMeters}m MSL</span>` : ''}
          </div>
          <button
            id="popup-btn-${loc.id}"
            type="button"
            class="w-full bg-forest-green hover:bg-forest-green-dark text-white font-sans text-xs font-semibold py-1.5 px-3 rounded-lg text-center transition-colors shadow-sm cursor-pointer"
          >
            Open Complete Dossier →
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        offset: [0, -20],
        maxWidth: 300,
        className: 'warm-map-popup',
      });

      marker.on('click', () => {
        setSelectedLocation(loc);
      });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`popup-btn-${loc.id}`);
        if (btn) {
          btn.onclick = () => {
            setDetailModalLocation(loc);
          };
        }
      });

      markersLayerRef.current?.addLayer(marker);
      markerInstancesRef.current.set(loc.id, marker);
    });

    // Invalidate size once markers are registered
    mapInstanceRef.current.invalidateSize();
  }, [filteredLocations, selectedLocation]);

  // 4. Pan to selected location
  useEffect(() => {
    if (selectedLocation && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(
        [selectedLocation.coordinates.latitude, selectedLocation.coordinates.longitude],
        selectedLocation.category === 'SOLAR_INFRASTRUCTURE' ? 12 : 15,
        { duration: 0.8 }
      );
    }
  }, [selectedLocation]);

  // Fit all markers in viewport
  const handleFitAllBounds = useCallback(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    const bounds = markersLayerRef.current.getBounds();
    if (bounds.isValid()) {
      mapInstanceRef.current.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 14,
      });
    }
  }, []);

  // Recenter to Pavagada Town
  const handleRecenterTown = useCallback(() => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([14.1025, 77.2798], 12, { duration: 0.8 });
  }, []);

  // Handle clicking location card from sidebar
  const handleSelectFromList = (loc: LocationDetail) => {
    setSelectedLocation(loc);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(
        [loc.coordinates.latitude, loc.coordinates.longitude],
        loc.category === 'SOLAR_INFRASTRUCTURE' ? 12 : 15,
        { duration: 0.8 }
      );
      const marker = markerInstancesRef.current.get(loc.id);
      if (marker) {
        setTimeout(() => marker.openPopup(), 400);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Map Filter & Search HUD */}
      <div className="bg-white border border-soft-sand rounded-2xl p-4 md:p-5 shadow-xs">
        <div className="grid grid-cols-12 gap-3 items-center">
          {/* Search box */}
          <div className="col-span-12 md:col-span-7 lg:col-span-8 relative">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-forest-green/60" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search landmarks (Fort, Solar, Gate, Hospital)..."
              className="w-full text-xs md:text-sm pl-9 pr-4 py-2 bg-warm-cream/30 border border-soft-sand rounded-xl font-sans placeholder:text-muted-text focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta"
            />
          </div>

          {/* Category Filter Dropdown */}
          <div className="col-span-12 md:col-span-5 lg:col-span-4 relative" ref={categoryDropdownRef}>
            <button
              type="button"
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              className="w-full bg-white border border-soft-sand hover:border-terracotta focus:border-terracotta rounded-xl px-3 py-2 text-xs md:text-sm font-semibold text-forest-green flex items-center justify-between gap-2 shadow-xs transition-all cursor-pointer"
              aria-label="Filter map by category"
            >
              <div className="flex items-center gap-1.5 truncate">
                <Layers className="w-4 h-4 text-forest-green/80 shrink-0" />
                <span className="truncate font-medium">
                  {activeCategory === 'ALL'
                    ? 'All Categories'
                    : categories.find((c) => c.id === activeCategory)?.name}
                </span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <span className="font-mono text-[10px] bg-forest-green text-white font-bold px-1.5 py-0.2 rounded-full">
                  {filteredLocations.length}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-muted-text transition-transform duration-200 ${
                    isCategoryOpen ? 'rotate-180' : ''
                  }`}
                />
              </div>
            </button>

            {isCategoryOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 max-h-64 overflow-y-auto bg-white border border-soft-sand rounded-xl shadow-xl z-[1500] py-1 divide-y divide-soft-sand/40">
                <div className="p-1">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveCategory('ALL');
                      setIsCategoryOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                      activeCategory === 'ALL' ? 'bg-forest-green text-white' : 'text-dark-text hover:bg-warm-cream'
                    }`}
                  >
                    <span>All Categories</span>
                    <span className="font-mono text-[10px]">{locationService.getLocations().length}</span>
                  </button>
                </div>
                <div className="p-1 space-y-0.5">
                  {categories.map((cat) => {
                    const isSelected = activeCategory === cat.id;
                    const count = locationService.getLocations({ category: cat.id }).length;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setActiveCategory(cat.id);
                          setIsCategoryOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                          isSelected ? 'bg-forest-green text-white font-semibold' : 'text-dark-text hover:bg-warm-cream'
                        }`}
                      >
                        <span className="truncate pr-1">{cat.name}</span>
                        <span className="font-mono text-[10px]">{count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Map + Sidebar Split (12-Columns) */}
      <div className="grid grid-cols-12 gap-6 items-start">
        {/* Leaflet Container with rounded-2xl and warm border */}
        <div className="col-span-12 lg:col-span-8 border border-soft-sand rounded-2xl bg-warm-cream/30 relative h-[560px] md:h-[640px] overflow-hidden shadow-sm flex flex-col">
          {/* Top Spatial HUD Controls Overlay */}
          <div className="absolute top-4 left-4 right-16 z-[1000] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
            {/* Coordinate Telemetry Badge */}
            <div className="bg-forest-green/90 backdrop-blur-md text-warm-cream font-mono text-[11px] px-3.5 py-1.5 rounded-lg border border-forest-green-light shadow-md pointer-events-auto flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-terracotta animate-pulse"></span>
              <span>14.1025° N, 77.2798° E · PAVAGADA TALUK</span>
            </div>

            {/* Quick Action Buttons (Fit Bounds, Recenter, Style Switcher) */}
            <div className="flex items-center gap-1.5 pointer-events-auto bg-white/90 backdrop-blur-md p-1 rounded-xl border border-soft-sand shadow-md">
              {/* Style Switcher */}
              {(['osm', 'satellite', 'terrain'] as BaseMapStyle[]).map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => setBaseStyle(style)}
                  title={`Switch to ${TILE_LAYERS[style].label} map`}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    baseStyle === style
                      ? 'bg-forest-green text-white shadow-xs'
                      : 'text-dark-text hover:bg-warm-cream'
                  }`}
                >
                  {style === 'osm' && <Compass className="w-3.5 h-3.5" />}
                  {style === 'satellite' && <Globe2 className="w-3.5 h-3.5" />}
                  {style === 'terrain' && <Mountain className="w-3.5 h-3.5" />}
                  <span>{TILE_LAYERS[style].label}</span>
                </button>
              ))}

              <div className="w-[1px] h-4 bg-soft-sand mx-0.5" />

              {/* Fit All Button */}
              <button
                type="button"
                onClick={handleFitAllBounds}
                title="Fit all landmarks within screen"
                className="text-[11px] font-semibold px-2 py-1 rounded-lg text-forest-green hover:bg-warm-cream transition-colors cursor-pointer flex items-center gap-1"
              >
                <Crosshair className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Fit All</span>
              </button>

              {/* Recenter Button */}
              <button
                type="button"
                onClick={handleRecenterTown}
                title="Center on Pavagada Hill Fort"
                className="text-[11px] font-semibold px-2 py-1 rounded-lg text-forest-green hover:bg-warm-cream transition-colors cursor-pointer flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Reset</span>
              </button>
            </div>
          </div>

          {/* Leaflet Mount Target */}
          <div
            ref={mapContainerRef}
            className="w-full h-full min-h-[560px] md:min-h-[640px] flex-1"
            style={{ minHeight: '560px', width: '100%', height: '100%' }}
            tabIndex={0}
            aria-label="Geospatial Map of Pavagada"
          />

          {/* Map Loading Fallback Indicator */}
          {!isMapReady && (
            <div className="absolute inset-0 bg-warm-cream flex items-center justify-center z-10">
              <div className="flex flex-col items-center gap-2 text-forest-green">
                <div className="w-8 h-8 border-3 border-terracotta border-t-transparent rounded-full animate-spin"></div>
                <span className="font-serif font-bold text-sm">Rendering Geospatial Canvas...</span>
              </div>
            </div>
          )}
        </div>

        {/* Location Sidebar List */}
        <div className="col-span-12 lg:col-span-4 border border-soft-sand rounded-2xl bg-white flex flex-col h-[560px] md:h-[640px] overflow-hidden shadow-sm">
          <div className="border-b border-soft-sand p-4 bg-warm-cream/60 shrink-0 flex items-center justify-between">
            <div>
              <div className="text-xs uppercase font-bold tracking-wider text-forest-green">
                Explorer Registry ({filteredLocations.length} Points)
              </div>
              <div className="text-[11px] text-muted-text">
                Select landmark to zoom & inspect telemetry
              </div>
            </div>
            <button
              type="button"
              onClick={handleFitAllBounds}
              className="text-xs text-terracotta hover:underline font-semibold cursor-pointer"
            >
              Fit View
            </button>
          </div>

          {/* Scrollable list */}
          <div className="overflow-y-auto divide-y divide-soft-sand/60 flex-1 p-2 space-y-1">
            {filteredLocations.length === 0 ? (
              <div className="p-8 text-center text-muted-text text-sm">
                No landmarks found matching "{searchQuery}".
              </div>
            ) : (
              filteredLocations.map((loc) => {
                const isSelected = selectedLocation?.id === loc.id;
                const categoryDef = CATEGORY_REGISTRY[loc.category];

                return (
                  <div
                    key={loc.id}
                    onClick={() => handleSelectFromList(loc)}
                    className={`p-3.5 rounded-xl cursor-pointer transition-all duration-150 ${
                      isSelected
                        ? 'bg-warm-cream border border-terracotta/40 shadow-sm'
                        : 'hover:bg-warm-cream/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-[10px] font-bold text-muted-text">
                        {loc.code}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          loc.category === 'SOLAR_INFRASTRUCTURE'
                            ? 'bg-terracotta text-white'
                            : loc.category === 'FORT_HERITAGE'
                            ? 'bg-earth-brown text-white'
                            : 'bg-forest-green text-white'
                        }`}
                      >
                        {categoryDef ? categoryDef.shortCode : loc.category}
                      </span>
                    </div>

                    <h4 className="text-sm font-serif font-bold text-black leading-snug">
                      {loc.name}
                    </h4>
                    {loc.kannadaName && (
                      <div className="text-xs font-kannada text-earth-brown mt-0.5">{loc.kannadaName}</div>
                    )}

                    <div className="font-mono text-[11px] text-muted-text mt-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-terracotta shrink-0" />
                        <span>{formatCoordinates(loc.coordinates.latitude, loc.coordinates.longitude)}</span>
                      </span>
                      {loc.coordinates.elevationMeters && (
                        <span>{loc.coordinates.elevationMeters}m</span>
                      )}
                    </div>

                    {isSelected && (
                      <div className="mt-2.5 pt-2.5 border-t border-soft-sand flex items-center justify-between">
                        <span className="text-xs font-semibold text-terracotta">Selected on map</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDetailModalLocation(loc);
                          }}
                          className="bg-forest-green hover:bg-forest-green-dark text-white text-xs font-semibold px-3 py-1 rounded-md transition-colors cursor-pointer"
                        >
                          Full Dossier →
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Selected Location Full Dossier Modal */}
      {detailModalLocation && (
        <LocationDetailModal
          location={detailModalLocation}
          onClose={() => setDetailModalLocation(null)}
        />
      )}
    </div>
  );
};
