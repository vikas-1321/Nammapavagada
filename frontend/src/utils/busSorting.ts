/**
 * Namma Pavagada - Bus Sorting & Demand-Ranking Engine
 *
 * Enforces passenger-first transit hierarchy:
 * Priority 1: Buses departing FROM Pavagada (grouped by destination demand, highest departures first)
 * Priority 2: Buses passing through Pavagada (strictly separated below, origin departure times noted)
 */

import { TransitScheduleItem, TransitTiming, DestinationGroup } from '../types/service';

/**
 * Normalizes destination names by trimming bus stand/majestic suffixes
 * and standardizing regional transliterations.
 */
export const normalizeDestination = (destination?: string): string => {
  if (!destination) return '';
  let cleaned = destination
    .replace(/\s*\(Kempegowda Bus Station \/ Majestic\)/gi, '')
    .replace(/\s*\(Majestic\)/gi, '')
    .replace(/\s*\(City Bus Stand\)/gi, '')
    .replace(/\s*KSRTC Bus Station/gi, '')
    .replace(/\s*Central Bus Stand/gi, '')
    .replace(/\s*Bus Station/gi, '')
    .replace(/\s*Bus Stand/gi, '')
    .replace(/\s*Bus Stop/gi, '')
    .trim();

  // Standardize common destination names
  const lower = cleaned.toLowerCase();
  if (lower.startsWith('bengaluru') || lower.startsWith('bangalore')) return 'Bengaluru';
  if (lower.startsWith('tumakur')) return 'Tumakuru';
  if (lower.startsWith('y n hosak') || lower === 'v h kote' || lower === 'y n hosakote') return 'Y N Hosakotte';
  if (lower.startsWith('kalayanad') || lower.startsWith('kalyanad')) return 'Kalyanadurga';
  if (lower.startsWith('sira')) return 'Sira';
  if (lower.startsWith('chitrad')) return 'Chitradurga';
  if (lower.startsWith('hindup')) return 'Hindupur';
  if (lower.startsWith('arsik')) return 'Arsikere';
  if (lower.startsWith('b k halli') || lower.startsWith('b.k.halli')) return 'B K Halli';
  if (lower.startsWith('rayad')) return 'Rayadurga';
  if (lower.startsWith('bellar') || lower.startsWith('ballar')) return 'Ballari';
  if (lower.startsWith('challak') || lower.startsWith('chalak')) return 'Challakere';
  if (lower.startsWith('venkatamman')) return 'Venkatammanahalli';
  if (lower.startsWith('kolar')) return 'Kolar';

  return cleaned;
};

/**
 * Distinguishes whether a route originates at Pavagada vs passes through Pavagada.
 */
export const isDepartingFromPavagada = (route: {
  source?: string;
  routeClassification?: string;
}): boolean => {
  if (route.routeClassification === 'PASSING_THROUGH') return false;
  if (route.routeClassification === 'DEPARTING') return true;
  return (route.source || '').toLowerCase().includes('pavagada');
};

/**
 * Parses time string (24-hour or 12-hour AM/PM) into minutes from midnight (0..1439).
 */
