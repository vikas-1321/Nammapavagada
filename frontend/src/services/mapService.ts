/**
 * Namma Pavagada - Map Service
 * Geospatial coordination and marker mapping for Leaflet
 * Communicates exclusively with backend map markers endpoint:
 *   GET /api/locations/map/markers
 *
 * NO HARDCODED OR MOCK FALLBACKS.
 */

import { locationService, MapMarkerData } from './locationService';

export type { MapMarkerData };

class MapService {
  public readonly DEFAULT_CENTER: [number, number] = [14.1025, 77.2798]; // Pavagada Fort Hill
  public readonly DEFAULT_ZOOM: number = 13;

  /**
   * Synchronous marker retrieval based on current backend locations state.
   */
  public getMarkers(categoryFilter?: string, query?: string): MapMarkerData[] {
    const locations = locationService.getLocations({
      category: categoryFilter !== 'ALL' ? (categoryFilter as any) : undefined,
      searchQuery: query,
    });

    return locations
      .filter((loc) => loc.coordinates && loc.coordinates.latitude != null && loc.coordinates.longitude != null)
      .map((loc) => ({
        id: loc.id,
        name: loc.name,
        shortName: (loc as any).shortName || loc.name,
        category: loc.category,
        subcategory: (loc as any).subcategory,
        coordinates: [loc.coordinates.latitude, loc.coordinates.longitude],
        summary: loc.summary,
        area: (loc as any).area || 'Pavagada',
        address: loc.address,
        elevationMeters: loc.coordinates.elevationMeters,
        primaryPhotoUrl: loc.primaryPhotoUrl,
        status: loc.status,
      }));
  }

  /**
   * Async marker retrieval directly querying backend /api/locations/map/markers.
   * Excludes records without usable coordinates.
   */
  public async getMarkersAsync(
    categoryFilter?: string,
    query?: string,
    forceRefresh: boolean = false
  ): Promise<MapMarkerData[]> {
    return locationService.getMapMarkersAsync(categoryFilter, query, forceRefresh);
  }

  /**
   * Calculate distance between two coordinates in kilometers (Haversine formula)
   */
  public calculateDistanceKm(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth radius in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(2));
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}

export const mapService = new MapService();
