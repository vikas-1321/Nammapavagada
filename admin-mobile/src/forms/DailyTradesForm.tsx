import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { AppTextInput } from '../components/common/AppTextInput';

interface DailyTradesFormProps {
  data: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
}

export const DailyTradesForm: React.FC<DailyTradesFormProps> = ({ data, onChange }) => {
  const updateField = (key: string, value: any) => {
    onChange({ ...data, [key]: value });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Trade & Essential Service Specifications</Text>

      <AppTextInput
        label="Service Profession / Trade Type"
        placeholder="e.g. Electrician, Plumber, Carpenter, Welder, Water Supplier"
        value={data.tradeType || ''}
        onChangeText={(t) => updateField('tradeType', t)}
      />

      <AppTextInput
        label="Service Coverage Area"
        placeholder="e.g. Entire Pavagada Town and surrounding villages up to 15 km"
        value={data.serviceArea || 'Pavagada Town & Surrounding Villages'}
        onChangeText={(t) => updateField('serviceArea', t)}
      />

      <View style={styles.switchRow}>
        <View style={styles.switchInfo}>
          <Text style={styles.switchLabel}>Doorstep Home Service Available</Text>
          <Text style={styles.switchSub}>Visits residence or farm for repairs</Text>
        </View>
        <Switch
          value={data.hasHomeService !== false}
          onValueChange={(val) => updateField('hasHomeService', val)}
          trackColor={{ false: colors.borderStrong, true: colors.primaryMuted }}
          thumbColor={data.hasHomeService !== false ? colors.primary : '#ffffff'}
        />
      </View>

      <View style={styles.switchRow}>
        <View style={styles.switchInfo}>
          <Text style={styles.switchLabel}>Emergency / Out-of-Hours Callout</Text>
          <Text style={styles.switchSub}>Available for urgent pipe leaks or electrical faults</Text>
        </View>
        <Switch
          value={!!data.hasEmergencyService}
          onValueChange={(val) => updateField('hasEmergencyService', val)}
          trackColor={{ false: colors.borderStrong, true: colors.primaryMuted }}
          thumbColor={data.hasEmergencyService ? colors.primary : '#ffffff'}
        />
      </View>

      <AppTextInput
        label="Pricing / Visit Fee Information (Optional)"
        placeholder="e.g. Minimum visit fee ₹150; repair charges based on work"
        value={data.pricingInfo || ''}
        onChangeText={(t) => updateField('pricingInfo', t)}
        helperText="Only include voluntary standard rates provided by the technician"
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
});
