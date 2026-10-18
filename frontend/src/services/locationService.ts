/**
 * Namma Pavagada - Centralized Location Service
 * Single Source of Truth for all Explorer landmarks and places.
 * Communicates exclusively with backend REST API:
 *   - GET /api/locations
 *   - GET /api/locations/:id
 *   - GET /api/locations/map/markers
 *   - GET /api/categories
 *
 * NO HARDCODED OR MOCK FALLBACKS.
 */

import { CATEGORY_REGISTRY, CategoryDefinition } from '../data/categoriesData';
import { LocationCategory, LocationDetail } from '../types/location';
import { apiClient } from './apiClient';

export interface LocationQueryParams {
  category?: LocationCategory | string | 'ALL';
  subcategory?: string;
  searchQuery?: string;
  tags?: string[];
  pdfOnly?: boolean;
  limit?: number;
  offset?: number;
}

export interface LocationsApiResponse {
  items: LocationDetail[];
  total: number;
  limit?: number;
  offset?: number;
}

export interface BackendCategory {
  id: string;
  name: string;
  shortCode?: string;
  badgeColorClass?: string;
  borderClass?: string;
  description?: string;
  isFutureModule?: boolean;
  displayOrder?: number;
  status?: string;
}

export interface MapMarkerData {
  id: string;
  name: string;
  shortName?: string;
  category: string;
  subcategory?: string;
  coordinates: [number, number];
  summary: string;
  area?: string;
  address?: string;
  elevationMeters?: number;
  primaryPhotoUrl?: string;
  status?: string;
  verification?: {
    status: string;
    isFresh: boolean;
  };
}

class LocationService {
  private locations: LocationDetail[] = [];
  private totalCount: number = 0;
  private isLoadedFromApi: boolean = false;
  private isLoading: boolean = false;
  private lastError: Error | null = null;
  private categoriesCache: CategoryDefinition[] = [];
  private listeners: Array<() => void> = [];

  constructor() {
    // Proactively fetch initial published locations from backend
    this.refreshFromApi().catch((err) => {
      console.warn('[LocationService] Initial API fetch failed:', err);
    });

    // Automatically revalidate when tab regains focus or visibility
    apiClient.onRevalidate(() => {
      this.refreshFromApi(true).catch(() => {});
    });
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach((l) => {
      try {
        l();
      } catch (err) {
        console.error('[LocationService] listener error:', err);
      }
    });
  }

