// Namma Pavagada Admin Mobile - Type Definitions

export type PlaceStatus =
  | 'ACTIVE'
  | 'PUBLISHED'
  | 'DRAFT'
  | 'INACTIVE'
  | 'ARCHIVED'
  | 'TEMP_CLOSED';

export type VerificationStatus =
  | 'NOT_VERIFIED'
  | 'PENDING'
  | 'VERIFIED'
  | 'NEEDS_REVERIFICATION';

export type VerificationSource =
  | 'Official Website'
  | 'Official Office'
  | 'Staff / Manager'
  | 'Phone Verification'
  | 'Physical Visit'
  | 'User Submitted'
  | 'Other';

export interface AdminUser {
  id: number;
  email: string;
  fullName: string;
  name?: string;
  role: 'super_admin' | 'editor' | 'viewer';
  lastLogin?: string;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  user: AdminUser;
}

export interface ContactInfo {
  authority?: string;
  phone?: string;
  alternatePhone?: string;
  whatsapp?: string;
  email?: string;
  website?: string;
  onlineServiceUrl?: string;
}

export interface TimeSlot {
  open: string;
  close: string;
}

export interface DaySchedule {
  isClosed: boolean;
  slots: TimeSlot[];
}

export interface StructuredHours {
  is24Hours: boolean;
  monday?: DaySchedule;
  tuesday?: DaySchedule;
  wednesday?: DaySchedule;
  thursday?: DaySchedule;
  friday?: DaySchedule;
  saturday?: DaySchedule;
  sunday?: DaySchedule;
  open?: string;
  close?: string;
  days?: string;
  notes?: string;
}

export interface VerificationInfo {
  status: VerificationStatus;
  lastVerifiedAt?: string;
  verifiedBy?: string;
  source?: VerificationSource | string;
  notes?: string;
  isFresh?: boolean;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
  elevationMeters?: number;
}

export interface PhotoItem {
  id: number;
  entityType: string;
  entityId: string;
  url: string;
  s3Key?: string;
  caption?: string;
  altText?: string;
  photoType?: string;
  displayOrder?: number;
  isPrimary: boolean;
  status?: string;
  createdAt?: string;
}

export interface TagItem {
  id: number;
  name: string;
  slug: string;
  category: 'SERVICE' | 'AVAILABILITY' | 'FACILITY' | 'PAYMENT' | 'AUDIENCE' | 'SERVICE_MODE' | 'OTHER';
  description?: string;
  placesCount?: number;
}

export interface GroupedTags {
  SERVICE: TagItem[];
  AVAILABILITY: TagItem[];
  FACILITY: TagItem[];
  PAYMENT: TagItem[];
  AUDIENCE: TagItem[];
  SERVICE_MODE: TagItem[];
  OTHER?: TagItem[];
}

export interface LocationItem {
  id: string;
  code: string;
  name: string;
  shortName?: string;
  kannadaName?: string;
  category: string;
  categoryName?: string;
  subcategory?: string;
  summary: string;
  fullDescription?: string;
  address: string;
  area?: string;
  pincode?: string;
  landmark?: string;
  mapReference?: string;
  coordinates: Coordinates;
  contact?: ContactInfo;
  hours?: StructuredHours;
  categoryData?: Record<string, any>;
  tags: string[];
  tagDetails?: TagItem[];
  verification?: VerificationInfo;
  primaryPhotoUrl?: string;
  photos?: PhotoItem[];
  status: PlaceStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface DuplicateCandidate {
  id: string;
  code: string;
  name: string;
  category: string;
  subcategory?: string;
  area?: string;
  address: string;
  similarity: number;
  isExactMatch: boolean;
  status: string;
}

export interface DataFreshnessStats {
  totalRecords: number;
  verifiedFresh: number;
  staleRecords: number;
  pendingVerification: number;
  needsReverification: number;
  totalNeedingAttention: number;
  freshnessPercent: number;
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
  recentActivities: any[];
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
  status: PlaceStatus;
  stops?: RouteStop[];
  timings?: BusTiming[];
  createdAt?: string;
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

export type FormCategoryType =
  | 'hospital'
  | 'clinic_doctor'
  | 'pharmacy'
  | 'fire_station'
  | 'police_station'
  | 'government_services'
  | 'bus_route'
  | 'bus_stop'
  | 'school'
  | 'college'
  | 'cinema_theatre'
  | 'bank'
  | 'atm'
  | 'hotel'
  | 'restaurant'
  | 'agriculture_apmc'
  | 'agriculture_store'
  | 'daily_trades'
  | 'general';

export interface SubcategoryMeta {
  id: string;
  name: string;
  description: string;
  formType: FormCategoryType;
  suggestedTags: string[];
}

export interface MainCategoryMeta {
  id: string;
  name: string;
  shortCode: string;
  icon: string;
  color: {
    primary: string;
    background: string;
    border: string;
    text: string;
    badge: string;
  };
  description: string;
  subcategories: SubcategoryMeta[];
}
