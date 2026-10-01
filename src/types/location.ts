export type LocationCategory =
  | 'FORT_HERITAGE'
  | 'MEGALITHIC_SITE'
  | 'RELIGIOUS'
  | 'SOLAR_INFRASTRUCTURE'
  | 'CIVIC_GOVERNMENT'
  | 'HEALTHCARE'
  | 'EDUCATION'
  | 'TRANSPORTATION'
  | 'PUBLIC_UTILITY';

export interface GeoCoordinates {
  latitude: number;
  longitude: number;
  elevationMeters?: number;
}

export interface LocationContact {
  phone?: string;
  email?: string;
  website?: string;
  authority?: string;
}

export interface OperatingHours {
  open: string;
  close: string;
  days: string;
  notes?: string;
}

export interface HistoricalContextRef {
  era: string;
  builtYearOrCentury: string;
  patronRuler?: string;
  architecturalStyle?: string;
  pdfSourceDoc: string;
  conservationPriority?: 'Priority 1: Immediate' | 'Priority 2: Structural Restoration' | 'Priority 3: Maintenance & Clearance';
}

export interface BaseLocation {
  id: string;
  code: string;
  name: string;
  kannadaName?: string;
  category: LocationCategory;
  summary: string;
  address: string;
  coordinates: GeoCoordinates;
}

export interface LocationDetail extends BaseLocation {
  fullDescription: string;
  historicalContext?: HistoricalContextRef;
  contact?: LocationContact;
  hours?: OperatingHours;
  tags: string[];
  keyAttributes: { label: string; value: string }[];
  verifiedSource: string;
  isPdfAuthoritative: boolean;
}
