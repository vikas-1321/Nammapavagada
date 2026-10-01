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

class HistoryService {
  public getAllEras(): HistoricalEra[] {
    return [...HISTORICAL_ERAS];
  }

  public getEraById(id: string): HistoricalEra | undefined {
    return HISTORICAL_ERAS.find(era => era.id === id);
  }

  public getFortStructures(filterClassification?: 'DEFENSE' | 'RELIGIOUS' | 'ROYAL'): FortStructureItem[] {
    if (!filterClassification) return [...FORT_STRUCTURES];
    return FORT_STRUCTURES.filter(s => s.classification === filterClassification);
  }

  public getMegalithicSites(): MegalithicSiteRecord[] {
    return [...MEGALITHIC_SITES];
  }

  public getAcademicCitations(): AcademicCitation[] {
    return [...ACADEMIC_CITATIONS];
  }
}

export const historyService = new HistoryService();
