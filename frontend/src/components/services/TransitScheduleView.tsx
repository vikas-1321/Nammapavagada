import React, { useState, useMemo } from 'react';
import { TransitScheduleItem, TransitRouteStop, TransitTiming } from '../../types/service';
import {
  Bus,
  MapPin,
  Landmark,
  BarChart2,
  Clock,
  ChevronDown,
  Search,
  X,
  RotateCw,
  AlertCircle,
} from 'lucide-react';

export interface TransitScheduleViewProps {
  routes: TransitScheduleItem[];
  registeredStopsCount?: number;
  onRefresh?: () => Promise<void> | void;
  isRefreshing?: boolean;
  lastSyncedAt?: Date | null;
  isApiLoaded?: boolean;
  isLoading?: boolean;
  error?: string | null;
  onBackToDirectory?: () => void;
}

// Clean helper to present station titles gracefully without repeating boilerplate
const cleanStationTitle = (name: string): string => {
  if (!name) return '';
  return name
    .replace(/\s*\(Kempegowda Bus Station \/ Majestic\)/gi, ' Majestic')
    .replace(/\s*\(Majestic\)/gi, ' Majestic')
    .replace(/\s*KSRTC Bus Station/gi, '')
    .replace(/\s*Central Bus Stand/gi, '')
    .replace(/\s*Bus Station/gi, '')
    .replace(/\s*Bus Stand/gi, '')
    .replace(/\s*Bus Stop/gi, '')
    .trim();
};

// Calculate journey duration from arrival estimate minutes or timing departure/arrival
const calculateJourneyDuration = (route: TransitScheduleItem): string | null => {
  // 1. Check if the last sequenced stop has arrivalEstimateMinutes
  if (route.stops && route.stops.length > 0) {
    const sortedStops = [...route.stops].sort((a, b) => a.sequence - b.sequence);
    const lastStop = sortedStops[sortedStops.length - 1];
    if (lastStop.arrivalEstimateMinutes && lastStop.arrivalEstimateMinutes > 0) {
      const hours = Math.floor(lastStop.arrivalEstimateMinutes / 60);
      const mins = lastStop.arrivalEstimateMinutes % 60;
      return hours > 0 ? `${hours}h ${mins > 0 ? `${mins}m` : '00m'}` : `${mins}m`;
    }
  }

  // 2. Derive difference between departure and arrival in timings if available
  if (route.timings && route.timings.length > 0) {
    for (const t of route.timings) {
      if (t.departureTime && t.arrivalTime) {
        const parseTime = (timeStr: string) => {
          const match = timeStr.trim().match(/(\d{1,2}):(\d{2})(?:\s*([APap][Mm]))?/);
          if (!match) return null;
          let hour = parseInt(match[1], 10);
          const min = parseInt(match[2], 10);
          const meridiem = match[3]?.toUpperCase();
          if (meridiem === 'PM' && hour < 12) hour += 12;
          if (meridiem === 'AM' && hour === 12) hour = 0;
          return hour * 60 + min;
        };

        const depMin = parseTime(t.departureTime);
        const arrMin = parseTime(t.arrivalTime);
        if (depMin !== null && arrMin !== null) {
          let diff = arrMin - depMin;
          if (diff < 0) diff += 24 * 60; // Next-day arrival
          if (diff > 0 && diff <= 18 * 60) {
            const hours = Math.floor(diff / 60);
            const mins = diff % 60;
            return hours > 0 ? `${hours}h ${mins > 0 ? `${mins}m` : '00m'}` : `${mins}m`;
          }
        }
      }
    }
  }

  return null;
};

// Helper to format frequency note or service summary
const getFrequencySummary = (route: TransitScheduleItem): string => {
  if (route.frequencyNote && route.frequencyNote.trim()) {
    // If frequency note is already concise, use directly; otherwise summarize
    const note = route.frequencyNote.trim();
    if (note.length <= 32) return note;
    if (note.toLowerCase().includes('30 to 45 minutes')) return 'Every 30–45 min';
    if (note.toLowerCase().includes('hourly')) return 'Every 60 min';
    if (note.toLowerCase().includes('2 hours')) return 'Every 2 hours';
  }

  const tripCount = route.timings?.length || 0;
  if (tripCount > 0) {
    return `${tripCount} services daily`;
  }

  return 'Regular service';
};

// Format operational days string
const formatOperatingDays = (dayType?: string): string => {
  if (!dayType) return 'Daily';
  const dt = dayType.toUpperCase();
  if (dt === 'DAILY') return 'Daily';
  if (dt === 'MON_SAT') return 'Mon–Sat';
  if (dt === 'MON_FRI') return 'Mon–Fri';
  if (dt === 'SUNDAY') return 'Sundays';
  return dayType;
};

