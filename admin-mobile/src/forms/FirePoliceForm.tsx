import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { AppTextInput } from '../components/common/AppTextInput';

interface FirePoliceFormProps {
  data: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
  isFire?: boolean;
}

export const FirePoliceForm: React.FC<FirePoliceFormProps> = ({ data, onChange, isFire }) => {
  const updateField = (key: string, value: any) => {
    onChange({ ...data, [key]: value });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>
        {isFire ? 'Fire & Emergency Services Details' : 'Police & Law Enforcement Details'}
      </Text>

      <AppTextInput
        label="Emergency Toll-Free Helpline"
        placeholder={isFire ? '101 or 112' : '112'}
        value={data.emergencyNumber || (isFire ? '101' : '112')}
        onChangeText={(t) => updateField('emergencyNumber', t)}
        keyboardType="phone-pad"
      />

      <AppTextInput
        label="Official Station Landline Desk Number"
        placeholder="e.g. 08136-244100"
        value={data.officialDeskPhone || ''}
        onChangeText={(t) => updateField('officialDeskPhone', t)}
        keyboardType="phone-pad"
        helperText="Strictly official public station numbers. Never enter personal cell numbers of staff."
      />

      <AppTextInput
        label="Circle & Sub-Division Jurisdiction"
        placeholder="e.g. Madhugiri Sub-Division, Pavagada Taluk"
        value={data.jurisdiction || 'Pavagada Taluk'}
        onChangeText={(t) => updateField('jurisdiction', t)}
      />

      {!isFire && (
        <>
          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchLabel}>Women & Child Assistance Helpdesk</Text>
            </View>
            <Switch
              value={data.hasWomenDesk !== false}
              onValueChange={(val) => updateField('hasWomenDesk', val)}
              trackColor={{ false: colors.borderStrong, true: colors.primaryMuted }}
              thumbColor={data.hasWomenDesk !== false ? colors.primary : '#ffffff'}
            />
          </View>

          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchLabel}>Lost & Found Article Reporting Desk</Text>
            </View>
            <Switch
              value={data.hasLostAndFound !== false}
              onValueChange={(val) => updateField('hasLostAndFound', val)}
              trackColor={{ false: colors.borderStrong, true: colors.primaryMuted }}
              thumbColor={data.hasLostAndFound !== false ? colors.primary : '#ffffff'}
            />
          </View>

          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchLabel}>Passport & Police Verification Desk</Text>
            </View>
            <Switch
              value={data.hasPassportVerification !== false}
              onValueChange={(val) => updateField('hasPassportVerification', val)}
              trackColor={{ false: colors.borderStrong, true: colors.primaryMuted }}
              thumbColor={data.hasPassportVerification !== false ? colors.primary : '#ffffff'}
            />
          </View>
        </>
      )}

      {isFire && (
        <View style={styles.switchRow}>
          <View style={styles.switchInfo}>
            <Text style={styles.switchLabel}>Disaster & Borewell Rescue Operations</Text>
          </View>
          <Switch
            value={data.hasDisasterRescue !== false}
            onValueChange={(val) => updateField('hasDisasterRescue', val)}
            trackColor={{ false: colors.borderStrong, true: colors.primaryMuted }}
            thumbColor={data.hasDisasterRescue !== false ? colors.primary : '#ffffff'}
          />
        </View>
      )}
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