export const parseTimeToMinutes = (timeStr?: string): number => {
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

/**
 * Formats minutes from midnight into 12-hour AM/PM display string.
 */
export const formatMinutesTo12Hour = (minutes: number): string => {
  const norm = ((minutes % 1440) + 1440) % 1440;
  const hours = Math.floor(norm / 60);
  const mins = norm % 60;
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  const minPad = mins.toString().padStart(2, '0');
  const hrPad = hour12.toString().padStart(2, '0');
  return `${hrPad}:${minPad} ${period}`;
};

/**
 * Gets current minutes from midnight in Indian Standard Time (UTC+05:30).
 */
export const getCurrentIstMinutes = (): number => {
  const now = new Date();
  const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
  return (utcMinutes + 330) % 1440; // 330 mins = 5 hrs 30 mins
};

/**
 * Sorts timings chronologically.
 */
export const sortTimingsChronologically = (timings: TransitTiming[] = []): TransitTiming[] => {
  return [...timings].sort(
    (a, b) => parseTimeToMinutes(a.departureTime) - parseTimeToMinutes(b.departureTime)
  );
};

export interface GroupedBusResult {
  departingDestinations: DestinationGroup[];
  passingRoutes: TransitScheduleItem[];
  totalDeparturesCount: number;
  totalRoutesCount: number;
  departingDeparturesCount: number;
  passingDeparturesCount: number;
}

/**
 * Groups and sorts routes according to passenger demand hierarchy:
 * Priority 1: Pavagada-departing routes grouped by normalized destination,
 *             sorted descending by total departure frequency.
 * Priority 2: Passing-through routes separated below.
 */
export const groupAndSortTransitRoutes = (
  routes: TransitScheduleItem[],
  activeFilter: string = 'All Buses',
  searchQuery: string = ''
): GroupedBusResult => {
  const q = searchQuery.toLowerCase().trim();

  // 1. Filter routes by search query and service class tab
  const filtered = routes.filter((route) => {
    const isDeparting = isDepartingFromPavagada(route);
    const isPassing = !isDeparting;

    // Filter tab constraints
    if (activeFilter === 'Departing' && !isDeparting) return false;
    if (activeFilter === 'Passing' && !isPassing) return false;

    const timings = route.timings || [];

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

    // Search query constraints
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

  // 2. Separate into departing and passing routes
  const departingRoutes: TransitScheduleItem[] = [];
  const passingRoutes: TransitScheduleItem[] = [];

  filtered.forEach((r) => {
    // Filter timings for service class if needed
    let timings = sortTimingsChronologically(r.timings || []);
    if (activeFilter === 'Express') {
      timings = timings.filter((t) =>
        (t.serviceClass || t.busType || '').toLowerCase().includes('express')
      );
    } else if (activeFilter === 'Ordinary') {
      timings = timings.filter((t) => {
        const sc = (t.serviceClass || t.busType || '').toLowerCase();
        return sc.includes('ordinary') || !sc;
      });
    } else if (activeFilter === 'Non-Stop') {
      timings = timings.filter((t) => {
        const sc = (t.serviceClass || t.busType || '').toLowerCase();
        return sc.includes('non-stop') || sc.includes('nonstop');
      });
    }

    const routeCopy: TransitScheduleItem = {
      ...r,
      timings,
    };

    if (isDepartingFromPavagada(r)) {
      departingRoutes.push(routeCopy);
    } else {
      passingRoutes.push(routeCopy);
    }
  });

  // 3. Group departing routes by normalized destination
  const destMap = new Map<string, { routes: TransitScheduleItem[]; destinationKannada?: string }>();

  departingRoutes.forEach((route) => {
    const norm = normalizeDestination(route.destination);
    if (!destMap.has(norm)) {
      destMap.set(norm, {
        routes: [],
        destinationKannada: route.destinationKannada,
      });
    }
    const entry = destMap.get(norm)!;
    entry.routes.push(route);
    if (!entry.destinationKannada && route.destinationKannada) {
      entry.destinationKannada = route.destinationKannada;
    }
  });

  // 4. Construct DestinationGroup array and calculate total departures
  const destinationGroups: DestinationGroup[] = [];
  let departingDeparturesCount = 0;

  destMap.forEach(({ routes: groupRoutes, destinationKannada }, destName) => {
    const totalDepartures = groupRoutes.reduce(
      (sum, route) => sum + (route.timings?.length || 0),
      0
    );
    departingDeparturesCount += totalDepartures;

    destinationGroups.push({
      destination: destName,
      destinationKannada,
      totalDepartures,
      routeCount: groupRoutes.length,
      routes: groupRoutes,
    });
  });

  // 5. SORT DESTINATION GROUPS: Highest scheduled departures first (Demand Rank), then alphabetical
  destinationGroups.sort((a, b) => {
    if (b.totalDepartures !== a.totalDepartures) {
      return b.totalDepartures - a.totalDepartures;
    }
    return a.destination.localeCompare(b.destination);
  });

  const passingDeparturesCount = passingRoutes.reduce(
    (sum, route) => sum + (route.timings?.length || 0),
    0
  );

  return {
    departingDestinations: destinationGroups,
    passingRoutes,
    totalDeparturesCount: departingDeparturesCount + passingDeparturesCount,
    totalRoutesCount: filtered.length,
    departingDeparturesCount,
    passingDeparturesCount,
  };
};

