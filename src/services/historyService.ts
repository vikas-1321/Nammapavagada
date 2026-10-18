/**
 * Namma Pavagada - Historical Archive Service
 * Historical eras, fort structures, and academic documentation.
 * Interfaces with backend endpoints:
 *   - GET /api/history/eras
 *   - GET /api/history/places
 */

import {
  HISTORICAL_ERAS,
  FORT_STRUCTURES,
  MEGALITHIC_SITES,
  ACADEMIC_CITATIONS
} from '../data/historyData';
import {
  HistoricalEra,
  FortStructureItem,
  MegalithicSiteRecord,
  AcademicCitation
} from '../types/history';
import { apiClient } from './apiClient';

class HistoryService {
  private eras: HistoricalEra[] = [...HISTORICAL_ERAS];
  private structures: FortStructureItem[] = [...FORT_STRUCTURES];

  constructor() {
    this.refreshFromApi();
    apiClient.onRevalidate(() => {
      this.refreshFromApi().catch(() => {});
    });
  }

  public async refreshFromApi(): Promise<void> {
    try {
      const [remoteEras, remotePlaces] = await Promise.allSettled([
        apiClient.get<HistoricalEra[]>('/history/eras'),
        apiClient.get<any[]>('/history/places'),
      ]);

      if (remoteEras.status === 'fulfilled' && Array.isArray(remoteEras.value) && remoteEras.value.length > 0) {
        this.eras = remoteEras.value;
      }

      if (remotePlaces.status === 'fulfilled' && Array.isArray(remotePlaces.value) && remotePlaces.value.length > 0) {
        this.structures = remotePlaces.value.map((p: any) => ({
          id: String(p.id || `fort-${Math.random()}`),
          name: p.name || 'Fort Structure',
          kannadaName: p.kannadaName,
          classification: (p.classification === 'RELIGIOUS' || p.classification === 'ROYAL') ? p.classification : 'DEFENSE',
          historicalPeriod: p.historicalPeriod || 'Palegara Era (16th–18th Century)',
          builder: p.builder || undefined,
          architecturalHighlights: Array.isArray(p.architecturalHighlights) ? p.architecturalHighlights : [p.description || 'Historic granite rampart'].filter(Boolean),
          currentCondition: p.currentCondition || p.conservationStatus || 'Fair',
          conservationAction: p.conservationAction || 'Periodic clearance and documentation',
          sourceReference: p.sourceReference || 'Karnataka State Gazetteer / ASI Survey',
        }));
      }
    } catch (e) {
      console.warn('[HistoryService] History sync failed:', e);
    }
  }

  public getAllEras(): HistoricalEra[] {
    return [...this.eras];
  }

  public getEraById(id: string): HistoricalEra | undefined {
    return this.eras.find(era => era.id === id);
  }

  public getFortStructures(filterClassification?: 'DEFENSE' | 'RELIGIOUS' | 'ROYAL'): FortStructureItem[] {
    if (!filterClassification) return [...this.structures];
    return this.structures.filter(s => s.classification === filterClassification);
  }

  public getMegalithicSites(): MegalithicSiteRecord[] {
    return [...MEGALITHIC_SITES];
  }

  public getAcademicCitations(): AcademicCitation[] {
    return [...ACADEMIC_CITATIONS];
  }
}

export const historyService = new HistoryService();
