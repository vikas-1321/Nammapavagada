import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { AppTextInput } from '../components/common/AppTextInput';

interface EducationFormProps {
  data: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
  isCollege?: boolean;
}

export const EducationForm: React.FC<EducationFormProps> = ({ data, onChange, isCollege }) => {
  const updateField = (key: string, value: any) => {
    onChange({ ...data, [key]: value });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>
        {isCollege ? 'Higher Education & Degree Details' : 'School Education Details'}
      </Text>

      <AppTextInput
        label="Affiliation Board / University"
        placeholder={isCollege ? 'e.g. Tumkur University / DTE' : 'e.g. Karnataka State Board (KSEAB) / CBSE'}
        value={data.board || ''}
        onChangeText={(t) => updateField('board', t)}
      />

      <AppTextInput
        label="Classes / Degrees Offered"
        placeholder={isCollege ? 'e.g. BA, BSc, BCom, BBA, Diploma CS' : 'e.g. Class 1 to 10 (SSLC)'}
        value={data.classesOffered || ''}
        onChangeText={(t) => updateField('classesOffered', t)}
      />

      <AppTextInput
        label="Medium of Instruction"
        placeholder="e.g. Kannada Medium / English Medium / Both"
        value={data.medium || 'Kannada & English'}
        onChangeText={(t) => updateField('medium', t)}
      />

      <AppTextInput
        label="Gender Admission"
        placeholder="Co-educational / Boys Only / Girls Only"
        value={data.genderAdmission || 'Co-educational'}
        onChangeText={(t) => updateField('genderAdmission', t)}
      />

      <Text style={[styles.sectionTitle, { marginTop: 12 }]}>Campus Facilities</Text>

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Science & Computer Laboratories</Text>
        <Switch
          value={data.hasLabs !== false}
          onValueChange={(val) => updateField('hasLabs', val)}
          trackColor={{ false: colors.borderStrong, true: colors.primaryMuted }}
          thumbColor={data.hasLabs !== false ? colors.primary : '#ffffff'}
        />
      </View>

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Library & Reading Hall</Text>
        <Switch
          value={data.hasLibrary !== false}
          onValueChange={(val) => updateField('hasLibrary', val)}
          trackColor={{ false: colors.borderStrong, true: colors.primaryMuted }}
          thumbColor={data.hasLibrary !== false ? colors.primary : '#ffffff'}
        />
      </View>

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Sports Ground / Playground</Text>
        <Switch
          value={data.hasPlayground !== false}
          onValueChange={(val) => updateField('hasPlayground', val)}
          trackColor={{ false: colors.borderStrong, true: colors.primaryMuted }}
          thumbColor={data.hasPlayground !== false ? colors.primary : '#ffffff'}
        />
      </View>

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Student Hostel Facility</Text>
        <Switch
          value={!!data.hasHostel}
          onValueChange={(val) => updateField('hasHostel', val)}
          trackColor={{ false: colors.borderStrong, true: colors.primaryMuted }}
          thumbColor={data.hasHostel ? colors.primary : '#ffffff'}
        />
      </View>

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Bus / Van Transport Provided</Text>
        <Switch
          value={!!data.hasTransport}
          onValueChange={(val) => updateField('hasTransport', val)}
          trackColor={{ false: colors.borderStrong, true: colors.primaryMuted }}
          thumbColor={data.hasTransport ? colors.primary : '#ffffff'}
        />
      </View>

      <AppTextInput
        label="Admissions Contact Phone"
        placeholder="e.g. 08136-244555"
        value={data.admissionPhone || ''}
        onChangeText={(t) => updateField('admissionPhone', t)}
        keyboardType="phone-pad"
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
    marginBottom: 8,
  },
  switchLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMain,
  },
});
