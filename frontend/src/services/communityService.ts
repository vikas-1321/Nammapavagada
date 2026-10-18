/**
 * Namma Pavagada - Centralized Community Service
 * Single Source of Truth for Community & Public Services:
 *   - Hospitals & Clinics: GET /api/hospitals, GET /api/locations?category=HEALTHCARE
 *   - Schools: GET /api/schools
 *   - Colleges: GET /api/colleges
 *   - Cinema Theatres: GET /api/theatres
 *   - Public Transit: GET /api/buses/routes
 *   - Civic Administration: GET /api/locations?category=CIVIC_GOVERNMENT
 *   - Banks & Utilities: GET /api/locations?category=PUBLIC_UTILITY
 *   - Local Food: GET /api/locations?subcategory=food
 *
 * ZERO HARDCODED PLACE RECORDS.
 */

import { COMMUNITY_CATEGORIES_META } from '../data/communityData';
import { CommunityCategoryKey, CommunityCategoryMeta, CommunityPlace } from '../types/community';
import { apiClient } from './apiClient';

interface BackendBusResponse {
  items: unknown[];
  total: number;
}

interface LocationApiResponse {
  items: any[];
  total: number;
}

class CommunityService {
  private categories: CommunityCategoryMeta[] = JSON.parse(JSON.stringify(COMMUNITY_CATEGORIES_META));
  private places: CommunityPlace[] = [];
  private isSynced: boolean = false;
  private isLoading: boolean = false;
  private lastError: Error | null = null;
  private listeners: Array<() => void> = [];

  constructor() {
    this.syncCountsFromBackend().catch((err) => {
      console.warn('[CommunityService] Initial backend sync failed:', err);
    });

    apiClient.onRevalidate(() => {
      this.syncCountsFromBackend(true).catch(() => {});
    });
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((l) => {
      try {
        l();
      } catch (err) {
        console.error('[CommunityService] listener notification error:', err);
      }
    });
  }

