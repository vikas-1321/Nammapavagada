import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AchievementBadge } from '../../types/survey';

interface Props {
  badge: AchievementBadge;
  isUnlocked: boolean;
}

export const AchievementBadgeCard: React.FC<Props> = ({ badge, isUnlocked }) => {
  return (
    <View style={[styles.card, !isUnlocked && styles.lockedCard]}>
      <Text style={[styles.icon, !isUnlocked && styles.lockedIcon]}>
        {badge.icon}
      </Text>
      <Text style={[styles.title, !isUnlocked && styles.lockedText]} numberOfLines={1}>
        {badge.title}
      </Text>
      <Text style={[styles.desc, !isUnlocked && styles.lockedSubtext]} numberOfLines={2}>
        {badge.description}
      </Text>
      {isUnlocked ? (
        <View style={styles.unlockedPill}>
          <Text style={styles.unlockedText}>UNLOCKED</Text>
        </View>
      ) : (
        <View style={styles.lockedPill}>
          <Text style={styles.lockedPillText}>LOCKED</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 140,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginRight: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  lockedCard: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    opacity: 0.65,
  },
  icon: {
    fontSize: 28,
    marginBottom: 6,
  },
  lockedIcon: {
    opacity: 0.5,
  },
  title: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 2,
  },
  lockedText: {
    color: '#64748B',
  },
  desc: {
    fontSize: 10,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 13,
    marginBottom: 8,
  },
  lockedSubtext: {
    color: '#94A3B8',
  },
  unlockedPill: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  unlockedText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#D97706',
    letterSpacing: 0.5,
  },
  lockedPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  lockedPillText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
});
