import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DailyChallenge } from '../../types/survey';

interface Props {
  challenge: DailyChallenge;
}

export const DailyChallengeCard: React.FC<Props> = ({ challenge }) => {
  const pct = Math.min(100, Math.round((challenge.current / challenge.target) * 100));

  return (
    <View style={[styles.container, challenge.completed && styles.completedBorder]}>
      <View style={styles.topRow}>
        <View style={styles.titleWrap}>
          <Text style={styles.title}>
            {challenge.completed ? '✅ ' : '🎯 '}
            {challenge.title}
          </Text>
          <Text style={styles.desc}>{challenge.description}</Text>
        </View>

        <View style={styles.rewardPill}>
          <Text style={styles.rewardText}>+{challenge.rewardPoints} PTS</Text>
        </View>
      </View>

      <View style={styles.progressRow}>
        <View style={styles.barBg}>
          <View
            style={[
              styles.barFill,
              { width: `${pct}%` },
              challenge.completed && { backgroundColor: '#10B981' },
            ]}
          />
        </View>
        <Text style={styles.progressCount}>
          {challenge.current}/{challenge.target}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  completedBorder: {
    borderColor: '#A7F3D0',
    backgroundColor: '#F0FDF4',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  titleWrap: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  desc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  rewardPill: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  rewardText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D97706',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
  },
  barBg: {
    flex: 1,
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#C65D3A',
    borderRadius: 3,
  },
  progressCount: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
});
