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

    // Deduplicate pending building drafts by coordinates (keep latest, group duplicate draft IDs)
    const buildingMap = new Map<string, any>();
    const buildingDraftIdGroups = new Map<string, string[]>();

    for (const d of pending) {
      if (d.type === 'BUILDING' && d.data) {
        const lat = parseFloat(d.data.latitude);
        const lng = parseFloat(d.data.longitude);
        const key = !isNaN(lat) && !isNaN(lng)
          ? `${lat.toFixed(5)}_${lng.toFixed(5)}`
          : d.id;
        buildingMap.set(key, { ...d.data, clientDraftId: d.id });
        const group = buildingDraftIdGroups.get(key) || [];
        group.push(d.id);
        buildingDraftIdGroups.set(key, group);
      }
    }
    const buildingsPayload = Array.from(buildingMap.values());

    // Deduplicate pending business drafts by buildingId + name (keep latest, group duplicate draft IDs)
    const businessMap = new Map<string, any>();
    const businessDraftIdGroups = new Map<string, string[]>();

    for (const d of pending) {
      if (d.type === 'BUSINESS' && d.data) {
        const bldId = d.data.buildingId || 'unknown';
        const bName = (d.data.name || '').trim().toLowerCase();
        const key = `${bldId}_${bName}`;
        businessMap.set(key, { ...d.data, clientDraftId: d.id });
        const group = businessDraftIdGroups.get(key) || [];
        group.push(d.id);
        businessDraftIdGroups.set(key, group);
      }
    }
    const businessesPayload = Array.from(businessMap.values());

    try {
      const result = await surveyApi.bulkSyncSurveys({
        buildings: buildingsPayload,
        businesses: businessesPayload,
      });

      if (result.success || (result.syncedBuildingsCount + result.syncedBusinessesCount > 0)) {
        // Clear all successfully synced draft IDs including grouped duplicates
        const syncedDraftIds = new Set<string>();
        for (const b of (result.syncedBuildings || [])) {
          if (b.clientDraftId) {
            syncedDraftIds.add(b.clientDraftId);
            for (const [, group] of buildingDraftIdGroups.entries()) {
              if (group.includes(b.clientDraftId)) {
                group.forEach((id) => syncedDraftIds.add(id));
              }
            }
          }
        }
        for (const biz of (result.syncedBusinesses || [])) {
          if (biz.clientDraftId) {
            syncedDraftIds.add(biz.clientDraftId);
            for (const [, group] of businessDraftIdGroups.entries()) {
              if (group.includes(biz.clientDraftId)) {
                group.forEach((id) => syncedDraftIds.add(id));
              }
            }
          }
        }

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

