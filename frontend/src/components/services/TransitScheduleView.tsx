import React, { useState } from 'react';
import { TransitScheduleItem } from '../../types/service';
import { Badge } from '../common/Badge';

export interface TransitScheduleViewProps {
  routes: TransitScheduleItem[];
  onRefresh?: () => Promise<void> | void;
  isRefreshing?: boolean;
  lastSyncedAt?: Date | null;
  isApiLoaded?: boolean;
}

export const TransitScheduleView: React.FC<TransitScheduleViewProps> = ({
  routes,
  onRefresh,
  isRefreshing = false,
  lastSyncedAt,
  isApiLoaded = false,
}) => {
  const [operatorFilter, setOperatorFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedRouteTimings, setExpandedRouteTimings] = useState<Record<string, boolean>>({});

  // Compute total stops across all active routes
  const totalStopsCount = routes.reduce((acc, r) => acc + (r.stops?.length || 0), 0);

  // Filter routes based on operator tab and search query
  const filteredRoutes = routes.filter((route) => {
    // Operator filter
    if (operatorFilter !== 'ALL') {
      const op = (route.operator || '').toUpperCase();
      if (operatorFilter === 'KSRTC' && op !== 'KSRTC') return false;
      if (operatorFilter === 'APSRTC' && op !== 'APSRTC') return false;
      if (operatorFilter === 'PRIVATE' && op !== 'PRIVATE') return false;
      if (operatorFilter === 'RAILWAYS' && !op.includes('RAIL')) return false;
    }

    // Search query filter (matches route code, source, destination, via, stops)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const codeMatch = route.routeCode?.toLowerCase().includes(q);
      const srcMatch = route.source?.toLowerCase().includes(q);
      const destMatch = route.destination?.toLowerCase().includes(q);
      const viaMatch = route.via?.some((v) => v.toLowerCase().includes(q));
      const stopMatch = route.stops?.some(
        (s) =>
          s.stopName?.toLowerCase().includes(q) ||
          (s.kannadaName && s.kannadaName.toLowerCase().includes(q))
      );
      if (!codeMatch && !srcMatch && !destMatch && !viaMatch && !stopMatch) {
        return false;
      }
    }

    return true;
  });

  const toggleTimings = (routeId: string) => {
    setExpandedRouteTimings((prev) => ({
      ...prev,
      [routeId]: !prev[routeId],
    }));
  };

  return (
    <div className="space-y-6">
      {/* Network Header with Live Status & Refresh Trigger */}
      <div className="bg-white p-5 rounded-2xl border border-soft-sand shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xl">🚌</span>
              <h4 className="text-xs uppercase tracking-wider font-bold text-forest-green">
                Public Transit Network · Pavagada Central Station & Taluk Corridors
              </h4>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
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
                {isApiLoaded ? 'Live API Connected' : 'Cached Timetable'}
              </span>
            </div>
            <p className="text-xs md:text-sm text-muted-text leading-relaxed font-sans">
              Interstate and regional transit schedules connecting Pavagada with Bengaluru, Tumakuru, Bellary, and Rayadurga.
              Route paths, ordered stop sequences, and departure timetables are maintained by administrative transport desks.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {lastSyncedAt && (
              <span className="text-[11px] font-mono text-muted-text hidden sm:inline">
                Synced: {lastSyncedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            {onRefresh && (
              <button
                type="button"
                onClick={() => onRefresh()}
                disabled={isRefreshing}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-warm-cream hover:bg-soft-sand text-dark-text text-xs font-semibold rounded-xl border border-soft-sand transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                title="Refresh routes and stops from live server"
              >
                <span className={isRefreshing ? 'animate-spin' : ''}>🔄</span>
                <span>{isRefreshing ? 'Syncing...' : 'Sync Timetables'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-soft-sand/70 text-center">
          <div className="bg-warm-cream/50 p-2.5 rounded-xl border border-soft-sand/50">
            <span className="text-[11px] uppercase tracking-wider text-muted-text block">Active Corridors</span>
            <span className="text-lg font-serif font-bold text-forest-green">{routes.length}</span>
          </div>
          <div className="bg-warm-cream/50 p-2.5 rounded-xl border border-soft-sand/50">
            <span className="text-[11px] uppercase tracking-wider text-muted-text block">Registered Stops</span>
            <span className="text-lg font-serif font-bold text-forest-green">{totalStopsCount}</span>
          </div>
          <div className="bg-warm-cream/50 p-2.5 rounded-xl border border-soft-sand/50">
            <span className="text-[11px] uppercase tracking-wider text-muted-text block">Major Hubs</span>
            <span className="text-lg font-serif font-bold text-terracotta">
              {routes.reduce((acc, r) => acc + (r.stops?.filter((s) => s.isMajorStop).length || 0), 0)}
            </span>
          </div>
          <div className="bg-warm-cream/50 p-2.5 rounded-xl border border-soft-sand/50">
            <span className="text-[11px] uppercase tracking-wider text-muted-text block">Daily Trips</span>
            <span className="text-lg font-serif font-bold text-forest-green">
              {routes.reduce((acc, r) => acc + (r.timings?.length || 0), 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-soft-sand shadow-xs">
        {/* Operator Filter Tabs */}
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: 'ALL', label: 'All Corridors' },
            { id: 'KSRTC', label: 'KSRTC' },
            { id: 'APSRTC', label: 'APSRTC' },
            { id: 'PRIVATE', label: 'Private' },
            { id: 'RAILWAYS', label: 'Rail' },
          ].map((op) => (
            <button
              key={op.id}
              type="button"
              onClick={() => setOperatorFilter(op.id)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
                operatorFilter === op.id
                  ? 'bg-forest-green text-white border-forest-green shadow-xs'
                  : 'bg-warm-cream text-dark-text border-soft-sand hover:bg-soft-sand'
              }`}
            >
              {op.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px]">
          <span className="absolute left-3 top-2.5 text-xs text-muted-text select-none">🔍</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search stops, towns, code..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-warm-cream border border-soft-sand rounded-xl focus:outline-none focus:border-forest-green focus:bg-white transition-all font-sans"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2 text-xs text-muted-text hover:text-dark-text"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Route List */}
      {filteredRoutes.length === 0 ? (
        <div className="bg-white border border-soft-sand rounded-2xl p-10 text-center space-y-3">
          <div className="text-3xl">🚌</div>
          <h3 className="text-base font-serif font-bold text-dark-text">No Matching Transit Routes</h3>
          <p className="text-xs text-muted-text max-w-md mx-auto">
            No active corridors matched &ldquo;{searchQuery}&rdquo; under the selected filter. Try clearing your search query or choosing another operator.
          </p>
          <button
            type="button"
            onClick={() => {
              setOperatorFilter('ALL');
              setSearchQuery('');
            }}
            className="px-4 py-2 bg-forest-green text-white text-xs font-semibold rounded-xl hover:bg-forest-green/90 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredRoutes.map((route) => {
            const hasStops = Array.isArray(route.stops) && route.stops.length > 0;
            const hasTimings = Array.isArray(route.timings) && route.timings.length > 0;
            const isTimingsExpanded = expandedRouteTimings[route.id] ?? false;

            // Sort stops by sequence
            const sortedStops = hasStops
              ? [...route.stops!].sort((a, b) => a.sequence - b.sequence)
              : [];

            return (
              <div
                key={route.id}
                className="bg-white border border-soft-sand hover:border-forest-green/50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200"
              >
                {/* Route Header */}
                <div className="flex flex-wrap items-center justify-between border-b border-soft-sand pb-3 mb-4 gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold bg-forest-green text-white px-2.5 py-0.5 rounded-md shadow-2xs">
                      {route.routeCode}
                    </span>
                    <Badge
                      variant={
                        route.operator === 'KSRTC'
                          ? 'forest'
                          : route.operator === 'APSRTC'
                          ? 'terracotta'
                          : route.operator === 'PRIVATE'
                          ? 'sand'
                          : 'sand'
                      }
                    >
                      {route.operator}
                    </Badge>
                    {route.status && route.status !== 'ACTIVE' && (
                      <span className="text-[10px] font-mono font-bold uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md">
                        {route.status}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-muted-text">
                      {route.isTimetableLive ? '🟢 Live GPS Verified' : 'Standard Corridor Frequency'}
                    </span>
                  </div>
                </div>

                {/* Origin -> Destination Banner */}
                <div className="grid grid-cols-12 gap-4 items-center mb-5 bg-warm-cream/40 p-4 rounded-xl border border-soft-sand/60">
                  <div className="col-span-12 sm:col-span-5">
                    <span className="text-[11px] uppercase font-bold text-muted-text block mb-0.5">Origin Station</span>
                    <div className="text-lg font-serif font-bold text-forest-green">{route.source}</div>
                  </div>
                  <div className="col-span-12 sm:col-span-2 text-center text-xl font-bold text-terracotta select-none">
                    →
                  </div>
                  <div className="col-span-12 sm:col-span-5 sm:text-right">
                    <span className="text-[11px] uppercase font-bold text-muted-text block mb-0.5">Destination Terminal</span>
                    <div className="text-lg font-serif font-bold text-forest-green">{route.destination}</div>
                  </div>
                </div>

                {/* SECTION 1: TRAVEL ORDER & STOPS CORRIDOR (The Sequenced Stops) */}
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="font-bold text-forest-green uppercase text-[11px] tracking-wider flex items-center gap-1.5">
                      <span>🚏</span>
                      <span>Travel Order & Sequenced Stops</span>
                      {hasStops && (
                        <span className="bg-forest-green/10 text-forest-green text-[10px] font-mono px-1.5 py-0.2 rounded-md font-bold">
                          {sortedStops.length} STOPS
                        </span>
                      )}
                    </span>
                    <span className="text-[11px] text-muted-text font-mono">
                      Sequential travel corridor
                    </span>
                  </div>

                  {hasStops ? (
                    <div className="bg-warm-cream/30 p-4 rounded-xl border border-soft-sand overflow-x-auto">
                      {/* Responsive horizontal travel order flow */}
                      <ol className="flex flex-col md:flex-row items-stretch md:items-center gap-2 md:gap-3 min-w-full">
                        {sortedStops.map((stop, idx) => {
                          const isFirst = idx === 0;
                          const isLast = idx === sortedStops.length - 1;

                          return (
                            <React.Fragment key={stop.id || stop.stopId || idx}>
                              <li className="flex-1 min-w-[150px] bg-white border border-soft-sand rounded-xl p-3 shadow-2xs relative">
                                <div className="flex items-center justify-between gap-1 mb-1">
                                  <span className="font-mono text-[10px] font-bold bg-soft-sand/70 text-dark-text px-1.5 py-0.2 rounded">
                                    #{String(stop.sequence).padStart(2, '0')}
                                  </span>
                                  {stop.isMajorStop && (
                                    <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded flex items-center gap-0.5">
                                      ★ Major Hub
                                    </span>
                                  )}
                                  {isFirst && (
                                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded">
                                      Start
                                    </span>
                                  )}
                                  {isLast && (
                                    <span className="text-[10px] font-bold bg-terracotta/20 text-terracotta px-1.5 py-0.2 rounded">
                                      End
                                    </span>
                                  )}
                                </div>

                                <div className="text-xs font-bold text-dark-text line-clamp-1" title={stop.stopName}>
                                  {stop.stopName}
                                </div>

                                {stop.kannadaName && (
                                  <div className="text-[11px] text-muted-text font-kannada line-clamp-1" title={stop.kannadaName}>
                                    {stop.kannadaName}
                                  </div>
                                )}

                                {stop.arrivalEstimateMinutes !== null && stop.arrivalEstimateMinutes !== undefined && (
                                  <div className="text-[10px] font-mono text-terracotta mt-1">
                                    ⏱ +{stop.arrivalEstimateMinutes} mins
                                  </div>
                                )}
                              </li>

                              {/* Arrow between sequential stops on desktop */}
                              {!isLast && (
                                <div className="hidden md:flex text-muted-text text-sm font-bold select-none px-0.5">
                                  →
                                </div>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </ol>
                    </div>
                  ) : (
                    /* Fallback to via tags if stops have not been linked yet */
                    <div className="bg-warm-cream/60 p-3.5 rounded-xl border border-soft-sand text-xs">
                      <span className="font-bold text-forest-green uppercase text-[11px] block mb-1.5">
                        Corridor Route Via:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {route.via && route.via.length > 0 ? (
                          route.via.map((stop, i) => (
                            <span
                              key={i}
                              className="bg-white border border-soft-sand px-2.5 py-0.5 rounded-md font-mono text-dark-text shadow-2xs"
                            >
                              {stop}
                            </span>
                          ))
                        ) : (
                          <span className="text-muted-text text-xs italic">Direct highway route</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* SECTION 2: TIMINGS & DEPARTURES SCHEDULE */}
                {hasTimings && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-forest-green uppercase text-[11px] tracking-wider flex items-center gap-1.5">
                        <span>🕒</span>
                        <span>Scheduled Departures & Timetable</span>
                        <span className="bg-forest-green/10 text-forest-green text-[10px] font-mono px-1.5 py-0.2 rounded-md font-bold">
                          {route.timings!.length} TRIPS
                        </span>
                      </span>
                      {route.timings!.length > 3 && (
                        <button
                          type="button"
                          onClick={() => toggleTimings(route.id)}
                          className="text-[11px] text-terracotta font-semibold hover:underline cursor-pointer"
                        >
                          {isTimingsExpanded ? 'Show Fewer Trips ▲' : `View All ${route.timings!.length} Trips ▼`}
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                      {(isTimingsExpanded ? route.timings! : route.timings!.slice(0, 3)).map((timing) => (
                        <div
                          key={timing.id}
                          className="bg-warm-cream/40 border border-soft-sand rounded-xl p-2.5 text-xs flex flex-col justify-between"
                        >
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="font-mono font-bold text-forest-green text-sm">
                              {timing.departureTime}
                            </span>
                            <span className="text-muted-text text-[10px]">→</span>
                            <span className="font-mono font-bold text-dark-text text-sm">
                              {timing.arrivalTime}
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-1 text-[10px] pt-1.5 border-t border-soft-sand/60">
                            <span className="font-bold uppercase tracking-wider text-muted-text">
                              {timing.busType}
                            </span>
                            <span className="font-mono text-forest-green bg-white px-1.5 py-0.2 rounded border border-soft-sand/60">
                              {timing.dayType}
                            </span>
                          </div>

                          {timing.remarks && (
                            <div className="text-[10px] text-muted-text italic mt-1 line-clamp-1">
                              {timing.remarks}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer with Frequency & Status Notes */}
                <div className="flex flex-col sm:flex-row justify-between items-baseline text-xs text-muted-text pt-3 border-t border-soft-sand/70 gap-2 font-sans">
                  <div>
                    <strong className="text-forest-green uppercase text-[11px] tracking-wide">Frequency: </strong>
                    <span className="text-dark-text font-medium">{route.frequencyNote || 'Standard regular service'}</span>
                  </div>
                  {route.statusNote && (
                    <div className="font-mono text-[11px] text-muted-text">
                      {route.statusNote}
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
