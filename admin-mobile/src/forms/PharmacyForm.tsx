import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { AppTextInput } from '../components/common/AppTextInput';

interface PharmacyFormProps {
  data: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
}

export const PharmacyForm: React.FC<PharmacyFormProps> = ({ data, onChange }) => {
  const updateField = (key: string, value: any) => {
    onChange({ ...data, [key]: value });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Pharmacy & Medicine Services</Text>

      <View style={styles.switchRow}>
        <View style={styles.switchInfo}>
          <Text style={styles.switchLabel}>24/7 Round the Clock Service</Text>
          <Text style={styles.switchSub}>Open day and night for emergency medicines</Text>
        </View>
        <Switch
          value={!!data.is24x7}
          onValueChange={(val) => updateField('is24x7', val)}
          trackColor={{ false: colors.borderStrong, true: colors.primaryMuted }}
          thumbColor={data.is24x7 ? colors.primary : '#ffffff'}
        />
      </View>

      <View style={styles.switchRow}>
        <View style={styles.switchInfo}>
          <Text style={styles.switchLabel}>Jan Aushadhi Kendra (Government)</Text>
          <Text style={styles.switchSub}>PMBJP subsidized generic medicine store</Text>
        </View>
        <Switch
          value={!!data.isJanAushadhi}
          onValueChange={(val) => updateField('isJanAushadhi', val)}
          trackColor={{ false: colors.borderStrong, true: colors.primaryMuted }}
          thumbColor={data.isJanAushadhi ? colors.primary : '#ffffff'}
        />
      </View>

      <View style={styles.switchRow}>
        <View style={styles.switchInfo}>
          <Text style={styles.switchLabel}>Generic Medicines Available</Text>
        </View>
        <Switch
          value={data.hasGenericMedicines !== false}
          onValueChange={(val) => updateField('hasGenericMedicines', val)}
          trackColor={{ false: colors.borderStrong, true: colors.primaryMuted }}
          thumbColor={data.hasGenericMedicines !== false ? colors.primary : '#ffffff'}
        />
      </View>

      <View style={styles.switchRow}>
        <View style={styles.switchInfo}>
          <Text style={styles.switchLabel}>Home Delivery Available</Text>
          <Text style={styles.switchSub}>Delivers medicines to home in Pavagada town</Text>
        </View>
        <Switch
          value={!!data.hasHomeDelivery}
          onValueChange={(val) => updateField('hasHomeDelivery', val)}
          trackColor={{ false: colors.borderStrong, true: colors.primaryMuted }}
          thumbColor={data.hasHomeDelivery ? colors.primary : '#ffffff'}
        />
      </View>

      {data.hasHomeDelivery && (
        <AppTextInput
          label="Delivery Coverage Area"
          placeholder="e.g. Within 3 km of Pavagada Town"
          value={data.deliveryArea || ''}
          onChangeText={(t) => updateField('deliveryArea', t)}
        />
      )}

      <AppTextInput
        label="WhatsApp Prescription Number"
        placeholder="e.g. 9449800000"
        value={data.whatsappPrescription || ''}
        onChangeText={(t) => updateField('whatsappPrescription', t)}
        keyboardType="phone-pad"
      />

      <View style={styles.switchRow}>
        <View style={styles.switchInfo}>
          <Text style={styles.switchLabel}>Emergency Night Bell / Callout Available</Text>
        </View>
        <Switch
          value={!!data.hasNightEmergencyService}
          onValueChange={(val) => updateField('hasNightEmergencyService', val)}
          trackColor={{ false: colors.borderStrong, true: colors.primaryMuted }}
          thumbColor={data.hasNightEmergencyService ? colors.primary : '#ffffff'}
        />
      </View>
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
