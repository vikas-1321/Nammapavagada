import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { DuplicateCandidate } from '../../types';
import { colors } from '../../theme/colors';
import { AppButton } from '../common/AppButton';

interface DuplicateAlertModalProps {
  visible: boolean;
  duplicates: DuplicateCandidate[];
  onContinue: () => void;
  onViewExisting: (candidate: DuplicateCandidate) => void;
  onDismiss: () => void;
}

export const DuplicateAlertModal: React.FC<DuplicateAlertModalProps> = ({
  visible,
  duplicates,
  onContinue,
  onViewExisting,
  onDismiss,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <Text style={styles.icon}>⚠️</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Possible Duplicate Record Detected</Text>
              <Text style={styles.subtitle}>
                We found existing places with similar names or locations in Pavagada.
              </Text>
            </View>
          </View>

          <ScrollView style={styles.list}>
            {duplicates.map((item) => (
              <View key={item.id} style={styles.itemCard}>
                <View style={styles.itemTop}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.matchBadge}>
                    {item.isExactMatch ? 'Exact Match' : `${Math.round(item.similarity * 100)}% Match`}
                  </Text>
                </View>
                <Text style={styles.itemCategory}>
                  {item.category} {item.subcategory ? `• ${item.subcategory}` : ''}
                </Text>
                <Text style={styles.itemAddress} numberOfLines={1}>
                  📍 {item.area || item.address}
                </Text>

                <TouchableOpacity
                  onPress={() => onViewExisting(item)}
                  style={styles.viewBtn}
                >
                  <Text style={styles.viewBtnText}>Inspect Existing Record →</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          <View style={styles.footerButtons}>
            <AppButton
              title="Edit / Review Name"
              variant="outline"
              size="small"
              onPress={onDismiss}
              style={{ flex: 1 }}
            />
            <AppButton
              title="Continue Anyway"
              variant="secondary"
              size="small"
              onPress={onContinue}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 18,
    maxHeight: '80%',
  },
  headerRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  icon: {
    fontSize: 28,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#991b1b',
  },
  subtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  list: {
    marginVertical: 8,
  },
  itemCard: {
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  itemTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textMain,
    flex: 1,
  },
  matchBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: '#991b1b',
    backgroundColor: '#fee2e2',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    marginLeft: 8,
  },
  itemCategory: {
    fontSize: 12,
    color: colors.primaryDark,
    fontWeight: '600',
    marginTop: 2,
  },
  itemAddress: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  viewBtn: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  viewBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  footerButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
});
