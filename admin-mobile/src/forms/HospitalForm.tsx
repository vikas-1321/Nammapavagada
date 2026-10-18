import React from 'react';
import { View, Text, Switch, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';
import { AppTextInput } from '../components/common/AppTextInput';

interface HospitalFormProps {
  data: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
}

export const HospitalForm: React.FC<HospitalFormProps> = ({ data, onChange }) => {
  const updateField = (key: string, value: any) => {
    onChange({ ...data, [key]: value });
  };

  const doctors = Array.isArray(data.doctors) ? data.doctors : [];

  const handleAddDoctor = () => {
    updateField('doctors', [
      ...doctors,
      { name: '', specialization: '', timings: '10:00 AM - 01:00 PM' },
    ]);
  };

  const handleUpdateDoctor = (index: number, field: string, val: string) => {
    const updated = [...doctors];
    updated[index] = { ...updated[index], [field]: val };
    updateField('doctors', updated);
  };

  const handleRemoveDoctor = (index: number) => {
    const updated = [...doctors];
    updated.splice(index, 1);
    updateField('doctors', updated);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Emergency & Critical Care</Text>

      <View style={styles.switchRow}>
        <View style={styles.switchInfo}>
          <Text style={styles.switchLabel}>24/7 Casualty & Emergency Desk</Text>
          <Text style={styles.switchSub}>Round-the-clock emergency patient admissions</Text>
        </View>
        <Switch
          value={!!data.has24x7Emergency}
          onValueChange={(val) => updateField('has24x7Emergency', val)}
          trackColor={{ false: colors.borderStrong, true: colors.primaryMuted }}
          thumbColor={data.has24x7Emergency ? colors.primary : '#ffffff'}
        />
      </View>

      <View style={styles.switchRow}>
        <View style={styles.switchInfo}>
          <Text style={styles.switchLabel}>Snakebite Treatment & Anti-Venom</Text>
          <Text style={styles.switchSub}>Crucial emergency anti-venom for rural taluk cases</Text>
        </View>
        <Switch
          value={!!data.hasSnakebiteTreatment}
          onValueChange={(val) => updateField('hasSnakebiteTreatment', val)}
          trackColor={{ false: colors.borderStrong, true: colors.primaryMuted }}
          thumbColor={data.hasSnakebiteTreatment ? colors.primary : '#ffffff'}
        />
      </View>

      <View style={styles.switchRow}>
        <View style={styles.switchInfo}>
          <Text style={styles.switchLabel}>Trauma Care Facility</Text>
          <Text style={styles.switchSub}>Acute accident & injury stabilization</Text>
        </View>
        <Switch
          value={!!data.hasTraumaCare}
          onValueChange={(val) => updateField('hasTraumaCare', val)}
          trackColor={{ false: colors.borderStrong, true: colors.primaryMuted }}
          thumbColor={data.hasTraumaCare ? colors.primary : '#ffffff'}
        />
      </View>

      <View style={styles.switchRow}>
        <View style={styles.switchInfo}>
          <Text style={styles.switchLabel}>ICU (Intensive Care Unit)</Text>
          <Text style={styles.switchSub}>Ventilator and intensive monitor beds</Text>
        </View>
        <Switch
          value={!!data.hasIcu}
          onValueChange={(val) => updateField('hasIcu', val)}
          trackColor={{ false: colors.borderStrong, true: colors.primaryMuted }}
          thumbColor={data.hasIcu ? colors.primary : '#ffffff'}
        />
      </View>

      <View style={styles.switchRow}>
        <View style={styles.switchInfo}>
          <Text style={styles.switchLabel}>Dedicated Ambulance Service</Text>
          <Text style={styles.switchSub}>Emergency patient transport on call</Text>
        </View>
        <Switch
          value={!!data.hasAmbulance}
          onValueChange={(val) => updateField('hasAmbulance', val)}
          trackColor={{ false: colors.borderStrong, true: colors.primaryMuted }}
          thumbColor={data.hasAmbulance ? colors.primary : '#ffffff'}
        />
      </View>

      <AppTextInput
        label="Emergency Casualty Direct Phone"
        placeholder="e.g. 108 or 08136-244240"
        value={data.emergencyPhone || ''}
        onChangeText={(val) => updateField('emergencyPhone', val)}
        keyboardType="phone-pad"
      />

      <Text style={[styles.sectionTitle, { marginTop: 12 }]}>Facilities & Operations</Text>

      <View style={styles.twoCol}>
        <View style={{ flex: 1 }}>
          <AppTextInput
            label="Inpatient Bed Count"
            placeholder="100"
            value={data.totalBeds ? String(data.totalBeds) : ''}
            onChangeText={(val) => updateField('totalBeds', val)}
            keyboardType="numeric"
          />
        </View>
        <View style={{ flex: 1 }}>
          <AppTextInput
            label="Institution Type"
            placeholder="Government / Private"
            value={data.institutionType || 'Government'}
            onChangeText={(val) => updateField('institutionType', val)}
          />
        </View>
      </View>

      <View style={styles.switchRow}>
        <View style={styles.switchInfo}>
          <Text style={styles.switchLabel}>Blood Storage / Bank</Text>
        </View>
        <Switch
          value={!!data.hasBloodBank}
          onValueChange={(val) => updateField('hasBloodBank', val)}
          trackColor={{ false: colors.borderStrong, true: colors.primaryMuted }}
          thumbColor={data.hasBloodBank ? colors.primary : '#ffffff'}
        />
      </View>

      <View style={styles.switchRow}>
        <View style={styles.switchInfo}>
          <Text style={styles.switchLabel}>Ayushman Bharat / Insurance Accepted</Text>
        </View>
        <Switch
          value={!!data.acceptsInsurance}
          onValueChange={(val) => updateField('acceptsInsurance', val)}
          trackColor={{ false: colors.borderStrong, true: colors.primaryMuted }}
          thumbColor={data.acceptsInsurance ? colors.primary : '#ffffff'}
        />
      </View>

      {/* Repeatable Doctors Roster */}
      <View style={styles.repeatableHeader}>
        <Text style={styles.sectionTitle}>Key Doctors & Specialists Roster</Text>
        <TouchableOpacity onPress={handleAddDoctor} style={styles.addBtn}>
          <Text style={styles.addBtnText}>+ Add Doctor</Text>
        </TouchableOpacity>
      </View>

      {doctors.map((doc: any, index: number) => (
        <View key={index} style={styles.repeatableCard}>
          <View style={styles.cardTop}>
            <Text style={styles.cardIdx}>Doctor #{index + 1}</Text>
            <TouchableOpacity onPress={() => handleRemoveDoctor(index)}>
              <Text style={styles.removeText}>✕ Remove</Text>
            </TouchableOpacity>
          </View>
          <AppTextInput
            placeholder="Doctor Full Name (e.g. Dr. H. M. Suresh)"
            value={doc.name}
            onChangeText={(t) => handleUpdateDoctor(index, 'name', t)}
          />
          <AppTextInput
            placeholder="Specialization (e.g. Pediatrician, General Surgeon)"
            value={doc.specialization}
            onChangeText={(t) => handleUpdateDoctor(index, 'specialization', t)}
          />
          <AppTextInput
            placeholder="OPD Timings (e.g. 09:30 AM – 01:30 PM)"
            value={doc.timings}
            onChangeText={(t) => handleUpdateDoctor(index, 'timings', t)}
          />
        </View>
      ))}
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
    marginRight: 10,
  },
  switchLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMain,
  },
  switchSub: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  twoCol: {
    flexDirection: 'row',
    gap: 12,
  },
  repeatableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 8,
  },
  addBtn: {
    backgroundColor: colors.primaryLight,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  repeatableCard: {
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardIdx: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
  },
  removeText: {
    fontSize: 12,
    color: colors.danger,
    fontWeight: '600',
  },
});
