import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { AppTextInput } from '../components/common/AppTextInput';

interface ClinicDoctorFormProps {
  data: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
}

export const ClinicDoctorForm: React.FC<ClinicDoctorFormProps> = ({ data, onChange }) => {
  const updateField = (key: string, value: any) => {
    onChange({ ...data, [key]: value });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Doctor & Consultation Details</Text>

      <AppTextInput
        label="Doctor Name & Qualifications"
        placeholder="e.g. Dr. R. K. Sharma, MBBS, MD (Medicine)"
        value={data.doctorName || ''}
        onChangeText={(t) => updateField('doctorName', t)}
      />

      <AppTextInput
        label="Medical Specialization"
        placeholder="e.g. General Physician, Pediatrician, Gynecologist, Dentist"
        value={data.specialization || ''}
        onChangeText={(t) => updateField('specialization', t)}
      />

      <AppTextInput
        label="OPD Consultation Timings"
        placeholder="e.g. 09:30 AM – 01:30 PM & 05:00 PM – 08:30 PM"
        value={data.consultationTimings || ''}
        onChangeText={(t) => updateField('consultationTimings', t)}
      />

      <View style={styles.switchRow}>
        <View style={styles.switchInfo}>
          <Text style={styles.switchLabel}>Walk-in Consultations Accepted</Text>
        </View>
        <Switch
          value={data.isWalkInAvailable !== false}
          onValueChange={(val) => updateField('isWalkInAvailable', val)}
          trackColor={{ false: colors.borderStrong, true: colors.primaryMuted }}
          thumbColor={data.isWalkInAvailable !== false ? colors.primary : '#ffffff'}
        />
      </View>

      <View style={styles.switchRow}>
        <View style={styles.switchInfo}>
          <Text style={styles.switchLabel}>Prior Appointment Required</Text>
        </View>
        <Switch
          value={!!data.isAppointmentRequired}
          onValueChange={(val) => updateField('isAppointmentRequired', val)}
          trackColor={{ false: colors.borderStrong, true: colors.primaryMuted }}
          thumbColor={data.isAppointmentRequired ? colors.primary : '#ffffff'}
        />
      </View>

      <AppTextInput
        label="Languages Spoken"
        placeholder="e.g. Kannada, Telugu, English, Hindi"
        value={data.languagesSpoken || 'Kannada, Telugu'}
        onChangeText={(t) => updateField('languagesSpoken', t)}
      />

      <AppTextInput
        label="Approximate Consultation Fee (Optional)"
        placeholder="e.g. ₹200 – ₹300"
        value={data.consultationFee || ''}
        onChangeText={(t) => updateField('consultationFee', t)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textMain,
    marginBottom: 8,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
  },
  switchInfo: {
    flex: 1,
  },
  switchLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMain,
  },
});
