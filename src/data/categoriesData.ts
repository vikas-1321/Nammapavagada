import { LocationCategory } from '../types/location';

export interface CategoryDefinition {
  id: LocationCategory;
  name: string;
  shortCode: string;
  badgeColorClass: string;
  borderClass: string;
  description: string;
  isFutureModule: boolean;
}

export const CATEGORY_REGISTRY: Record<LocationCategory, CategoryDefinition> = {
  FORT_HERITAGE: {
    id: 'FORT_HERITAGE',
    name: 'Fort & Hill Citadel',
    shortCode: 'FORT',
    badgeColorClass: 'bg-earth-brown text-white',
    borderClass: 'border-earth-brown',
    description: '16th-century stone ramparts, gates, bastions, and royal structures of Pavagada hill',
    isFutureModule: false,
  },
  MEGALITHIC_SITE: {
    id: 'MEGALITHIC_SITE',
    name: 'Megalithic & Prehistoric',
    shortCode: 'MEGA',
    badgeColorClass: 'bg-[#5C3D2E] text-white',
    borderClass: 'border-[#5C3D2E]',
    description: 'Iron Age stone cists, dolmens, and menhirs dating from 1000 BCE to early historic era',
    isFutureModule: false,
  },
  RELIGIOUS: {
    id: 'RELIGIOUS',
    name: 'Sacred Heritage',
    shortCode: 'RELG',
    badgeColorClass: 'bg-forest-green-dark text-white',
    borderClass: 'border-forest-green-dark',
    description: 'Centuries-old temples, mosques, and sacred shrines documented in historical surveys',
    isFutureModule: false,
  },
  SOLAR_INFRASTRUCTURE: {
    id: 'SOLAR_INFRASTRUCTURE',
    name: 'Shakti Sthala (Solar Park)',
    shortCode: 'SOLR',
    badgeColorClass: 'bg-terracotta text-white',
    borderClass: 'border-terracotta',
    description: '2,050 MW solar park spread across 13,000 acres in 5 taluk villages',
    isFutureModule: false,
  },
  CIVIC_GOVERNMENT: {
    id: 'CIVIC_GOVERNMENT',
    name: 'Government & Administration',
    shortCode: 'GOVT',
    badgeColorClass: 'bg-forest-green text-white',
    borderClass: 'border-forest-green',
    description: 'Taluk administrative offices, Town Municipal Council, and statutory services',
    isFutureModule: false,
  },
  HEALTHCARE: {
    id: 'HEALTHCARE',
    name: 'Healthcare & Medical',
    shortCode: 'HLTH',
    badgeColorClass: 'bg-terracotta-dark text-white',
    borderClass: 'border-terracotta-dark',
    description: 'Government Hospital, Community Health Centre, and emergency facilities',
    isFutureModule: false,
  },
  TRANSPORTATION: {
    id: 'TRANSPORTATION',
    name: 'Transit & Connectivity',
    shortCode: 'TRNS',
    badgeColorClass: 'bg-forest-green-light text-white',
    borderClass: 'border-forest-green-light',
    description: 'KSRTC bus station, APSRTC interstate depot, and upcoming railway station',
    isFutureModule: false,
  },
  EDUCATION: {
    id: 'EDUCATION',
    name: 'Education & Academics',
    shortCode: 'EDUC',
    badgeColorClass: 'bg-[#4A5D4E] text-white',
    borderClass: 'border-[#4A5D4E]',
    description: 'Government colleges, higher primary institutions, and polytechnics in Pavagada',
    isFutureModule: true,
  },
  PUBLIC_UTILITY: {
    id: 'PUBLIC_UTILITY',
    name: 'Public Utilities & Banking',
    shortCode: 'UTIL',
    badgeColorClass: 'bg-[#6B5B4D] text-white',
    borderClass: 'border-[#6B5B4D]',
    description: 'Banks, post offices, fire protection, and municipal service centers',
    isFutureModule: true,
  }
};
