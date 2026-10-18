import React, { useState } from 'react';
import { View, Text, Modal, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { LocationItem, VerificationStatus, VerificationSource } from '../../types';
import { verificationApi } from '../../api/verificationApi';
import { colors } from '../../theme/colors';
import { AppTextInput } from '../common/AppTextInput';
import { AppButton } from '../common/AppButton';

interface QuickVerifyModalProps {
  visible: boolean;
  place: LocationItem | null;
  onClose: () => void;
  onSuccess: (updatedPlace: LocationItem) => void;
}

const SOURCES: VerificationSource[] = [
  'Official Office',
  'Physical Visit',
  'Phone Verification',
  'Official Website',
  'Staff / Manager',
  'User Submitted',
  'Other',
];

export const QuickVerifyModal: React.FC<QuickVerifyModalProps> = ({
  visible,
  place,
  onClose,
  onSuccess,
}) => {
  const [status, setStatus] = useState<VerificationStatus>('VERIFIED');
  const [source, setSource] = useState<VerificationSource>('Physical Visit');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!place) return null;

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const updated = await verificationApi.verifyLocation(place.id, {
        status,
        source,
        notes,
      });
      Alert.alert('Verification Saved', `Place "${place.name}" marked as ${status}.`);
      onSuccess(updated);
      onClose();
    } catch (err: any) {
      Alert.alert('Verification Failed', err.message || 'Unable to update verification status.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Verify & Audit Location</Text>
          <Text style={styles.placeName}>{place.name}</Text>
          <Text style={styles.placeSub}>
            {place.category} • {place.area || place.address}
          </Text>

          <Text style={styles.fieldLabel}>Set Verification Status</Text>
          <View style={styles.chipsRow}>
            {(['VERIFIED', 'PENDING', 'NEEDS_REVERIFICATION', 'NOT_VERIFIED'] as VerificationStatus[]).map((st) => (
              <TouchableOpacity
                key={st}
                onPress={() => setStatus(st)}
                style={[styles.statusChip, status === st && styles.statusChipActive]}
              >
                <Text style={[styles.statusChipText, status === st && styles.statusChipTextActive]}>
                  {st.replace('_', ' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.fieldLabel}>Information Source</Text>
          <View style={styles.chipsRow}>
            {SOURCES.map((src) => (
              <TouchableOpacity
                key={src}
                onPress={() => setSource(src)}
                style={[styles.sourceChip, source === src && styles.sourceChipActive]}
              >
                <Text style={[styles.sourceChipText, source === src && styles.sourceChipTextActive]}>
                  {src}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <AppTextInput
            label="Verification Notes & Evidence"
            placeholder="e.g. Visited in person. Confirmed casualty desk is staffed 24/7."
            value={notes}
            onChangeText={setNotes}
            multiline
          />

          <View style={styles.buttons}>
            <AppButton
              title="Cancel"
              variant="outline"
              onPress={onClose}
              style={{ flex: 1 }}
            />
            <AppButton
              title="Confirm & Save"
              loading={isSubmitting}
              onPress={handleSubmit}
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
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 20,
    maxHeight: '90%',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textMain,
  },
  placeName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primaryDark,
    marginTop: 4,
  },
  placeSub: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMain,
    marginBottom: 8,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  statusChip: {
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  statusChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  statusChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMain,
  },
  statusChipTextActive: {
    color: '#ffffff',
  },
  sourceChip: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  sourceChipActive: {
    backgroundColor: colors.primaryDark,
    borderColor: colors.primaryDark,
  },
  sourceChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textMain,
  },
  sourceChipTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
});
