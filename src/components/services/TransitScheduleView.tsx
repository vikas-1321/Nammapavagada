import React, { useState, useMemo } from 'react';
import { TransitScheduleItem, TransitTiming } from '../../types/service';
import {
  Bus,
  MapPin,
  Clock,
  ChevronDown,
  Search,
  X,
  RotateCw,
  AlertCircle,
  Phone,
  Info,
  Calendar,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Flag,
} from 'lucide-react';
import { useFeedback } from '../../context/FeedbackContext';

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

// Clean station titles without repeating boilerplate
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

// Parse departure time string into minutes from midnight for accurate chronological sorting
const parseTimeToMinutes = (timeStr?: string): number => {
  if (!timeStr) return 9999;
  const clean = timeStr.trim().toUpperCase();
  const match = clean.match(/(\d{1,2}):(\d{2})(?:\s*([AP]M))?/);
  if (!match) return 9999;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const meridiem = match[3];

  if (meridiem === 'PM' && hours < 12) hours += 12;
  if (meridiem === 'AM' && hours === 12) hours = 0;
  // If 24-hour format (e.g. 13:30, 19:15)
  return hours * 60 + minutes;
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

type FilterCategory = 'ALL' | 'DEPARTING' | 'PASSING' | 'EXPRESS' | 'ORDINARY' | 'NON_STOP';

export const TransitScheduleView: React.FC<TransitScheduleViewProps> = ({
  routes,
  registeredStopsCount,
  onRefresh,
  isRefreshing = false,
  isApiLoaded = false,
  isLoading = false,
  error = null,
}) => {
  const { openFeedback } = useFeedback();
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedRouteTimings, setExpandedRouteTimings] = useState<Record<string, boolean>>({});

  // Flatten all timings across all routes to calculate comprehensive stats
  const allTimings = useMemo(() => {
    const list: TransitTiming[] = [];
    routes.forEach((r) => {
      if (r.timings && Array.isArray(r.timings)) {
        list.push(...r.timings);
      }
    });
    return list;
  }, [routes]);

  // Dynamic statistics calculated strictly from the imported records
  const stats = useMemo(() => {
    const totalEntries = allTimings.length;

    // Distinct destinations
    const destinations = new Set<string>();
    allTimings.forEach((t) => {
      const dest = t.sourceDestination || routes.find((r) => r.id === t.routeId)?.destination;
      if (dest) destinations.add(dest.trim());
    });
    if (destinations.size === 0) {
      routes.forEach((r) => {
        if (r.destination) destinations.add(r.destination.trim());
      });
    }

    // Service class counts
    let expressCount = 0;
    let ordinaryCount = 0;
    let nonStopCount = 0;
    let departingCount = 0;
    let passingCount = 0;

    allTimings.forEach((t) => {
      const sClass = (t.serviceClass || t.busType || '').toLowerCase();
      if (sClass.includes('non-stop') || sClass.includes('non stop') || sClass === 'nonstop') {
        nonStopCount++;
      } else if (sClass.includes('express')) {
        expressCount++;
      } else {
        ordinaryCount++;
      }

      const isPassing =
        t.routeClassification === 'PASSING_THROUGH' ||
        (t.sourceOrigin && t.sourceOrigin.toLowerCase() !== 'pavagada');
      if (isPassing) {
        passingCount++;
      } else {
        departingCount++;
      }
    });

    return {
      totalEntries,
      distinctDestinations: destinations.size,
      expressCount,
      ordinaryCount,
      nonStopCount,
      departingCount,
      passingCount,
      totalRoutes: routes.length,
    };
  }, [routes, allTimings]);

  // Filter routes and their timings based on both the selected filter and search query
  const filteredRoutes = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return routes
      .map((route) => {
        const timings = route.timings || [];

        // Filter timings inside the route
        const matchingTimings = timings.filter((timing) => {
          // 1. Filter Tab Match
          if (activeFilter === 'DEPARTING') {
            const isPassing =
              timing.routeClassification === 'PASSING_THROUGH' ||
              (timing.sourceOrigin && timing.sourceOrigin.toLowerCase() !== 'pavagada');
            if (isPassing) return false;
          } else if (activeFilter === 'PASSING') {
            const isPassing =
              timing.routeClassification === 'PASSING_THROUGH' ||
              (timing.sourceOrigin && timing.sourceOrigin.toLowerCase() !== 'pavagada');
            if (!isPassing) return false;
          } else if (activeFilter === 'EXPRESS') {
            const cls = (timing.serviceClass || timing.busType || '').toLowerCase();
            if (!cls.includes('express')) return false;
          } else if (activeFilter === 'ORDINARY') {
            const cls = (timing.serviceClass || timing.busType || '').toLowerCase();
            if (cls.includes('express') || cls.includes('non-stop')) return false;
          } else if (activeFilter === 'NON_STOP') {
            const cls = (timing.serviceClass || timing.busType || '').toLowerCase();
            if (!cls.includes('non-stop') && !cls.includes('non stop')) return false;
          }

          // 2. Search Query Match
          if (query) {
            const orig = (timing.sourceOrigin || route.source || '').toLowerCase();
            const dest = (timing.sourceDestination || route.destination || '').toLowerCase();
            const via = (timing.viaPlace || (route.via ? route.via.join(' ') : '')).toLowerCase();
            const sClass = (timing.serviceClass || timing.busType || '').toLowerCase();
            const depTime = (timing.departureTime || '').toLowerCase();
            const slNo = timing.serialNumber ? timing.serialNumber.toString() : '';

            const matchesTiming =
              dest.includes(query) ||
              orig.includes(query) ||
              via.includes(query) ||
              sClass.includes(query) ||
              depTime.includes(query) ||
              slNo === query;

            if (!matchesTiming) return false;
          }

          return true;
        });

        // Check if route itself matches query (for routes with no timings or general title matches)
        const routeMatchesQuery = query
          ? route.source.toLowerCase().includes(query) ||
            route.destination.toLowerCase().includes(query) ||
            route.routeCode.toLowerCase().includes(query) ||
            (route.via && route.via.some((v) => v.toLowerCase().includes(query)))
          : true;

        // If filter tab is set to DEPARTING / PASSING, route level check
        const isRoutePassing =
          route.routeClassification === 'PASSING_THROUGH' ||
          route.source.toLowerCase() !== 'pavagada';
        let routeMatchesFilter = true;
        if (activeFilter === 'DEPARTING' && isRoutePassing) routeMatchesFilter = false;
        if (activeFilter === 'PASSING' && !isRoutePassing) routeMatchesFilter = false;

        // Keep route if it has matching timings, or if no timings exist but route matches query & filter
        const shouldInclude =
          matchingTimings.length > 0 || (timings.length === 0 && routeMatchesQuery && routeMatchesFilter);

        if (!shouldInclude) return null;

        // Sort matched timings chronologically while preserving serial numbers
        const sortedTimings = [...matchingTimings].sort(
          (a, b) => parseTimeToMinutes(a.departureTime) - parseTimeToMinutes(b.departureTime)
        );

        return {
          ...route,
          matchedTimings: sortedTimings,
        };
      })
      .filter((r): r is TransitScheduleItem & { matchedTimings: TransitTiming[] } => r !== null);
  }, [routes, activeFilter, searchQuery]);

  // Total filtered timings count
  const totalFilteredTimingsCount = useMemo(() => {
    return filteredRoutes.reduce((acc, r) => acc + (r.matchedTimings?.length || 0), 0);
  }, [filteredRoutes]);

  const toggleTimings = (routeId: string) => {
    setExpandedRouteTimings((prev) => ({
      ...prev,
      [routeId]: !(prev[routeId] ?? true), // Default to expanded for immediate timetable clarity
    }));
  };

  // Loading Skeleton State
  if (isLoading && routes.length === 0) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-slate-200/80 rounded-xl w-64" />
        <div className="h-10 bg-white rounded-xl border border-slate-200" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 bg-white rounded-3xl border border-slate-200" />
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
        <h3 className="text-lg font-serif font-bold text-slate-900">Unable to Load Bus Timetable</h3>
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
    <div className="space-y-5 animate-fadeIn">
      {/* =========================================================================
          SECTION A: CLEAN COMPACT HEADER & INQUIRY PILL
      ========================================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 tracking-wider uppercase font-sans">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              KSRTC · Chitradurga Division
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-[11px] text-slate-500 font-medium">Pavagada Bus Stand</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex flex-wrap items-baseline gap-2">
            <span>Bus &amp; Transport</span>
            <span className="font-kannada text-sm sm:text-base font-normal text-slate-500">
              (ಅಧಿಕೃತ ಬಸ್ ವೇಳಾಪಟ್ಟಿ)
            </span>
          </h1>
        </div>

        {/* Action Buttons: Compact Inquiry Call & Refresh */}
        <div className="flex items-center gap-2 shrink-0">
          <a
            href="tel:7760990864"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 rounded-full text-xs font-semibold transition-colors shadow-2xs"
            title="Call Pavagada Bus Stand Official Inquiry"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-600" />
            <span>Inquiry: <strong className="font-mono">7760990864</strong></span>
          </a>

          {onRefresh && (
            <button
              type="button"
              onClick={() => onRefresh()}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-600 text-xs font-medium rounded-full border border-slate-200 transition-colors shadow-2xs disabled:opacity-50 cursor-pointer"
              title="Refresh timetable"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          )}
        </div>
      </div>

      {/* =========================================================================
          SECTION B: COMPACT TOOLBAR (FILTERS + COMPACT SEARCH INPUT)
      ========================================================================== */}
      <div className="space-y-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {[
              { id: 'ALL' as FilterCategory, label: 'All Buses', count: stats.totalEntries },
              { id: 'DEPARTING' as FilterCategory, label: 'Departing', count: stats.departingCount },
              { id: 'PASSING' as FilterCategory, label: 'Passing', count: stats.passingCount },
              { id: 'EXPRESS' as FilterCategory, label: 'Express', count: stats.expressCount },
              { id: 'ORDINARY' as FilterCategory, label: 'Ordinary', count: stats.ordinaryCount },
              { id: 'NON_STOP' as FilterCategory, label: 'Non-Stop', count: stats.nonStopCount },
            ].map((tab) => {
              const isActive = activeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveFilter(tab.id)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200/80'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Compact Search Bar */}
          <div className="relative w-full md:w-64 lg:w-72 shrink-0">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search destination or bus..."
              className="w-full pl-8 pr-7 py-1.5 text-xs bg-white border border-slate-200/90 rounded-xl focus:outline-none focus:border-emerald-600 text-slate-900 placeholder:text-slate-400 transition-all font-sans shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Departure count readout */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 px-0.5">
          <span>
            Showing <strong className="text-slate-800 font-semibold">{totalFilteredTimingsCount}</strong> departures across{' '}
            <strong className="text-slate-800 font-semibold">{filteredRoutes.length}</strong> routes
          </span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-emerald-700 hover:underline text-[11px]"
            >
              Clear filter
            </button>
          )}
        </div>
      </div>

      {/* =========================================================================
          SECTION D & E: CORRIDOR CARDS WITH EXPANDABLE SCHEDULED DEPARTURES
      ========================================================================== */}
      {filteredRoutes.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-10 md:p-14 text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Bus className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-serif font-bold text-slate-900">
            {routes.length === 0 ? 'No Timetable Records Available Yet' : 'No Buses Match Your Search'}
          </h3>
          <p className="text-xs md:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            {routes.length === 0
              ? 'Bus timetable records are being synchronized with the Chitradurga Division database.'
              : `No bus services matched "${searchQuery}" under the "${activeFilter}" filter.`}
          </p>
          {(activeFilter !== 'ALL' || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setActiveFilter('ALL');
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
            const isTimingsExpanded = expandedRouteTimings[route.id] ?? true;
            const timings = route.matchedTimings || [];
            const isPassingThrough =
              route.routeClassification === 'PASSING_THROUGH' ||
              route.source.toLowerCase() !== 'pavagada';

            // Clean origin and destination display
            const originTitle = cleanStationTitle(route.source);
            const destinationTitle = cleanStationTitle(route.destination);
            const viaText = route.via && route.via.length > 0 ? route.via.join(', ') : '';

            // Unique service classes operating on this route
            const routeClasses = Array.from(
              new Set(
                timings
                  .map((t) => t.serviceClass || t.busType)
                  .filter((c): c is string => Boolean(c))
              )
            );

            return (
              <div
                key={route.id}
                className="bg-white border border-slate-200/80 rounded-3xl p-5 md:p-7 shadow-xs hover:border-slate-300 transition-all space-y-5"
              >
                {/* 1. Corridor Header with Badges, Title, and Right Summary Panel */}
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="space-y-2.5">
                    {/* Badge Row */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {route.operator || 'KSRTC'}
                      </span>

                      {/* Route Classification Badge */}
                      {isPassingThrough ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-300 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          <span>PASSING THROUGH PAVAGADA</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider bg-sky-50 text-sky-800 border border-sky-200">
                          DEPARTING PAVAGADA
                        </span>
                      )}

                      {/* Service Classes on this Route */}
                      {routeClasses.map((cls) => (
                        <span
                          key={cls}
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200"
                        >
                          {cls}
                        </span>
                      ))}

                      <span className="text-xs font-mono font-medium text-slate-400">
                        {route.routeCode}
                      </span>
                    </div>

                    {/* Origin -> Destination Title */}
                    <div className="flex flex-wrap items-center text-xl md:text-2xl font-bold text-slate-900 tracking-tight font-sans">
                      <span>{originTitle}</span>
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-400 text-xs mx-2 select-none font-bold">
                        →
                      </span>
                      <span>{destinationTitle}</span>
                    </div>

                    {/* Via Location if recorded */}
                    {viaText && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>Via: <strong className="text-slate-700">{viaText}</strong></span>
                      </div>
                    )}
                  </div>

                  {/* Right Summary Badge: Trip Count */}
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-2.5 flex items-center gap-4 shrink-0 self-start">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                        SCHEDULED DEPARTURES
                      </span>
                      <span className="text-sm font-bold text-slate-900 font-sans">
                        {timings.length} {timings.length === 1 ? 'service' : 'services'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Passing Through Transparency Warning */}
                {isPassingThrough && (
                  <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2.5">
                    <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      <strong>Passing-Through Notice:</strong> This bus originates at <strong className="text-amber-950">{originTitle}</strong> and passes through Pavagada Bus Stand en route to <strong className="text-amber-950">{destinationTitle}</strong>.
                      The printed timetable time reflects the origin departure; arrival/departure at Pavagada Bus Stand may vary and requires local confirmation.
                    </p>
                  </div>
                )}

                {/* 3. Expandable Scheduled Departures Section */}
                <div className="border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    onClick={() => toggleTimings(route.id)}
                    className="w-full flex items-center justify-between group cursor-pointer focus:outline-none py-1"
                    aria-expanded={isTimingsExpanded}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full border border-emerald-500/80 flex items-center justify-center text-emerald-600">
                        <Clock className="w-3 h-3 stroke-[2.5]" />
                      </div>
                      <span className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                        Timetable Departures
                      </span>
                      <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200/60">
                        {timings.length}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-400 group-hover:text-slate-700 transition-colors">
                      <span>{isTimingsExpanded ? 'Hide' : 'Show'} timetable</span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                          isTimingsExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </button>

                  {/* Departures Grid/Table */}
                  {isTimingsExpanded && (
                    <div className="mt-3 pt-1 animate-fadeIn">
                      {timings.length > 0 ? (
                        <div className="divide-y divide-slate-100 border-t border-slate-100">
                          {timings.map((timing) => {
                            const isPassingRow =
                              timing.routeClassification === 'PASSING_THROUGH' ||
                              (timing.sourceOrigin && timing.sourceOrigin.toLowerCase() !== 'pavagada');
                            const sClass = timing.serviceClass || timing.busType || 'Ordinary';

                            return (
                              <div
                                key={timing.id || timing.serialNumber}
                                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 px-3 rounded-xl transition-colors"
                              >
                                {/* Left: Serial Number & Departure Time */}
                                <div className="flex items-center gap-3 min-w-[200px]">
                                  {timing.serialNumber && (
                                    <span
                                      className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200"
                                      title={`Official Timetable Serial Number #${timing.serialNumber}`}
                                    >
                                      SL #{timing.serialNumber}
                                    </span>
                                  )}

                                  <div className="flex items-baseline gap-1.5">
                                    <span className="text-lg font-bold text-slate-900 font-mono tracking-tight">
                                      {timing.departureTime}
                                    </span>
                                    {isPassingRow && (
                                      <span className="text-[10px] text-amber-700 bg-amber-100/70 px-1.5 py-0.5 rounded font-medium">
                                        Origin Time
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Middle: Service Class Badge & Route details */}
                                <div className="flex-1 sm:px-2">
                                  <div className="flex flex-wrap items-center gap-2">
                                    {/* Service Class Badge */}
                                    <span
                                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                                        sClass.toLowerCase().includes('non-stop')
                                          ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                          : sClass.toLowerCase().includes('express')
                                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                                      }`}
                                    >
                                      {sClass}
                                    </span>

                                    {/* Via place */}
                                    {timing.viaPlace && (
                                      <span className="text-xs text-slate-600 font-medium flex items-center gap-1">
                                        <span>via {timing.viaPlace}</span>
                                      </span>
                                    )}

                                    {/* Origin & Destination if passing through */}
                                    {isPassingRow && timing.sourceOrigin && (
                                      <span className="text-[11px] text-slate-500 font-sans italic">
                                        ({timing.sourceOrigin} → {timing.sourceDestination})
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Right: Provenance Tag & Days */}
                                <div className="flex items-center gap-3 text-left sm:text-right shrink-0">
                                  <span className="text-[11px] text-slate-400 font-mono" title="Source document page">
                                    Page {timing.sourcePage || 1}
                                  </span>

                                  <span className="text-xs font-medium text-slate-600 font-sans bg-slate-100 px-2 py-0.5 rounded">
                                    {formatOperatingDays(timing.dayType)}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="p-4 mt-2 rounded-2xl bg-slate-50 border border-slate-200/60 text-xs text-slate-500 italic text-center">
                          No scheduled departures match the active search or filter.
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 4. Contextual Issue Report Link */}
                <div className="pt-2 flex items-center justify-end border-t border-slate-50">
                  <button
                    type="button"
                    onClick={() => openFeedback({
                      category: 'INCORRECT_INFO',
                      relatedEntityType: 'BUS_ROUTE',
                      relatedEntityId: route.id,
                      relatedEntityName: `${originTitle} → ${destinationTitle} (${route.routeCode})`,
                      defaultMessage: `I noticed incorrect bus timing or stop info on the route ${originTitle} to ${destinationTitle}: `,
                    })}
                    className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 hover:text-terracotta transition-colors px-2 py-1 rounded-lg hover:bg-slate-50 cursor-pointer"
                    title="Report outdated bus timing or missing stop on this route"
                  >
                    <Flag className="w-3.5 h-3.5" />
                    <span>Report incorrect timing</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Subtle bottom citation */}
      <div className="pt-6 pb-2 text-center text-xs text-slate-400 border-t border-slate-200/60 flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
        <span>Source: Pavagada Bus Stand Official Timetable · Chitradurga Division</span>
        <span>·</span>
        <a href="tel:7760990864" className="hover:text-slate-600 transition-colors">
          Helpdesk / Inquiry: 7760990864
        </a>
      </div>
    </div>
  );
};
