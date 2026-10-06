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
  }

  public async refreshFromApi(): Promise<void> {
    const remoteEras = await apiClient.get<HistoricalEra[]>('/history/eras');
    if (remoteEras && Array.isArray(remoteEras) && remoteEras.length > 0) {
      this.eras = remoteEras;
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
