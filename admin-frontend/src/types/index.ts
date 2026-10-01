export interface AdminUser {
  id: number;
  email: string;
  fullName: string;
  role: 'SUPER_ADMIN' | 'EDITOR' | 'VIEWER';
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  shortCode: string;
  badgeColorClass: string;
  borderClass: string;
  description: string;
  isFutureModule: boolean;
  displayOrder: number;
  status: string;
  locationsCount?: number;
}

export interface LocationItem {
  id: string;
  code: string;
  name: string;
  kannadaName?: string;
  category: string;
  summary: string;
  fullDescription?: string;
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
    elevationMeters?: number;
  };
  historicalContext?: {
    era?: string;
    builtYearOrCentury?: string;
    patronRuler?: string;
    architecturalStyle?: string;
    pdfSourceDoc?: string;
    conservationPriority?: string;
  };
  contact?: {
    authority?: string;
    phone?: string;
    website?: string;
  };
  hours?: {
    open?: string;
    close?: string;
    days?: string;
    notes?: string;
  };
  tags: string[];
  keyAttributes: { label: string; value: string }[];
  verifiedSource?: string;
  isPdfAuthoritative: boolean;
  primaryPhotoUrl?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'DRAFT' | 'ARCHIVED';
  createdAt?: string;
  updatedAt?: string;
}

export interface BusStop {
  id: string;
  stopName: string;
  kannadaName?: string;
  locationArea?: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  status: string;
}

export interface RouteStop {
  id: number;
  routeId: string;
  stopId: string;
  stopName: string;
  kannadaName?: string;
  sequence: number;
  isMajorStop: boolean;
  arrivalEstimateMinutes?: number;
  latitude?: number;
  longitude?: number;
}

export interface BusTiming {
  id: number;
  routeId: string;
  stopId?: string;
  stopName?: string;
  departureTime: string;
  arrivalTime?: string;
  dayType: 'DAILY' | 'MON_SAT' | 'MON_FRI' | 'SUNDAY' | 'HOLIDAY';
  busType: string;
  remarks?: string;
  status: string;
}

export interface BusRoute {
  id: string;
  routeCode: string;
  source: string;
  destination: string;
  via: string[];
  operator: string;
  frequencyNote?: string;
  statusNote?: string;
  isTimetableLive: boolean;
  status: 'ACTIVE' | 'INACTIVE' | 'DRAFT' | 'ARCHIVED';
  stops?: RouteStop[];
  timings?: BusTiming[];
  createdAt?: string;
}

export interface Hospital {
  id: string;
  name: string;
  kannadaName?: string;
  description?: string;
  address: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  emergencyPhone?: string;
  openingHours?: string;
  services: string[];
  departments: string[];
  website?: string;
  primaryPhotoUrl?: string;
  status: string;
}

export interface EducationalInstitution {
  id: string;
  name: string;
  kannadaName?: string;
  institutionType: 'SCHOOL' | 'COLLEGE' | 'POLYTECHNIC' | 'PU_COLLEGE';
  description?: string;
  address: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  website?: string;
  courses: string[];
  facilities: string[];
  openingHours?: string;
  affiliation?: string;
  primaryPhotoUrl?: string;
  status: string;
}

export interface Theatre {
  id: string;
  name: string;
  kannadaName?: string;
  address: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  website?: string;
  screensCount: number;
  currentMovies: string[];
  showTimings: string[];
  ticketInfo: Record<string, string>;
  primaryPhotoUrl?: string;
  status: string;
}

export interface HistoryEra {
  id: string;
  eraName: string;
  kannadaTitle?: string;
  timeRange: string;
  primaryRulers: string[];
  keyEvents: string[];
  summary: string;
  pdfEvidence: string;
  displayOrder: number;
  status: string;
}

export interface HistoricalPlace {
  id: string;
  name: string;
  kannadaName?: string;
  eraId?: string;
  classification: 'DEFENSE' | 'RELIGIOUS' | 'ROYAL';
  description: string;
  pdfSource: string;
  latitude?: number;
  longitude?: number;
  elevationMeters?: number;
  primaryPhotoUrl?: string;
  status: string;
}

export interface PhotoItem {
  id: number;
  entityType: string;
  entityId: string;
  s3Key: string;
  url: string;
  altText: string;
  caption: string;
  photoType: string;
  displayOrder: number;
  isPrimary: boolean;
  fileSizeBytes?: number;
  mimeType: string;
  status: string;
  createdAt: string;
}

export interface PhotoRequest {
  entityType: string;
  entityId: string;
  entityName: string;
  category: string;
  hasPrimary: boolean;
  uploadedCount: number;
  uploadedTypes: string[];
  missingRecommended: string[];
  isComplete: boolean;
}

export interface AuditLogItem {
  id: number;
  adminId?: number;
  adminEmail: string;
  action: string;
  entityType: string;
  entityId: string;
  previousValue?: any;
  newValue?: any;
  ipAddress?: string;
  timestamp: string;
}

export interface DashboardOverview {
  statistics: {
    totalLocations: number;
    activeLocations: number;
    draftLocations: number;
    totalBusRoutes: number;
    totalBusStops: number;
    totalHospitals: number;
    totalSchools: number;
    totalColleges: number;
    totalTheatres: number;
    totalHistoricalPlaces: number;
    totalPhotos: number;
    missingPhotosCount: number;
  };
  recentLocations: LocationItem[];
  recentActivities: AuditLogItem[];
}
