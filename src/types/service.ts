export type ServiceType =
  | 'TRANSIT_BUS'
  | 'TRANSIT_RAILWAY'
  | 'EMERGENCY_MEDICAL'
  | 'CIVIC_GOVERNMENT'
  | 'POLICE_SECURITY'
  | 'PUBLIC_UTILITY';

export interface TransitScheduleItem {
  id: string;
  routeCode: string;
  source: string;
  destination: string;
  via: string[];
  operator: 'KSRTC' | 'APSRTC' | 'INDIAN_RAILWAYS' | 'LOCAL';
  frequencyNote: string;
  isTimetableLive: boolean;
  statusNote: string;
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