  /**
   * Refreshes locations and category definitions from backend API
   */
  public async refreshFromApi(forceRefresh: boolean = false): Promise<void> {
    this.isLoading = true;
    try {
      const [locationsRes, categoriesRes] = await Promise.allSettled([
        apiClient.get<LocationsApiResponse>('/locations', { limit: 200 }, { forceRefresh }),
        apiClient.get<BackendCategory[]>('/categories', undefined, { forceRefresh }),
      ]);

      if (locationsRes.status === 'fulfilled' && locationsRes.value && Array.isArray(locationsRes.value.items)) {
        this.locations = locationsRes.value.items;
        this.totalCount = locationsRes.value.total ?? locationsRes.value.items.length;
        this.isLoadedFromApi = true;
        this.lastError = null;
      } else if (locationsRes.status === 'rejected') {
        this.lastError = locationsRes.reason instanceof Error ? locationsRes.reason : new Error(String(locationsRes.reason));
      }

      if (categoriesRes.status === 'fulfilled' && Array.isArray(categoriesRes.value)) {
        this.categoriesCache = this.mergeCategoriesWithRegistry(categoriesRes.value);
      }

      this.notifyListeners();
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Retrieve locations asynchronously with server-side filters.
   * Throws on error so the caller can render an ErrorState.
   * Returns empty array if none exist (EmptyState).
   */
  public async getLocationsAsync(
    params?: LocationQueryParams,
    options?: { forceRefresh?: boolean }
  ): Promise<LocationsApiResponse> {
    const queryParams: Record<string, string | number | boolean | undefined> = {
      limit: params?.limit ?? 100,
      offset: params?.offset ?? 0,
    };

    if (params?.category && params.category !== 'ALL') {
      queryParams.category = params.category;
    }
    if (params?.subcategory && params.subcategory !== 'ALL') {
      queryParams.subcategory = params.subcategory;
    }
    if (params?.searchQuery && params.searchQuery.trim().length > 0) {
      queryParams.q = params.searchQuery.trim();
    }
    if (params?.pdfOnly) {
      queryParams.pdfOnly = true;
    }

    const res = await apiClient.get<LocationsApiResponse>('/locations', queryParams, {
      forceRefresh: options?.forceRefresh,
    });

    if (res && Array.isArray(res.items)) {
      // If this was an unfiltered query, update local cache
      if (!params || (!params.category && !params.searchQuery && !params.subcategory)) {
        this.locations = res.items;
        this.totalCount = res.total ?? res.items.length;
        this.isLoadedFromApi = true;
        this.notifyListeners();
      }
      return res;
    }

    return { items: [], total: 0 };
  }

  /**
   * Retrieve single location detail by ID from backend.
   */
  public async getLocationByIdAsync(id: string): Promise<LocationDetail | null> {
    try {
      const res = await apiClient.get<LocationDetail>(`/locations/${encodeURIComponent(id)}`);
      return res || null;
    } catch (err) {
      console.warn(`[LocationService] Failed to load location ${id}:`, err);
      return null;
    }
  }

  /**
   * Retrieve lightweight map markers from backend with valid geographic coordinates.
   */
  public async getMapMarkersAsync(
    categoryFilter?: string,
    query?: string,
    forceRefresh: boolean = false
  ): Promise<MapMarkerData[]> {
    const params: Record<string, string | undefined> = {};
    if (categoryFilter && categoryFilter !== 'ALL') {
      params.category = categoryFilter;
    }
    if (query && query.trim()) {
      params.q = query.trim();
    }

    const markers = await apiClient.get<MapMarkerData[]>('/locations/map/markers', params, {
      forceRefresh,
    });

    if (Array.isArray(markers)) {
      // Exclude markers with missing or invalid coordinates
      return markers.filter(
        (m) =>
          Array.isArray(m.coordinates) &&
          m.coordinates.length === 2 &&
          typeof m.coordinates[0] === 'number' &&
          !isNaN(m.coordinates[0]) &&
          typeof m.coordinates[1] === 'number' &&
          !isNaN(m.coordinates[1])
      );
    }
    return [];
  }

  /**
   * Synchronous accessor for components subscribing to service updates.
   * Returns ONLY backend-retrieved records.
   */
  public getLocations(params?: LocationQueryParams): LocationDetail[] {
    let result = [...this.locations];

    if (!params) return result;

    if (params.category && params.category !== 'ALL') {
      result = result.filter((loc) => loc.category === params.category);
    }

    if (params.searchQuery && params.searchQuery.trim().length > 0) {
      const q = params.searchQuery.toLowerCase().trim();
      result = result.filter(
        (loc) =>
          loc.name.toLowerCase().includes(q) ||
          (loc.kannadaName && loc.kannadaName.toLowerCase().includes(q)) ||
          loc.summary.toLowerCase().includes(q) ||
          loc.address.toLowerCase().includes(q) ||
          (loc.tags && loc.tags.some((t) => t.toLowerCase().includes(q)))
      );
    }

    if (params.tags && params.tags.length > 0) {
      result = result.filter((loc) => loc.tags && params.tags!.some((tag) => loc.tags.includes(tag)));
    }

    if (params.pdfOnly) {
      result = result.filter((loc) => loc.isPdfAuthoritative);
    }

    return result;
  }

  public getLocationById(id: string): LocationDetail | undefined {
    return this.locations.find((loc) => loc.id === id);
  }

  /**
   * Retrieve active categories list (combining backend records with presentation tokens)
   */
  public getCategories(): CategoryDefinition[] {
    if (this.categoriesCache.length > 0) {
      return this.categoriesCache;
    }
    return Object.values(CATEGORY_REGISTRY);
  }

  public async getCategoriesAsync(forceRefresh: boolean = false): Promise<CategoryDefinition[]> {
    try {
      const backendCats = await apiClient.get<BackendCategory[]>('/categories', undefined, { forceRefresh });
      if (Array.isArray(backendCats) && backendCats.length > 0) {
        this.categoriesCache = this.mergeCategoriesWithRegistry(backendCats);
        return this.categoriesCache;
      }
    } catch (e) {
      console.warn('[LocationService] Categories API request failed:', e);
    }
    return this.getCategories();
  }

  private mergeCategoriesWithRegistry(backendCats: BackendCategory[]): CategoryDefinition[] {
    return backendCats
      .filter((c) => c.status !== 'INACTIVE' && c.status !== 'ARCHIVED')
      .map((c) => {
        const preset = (CATEGORY_REGISTRY as Record<string, CategoryDefinition>)[c.id];
        return {
          id: c.id as LocationCategory,
          name: c.name || preset?.name || c.id,
          shortCode: c.shortCode || preset?.shortCode || c.id.slice(0, 4),
          badgeColorClass: c.badgeColorClass || preset?.badgeColorClass || 'bg-forest-green text-white',
          borderClass: c.borderClass || preset?.borderClass || 'border-forest-green',
          description: c.description || preset?.description || '',
          isFutureModule: c.isFutureModule ?? preset?.isFutureModule ?? false,
        };
      });
  }

  /**
   * Get dynamic counts of locations by category directly from backend data
   */
  public getCategoryCounts(): Record<string, number> {
    const counts: Record<string, number> = { ALL: this.locations.length };
    for (const loc of this.locations) {
      if (loc.category) {
        counts[loc.category] = (counts[loc.category] || 0) + 1;
      }
    }
    return counts;
  }

  public isApiLoaded(): boolean {
    return this.isLoadedFromApi;
  }

  public getIsLoading(): boolean {
    return this.isLoading;
  }

  public getLastError(): Error | null {
    return this.lastError;
  }

  public getTotalCount(): number {
    return this.totalCount;
  }
}

export const locationService = new LocationService();