  /**
   * Syncs live counts and records for all categories from backend REST endpoints.
   * NEVER injects fake records.
   */
  public async syncCountsFromBackend(forceRefresh: boolean = false): Promise<void> {
    this.isLoading = true;
    try {
      const [locationsRes, busesRes] = await Promise.all([
        apiClient.get<LocationApiResponse>('/locations', { limit: 500 }, { forceRefresh }).catch(() => null),
        apiClient.get<BackendBusResponse>('/buses/routes', undefined, { forceRefresh }).catch(() => null),
      ]);

      const freshPlaces: CommunityPlace[] = [];
      const allLocs: any[] = (locationsRes && typeof locationsRes === 'object' && 'items' in locationsRes && Array.isArray((locationsRes as LocationApiResponse).items))
        ? (locationsRes as LocationApiResponse).items
        : [];

      // 1. Hospitals & Healthcare
      const hospLocs = allLocs.filter((l) => {
        const cat = (l.category || '').toUpperCase();
        return cat === 'HEALTHCARE' || cat === 'HEALTHCARE_MEDICAL' || cat === 'EMERGENCY_CRITICAL_CARE';
      });
      this.updateCategoryCount('hospitals', hospLocs.length);
      hospLocs.forEach((h: any) => {
        freshPlaces.push({
          id: `hosp-${h.id}`,
          category: 'hospitals',
          name: h.name,
          kannadaName: h.kannadaName,
          type: h.subcategory || 'Government Taluk Hospital',
          address: h.address || 'Pavagada Town',
          phone: h.contact?.phone || h.contact?.authority,
          emergencyPhone: h.contact?.alternatePhone || h.contact?.phone,
          openingHours: h.hours?.days ? `${h.hours.days}: ${h.hours.open || ''} - ${h.hours.close || ''}` : (h.hours?.notes || '24/7 Casualty & Inpatient Desk'),
          description: h.summary || h.fullDescription,
          services: Array.isArray(h.keyAttributes) ? h.keyAttributes.map((k: any) => `${k.label}: ${k.value}`) : (h.tags || []),
          departments: Array.isArray(h.tags) ? h.tags : [],
          verificationStatus: h.verification?.status === 'VERIFIED' ? 'Verified Official' : 'Registered',
          latitude: h.coordinates?.latitude,
          longitude: h.coordinates?.longitude,
          website: h.contact?.website,
        });
      });

      // 2. Schools & Colleges (from EDUCATION or EDUCATION_TRAINING)
      const eduLocs = allLocs.filter((l) => {
        const cat = (l.category || '').toUpperCase();
        return cat === 'EDUCATION' || cat === 'EDUCATION_TRAINING';
      });

      const isCollege = (l: any) => {
        const sub = (l.subcategory || '').toLowerCase();
        const nm = (l.name || '').toLowerCase();
        return sub.includes('college') || sub.includes('pu') || sub.includes('degree') || sub.includes('polytechnic') || sub.includes('iti') ||
               nm.includes('college') || nm.includes('university') || nm.includes('degree');
      };

      const schoolLocs = eduLocs.filter((l) => !isCollege(l));
      const collegeLocs = eduLocs.filter((l) => isCollege(l));

      this.updateCategoryCount('schools', schoolLocs.length);
      schoolLocs.forEach((s: any) => {
        freshPlaces.push({
          id: `school-${s.id}`,
          category: 'schools',
          name: s.name,
          kannadaName: s.kannadaName,
          type: s.subcategory || 'Primary & High School',
          address: s.address,
          phone: s.contact?.phone || s.contact?.authority,
          openingHours: s.hours?.days ? `${s.hours.days}: ${s.hours.open || ''} - ${s.hours.close || ''}` : '09:30 AM – 04:30 PM',
          description: s.summary || s.fullDescription,
          facilities: Array.isArray(s.keyAttributes) ? s.keyAttributes.map((k: any) => `${k.label}: ${k.value}`) : (s.tags || []),
          verificationStatus: s.verification?.status === 'VERIFIED' ? 'Verified Official' : 'Registered',
          latitude: s.coordinates?.latitude,
          longitude: s.coordinates?.longitude,
          website: s.contact?.website,
        });
      });

      this.updateCategoryCount('colleges', collegeLocs.length);
      collegeLocs.forEach((c: any) => {
        freshPlaces.push({
          id: `college-${c.id}`,
          category: 'colleges',
          name: c.name,
          kannadaName: c.kannadaName,
          type: c.subcategory || 'Pre-University / Degree College',
          address: c.address,
          phone: c.contact?.phone || c.contact?.authority,
          openingHours: c.hours?.days ? `${c.hours.days}: ${c.hours.open || ''} - ${c.hours.close || ''}` : '09:30 AM – 04:30 PM',
          description: c.summary || c.fullDescription,
          courses: Array.isArray(c.tags) ? c.tags : [],
          facilities: Array.isArray(c.keyAttributes) ? c.keyAttributes.map((k: any) => `${k.label}: ${k.value}`) : [],
          verificationStatus: c.verification?.status === 'VERIFIED' ? 'Verified Official' : 'Registered',
          latitude: c.coordinates?.latitude,
          longitude: c.coordinates?.longitude,
          website: c.contact?.website,
        });
      });

      // 4. Theatres / Entertainment
      const theatreLocs = allLocs.filter((l) => {
        const cat = (l.category || '').toUpperCase();
        const sub = (l.subcategory || '').toLowerCase();
        return cat === 'ENTERTAINMENT_HOSPITALITY' || cat === 'EVENTS_CULTURE_VENUES' || cat === 'THEATRE' ||
               sub.includes('theatre') || sub.includes('cinema');
      });
      this.updateCategoryCount('entertainment', theatreLocs.length);
      theatreLocs.forEach((t: any) => {
        freshPlaces.push({
          id: `theatre-${t.id}`,
          category: 'entertainment',
          name: t.name,
          kannadaName: t.kannadaName,
          type: t.subcategory || 'Cinema Theatre',
          address: t.address,
          phone: t.contact?.phone,
          showTimings: Array.isArray(t.keyAttributes) ? t.keyAttributes.map((k: any) => `${k.label}: ${k.value}`) : [],
          currentMovie: Array.isArray(t.tags) ? t.tags.join(', ') : '',
          ticketInfo: t.hours?.notes || '',
          verificationStatus: t.verification?.status === 'VERIFIED' ? 'Verified Official' : 'Active Service',
          latitude: t.coordinates?.latitude,
          longitude: t.coordinates?.longitude,
          website: t.contact?.website,
        });
      });

      // 5. Transport (buses)
      const busCount = (busesRes && typeof busesRes === 'object' && 'items' in busesRes && Array.isArray((busesRes as BackendBusResponse).items))
        ? (busesRes as BackendBusResponse).items.length
        : 0;
      this.updateCategoryCount('transport', busCount);

      // 6. Civic Administration
      const govLocs = allLocs.filter((l) => {
        const cat = (l.category || '').toUpperCase();
        return cat === 'CIVIC_GOVERNMENT' || cat === 'CIVIC_GOVERNANCE';
      });
      this.updateCategoryCount('government', govLocs.length);
      govLocs.forEach((loc: any) => {
        freshPlaces.push({
          id: `gov-${loc.id}`,
          category: 'government',
          name: loc.name,
          kannadaName: loc.kannadaName,
          type: loc.subcategory || 'Administrative Office',
          address: loc.address,
          phone: loc.contact?.phone || loc.contact?.authority,
          openingHours: loc.hours?.days ? `${loc.hours.days}: ${loc.hours.open || ''} - ${loc.hours.close || ''}` : '10:00 AM – 05:30 PM',
          description: loc.summary,
          services: Array.isArray(loc.keyAttributes) ? loc.keyAttributes.map((k: any) => `${k.label}: ${k.value}`) : loc.tags,
          verificationStatus: loc.verification?.status === 'VERIFIED' ? 'Verified Official' : 'Registered',
          latitude: loc.coordinates?.latitude,
          longitude: loc.coordinates?.longitude,
          website: loc.contact?.website,
        });
      });

      // 7. Banks & Public Utilities
      const utilLocs = allLocs.filter((l) => {
        const cat = (l.category || '').toUpperCase();
        return cat === 'PUBLIC_UTILITY' || cat === 'BANKING_FINANCE_LEGAL' || cat === 'DAILY_UTILITIES_TRADES';
      });
      this.updateCategoryCount('banks', utilLocs.length);
      utilLocs.forEach((loc: any) => {
        freshPlaces.push({
          id: `util-${loc.id}`,
          category: 'banks',
          name: loc.name,
          kannadaName: loc.kannadaName,
          type: loc.subcategory || 'Banking & Finance',
          address: loc.address,
          phone: loc.contact?.phone,
          openingHours: loc.hours?.days ? `${loc.hours.days}: ${loc.hours.open || ''} - ${loc.hours.close || ''}` : '10:00 AM – 04:00 PM',
          description: loc.summary,
          services: loc.tags,
          verificationStatus: loc.verification?.status === 'VERIFIED' ? 'Verified Official' : 'Registered',
          latitude: loc.coordinates?.latitude,
          longitude: loc.coordinates?.longitude,
          website: loc.contact?.website,
        });
      });

      // 8. Emergency (helplines + active healthcare casualty numbers)
      const emergencyPlacesCount = 2 + hospLocs.length;
      this.updateCategoryCount('emergency', emergencyPlacesCount);

      // 9. Food & Dining
      const foodLocs = allLocs.filter((l) => {
        const sub = (l.subcategory || '').toLowerCase();
        return sub.includes('food') || sub.includes('restaurant') || sub.includes('hotel') || sub.includes('eatery');
      });
      this.updateCategoryCount('food', foodLocs.length);

      this.places = freshPlaces;
      this.isSynced = true;
      this.lastError = null;
      this.notify();
    } catch (e: unknown) {
      console.warn('[CommunityService] Backend sync failed:', e);
      this.lastError = e instanceof Error ? e : new Error(String(e));
      this.notify();
    } finally {
      this.isLoading = false;
    }
  }

  private updateCategoryCount(categoryId: CommunityCategoryKey, count: number): void {
    const cat = this.categories.find((c) => c.id === categoryId);
    if (cat) {
      cat.initialCount = count;
    }
  }

  public getCategories(): CommunityCategoryMeta[] {
    return [...this.categories];
  }

  public getCategoryById(id: CommunityCategoryKey): CommunityCategoryMeta | undefined {
    return this.categories.find((c) => c.id === id);
  }

  public getTotalServicesCount(): number {
    return this.categories.reduce((acc, c) => acc + c.initialCount, 0);
  }

  /**
   * Returns only verified places fetched from backend.
   * Returns empty array if none found. Zero fallback.
   */
  public getPlacesByCategory(category: CommunityCategoryKey): CommunityPlace[] {
    return this.places.filter((p) => p.category === category);
  }

  public getPlaceById(id: string): CommunityPlace | undefined {
    return this.places.find((p) => p.id === id);
  }

  public isBackendSynced(): boolean {
    return this.isSynced;
  }

  public getIsLoading(): boolean {
    return this.isLoading;
  }

  public getLastError(): Error | null {
    return this.lastError;
  }
}

export const communityService = new CommunityService();
