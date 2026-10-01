import { TRANSIT_ROUTES, CIVIC_OFFICES, EMERGENCY_CONTACTS } from '../data/servicesData';
import { TransitScheduleItem, CivicServiceContact, EmergencyContact } from '../types/service';

class ServiceDirectoryService {
  public getTransitRoutes(): TransitScheduleItem[] {
    return [...TRANSIT_ROUTES];
  }

  public getCivicOffices(): CivicServiceContact[] {
    return [...CIVIC_OFFICES];
  }

  public getEmergencyContacts(): EmergencyContact[] {
    return [...EMERGENCY_CONTACTS];
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
      transit: TRANSIT_ROUTES.filter(r =>
        r.destination.toLowerCase().includes(q) ||
        r.source.toLowerCase().includes(q) ||
        r.operator.toLowerCase().includes(q) ||
        r.via.some(v => v.toLowerCase().includes(q))
      ),
      civic: CIVIC_OFFICES.filter(c =>
        c.officeName.toLowerCase().includes(q) ||
        c.department.toLowerCase().includes(q) ||
        c.keyServices.some(s => s.toLowerCase().includes(q))
      ),
      emergency: EMERGENCY_CONTACTS.filter(e =>
        e.service.toLowerCase().includes(q) ||
        e.telephone.includes(q)
      )
    };
  }
}

export const serviceDirectoryService = new ServiceDirectoryService();
