import { COMMUNITY_CATEGORIES_META, COMMUNITY_PLACES } from '../data/communityData';
import { CommunityCategoryKey, CommunityCategoryMeta, CommunityPlace } from '../types/community';
import { apiClient } from './apiClient';

interface BackendBusResponse {
  items: unknown[];
  total: number;
}

class CommunityService {
  private categories: CommunityCategoryMeta[] = JSON.parse(JSON.stringify(COMMUNITY_CATEGORIES_META));
  private places: CommunityPlace[] = JSON.parse(JSON.stringify(COMMUNITY_PLACES));
  private isSynced: boolean = false;
  private listeners: Array<() => void> = [];

  constructor() {
    this.syncCountsFromBackend();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify(): void {
    this.listeners.forEach(l => {
      try {
        l();
      } catch (err) {
        console.error('[CommunityService] listener notification error:', err);
      }
    });
  }

  /**
   * Attempt to sync live counts and records from backend REST endpoints
   * Falls back gracefully to authentic local data if API is offline.
   */
  public async syncCountsFromBackend(): Promise<void> {
    try {
      const promises = [
        apiClient.get<any[]>('/hospitals').catch(() => null),
        apiClient.get<any[]>('/schools').catch(() => null),
        apiClient.get<any[]>('/colleges').catch(() => null),
        apiClient.get<any[]>('/theatres').catch(() => null),
        apiClient.get<BackendBusResponse>('/buses/routes').catch(() => null),
      ];

      const [hospitalsRes, schoolsRes, collegesRes, theatresRes, busesRes] = await Promise.all(promises);
      let updated = false;

      // Update hospitals if backend returns data
      if (Array.isArray(hospitalsRes) && hospitalsRes.length > 0) {
        this.updateCategoryCount('hospitals', hospitalsRes.length);
        // Merge backend hospital records with community schema
        hospitalsRes.forEach((h: any) => {
          const existing = this.places.find(p => p.id === `hosp-${h.id}` || p.name.toLowerCase() === (h.name || '').toLowerCase());
          if (!existing) {
            this.places.push({
              id: `api-hosp-${h.id}`,
              category: 'hospitals',
              name: h.name,
              kannadaName: h.kannadaName,
              type: h.type || 'Hospital',
              address: h.address || 'Pavagada',
              phone: h.phone,
              emergencyPhone: h.emergencyPhone,
              openingHours: h.openingHours || '24/7 Casualty',
              description: h.description,
              services: Array.isArray(h.services) ? h.services : [],
              verificationStatus: 'Verified Official',
              latitude: h.latitude,
              longitude: h.longitude,
            });
          }
        });
        updated = true;
      }

      // Update schools
      if (Array.isArray(schoolsRes) && schoolsRes.length > 0) {
        this.updateCategoryCount('schools', schoolsRes.length);
        updated = true;
      }

      // Update colleges
      if (Array.isArray(collegesRes) && collegesRes.length > 0) {
        this.updateCategoryCount('colleges', collegesRes.length);
        updated = true;
      }

      // Update theatres
      if (Array.isArray(theatresRes) && theatresRes.length > 0) {
        this.updateCategoryCount('entertainment', theatresRes.length);
        updated = true;
      }

      // Update transport bus routes
      if (busesRes && typeof busesRes === 'object' && 'items' in busesRes && Array.isArray((busesRes as BackendBusResponse).items)) {
        const busItems = (busesRes as BackendBusResponse).items;
        if (busItems.length > 0) {
          this.updateCategoryCount('transport', busItems.length);
          updated = true;
        }
      }

      if (updated) {
        this.isSynced = true;
        this.notify();
      }
    } catch (e) {
      console.warn('[CommunityService] Backend sync completed with local fallback:', e);
    }
  }

  private updateCategoryCount(categoryId: CommunityCategoryKey, count: number): void {
    const cat = this.categories.find(c => c.id === categoryId);
    if (cat) {
      cat.initialCount = count;
    }
  }

  public getCategories(): CommunityCategoryMeta[] {
    return [...this.categories];
  }

  public getCategoryById(id: CommunityCategoryKey): CommunityCategoryMeta | undefined {
    return this.categories.find(c => c.id === id);
  }

  public getTotalServicesCount(): number {
    return this.categories.reduce((acc, c) => acc + c.initialCount, 0);
  }

  public getPlacesByCategory(category: CommunityCategoryKey): CommunityPlace[] {
    return this.places.filter(p => p.category === category);
  }

  public getPlaceById(id: string): CommunityPlace | undefined {
    return this.places.find(p => p.id === id);
  }

  public searchPlaces(category: CommunityCategoryKey, query: string, typeFilter?: string): CommunityPlace[] {
    let items = this.getPlacesByCategory(category);
    const q = query.trim().toLowerCase();

    if (typeFilter && typeFilter !== 'ALL') {
      items = items.filter(p => {
        if (!p.type) return false;
        return p.type.toLowerCase().includes(typeFilter.toLowerCase());
      });
    }

    if (!q) return items;

    return items.filter(p => {
      const matchName = p.name.toLowerCase().includes(q);
      const matchKannada = p.kannadaName?.toLowerCase().includes(q);
      const matchAddress = p.address.toLowerCase().includes(q);
      const matchDesc = p.description?.toLowerCase().includes(q);
      const matchType = p.type?.toLowerCase().includes(q);
      const matchTags = p.tags?.some(t => t.toLowerCase().includes(q));
      const matchServices = p.services?.some(s => s.toLowerCase().includes(q));
      const matchCourses = p.courses?.some(c => c.toLowerCase().includes(q));
      return (
        matchName ||
        matchKannada ||
        matchAddress ||
        matchDesc ||
        matchType ||
        matchTags ||
        matchServices ||
        matchCourses
      );
    });
  }

  public isBackendSynced(): boolean {
    return this.isSynced;
  }
}

export const communityService = new CommunityService();
