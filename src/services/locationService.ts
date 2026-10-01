import { LOCATIONS_DATA } from '../data/locationsData';
import { CATEGORY_REGISTRY, CategoryDefinition } from '../data/categoriesData';
import { LocationCategory, LocationDetail } from '../types/location';

export interface LocationQueryParams {
  category?: LocationCategory | 'ALL';
  searchQuery?: string;
  tags?: string[];
  pdfOnly?: boolean;
}

class LocationService {
  private locations: LocationDetail[] = LOCATIONS_DATA;

  /**
   * Retrieve all locations with optional filtering
   */
  public getLocations(params?: LocationQueryParams): LocationDetail[] {
    let result = [...this.locations];

    if (!params) return result;

    if (params.category && params.category !== 'ALL') {
      result = result.filter(loc => loc.category === params.category);
    }

    if (params.searchQuery && params.searchQuery.trim().length > 0) {
      const q = params.searchQuery.toLowerCase().trim();
      result = result.filter(loc =>
        loc.name.toLowerCase().includes(q) ||
        (loc.kannadaName && loc.kannadaName.includes(q)) ||
        loc.summary.toLowerCase().includes(q) ||
        loc.address.toLowerCase().includes(q) ||
        loc.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    if (params.tags && params.tags.length > 0) {
      result = result.filter(loc =>
        params.tags!.some(tag => loc.tags.includes(tag))
      );
    }

    if (params.pdfOnly) {
      result = result.filter(loc => loc.isPdfAuthoritative);
    }

    return result;
  }

  /**
   * Get location by unique ID
   */
  public getLocationById(id: string): LocationDetail | undefined {
    return this.locations.find(loc => loc.id === id);
  }

  /**
   * Get list of categories
   */
  public getCategories(): CategoryDefinition[] {
    return Object.values(CATEGORY_REGISTRY);
  }

  /**
   * Get category definition
   */
  public getCategory(category: LocationCategory): CategoryDefinition {
    return CATEGORY_REGISTRY[category];
  }

  /**
   * Get counts of locations by category
   */
  public getCategoryCounts(): Record<string, number> {
    const counts: Record<string, number> = { ALL: this.locations.length };
    for (const loc of this.locations) {
      counts[loc.category] = (counts[loc.category] || 0) + 1;
    }
    return counts;
  }
}

export const locationService = new LocationService();
