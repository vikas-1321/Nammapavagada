import React from 'react';

export type CommunityCategoryKey =
  | 'hospitals'
  | 'transport'
  | 'schools'
  | 'colleges'
  | 'entertainment'
  | 'government'
  | 'banks'
  | 'food'
  | 'emergency';

export interface CommunityCategoryMeta {
  id: CommunityCategoryKey;
  name: string;
  kannadaName: string;
  route: string;
  hash: string;
  eyebrow: string;
  description: string;
  cardDescription: string;
  iconName: string;
  accentBg: string;
  accentText: string;
  accentBorder: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  initialCount: number;
}

export interface CommunityPlace {
  id: string;
  category: CommunityCategoryKey;
  name: string;
  kannadaName?: string;
  type?: string;
  address: string;
  phone?: string;
  emergencyPhone?: string;
  openingHours?: string;
  description?: string;
  tags?: string[];
  facilities?: string[];
  courses?: string[];
  services?: string[];
  departments?: string[];
  showTimings?: string[];
  currentMovie?: string;
  ticketInfo?: Record<string, string>;
  verificationStatus?: 'Verified Official' | 'Active Service' | 'Registered';
  latitude?: number | null;
  longitude?: number | null;
  website?: string;
}
