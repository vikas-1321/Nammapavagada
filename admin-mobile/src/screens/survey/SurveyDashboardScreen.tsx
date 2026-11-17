import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { surveyApi } from '../../api/surveyApi';
import { surveyOffline } from '../../utils/surveyOffline';
import { SurveyDashboardStats, SurveyDraft } from '../../types/survey';
import { SurveyStatsCard } from '../../components/survey/SurveyStatsCard';
import { DailyChallengeCard } from '../../components/survey/DailyChallengeCard';
import { AchievementBadgeCard } from '../../components/survey/AchievementBadgeCard';

export const SurveyDashboardScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [stats, setStats] = useState<SurveyDashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [drafts, setDrafts] = useState<SurveyDraft[]>([]);
  const [draftModalVisible, setDraftModalVisible] = useState<boolean>(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [dashStats, offlineDrafts] = await Promise.all([
        surveyApi.getDashboardStats().catch(() => null),
        surveyOffline.getDrafts(),
      ]);
      if (dashStats) setStats(dashStats);
      setDrafts(offlineDrafts);
    } catch {
      // offline fallback
      const offlineDrafts = await surveyOffline.getDrafts();
      setDrafts(offlineDrafts);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleSyncDrafts = async () => {
    setLoading(true);
    const res = await surveyOffline.syncAllPendingDrafts();
    setLoading(false);
    if (res.success) {
      Alert.alert(
        'Cloud Sync Successful! ☁️',
        `Successfully synced ${res.syncedBuildings} buildings and ${res.syncedBusinesses} businesses.`
      );
      loadData();
    } else {
      Alert.alert('Sync Result', `Issues encountered: ${res.errors.join(', ')}`);
      loadData();
    }
  };

  const handleResumeDraft = (draft: SurveyDraft) => {
    setDraftModalVisible(false);
    if (draft.type === 'BUILDING') {
      navigation.navigate('BuildingWizard', {
        initialLat: draft.data?.latitude,
        initialLng: draft.data?.longitude,
      });
    } else {
      navigation.navigate('BusinessWizard', {
        buildingId: draft.data?.buildingId,
      });
    }
  };

  const handleDeleteDraft = async (id: string) => {
    await surveyOffline.deleteDraft(id);
    const updated = await surveyOffline.getDrafts();
    setDrafts(updated);
  };

  const unlockedBadgeIds = new Set(
    (stats?.surveyor?.badges || []).map((b) => (typeof b === 'string' ? b : b.id))
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTag}>NAMMA PAVAGADA</Text>
          <Text style={styles.headerTitle}>Building & Business Intelligence</Text>
        </View>

        <TouchableOpacity
          style={styles.mapBtn}
          onPress={() => navigation.navigate('BuildingMap')}
        >
          <Text style={styles.mapBtnText}>🗺️ Map View</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Surveyor Gamification Stats Card */}
        <SurveyStatsCard
          profile={stats?.surveyor}
          onSyncPress={handleSyncDrafts}
          pendingSyncCount={drafts.filter((d) => !d.synced).length}
        />

        {/* Quick Action Navigation Buttons */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionTile, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('BuildingMap')}
          >
            <Text style={styles.actionIcon}>🗺️</Text>
            <Text style={styles.actionTitle}>Building Map</Text>
            <Text style={styles.actionSub}>OpenStreetMap Explorer</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionTile, { backgroundColor: '#0F172A' }]}
            onPress={() => navigation.navigate('BuildingWizard')}
          >
            <Text style={styles.actionIcon}>🏛️</Text>
            <Text style={styles.actionTitle}>Map Building</Text>
            <Text style={styles.actionSub}>+ New Physical Survey</Text>
          </TouchableOpacity>
        </View>

        {/* Drafts Summary Button */}
        {drafts.length > 0 && (
          <TouchableOpacity
            style={styles.draftsStrip}
            onPress={() => setDraftModalVisible(true)}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ fontSize: 18 }}>📝</Text>
              <View>
                <Text style={styles.draftsTitle}>{drafts.length} Local Survey Drafts</Text>
                <Text style={styles.draftsSub}>Tap to view, resume or sync offline progress</Text>
              </View>
            </View>
            <Text style={styles.draftsArrow}>View →</Text>
          </TouchableOpacity>
        )}

        {/* Aggregate Taluk Mapped Breakdown */}
        {stats && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionHeader}>Taluk Coverage Statistics</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{stats.totalBuildings}</Text>
                <Text style={styles.statLabel}>Buildings Mapped</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={[styles.statNumber, { color: colors.primary }]}>{stats.totalShops}</Text>
                <Text style={styles.statLabel}>Registered Shops</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={[styles.statNumber, { color: '#6366F1' }]}>{stats.mixedBuildings}</Text>
                <Text style={styles.statLabel}>Mixed-Use</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={[styles.statNumber, { color: '#10B981' }]}>{stats.residentialBuildings}</Text>
                <Text style={styles.statLabel}>Residential</Text>
              </View>
            </View>
          </View>
        )}

        {/* Daily Challenges Section */}
        {stats?.dailyChallenges && stats.dailyChallenges.length > 0 && (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeader}>🎯 Daily Survey Challenges</Text>
              <Text style={styles.sectionSubBadge}>Earn Bonus Points</Text>
            </View>
            {stats.dailyChallenges.map((ch) => (
              <DailyChallengeCard key={ch.id} challenge={ch} />
            ))}
          </View>
        )}

        {/* Achievements / Badges Section */}
        {stats?.allAvailableBadges && (
          <View style={[styles.sectionCard, { marginBottom: 30 }]}>
            <Text style={styles.sectionHeader}>🏆 Surveyor Badges & Achievements</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
              {stats.allAvailableBadges.map((badge) => (
                <AchievementBadgeCard
                  key={badge.id}
                  badge={badge}
                  isUnlocked={unlockedBadgeIds.has(badge.id)}
                />
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>

      {/* Offline Drafts Modal */}
      <Modal visible={draftModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Local Offline Survey Drafts</Text>
              <TouchableOpacity onPress={() => setDraftModalVisible(false)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 400 }}>
              {drafts.map((d) => (
                <View key={d.id} style={styles.draftCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.draftTypeBadge}>{d.type}</Text>
                    <Text style={styles.draftItemTitle}>{d.title}</Text>
                    <Text style={styles.draftItemSub}>{d.subtitle}</Text>
                    <Text style={styles.draftDate}>
                      Step {d.step}/{d.totalSteps} • Saved {new Date(d.updatedAt).toLocaleTimeString()}
                    </Text>
                  </View>

                  <View style={styles.draftActions}>
                    <TouchableOpacity
                      style={styles.resumeBtn}
                      onPress={() => handleResumeDraft(d)}
                    >
                      <Text style={styles.resumeBtnText}>Resume</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.delBtn}
                      onPress={() => handleDeleteDraft(d.id)}
                    >
                      <Text style={styles.delBtnText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity style={styles.syncAllBtn} onPress={handleSyncDrafts}>
              <Text style={styles.syncAllText}>☁️ Sync All Pending Drafts</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTag: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 1,
  },
  mapBtn: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  mapBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  scroll: {
    flex: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginTop: 8,
  },
  actionTile: {
    flex: 1,
    padding: 14,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  actionSub: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
    fontWeight: '500',
  },
  draftsStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 12,
  },
  draftsTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
  },
  draftsSub: {
    fontSize: 10,
    color: '#B45309',
  },
  draftsArrow: {
    fontSize: 12,
    fontWeight: '800',
    color: '#92400E',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  sectionSubBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: '#D97706',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  statBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  statLabel: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalCloseText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#64748B',
  },
  draftCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  draftTypeBadge: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.primary,
    backgroundColor: 'rgba(198, 93, 58, 0.1)',
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  draftItemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  draftItemSub: {
    fontSize: 11,
    color: '#64748B',
  },
  draftDate: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 4,
  },
  draftActions: {
    gap: 6,
  },
  resumeBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  resumeBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  delBtn: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  delBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EF4444',
  },
  syncAllBtn: {
    backgroundColor: '#0F172A',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 12,
  },
  syncAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