export const TransitScheduleView: React.FC<TransitScheduleViewProps> = ({
  routes,
  registeredStopsCount,
  onRefresh,
  isRefreshing = false,
  lastSyncedAt,
  isApiLoaded = false,
  isLoading = false,
  error = null,
}) => {
  const [operatorFilter, setOperatorFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedRouteTimings, setExpandedRouteTimings] = useState<Record<string, boolean>>({});

  // Calculate statistics from authentic backend data
  const stats = useMemo(() => {
    const activeCorridors = routes.length;

    // Unique registered stops count: prefer prop or calculate unique stops
    const uniqueStops = new Set<string>();
    routes.forEach((r) => {
      r.stops?.forEach((s) => {
        if (s.stopName) uniqueStops.add(s.stopName);
      });
      if (r.source) uniqueStops.add(r.source);
      if (r.destination) uniqueStops.add(r.destination);
    });
    const calculatedStopsCount = registeredStopsCount && registeredStopsCount > 0
      ? registeredStopsCount
      : uniqueStops.size;

    // Major hubs: unique stops flagged as isMajorStop plus terminal anchors
    const hubs = new Set<string>();
    routes.forEach((r) => {
      if (r.stops && r.stops.length > 0) {
        r.stops.forEach((s) => {
          if (s.isMajorStop) {
            hubs.add(s.stopName || s.stopId);
          }
        });
      }
      if (r.source) hubs.add(r.source);
      if (r.destination) hubs.add(r.destination);
    });

    // Total daily departures across all active routes
    const dailyTrips = routes.reduce((acc, r) => acc + (r.timings?.length || 0), 0);

    return {
      activeCorridors,
      registeredStops: calculatedStopsCount,
      majorHubs: hubs.size,
      dailyTrips,
    };
  }, [routes, registeredStopsCount]);

  // Available operator filters based on actual data
  const availableOperators = useMemo(() => {
    const ops = new Set<string>();
    routes.forEach((r) => {
      if (r.operator) {
        ops.add(r.operator.toUpperCase());
      }
    });
    return ops;
  }, [routes]);

  // Filter routes based on operator tab and search query
  const filteredRoutes = useMemo(() => {
    return routes.filter((route) => {
      // Operator filter
      if (operatorFilter !== 'ALL') {
        const op = (route.operator || '').toUpperCase();
        if (operatorFilter === 'KSRTC' && op !== 'KSRTC') return false;
        if (operatorFilter === 'APSRTC' && op !== 'APSRTC') return false;
        if (operatorFilter === 'PRIVATE' && op !== 'PRIVATE') return false;
        if (operatorFilter === 'RAILWAYS' && !op.includes('RAIL')) return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const codeMatch = route.routeCode?.toLowerCase().includes(q);
        const srcMatch = route.source?.toLowerCase().includes(q);
        const destMatch = route.destination?.toLowerCase().includes(q);
        const opMatch = route.operator?.toLowerCase().includes(q);
        const viaMatch = route.via?.some((v) => v.toLowerCase().includes(q));
        const stopMatch = route.stops?.some(
          (s) =>
            s.stopName?.toLowerCase().includes(q) ||
            (s.kannadaName && s.kannadaName.toLowerCase().includes(q))
        );

        if (!codeMatch && !srcMatch && !destMatch && !viaMatch && !stopMatch && !opMatch) {
          return false;
        }
      }

      return true;
    });
  }, [routes, operatorFilter, searchQuery]);

  const toggleTimings = (routeId: string) => {
    setExpandedRouteTimings((prev) => ({
      ...prev,
      [routeId]: !prev[routeId],
    }));
  };

  // Loading Skeleton State
  if (isLoading && routes.length === 0) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-10 bg-slate-200/80 rounded-xl w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-white rounded-2xl border border-slate-200 p-5" />
          ))}
        </div>
        <div className="h-14 bg-white rounded-2xl border border-slate-200" />
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-64 bg-white rounded-3xl border border-slate-200" />
          ))}
        </div>
      </div>
    );
  }

  // Error State with Retry
  if (error && routes.length === 0) {
    return (
      <div className="bg-white border border-red-200 rounded-3xl p-8 md:p-12 text-center space-y-4 max-w-xl mx-auto shadow-sm">
        <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-serif font-bold text-slate-900">Unable to Load Transit Corridors</h3>
        <p className="text-sm text-slate-600 leading-relaxed font-sans">{error}</p>
        {onRefresh && (
          <button
            type="button"
            onClick={() => onRefresh()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-forest-green text-white text-sm font-semibold rounded-xl hover:bg-forest-green-dark transition-colors cursor-pointer shadow-sm"
          >
            <RotateCw className="w-4 h-4" />
            <span>Retry Connection</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* =========================================================================
          SECTION 1: PAGE HEADER & TRANSPORT OVERVIEW (Screenshot 3 Reference)
      ========================================================================== */}
      <div className="space-y-4">
        {/* Eyebrow & Status Row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Bus className="w-4 h-4 text-emerald-600 stroke-[2.2]" />
            <span className="text-xs font-bold text-emerald-600 tracking-widest uppercase font-sans">
              MOVE ACROSS THE REGION
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold ${
                isApiLoaded
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isApiLoaded ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              {isApiLoaded ? 'Live API Connected' : 'Syncing Live...'}
            </span>

            {onRefresh && (
              <button
                type="button"
                onClick={() => onRefresh()}
                disabled={isRefreshing}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition-colors shadow-2xs disabled:opacity-50 cursor-pointer"
                title="Refresh routes from server"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{isRefreshing ? 'Syncing...' : 'Sync'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Main Title */}
        <div>
          <h1 className="font-serif text-3xl md:text-5xl font-bold text-slate-900 tracking-tight">
            Bus &amp; Transport
          </h1>
          <p className="font-kannada text-xs md:text-sm text-slate-500 mt-1 font-normal">
            ಬಸ್ ಮತ್ತು ಸಾರಿಗೆ ವ್ಯವಸ್ಥೆ · Pavagada Central Station &amp; Interstate Corridors
          </p>
        </div>

        {/* Responsive Statistics Section with 4 Cards (Screenshot 3 Reference) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {/* Card 1: Active Corridors */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs hover:border-slate-300 transition-colors flex flex-col justify-center">
            <span className="text-3xl md:text-4xl font-bold text-slate-900 font-sans tracking-tight">
              {stats.activeCorridors < 10 ? `0${stats.activeCorridors}` : stats.activeCorridors}
            </span>
            <span className="text-sm font-medium text-slate-500 mt-1">Active corridors</span>
          </div>

          {/* Card 2: Registered Stops */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs hover:border-slate-300 transition-colors flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
              <MapPin className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <span className="text-3xl md:text-4xl font-bold text-slate-900 font-sans tracking-tight block">
                {stats.registeredStops < 10 ? `0${stats.registeredStops}` : stats.registeredStops}
              </span>
              <span className="text-sm font-medium text-slate-500">Registered stops</span>
            </div>
          </div>

          {/* Card 3: Major Hubs */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs hover:border-slate-300 transition-colors flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
              <Landmark className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <span className="text-3xl md:text-4xl font-bold text-slate-900 font-sans tracking-tight block">
                {stats.majorHubs < 10 ? `0${stats.majorHubs}` : stats.majorHubs}
              </span>
              <span className="text-sm font-medium text-slate-500">Major hubs</span>
            </div>
          </div>

          {/* Card 4: Daily Trips */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs hover:border-slate-300 transition-colors flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <BarChart2 className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <span className="text-3xl md:text-4xl font-bold text-slate-900 font-sans tracking-tight block">
                {stats.dailyTrips < 10 ? `0${stats.dailyTrips}` : stats.dailyTrips}
              </span>
              <span className="text-sm font-medium text-slate-500">Daily trips</span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 2: NETWORK DIRECTORY & FILTER BAR (Screenshot 3 Reference)
      ========================================================================== */}
      <div className="space-y-4 pt-4">
        {/* Eyebrow & Directory Heading */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <div className="text-xs font-bold text-emerald-600 tracking-widest uppercase mb-1 font-sans">
              NETWORK DIRECTORY
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 font-serif tracking-tight">
              Explore corridors
            </h2>
          </div>
          <div className="text-xs md:text-sm font-medium text-slate-500 font-sans">
            {filteredRoutes.length} of {routes.length} corridors shown
          </div>
        </div>

        {/* Filter Tabs and Search Bar Row */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-2.5 md:p-3 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Operator Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {[
              { id: 'ALL', label: 'All Corridors' },
              { id: 'KSRTC', label: 'KSRTC' },
              { id: 'APSRTC', label: 'APSRTC' },
              { id: 'PRIVATE', label: 'Private' },
              { id: 'RAILWAYS', label: 'Rail' },
            ].map((tab) => {
              const isActive = operatorFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setOperatorFilter(tab.id)}
                  className={`text-xs md:text-sm font-semibold px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Search Input Box */}
          <div className="relative min-w-[240px] md:w-80 shrink-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search stop, town or code"
              className="w-full pl-10 pr-9 py-2 text-xs md:text-sm bg-slate-50/70 border border-slate-200/80 rounded-xl focus:outline-none focus:border-emerald-600 focus:bg-white text-slate-900 placeholder:text-slate-400 transition-all font-sans"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 3: ROUTE CORRIDOR CARDS (Screenshots 1 & 2 Reference)
      ========================================================================== */}
      {filteredRoutes.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-10 md:p-14 text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Bus className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-serif font-bold text-slate-900">
            {routes.length === 0 ? 'No Transport Corridors Available Yet' : 'No Corridors Match Your Search'}
          </h3>
          <p className="text-xs md:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            {routes.length === 0
              ? 'Transport corridor records are currently being published by the local transit administration.'
              : `No active corridors matched "${searchQuery}" under the selected operator filter.`}
          </p>
          {(operatorFilter !== 'ALL' || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setOperatorFilter('ALL');
                setSearchQuery('');
              }}
              className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {filteredRoutes.map((route) => {
            const isTimingsExpanded = expandedRouteTimings[route.id] ?? false;
            const journeyDuration = calculateJourneyDuration(route);
            const frequencySummary = getFrequencySummary(route);

            // Prepare stops sequence from backend stops or fallback to via
            const hasStops = Array.isArray(route.stops) && route.stops.length > 0;
            const orderedStops: Array<{
              id: string | number;
              name: string;
              kannadaName?: string;
              isMajorStop: boolean;
            }> = hasStops
              ? [...route.stops!]
                  .sort((a, b) => a.sequence - b.sequence)
                  .map((s, idx) => ({
                    id: s.id || s.stopId || idx,
                    name: cleanStationTitle(s.stopName),
                    kannadaName: s.kannadaName,
                    isMajorStop: s.isMajorStop || idx === 0 || idx === (route.stops?.length || 1) - 1,
                  }))
              : [
                  { id: 'src', name: cleanStationTitle(route.source), isMajorStop: true },
                  ...(route.via || []).map((v, i) => ({
                    id: `via-${i}`,
                    name: cleanStationTitle(v),
                    isMajorStop: false,
                  })),
                  { id: 'dest', name: cleanStationTitle(route.destination), isMajorStop: true },
                ];

            // Clean origin and destination display
            const originTitle = cleanStationTitle(route.source);
            const destinationTitle = cleanStationTitle(route.destination);

            return (
              <div
                key={route.id}
                className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-xs hover:border-slate-300 transition-all space-y-6"
              >
                {/* 1. Corridor Header with Operator Badge, Route Code, Title, and Right Summary Panel */}
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                  <div className="space-y-3">
                    {/* Badge & Route Code */}
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wider ${
                          route.operator?.toUpperCase() === 'KSRTC'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : route.operator?.toUpperCase() === 'APSRTC'
                            ? 'bg-sky-50 text-sky-700 border border-sky-200'
                            : route.operator?.toUpperCase() === 'PRIVATE'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        }`}
                      >
                        {route.operator || 'KSRTC'}
                      </span>
                      <span className="text-xs font-mono font-medium text-slate-400">
                        {route.routeCode}
                      </span>
                    </div>

                    {/* Origin -> Destination Title */}
                    <div className="flex flex-wrap items-center text-2xl md:text-3xl font-bold text-slate-900 tracking-tight font-sans">
                      <span>{originTitle}</span>
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 text-slate-400 text-sm mx-2.5 select-none font-sans font-bold">
                        →
                      </span>
                      <span>{destinationTitle}</span>
                    </div>
                  </div>

                  {/* Right Summary Panel: FREQUENCY & JOURNEY (Screenshots 1 & 2) */}
                  <div className="bg-slate-50/80 border border-slate-100 rounded-2xl px-5 py-3 flex items-center gap-6 shrink-0 self-start">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                        FREQUENCY
                      </span>
                      <span className="text-xs md:text-sm font-bold text-slate-800 whitespace-nowrap">
                        {frequencySummary}
                      </span>
                    </div>

                    {journeyDuration && (
                      <>
                        <div className="w-px h-8 bg-slate-200/80" />
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                            JOURNEY
                          </span>
                          <span className="text-xs md:text-sm font-bold text-slate-800 whitespace-nowrap">
                            {journeyDuration}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* 2. Route Timeline with Connecting Line, Circular Markers, and HUB labels */}
                <div className="pt-2 pb-2">
                  <div className="overflow-x-auto pb-4 pt-3 -mx-2 px-2 scrollbar-none">
                    <div className="relative flex items-start justify-between min-w-[580px] md:min-w-full px-4">
                      {/* Connecting Horizontal Line between first and last marker */}
                      <div className="absolute top-[8px] left-6 right-6 h-0.5 bg-emerald-200 -z-0" />

                      {orderedStops.map((stop, idx) => {
                        const isHub = stop.isMajorStop;

                        return (
                          <div
                            key={stop.id}
                            className="relative z-10 flex flex-col items-center text-center px-2 flex-1 min-w-[100px]"
                          >
                            {/* Stop Marker on the Line */}
                            <div className="flex items-center justify-center h-4.5 mb-2.5">
                              {isHub ? (
                                <div className="w-4.5 h-4.5 rounded-full border-2 border-emerald-600 bg-white flex items-center justify-center shadow-xs">
                                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                                </div>
                              ) : (
                                <div className="w-3.5 h-3.5 rounded-full border-2 border-emerald-400 bg-white shadow-2xs" />
                              )}
                            </div>

                            {/* Stop Name */}
                            <span
                              className="text-xs md:text-sm font-bold text-slate-800 block leading-snug"
                              title={stop.name}
                            >
                              {stop.name}
                            </span>

                            {/* Kannada Subtitle if available */}
                            {stop.kannadaName && (
                              <span className="text-[11px] text-slate-400 font-kannada mt-0.5 block">
                                {stop.kannadaName}
                              </span>
                            )}

                            {/* HUB Indicator */}
                            {isHub && (
                              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 mt-1 block">
                                HUB
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 3. Expandable Scheduled Departures Section (Screenshots 1 & 2) */}
                <div className="border-t border-slate-100 pt-5">
                  <button
                    type="button"
                    onClick={() => toggleTimings(route.id)}
                    className="w-full flex items-center justify-between group cursor-pointer focus:outline-none"
                    aria-expanded={isTimingsExpanded}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-full border border-emerald-500/80 flex items-center justify-center text-emerald-600">
                        <Clock className="w-3 h-3 stroke-[2.5]" />
                      </div>
                      <span className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                        Scheduled departures
                      </span>
                      <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200/60">
                        {route.timings?.length || 0} trips
                      </span>
                    </div>

                    <div className="text-slate-400 group-hover:text-slate-700 transition-colors">
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                          isTimingsExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </button>

                  {/* Expanded Departures Table */}
                  {isTimingsExpanded && (
                    <div className="mt-4 pt-1 animate-fadeIn">
                      {route.timings && route.timings.length > 0 ? (
                        <div className="divide-y divide-slate-100 border-t border-slate-100">
                          {route.timings.map((timing) => (
                            <div
                              key={timing.id}
                              className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 px-3 rounded-xl transition-colors"
                            >
                              {/* Departure -> Arrival */}
                              <div className="flex items-baseline gap-2 min-w-[210px]">
                                <span className="text-lg font-bold text-slate-900 font-sans tracking-tight">
                                  {timing.departureTime}
                                </span>
                                {timing.arrivalTime && (
                                  <>
                                    <span className="text-slate-400 font-medium">→</span>
                                    <span className="text-sm font-medium text-slate-500">
                                      {timing.arrivalTime}
                                    </span>
                                  </>
                                )}
                              </div>

                              {/* Service Type Badge & Notes */}
                              <div className="flex-1 sm:px-4">
                                <div className="flex flex-wrap items-center gap-2.5">
                                  <span
                                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                                      timing.busType?.toUpperCase() === 'EXPRESS'
                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                        : timing.busType?.toUpperCase() === 'RAJAHAMSA'
                                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                                    }`}
                                  >
                                    {timing.busType || 'ORDINARY'}
                                  </span>

                                  {timing.remarks ? (
                                    <span className="text-xs text-slate-500 font-sans">
                                      {timing.remarks}
                                    </span>
                                  ) : (
                                    <span className="text-xs text-slate-400 font-sans">
                                      All scheduled stops
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Operating Days */}
                              <div className="text-left sm:text-right shrink-0">
                                <span className="text-xs font-medium text-slate-500 font-sans">
                                  {formatOperatingDays(timing.dayType)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 mt-2 rounded-2xl bg-slate-50 border border-slate-200/60 text-xs text-slate-500 italic text-center">
                          No scheduled departure records currently published for this corridor.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
