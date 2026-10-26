import React, { useState, useMemo, useCallback } from 'react';
import { TransitScheduleItem, TransitTiming } from '../../types/service';
import { useFeedback } from '../../context/FeedbackContext';
import {
  ArrowLeft,
  Phone,
  RotateCw,
  Search,
  Clock,
  Flag,
  X,
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

type FilterCategory = 'All Buses' | 'Departing' | 'Passing' | 'Express' | 'Ordinary' | 'Non-Stop';

// Parse departure time to minutes from midnight for accurate chronological sorting
const parseTimeToMinutes = (timeStr?: string): number => {
  if (!timeStr) return 9999;
  const match = timeStr.trim().match(/(\d{1,2}):(\d{2})(?:\s*([APap][Mm]))?/);
  if (!match) return 9999;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const meridiem = match[3]?.toUpperCase();
  if (meridiem === 'PM' && hours < 12) hours += 12;
  if (meridiem === 'AM' && hours === 12) hours = 0;
  return hours * 60 + minutes;
};

// Clean station title for display
const cleanStationTitle = (name: string): string => {
  if (!name) return '';
  return name
    .replace(/\s*\(Kempegowda Bus Station \/ Majestic\)/gi, '')
    .replace(/\s*\(Majestic\)/gi, '')
    .replace(/\s*KSRTC Bus Station/gi, '')
    .replace(/\s*Central Bus Stand/gi, '')
    .replace(/\s*Bus Station/gi, '')
    .replace(/\s*Bus Stand/gi, '')
    .replace(/\s*Bus Stop/gi, '')
    .trim();
};

// Determine intermediate via places
const getViaDisplay = (route: TransitScheduleItem): string => {
  const isPassing =
    route.routeClassification === 'PASSING_THROUGH' ||
    !route.source.toLowerCase().includes('pavagada');

  let viaList: string[] = [];
  if (Array.isArray(route.via) && route.via.length > 0) {
    viaList = [...route.via];
  } else if (route.stops && route.stops.length > 2) {
    viaList = route.stops
      .slice(1, -1)
      .map((s) => s.stopName.replace(/ Bus (Stand|Stop|Station)$/i, ''));
  }

  if (isPassing) {
    const hasPavagadaInVia = viaList.some((v) => v.toLowerCase().includes('pavagada'));
    if (!hasPavagadaInVia) {
      viaList.unshift('Pavagada Bus Stand');
    }
  }

  return viaList.length > 0 ? viaList.join(', ') : 'Direct highway route';
};

// Helper to determine the primary service type for a route card header
const getPrimaryServiceType = (route: TransitScheduleItem): string => {
  if (!route.timings || route.timings.length === 0) {
    return 'ORDINARY';
  }
  const counts: Record<string, number> = {};
  for (const t of route.timings) {
    const sc = (t.serviceClass || t.busType || 'ORDINARY').toUpperCase();
    counts[sc] = (counts[sc] || 0) + 1;
  }
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return sorted[0]?.[0] || 'ORDINARY';
};

export const TransitScheduleView: React.FC<TransitScheduleViewProps> = ({
  routes,
  onRefresh,
  isRefreshing = false,
  isLoading = false,
  error = null,
  onBackToDirectory,
}) => {
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('All Buses');
  const [query, setQuery] = useState<string>('');
  const [expandedRoutes, setExpandedRoutes] = useState<Record<string, boolean>>({});
  const [justRefreshed, setJustRefreshed] = useState<boolean>(false);

  // Hook into central feedback system for reporting incorrect bus timings
  let feedbackContext: ReturnType<typeof useFeedback> | null = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    feedbackContext = useFeedback();
  } catch {
    feedbackContext = null;
  }

  const handleRefresh = useCallback(async () => {
    if (onRefresh) {
      await onRefresh();
    }
    setJustRefreshed(true);
    setTimeout(() => setJustRefreshed(false), 1500);
  }, [onRefresh]);

  const toggleTimetable = (routeId: string) => {
    setExpandedRoutes((prev) => ({
      ...prev,
      [routeId]: !prev[routeId],
    }));
  };

  const handleReportTiming = (route: TransitScheduleItem) => {
    if (feedbackContext) {
      feedbackContext.openFeedback({
        category: 'INCORRECT_INFO',
        relatedEntityType: 'TRANSIT_BUS',
        relatedEntityId: route.id,
        relatedEntityName: `${route.source} → ${route.destination} (${route.routeCode})`,
        defaultMessage: `I want to report an incorrect timing or missing service on route ${route.routeCode} (${route.source} to ${route.destination}):\n\n- Correct departure time:\n- Service type:\n- Details:`,
      });
    } else {
      window.location.href = `mailto:admin@nammapavagada.in?subject=Report%20Incorrect%20Bus%20Timing%20${encodeURIComponent(
        route.routeCode
      )}&body=${encodeURIComponent(
        `Route: ${route.source} to ${route.destination} (${route.routeCode})\n\nPlease describe the correction:`
      )}`;
    }
  };

  // Compute dynamic counts from authentic backend data
  const filterCounts = useMemo(() => {
    let allCount = 0;
    let departingCount = 0;
    let passingCount = 0;
    let expressCount = 0;
    let ordinaryCount = 0;
    let nonStopCount = 0;

    routes.forEach((route) => {
      const isDeparting =
        route.routeClassification === 'DEPARTING' ||
        route.source.toLowerCase().includes('pavagada');

      const timings = route.timings || [];
      const routeTimingsCount = timings.length;

      allCount += routeTimingsCount;
      if (isDeparting) {
        departingCount += routeTimingsCount;
      } else {
        passingCount += routeTimingsCount;
      }

      timings.forEach((t) => {
        const sc = (t.serviceClass || t.busType || '').toLowerCase();
        if (sc.includes('non-stop') || sc.includes('nonstop')) {
          nonStopCount++;
        } else if (sc.includes('express')) {
          expressCount++;
        } else if (sc.includes('ordinary') || !sc) {
          ordinaryCount++;
        } else {
          ordinaryCount++;
        }
      });
    });

    return {
      'All Buses': allCount,
      Departing: departingCount,
      Passing: passingCount,
      Express: expressCount,
      Ordinary: ordinaryCount,
      'Non-Stop': nonStopCount,
    };
  }, [routes]);

  const filterTabs: Array<{ label: FilterCategory; count: number }> = [
    { label: 'All Buses', count: filterCounts['All Buses'] },
    { label: 'Departing', count: filterCounts['Departing'] },
    { label: 'Passing', count: filterCounts['Passing'] },
    { label: 'Express', count: filterCounts['Express'] },
    { label: 'Ordinary', count: filterCounts['Ordinary'] },
    { label: 'Non-Stop', count: filterCounts['Non-Stop'] },
  ];

  // Filter routes based on selected tab and search query
  const filteredRoutes = useMemo(() => {
    const q = query.toLowerCase().trim();

    return routes.filter((route) => {
      const isDeparting =
        route.routeClassification === 'DEPARTING' ||
        route.source.toLowerCase().includes('pavagada');
      const isPassing = !isDeparting;

      const timings = route.timings || [];

      // Category tab filtering
      if (activeFilter === 'Departing' && !isDeparting) return false;
      if (activeFilter === 'Passing' && !isPassing) return false;
      if (activeFilter === 'Express') {
        const hasExpress = timings.some((t) =>
          (t.serviceClass || t.busType || '').toLowerCase().includes('express')
        );
        if (!hasExpress) return false;
      }
      if (activeFilter === 'Ordinary') {
        const hasOrdinary = timings.some((t) => {
          const sc = (t.serviceClass || t.busType || '').toLowerCase();
          return sc.includes('ordinary') || !sc;
        });
        if (!hasOrdinary) return false;
      }
      if (activeFilter === 'Non-Stop') {
        const hasNonStop = timings.some((t) => {
          const sc = (t.serviceClass || t.busType || '').toLowerCase();
          return sc.includes('non-stop') || sc.includes('nonstop');
        });
        if (!hasNonStop) return false;
      }

      // Search query filtering
      if (q) {
        const srcMatch = route.source?.toLowerCase().includes(q);
        const destMatch = route.destination?.toLowerCase().includes(q);
        const codeMatch = route.routeCode?.toLowerCase().includes(q);
        const opMatch = route.operator?.toLowerCase().includes(q);
        const viaMatch = Array.isArray(route.via) && route.via.some((v) => v.toLowerCase().includes(q));
        const stopMatch =
          Array.isArray(route.stops) &&
          route.stops.some(
            (s) =>
              s.stopName?.toLowerCase().includes(q) ||
              (s.kannadaName && s.kannadaName.toLowerCase().includes(q))
          );
        const timingMatch = timings.some(
          (t) =>
            t.remarks?.toLowerCase().includes(q) ||
            t.viaPlace?.toLowerCase().includes(q) ||
            t.departureTime?.toLowerCase().includes(q)
        );

        if (!srcMatch && !destMatch && !codeMatch && !opMatch && !viaMatch && !stopMatch && !timingMatch) {
          return false;
        }
      }

      return true;
    });
  }, [routes, activeFilter, query]);

  // Compute total departures in filtered view
  const filteredDeparturesCount = useMemo(() => {
    return filteredRoutes.reduce((acc, r) => {
      const timings = r.timings || [];
      if (activeFilter === 'All Buses' || activeFilter === 'Departing' || activeFilter === 'Passing') {
        return acc + timings.length;
      }
      if (activeFilter === 'Express') {
        return (
          acc +
          timings.filter((t) =>
            (t.serviceClass || t.busType || '').toLowerCase().includes('express')
          ).length
        );
      }
      if (activeFilter === 'Ordinary') {
        return (
          acc +
          timings.filter((t) => {
            const sc = (t.serviceClass || t.busType || '').toLowerCase();
            return sc.includes('ordinary') || !sc;
          }).length
        );
      }
      if (activeFilter === 'Non-Stop') {
        return (
          acc +
          timings.filter((t) => {
            const sc = (t.serviceClass || t.busType || '').toLowerCase();
            return sc.includes('non-stop') || sc.includes('nonstop');
          }).length
        );
      }
      return acc + timings.length;
    }, 0);
  }, [filteredRoutes, activeFilter]);

  // Helper to group timings by service class for the expanded timetable view
  const groupRouteTimings = (timings?: TransitTiming[]) => {
    if (!timings || timings.length === 0) return [];

    const express: TransitTiming[] = [];
    const nonStop: TransitTiming[] = [];
    const ordinary: TransitTiming[] = [];
    const others: TransitTiming[] = [];

    const sorted = [...timings].sort(
      (a, b) => parseTimeToMinutes(a.departureTime) - parseTimeToMinutes(b.departureTime)
    );

    sorted.forEach((t) => {
      const sc = (t.serviceClass || t.busType || '').toLowerCase();
      if (sc.includes('non-stop') || sc.includes('nonstop')) {
        nonStop.push(t);
      } else if (sc.includes('express')) {
        express.push(t);
      } else if (sc.includes('ordinary') || !sc) {
        ordinary.push(t);
      } else {
        others.push(t);
      }
    });

    const groups = [];
    if (express.length > 0) {
      groups.push({
        key: 'EXPRESS',
        label: 'EXPRESS',
        badgeClass: 'bg-[#e3ece6] text-[#356046]',
        borderClass: 'border-[#dce5de]',
        chipBg: 'bg-[#f3f6f3] text-[#233329]',
        count: express.length,
        timings: express,
      });
    }
    if (nonStop.length > 0) {
      groups.push({
        key: 'NON-STOP',
        label: 'NON-STOP',
        badgeClass: 'bg-[#f2ede1] text-[#6f5a2c]',
        borderClass: 'border-[#e3ded1]',
        chipBg: 'bg-[#f7f5f0] text-[#3b3425]',
        count: nonStop.length,
        timings: nonStop,
      });
    }
    if (ordinary.length > 0) {
      groups.push({
        key: 'ORDINARY',
        label: 'ORDINARY',
        badgeClass: 'bg-[#eceef2] text-[#505b70]',
        borderClass: 'border-[#dedfe3]',
        chipBg: 'bg-[#f3f4f6] text-[#303746]',
        count: ordinary.length,
        timings: ordinary,
      });
    }
    if (others.length > 0) {
      groups.push({
        key: 'OTHER',
        label: 'SPECIAL',
        badgeClass: 'bg-[#f0f2f0] text-[#3f4a42]',
        borderClass: 'border-[#d9ddd9]',
        chipBg: 'bg-[#f4f6f4] text-[#27332a]',
        count: others.length,
        timings: others,
      });
    }
    return groups;
  };

  // Loading skeleton state
  if (isLoading && routes.length === 0) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-slate-200/80 rounded-lg" />
        <div className="h-12 w-64 bg-slate-200/80 rounded-lg" />
        <div className="h-10 w-full bg-slate-200/80 rounded-full" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 bg-white rounded-xl border border-[#dcdad3] p-5" />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error && routes.length === 0) {
    return (
      <div className="bg-white border border-red-200 rounded-2xl p-8 text-center space-y-4 max-w-lg mx-auto shadow-sm">
        <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-serif font-bold text-slate-900">Unable to Load Bus Timetable</h3>
        <p className="text-xs text-slate-600 leading-relaxed font-sans">{error}</p>
        {onRefresh && (
          <button
            type="button"
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#173d2a] text-white text-xs font-semibold rounded-lg hover:bg-[#0e2f1e] transition-colors cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Retry Connection</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn text-[#19211c]">
      {/* =========================================================================
          1. TOP NAVIGATION BAR (Matching Reference Screenshots)
      ========================================================================== */}
      {onBackToDirectory && (
        <nav
          className="border-b border-[#dedbd3] -mx-4 md:-mx-8 lg:-mx-12 px-5 py-3.5 sm:px-8 lg:px-12 bg-[#fbf9f5]/90 mb-2"
          aria-label="Category Navigation"
        >
          <div className="mx-auto flex max-w-[1440px] items-center justify-between">
            <button
              type="button"
              onClick={onBackToDirectory}
              className="flex items-center gap-1.5 text-[12px] font-semibold text-[#566159] transition-colors hover:text-[#15241a] cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to All Categories</span>
            </button>
            <p className="hidden text-[10px] font-bold tracking-[0.18em] text-[#8b8f88] uppercase sm:block font-sans">
              Transit Corridors <span className="px-1 text-[#b2b3ae]">·</span> Pavagada Central Station
            </p>
          </div>
        </nav>
      )}

      {/* =========================================================================
          2. PAGE HEADER (Matching Screenshot 3 & 2)
      ========================================================================== */}
      <header className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          {/* Top identification label with status indicator dot */}
          <div className="mb-3 flex items-center gap-2 text-[11px] font-bold tracking-[0.11em] text-[#657068] uppercase font-sans">
            <span className="h-2 w-2 rounded-full bg-[#4b8f63] shadow-[0_0_0_3px_#dfece2]" />
            <span>KSRTC · Chitradurga Division · Pavagada Bus Stand</span>
          </div>

          {/* Main Title */}
          <h1 className="font-serif text-[42px] leading-none font-semibold tracking-[-0.035em] text-[#18221b] sm:text-[52px]">
            Bus &amp; Transport
          </h1>

          {/* Kannada Subtitle */}
          <p className="mt-2 text-sm font-medium text-[#777d77] font-kannada">
            (ಬಸ್ ಮತ್ತು ಸಾರಿಗೆ)
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Official Inquiry Contact */}
          <a
            href="tel:08136244888"
            className="flex h-10 items-center gap-2 rounded-lg border border-[#d3d6d0] bg-white px-4 text-xs font-semibold text-[#334039] shadow-[0_1px_2px_rgba(25,33,28,0.04)] transition hover:border-[#aeb7b0]"
            title="Call official inquiry desk"
          >
            <Phone className="w-3.5 h-3.5 text-[#657068]" />
            <span>
              <span className="text-[#777d77] font-normal">Inquiry:</span> 08136 244 888
            </span>
          </a>

          {/* Real Refresh Action */}
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex h-10 items-center gap-2 rounded-lg bg-[#173d2a] px-4 text-xs font-semibold text-white transition hover:bg-[#0e2f1e] disabled:opacity-60 cursor-pointer shadow-xs"
            title="Refresh timetable from live server"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Syncing...' : justRefreshed ? 'Updated' : 'Refresh'}</span>
          </button>
        </div>
      </header>

      {/* =========================================================================
          3. FILTER TABS & SEARCH BAR (Matching Screenshot 3 & 2)
      ========================================================================== */}
      <section aria-label="Bus filters" className="pt-2">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          {/* Horizontally scrollable filter pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none flex-nowrap">
            {filterTabs.map(({ label, count }) => {
              const active = activeFilter === label;
              return (
                <button
                  type="button"
                  key={label}
                  onClick={() => setActiveFilter(label)}
                  className={`shrink-0 rounded-full border px-3.5 py-2 text-[11px] font-bold transition cursor-pointer whitespace-nowrap ${
                    active
                      ? 'border-[#1e2b23] bg-[#1e2b23] text-white shadow-sm'
                      : 'border-[#d9d8d2] bg-[#fbfaf7] text-[#606760] hover:border-[#adb2ac]'
                  }`}
                >
                  {label}{' '}
                  <span className={active ? 'text-[#aabbb0]' : 'text-[#9a9d98]'}>
                    ({count})
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Bar on Right on Desktop, stacked below on mobile */}
          <label className="relative block w-full shrink-0 xl:w-[300px]">
            <span className="absolute top-1/2 left-3.5 -translate-y-1/2 text-[#818780] pointer-events-none">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search destination or bus..."
              className="h-10 w-full rounded-lg border border-[#d7d6d0] bg-white pr-9 pl-10 text-xs text-[#273129] outline-none transition placeholder:text-[#9a9e99] focus:border-[#74887a] focus:ring-2 focus:ring-[#dfe7e0] font-sans"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-[#818780] hover:text-[#273129] cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </label>
        </div>

        {/* Results Summary */}
        <p className="mt-2.5 text-[11px] text-[#828680] font-sans">
          Showing{' '}
          <strong className="font-semibold text-[#4f5751]">
            {filteredDeparturesCount} departures
          </strong>{' '}
          across {filteredRoutes.length} routes
          {query && <span> matching “{query}”</span>}
        </p>
      </section>

      {/* =========================================================================
          4. BUS ROUTE CARDS (Matching Screenshot 1, 2, 3)
      ========================================================================== */}
      {filteredRoutes.length === 0 ? (
        <div className="rounded-xl border border-[#dcdad3] bg-white p-10 text-center space-y-3 shadow-xs">
          <h3 className="text-base font-serif font-bold text-[#162019]">No bus routes found</h3>
          <p className="text-xs text-[#727a73] max-w-md mx-auto leading-relaxed">
            Try a different destination or filter.
          </p>
          {(activeFilter !== 'All Buses' || query) && (
            <button
              type="button"
              onClick={() => {
                setActiveFilter('All Buses');
                setQuery('');
              }}
              className="px-4 py-2 bg-[#1e2b23] text-white text-xs font-semibold rounded-lg hover:bg-[#15241a] transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRoutes.map((route) => {
            const isPassing =
              route.routeClassification === 'PASSING_THROUGH' ||
              !route.source.toLowerCase().includes('pavagada');

            const originDisplay = cleanStationTitle(route.source) || route.source;
            const destinationDisplay = cleanStationTitle(route.destination) || route.destination;
            const viaDisplay = getViaDisplay(route);
            const primaryServiceType = getPrimaryServiceType(route);
            const timings = route.timings || [];
            const isExpanded = expandedRoutes[route.id] ?? false;
            const groupedTimings = groupRouteTimings(timings);
            const totalBuses = timings.length;

            return (
              <article
                key={route.id}
                className="overflow-hidden rounded-xl border border-[#dcdad3] bg-white shadow-[0_8px_28px_rgba(31,42,34,0.045)] transition-all hover:border-[#c8c6be]"
              >
                {/* Route Header Row */}
                <div className="px-5 py-4">
                  <div className="min-w-0">
                    {/* Badges Row */}
                    <div className="mb-2 flex flex-wrap items-center gap-1.5">
                      {/* Operator Badge */}
                      <span className="rounded bg-[#e2eee6] px-2 py-1 text-[9px] font-extrabold tracking-[0.08em] text-[#26543a] uppercase">
                        {route.operator || 'KSRTC'}
                      </span>

                      {/* Origin Classification Badge */}
                      {isPassing ? (
                        <span className="rounded bg-[#fff0cd] px-2 py-1 text-[9px] font-extrabold tracking-[0.07em] text-[#875a04] uppercase">
                          PASSING THROUGH PAVAGADA
                        </span>
                      ) : (
                        <span className="rounded bg-[#e2eee6] px-2 py-1 text-[9px] font-extrabold tracking-[0.07em] text-[#26543a] uppercase">
                          DEPARTING FROM PAVAGADA
                        </span>
                      )}

                      {/* Service Type Badge */}
                      <span className="rounded border border-[#d9ddd9] px-2 py-1 text-[9px] font-bold tracking-[0.07em] text-[#566158] uppercase">
                        {primaryServiceType}
                      </span>

                      {/* Route Code */}
                      <span className="ml-0.5 font-mono text-[10px] font-semibold text-[#8a8e89]">
                        {route.routeCode}
                      </span>
                    </div>

                    {/* Route Heading + Via + Mobile-style Bus Badge */}
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-3">
                      <h2 className="text-xl leading-tight font-bold tracking-[-0.025em] text-[#162019] sm:text-2xl font-sans inline-flex items-center flex-wrap gap-1.5">
                        <span>{originDisplay}</span>
                        <span className="px-0.5 font-normal text-[#9aa19b]">→</span>
                        <span>{destinationDisplay}</span>
                        {/* Bus count pill (styled as in mobile phone for all screen sizes) */}
                        <span className="inline-flex -translate-y-0.5 rounded-full bg-[#e4eee7] px-2.5 py-1 align-middle text-[9px] sm:text-[10px] leading-none font-bold tracking-normal text-[#326145]">
                          {totalBuses} bus{totalBuses !== 1 ? 'es' : ''}
                        </span>
                      </h2>
                      <p className="text-[11px] font-medium text-[#727a73] font-sans">
                        Via: {viaDisplay}
                      </p>
                    </div>
                  </div>
                </div>

                {/* =========================================================================
                    5. TIMETABLE EXPANSION ROW & BODY (Matching Screenshot 1)
                ========================================================================== */}
                <section className="border-t border-[#ebe9e3]">
                  {/* Collapsible Trigger Row */}
                  <button
                    type="button"
                    onClick={() => toggleTimetable(route.id)}
                    aria-expanded={isExpanded}
                    className="flex w-full items-center justify-between px-5 py-3 text-left transition-colors hover:bg-[#faf9f6] cursor-pointer"
                  >
                    <span className="flex items-center gap-2 text-xs font-bold text-[#313e35] font-sans">
                      <span className="text-[#66806e]">
                        <Clock className="w-3.5 h-3.5" />
                      </span>
                      <span>Timetable Departures</span>
                      <span className="rounded bg-[#edf0ec] px-1.5 py-0.5 text-[9px] text-[#667068] font-mono">
                        {totalBuses}
                      </span>
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-[#777e78] font-sans">
                      <span>{isExpanded ? 'Hide timetable' : 'Show timetable'}</span>
                      <span
                        className={`text-base leading-none transition-transform duration-200 ${
                          isExpanded ? '' : 'rotate-180'
                        }`}
                      >
                        ⌃
                      </span>
                    </span>
                  </button>

                  {/* Expanded Timetable Grid with Service Type Groups */}
                  {isExpanded && (
                    <div className="border-t border-[#efeee9] bg-[#fcfbf8] px-5 animate-fadeIn">
                      {groupedTimings.length > 0 ? (
                        <div className="grid gap-2.5 py-3 sm:grid-cols-2 lg:grid-cols-3">
                          {groupedTimings.map((group) => (
                            <div
                              key={group.key}
                              className={`rounded-lg border ${group.borderClass} bg-white p-3 shadow-2xs`}
                            >
                              {/* Group Header */}
                              <div className="mb-2.5 flex items-center justify-between">
                                <span
                                  className={`rounded ${group.badgeClass} px-2 py-1 text-[9px] font-extrabold tracking-[0.08em] uppercase`}
                                >
                                  {group.label}
                                </span>
                                <span className="text-[9px] font-semibold text-[#969b96]">
                                  {group.count} bus{group.count !== 1 ? 'es' : ''}
                                </span>
                              </div>

                              {/* Departure Time Chips */}
                              <div className="flex flex-wrap gap-1.5">
                                {group.timings.map((timing) => (
                                  <span
                                    key={timing.id}
                                    className={`rounded-md ${group.chipBg} px-2.5 py-1.5 text-xs font-bold font-sans tracking-tight`}
                                    title={timing.remarks || `${group.label} departure from Pavagada`}
                                  >
                                    {timing.departureTime}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-4 text-center text-xs text-[#8a8e89] italic">
                          Timetable departures currently unavailable or pending administrative publication.
                        </div>
                      )}

                      {/* Footer with Report Timing action */}
                      <footer className="flex justify-end border-t border-[#ebe9e3] py-2.5">
                        <button
                          type="button"
                          onClick={() => handleReportTiming(route)}
                          className="flex items-center gap-1.5 text-[10px] font-semibold text-[#878b87] transition hover:text-[#704f43] cursor-pointer"
                        >
                          <Flag className="w-3 h-3" />
                          <span>Report incorrect timing</span>
                        </button>
                      </footer>
                    </div>
                  )}
                </section>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
