export interface HistoricalEra {
  id: string;
  eraName: string;
  kannadaTitle?: string;
  timeRange: string;
  primaryRulers: string[];
  keyEvents: string[];
  summary: string;
  pdfEvidence: string;
}

export interface FortGate {
  id: string;
  name: string;
  kannadaName?: string;
  layer: 'Settlement Base' | 'Hill Mid-Section' | 'Upper Citadel';
  status: 'Surviving' | 'Dilapidated' | 'Destroyed';
  significance: string;
}

export interface FortDefenseComponent {
  id: string;
  name: string;
  type: 'GATE' | 'BASTION' | 'BATTERY' | 'WALL' | 'TUNNEL';
  description: string;
  architecturalDetails: string;
  materials: string;
  conditionStatus: string;
  conservationPriority: 'Priority 1: Immediate' | 'Priority 2: Structural Restoration' | 'Priority 3: Maintenance & Clearance';
}

export interface FortStructureItem {
  id: string;
  name: string;
  kannadaName?: string;
  classification: 'DEFENSE' | 'RELIGIOUS' | 'ROYAL';
  historicalPeriod: string;
  builder?: string;
  architecturalHighlights: string[];
  currentCondition: string;
  conservationAction: string;
  sourceReference: string;
}

export interface MegalithicSiteRecord {
  id: string;
  siteName: string;
  kannadaName?: string;
  locationDetails: string;
  tombTypes: string[];
  artifactFindings: string[];
  scholarlyResearchers: string[];
  significance: string;
  culturalLore: string;
}

export interface AcademicCitation {
  id: string;
  title: string;
  authors: string;
  publication: string;
  year: number | string;
  isbnOrDoi?: string;
  notes: string;
}
