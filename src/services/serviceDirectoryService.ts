import { TRANSIT_ROUTES, CIVIC_OFFICES, EMERGENCY_CONTACTS } from '../data/servicesData';
import { TransitScheduleItem, CivicServiceContact, EmergencyContact } from '../types/service';
import { apiClient } from './apiClient';

interface BusRoutesApiResponse {
  items: TransitScheduleItem[];
  total: number;
}

class ServiceDirectoryService {
  private transitRoutes: TransitScheduleItem[] = [...TRANSIT_ROUTES];
  private civicOffices: CivicServiceContact[] = [...CIVIC_OFFICES];
  private emergencyContacts: EmergencyContact[] = [...EMERGENCY_CONTACTS];
  private isLoadedFromApi: boolean = false;
  private lastSyncedAt: Date | null = null;
  private listeners: Array<() => void> = [];

  constructor() {
    this.refreshFromApi();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(l => {
      try {
        l();
      } catch (e) {
        console.error('[ServiceDirectoryService] listener error:', e);
      }
    });
  }

  public async refreshFromApi(): Promise<boolean> {
    try {
      const data = await apiClient.get<BusRoutesApiResponse>('/buses/routes', { limit: 100 });
      if (data && Array.isArray(data.items)) {
        this.transitRoutes = data.items;
        this.isLoadedFromApi = true;
        this.lastSyncedAt = new Date();
        this.notifyListeners();
        return true;
      }
      return false;
    } catch (err) {
      console.warn('[ServiceDirectoryService] Failed to sync bus routes from backend REST API:', err);
      return false;
    }
  }

  public async fetchTransitRoutes(forceRefresh: boolean = false): Promise<TransitScheduleItem[]> {
    if (this.isLoadedFromApi && !forceRefresh) {
      return [...this.transitRoutes];
    }
    await this.refreshFromApi();
    return [...this.transitRoutes];
  }

  public getTransitRoutes(): TransitScheduleItem[] {
    return [...this.transitRoutes];
  }

  public isApiLoaded(): boolean {
    return this.isLoadedFromApi;
  }

  public getLastSyncedAt(): Date | null {
    return this.lastSyncedAt;
  }

  public getCivicOffices(): CivicServiceContact[] {
    return [...this.civicOffices];
  }

  public getEmergencyContacts(): EmergencyContact[] {
    return [...this.emergencyContacts];
  }

  public searchServices(query: string): {
    transit: TransitScheduleItem[];
    civic: CivicServiceContact[];
    emergency: EmergencyContact[];
  } {
    const q = query.toLowerCase().trim();
    if (!q) {
      return {
        transit: this.getTransitRoutes(),
        civic: this.getCivicOffices(),
        emergency: this.getEmergencyContacts()
      };
    }

    return {
      transit: this.transitRoutes.filter(r =>
        r.destination.toLowerCase().includes(q) ||
        r.source.toLowerCase().includes(q) ||
        r.operator.toLowerCase().includes(q) ||
        r.routeCode.toLowerCase().includes(q) ||
        (r.via && r.via.some(v => v.toLowerCase().includes(q))) ||
        (r.stops && r.stops.some(s =>
          s.stopName.toLowerCase().includes(q) ||
          (s.kannadaName && s.kannadaName.toLowerCase().includes(q))
        ))
      ),
      civic: this.civicOffices.filter(c =>
        c.officeName.toLowerCase().includes(q) ||
        c.department.toLowerCase().includes(q) ||
        c.keyServices.some(s => s.toLowerCase().includes(q))
      ),
      emergency: this.emergencyContacts.filter(e =>
        e.service.toLowerCase().includes(q) ||
        e.telephone.includes(q)
      )
    };
  }
}

export const serviceDirectoryService = new ServiceDirectoryService();
