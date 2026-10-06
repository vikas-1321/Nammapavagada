import { LocationDetail } from '../types/location';
import { locationService } from './locationService';
import { apiClient } from './apiClient';

export interface MapMarkerData {
  id: string;
  name: string;
  category: string;
  coordinates: [number, number];
  summary: string;
  elevationMeters?: number;
  primaryPhotoUrl?: string;
}

class MapService {
  public readonly DEFAULT_CENTER: [number, number] = [14.1025, 77.2798]; // Pavagada Fort Hill
  public readonly DEFAULT_ZOOM: number = 13;

  public getMarkers(categoryFilter?: string, query?: string): MapMarkerData[] {
    const locations: LocationDetail[] = locationService.getLocations({
      category: categoryFilter as any,
      searchQuery: query
    });

    return locations.map(loc => ({
      id: loc.id,
      name: loc.name,
      category: loc.category,
      coordinates: [loc.coordinates.latitude, loc.coordinates.longitude],
      summary: loc.summary,
      elevationMeters: loc.coordinates.elevationMeters,
      primaryPhotoUrl: loc.primaryPhotoUrl,
    }));
  }

  public async getMarkersAsync(categoryFilter?: string, query?: string): Promise<MapMarkerData[]> {
    const remoteMarkers = await apiClient.get<MapMarkerData[]>('/locations/map/markers', {
      category: categoryFilter !== 'ALL' ? categoryFilter : undefined,
      q: query,
    });

    if (remoteMarkers && Array.isArray(remoteMarkers) && remoteMarkers.length > 0) {
      return remoteMarkers;
    }
    return this.getMarkers(categoryFilter, query);
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
