import { storage } from './storage';
import { SurveyDraft } from '../types/survey';
import { surveyApi } from '../api/surveyApi';

const DRAFTS_STORAGE_KEY = 'npweb_survey_drafts_v1';

export const surveyOffline = {
  getDrafts: async (): Promise<SurveyDraft[]> => {
    try {
      const raw = await storage.getItem(DRAFTS_STORAGE_KEY);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  getDraftById: async (id: string): Promise<SurveyDraft | null> => {
    const drafts = await surveyOffline.getDrafts();
    return drafts.find((d) => d.id === id) || null;
  },

  saveDraft: async (draft: SurveyDraft): Promise<void> => {
    const drafts = await surveyOffline.getDrafts();
    const idx = drafts.findIndex((d) => d.id === draft.id);
    draft.updatedAt = new Date().toISOString();
    draft.synced = false;

    if (idx >= 0) {
      drafts[idx] = draft;
    } else {
      drafts.unshift(draft);
    }
    await storage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(drafts));
  },

  deleteDraft: async (id: string): Promise<void> => {
    const drafts = await surveyOffline.getDrafts();
    const filtered = drafts.filter((d) => d.id !== id);
    await storage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(filtered));
  },

  getPendingSyncCount: async (): Promise<number> => {
    const drafts = await surveyOffline.getDrafts();
    return drafts.filter((d) => !d.synced).length;
  },

  syncAllPendingDrafts: async (): Promise<{
    success: boolean;
    syncedBuildings: number;
    syncedBusinesses: number;
    errors: any[];
  }> => {
    const drafts = await surveyOffline.getDrafts();
    const pending = drafts.filter((d) => !d.synced);

    if (pending.length === 0) {
      return { success: true, syncedBuildings: 0, syncedBusinesses: 0, errors: [] };
    }

    const buildingsPayload: any[] = [];
    const businessesPayload: any[] = [];

    for (const d of pending) {
      if (d.type === 'BUILDING') {
        buildingsPayload.push({
          ...d.data,
          clientDraftId: d.id,
        });
      } else if (d.type === 'BUSINESS') {
        businessesPayload.push({
          ...d.data,
          clientDraftId: d.id,
        });
      }
    }

    try {
      const result = await surveyApi.bulkSyncSurveys({
        buildings: buildingsPayload,
        businesses: businessesPayload,
      });

      if (result.success || (result.syncedBuildingsCount + result.syncedBusinessesCount > 0)) {
        // Clear successfully synced drafts
        const syncedDraftIds = new Set([
          ...result.syncedBuildings.map((b) => b.clientDraftId),
          ...result.syncedBusinesses.map((b) => b.clientDraftId),
        ]);

        const remainingDrafts = drafts.filter((d) => !syncedDraftIds.has(d.id));
        await storage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(remainingDrafts));

        return {
          success: result.success,
          syncedBuildings: result.syncedBuildingsCount,
          syncedBusinesses: result.syncedBusinessesCount,
          errors: result.errors || [],
        };
      }
      return {
        success: false,
        syncedBuildings: 0,
        syncedBusinesses: 0,
        errors: result.errors || ['Sync was not completed'],
      };
    } catch (err: any) {
      return {
        success: false,
        syncedBuildings: 0,
        syncedBusinesses: 0,
        errors: [err.message || 'Network sync failed'],
      };
    }
  },
};
