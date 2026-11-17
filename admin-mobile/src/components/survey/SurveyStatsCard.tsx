import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';
import { SurveyorProfile } from '../../types/survey';

interface Props {
  profile?: SurveyorProfile;
  onRefresh?: () => void;
  onSyncPress?: () => void;
  pendingSyncCount?: number;
}

export const SurveyStatsCard: React.FC<Props> = ({
  profile,
  onRefresh,
  onSyncPress,
  pendingSyncCount = 0,
}) => {
  if (!profile) return null;

  return (
    <View style={styles.card}>
      {/* Top Header: Level & Points */}
      <View style={styles.headerRow}>
        <View style={styles.levelBadge}>
          <Text style={styles.levelIcon}>⭐</Text>
          <View>
            <Text style={styles.levelLabel}>LEVEL {profile.levelNumber}</Text>
            <Text style={styles.levelTitle}>{profile.levelTitle}</Text>
          </View>
        </View>

        <View style={styles.pointsPill}>
          <Text style={styles.pointsValue}>{profile.totalPoints.toLocaleString()}</Text>
          <Text style={styles.pointsLabel}>PTS</Text>
        </View>
      </View>

      {/* Progress Bar to Next Level */}
      <View style={styles.progressSection}>
        <View style={styles.progressTextRow}>
          <Text style={styles.progressText}>
            Progress to Level {Math.min(5, profile.levelNumber + 1)}
          </Text>
          <Text style={styles.progressPct}>{profile.levelProgressPct}%</Text>
        </View>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${profile.levelProgressPct}%` }]} />
        </View>
      </View>

      {/* Stats Counters Grid */}
      <View style={styles.countersRow}>
        <View style={styles.counterBox}>
          <Text style={styles.counterVal}>{profile.buildingsMappedCount}</Text>
          <Text style={styles.counterLbl}>Buildings</Text>
        </View>

        <View style={styles.counterDivider} />

        <View style={styles.counterBox}>
          <Text style={styles.counterVal}>{profile.shopsRegisteredCount}</Text>
          <Text style={styles.counterLbl}>Shops</Text>
        </View>

        <View style={styles.counterDivider} />

        <View style={styles.counterBox}>
          <Text style={styles.counterVal}>{profile.photosUploadedCount}</Text>
          <Text style={styles.counterLbl}>Photos</Text>
        </View>

        <View style={styles.counterDivider} />

        <View style={styles.counterBox}>
          <Text style={styles.counterVal}>{profile.badges?.length || 0}</Text>
          <Text style={styles.counterLbl}>Badges</Text>
        </View>
      </View>

      {/* Pending Sync Alert if offline drafts exist */}
      {pendingSyncCount > 0 && (
        <TouchableOpacity style={styles.syncAlert} onPress={onSyncPress} activeOpacity={0.8}>
          <Text style={styles.syncAlertIcon}>☁️</Text>
          <Text style={styles.syncAlertText}>
            {pendingSyncCount} offline {pendingSyncCount === 1 ? 'draft' : 'drafts'} waiting to sync
          </Text>
          <Text style={styles.syncActionText}>Sync Now →</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    borderWidth: 1,
    borderColor: '#334155',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  levelIcon: {
    fontSize: 28,
  },
  levelLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#F59E0B',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  levelTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 1,
  },
  pointsPill: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: '#F59E0B',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
  },
  pointsValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F59E0B',
  },
  pointsLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#F59E0B',
    letterSpacing: 0.5,
  },
  progressSection: {
    marginTop: 14,
  },
  progressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#94A3B8',
  },
  progressPct: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F59E0B',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#334155',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#F59E0B',
    borderRadius: 3,
  },
  countersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  counterBox: {
    flex: 1,
    alignItems: 'center',
  },
  counterVal: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  counterLbl: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
    fontWeight: '500',
  },
  counterDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#334155',
  },
  syncAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 14,
    gap: 8,
  },
  syncAlertIcon: {
    fontSize: 16,
  },
  syncAlertText: {
    flex: 1,
    fontSize: 11,
    color: '#F1F5F9',
    fontWeight: '600',
  },
  syncActionText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '700',
  },
});

