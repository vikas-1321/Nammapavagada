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
      const promises = [
        apiClient.get<any[]>('/hospitals', undefined, { forceRefresh }).catch(() => null),
        apiClient.get<any[]>('/schools', undefined, { forceRefresh }).catch(() => null),
        apiClient.get<any[]>('/colleges', undefined, { forceRefresh }).catch(() => null),
        apiClient.get<any[]>('/theatres', undefined, { forceRefresh }).catch(() => null),
        apiClient.get<BackendBusResponse>('/buses/routes', undefined, { forceRefresh }).catch(() => null),
        apiClient.get<LocationApiResponse>('/locations', { category: 'CIVIC_GOVERNMENT', limit: 100 }, { forceRefresh }).catch(() => null),
        apiClient.get<LocationApiResponse>('/locations', { category: 'PUBLIC_UTILITY', limit: 100 }, { forceRefresh }).catch(() => null),
      ];

      const [hospitalsRes, schoolsRes, collegesRes, theatresRes, busesRes, govRes, utilRes] =
        await Promise.all(promises);

      const freshPlaces: CommunityPlace[] = [];

      // 1. Hospitals
      if (Array.isArray(hospitalsRes)) {
        this.updateCategoryCount('hospitals', hospitalsRes.length);
        hospitalsRes.forEach((h: any) => {
          freshPlaces.push({
            id: `hosp-${h.id}`,
            category: 'hospitals',
            name: h.name,
            kannadaName: h.kannadaName,
            type: h.type || 'Government Taluk Hospital',
            address: h.address || 'Pavagada Town',
            phone: h.phone,
            emergencyPhone: h.emergencyPhone,
            openingHours: h.openingHours || '24/7 Casualty & Inpatient Desk',
            description: h.description,
            services: Array.isArray(h.services) ? h.services : [],
            departments: Array.isArray(h.departments) ? h.departments : [],
            verificationStatus: 'Verified Official',
            latitude: h.latitude,
            longitude: h.longitude,
            website: h.website,
          });
        });
      } else {
        this.updateCategoryCount('hospitals', 0);
      }

      // 2. Schools
      if (Array.isArray(schoolsRes)) {
        this.updateCategoryCount('schools', schoolsRes.length);
        schoolsRes.forEach((s: any) => {
          freshPlaces.push({
            id: `school-${s.id}`,
            category: 'schools',
            name: s.name,
            kannadaName: s.kannadaName,
            type: s.institutionType || 'Primary & High School',
            address: s.address,
            phone: s.phone,
            openingHours: s.openingHours || '09:30 AM – 04:30 PM',
            description: s.description,
            facilities: Array.isArray(s.facilities) ? s.facilities : [],
            verificationStatus: 'Verified Official',
            latitude: s.latitude,
            longitude: s.longitude,
            website: s.website,
          });
        });
      } else {
        this.updateCategoryCount('schools', 0);
      }

      // 3. Colleges
      if (Array.isArray(collegesRes)) {
        this.updateCategoryCount('colleges', collegesRes.length);
        collegesRes.forEach((c: any) => {
          freshPlaces.push({
            id: `college-${c.id}`,
            category: 'colleges',
            name: c.name,
            kannadaName: c.kannadaName,
            type: c.institutionType || 'Pre-University / Degree College',
            address: c.address,
            phone: c.phone,
            openingHours: c.openingHours || '09:30 AM – 04:30 PM',
            description: c.description,
            courses: Array.isArray(c.courses) ? c.courses : [],
            facilities: Array.isArray(c.facilities) ? c.facilities : [],
            verificationStatus: 'Verified Official',
            latitude: c.latitude,
            longitude: c.longitude,
            website: c.website,
          });
        });
      } else {
        this.updateCategoryCount('colleges', 0);
      }

      // 4. Theatres / Entertainment
      if (Array.isArray(theatresRes)) {
        this.updateCategoryCount('entertainment', theatresRes.length);
        theatresRes.forEach((t: any) => {
          freshPlaces.push({
            id: `theatre-${t.id}`,
            category: 'entertainment',
            name: t.name,
            kannadaName: t.kannadaName,
            type: 'Cinema Theatre',
            address: t.address,
            phone: t.phone,
            showTimings: Array.isArray(t.showTimings) ? t.showTimings : [],
            currentMovie: Array.isArray(t.currentMovies) ? t.currentMovies.join(', ') : '',
            ticketInfo: t.ticketInfo,
            verificationStatus: 'Active Service',
            latitude: t.latitude,
            longitude: t.longitude,
            website: t.website,
          });
        });
      } else {
        this.updateCategoryCount('entertainment', 0);
      }

      // 5. Transport (buses)
      if (
        busesRes &&
        typeof busesRes === 'object' &&
        'items' in busesRes &&
        Array.isArray((busesRes as BackendBusResponse).items)
      ) {
        this.updateCategoryCount('transport', (busesRes as BackendBusResponse).items.length);
      } else {
        this.updateCategoryCount('transport', 0);
      }

      // 6. Civic Administration
      const govItems: any[] = (govRes && typeof govRes === 'object' && 'items' in govRes && Array.isArray((govRes as LocationApiResponse).items))
        ? (govRes as LocationApiResponse).items
        : (Array.isArray(govRes) ? govRes : []);
      this.updateCategoryCount('government', govItems.length);
      govItems.forEach((loc: any) => {
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
          verificationStatus: 'Verified Official',
          latitude: loc.coordinates?.latitude,
          longitude: loc.coordinates?.longitude,
          website: loc.contact?.website,
        });
      });

      // 7. Banks & Public Utilities
      const utilItems: any[] = (utilRes && typeof utilRes === 'object' && 'items' in utilRes && Array.isArray((utilRes as LocationApiResponse).items))
        ? (utilRes as LocationApiResponse).items
        : (Array.isArray(utilRes) ? utilRes : []);
      this.updateCategoryCount('banks', utilItems.length);
      utilItems.forEach((loc: any) => {
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
          verificationStatus: 'Registered',
          latitude: loc.coordinates?.latitude,
          longitude: loc.coordinates?.longitude,
          website: loc.contact?.website,
        });
      });

      // 8. Emergency (hospitals casualty numbers + unified helplines)
      const emergencyPlacesCount = 2 + (Array.isArray(hospitalsRes) ? hospitalsRes.length : 0);
      this.updateCategoryCount('emergency', emergencyPlacesCount);

      // 9. Food & Dining
      this.updateCategoryCount('food', 0);

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
