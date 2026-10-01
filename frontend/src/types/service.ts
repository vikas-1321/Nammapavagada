export type ServiceType =
  | 'TRANSIT_BUS'
  | 'TRANSIT_RAILWAY'
  | 'EMERGENCY_MEDICAL'
  | 'CIVIC_GOVERNMENT'
  | 'POLICE_SECURITY'
  | 'PUBLIC_UTILITY';

export interface TransitRouteStop {
  id: number;
  routeId: string;
  stopId: string;
  stopName: string;
  kannadaName?: string;
  sequence: number;
  arrivalEstimateMinutes?: number | null;
  isMajorStop?: boolean;
  latitude?: number;
  longitude?: number;
}

export interface TransitTiming {
  id: number;
  routeId: string;
  departureTime: string;
  arrivalTime: string;
  busType: string;
  dayType: string;
  remarks?: string;
  status?: string;
}

export interface TransitScheduleItem {
  id: string;
  routeCode: string;
  source: string;
  destination: string;
  via: string[];
  operator: 'KSRTC' | 'APSRTC' | 'INDIAN_RAILWAYS' | 'PRIVATE' | 'LOCAL' | string;
  frequencyNote: string;
  isTimetableLive: boolean;
  statusNote: string;
  status?: string;
  stops?: TransitRouteStop[];
  timings?: TransitTiming[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CivicServiceContact {
  id: string;
  department: string;
  officeName: string;
  contactNumber?: string;
  address: string;
  workingHours: string;
  keyServices: string[];
  verificationStatus: 'Verified Official' | 'Under Review' | 'Coming Soon';
}

export interface EmergencyContact {
  id: string;
  service: string;
  telephone: string;
  alternatePhone?: string;
  operationalHours: string;
  notes?: string;
}
