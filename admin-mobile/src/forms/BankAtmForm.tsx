import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { AppTextInput } from '../components/common/AppTextInput';

interface BankAtmFormProps {
  data: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
  isAtmOnly?: boolean;
}

export const BankAtmForm: React.FC<BankAtmFormProps> = ({ data, onChange, isAtmOnly }) => {
  const updateField = (key: string, value: any) => {
    onChange({ ...data, [key]: value });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>
        {isAtmOnly ? 'ATM / Cash Kiosk Specifications' : 'Banking & Branch Specifications'}
      </Text>

      {!isAtmOnly && (
        <>
          <View style={styles.twoCol}>
            <View style={{ flex: 1 }}>
              <AppTextInput
                label="Branch Name"
                placeholder="e.g. Pavagada Town Branch"
                value={data.branchName || ''}
                onChangeText={(t) => updateField('branchName', t)}
              />
            </View>
            <View style={{ flex: 1 }}>
              <AppTextInput
                label="IFSC Code"
                required
                placeholder="e.g. SBIN0040123"
                value={data.ifscCode || ''}
                onChangeText={(t) => updateField('ifscCode', t.toUpperCase())}
                autoCapitalize="characters"
              />
            </View>
          </View>

          <AppTextInput
            label="MICR / Branch Code (Optional)"
            placeholder="e.g. 561002002"
            value={data.micrCode || ''}
            onChangeText={(t) => updateField('micrCode', t)}
          />
        </>
      )}

      <View style={styles.switchRow}>
        <View style={styles.switchInfo}>
          <Text style={styles.switchLabel}>24/7 ATM Access</Text>
          <Text style={styles.switchSub}>Cash withdrawal kiosk open 24 hours</Text>
        </View>
        <Switch
          value={data.has24x7Atm !== false}
          onValueChange={(val) => updateField('has24x7Atm', val)}
          trackColor={{ false: colors.borderStrong, true: colors.primaryMuted }}
          thumbColor={data.has24x7Atm !== false ? colors.primary : '#ffffff'}
        />
      </View>

      <View style={styles.switchRow}>
        <View style={styles.switchInfo}>
          <Text style={styles.switchLabel}>Cash Deposit Machine (CDM / Recycler)</Text>
          <Text style={styles.switchSub}>Instant automated account cash deposit</Text>
        </View>
        <Switch
          value={!!data.hasCdm}
          onValueChange={(val) => updateField('hasCdm', val)}
          trackColor={{ false: colors.borderStrong, true: colors.primaryMuted }}
          thumbColor={data.hasCdm ? colors.primary : '#ffffff'}
        />
      </View>

      {!isAtmOnly && (
        <>
          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchLabel}>Passbook Printing Kiosk</Text>
            </View>
            <Switch
              value={data.hasPassbookKiosk !== false}
              onValueChange={(val) => updateField('hasPassbookKiosk', val)}
              trackColor={{ false: colors.borderStrong, true: colors.primaryMuted }}
              thumbColor={data.hasPassbookKiosk !== false ? colors.primary : '#ffffff'}
            />
          </View>

          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchLabel}>Safe Deposit Locker Facility</Text>
            </View>
            <Switch
              value={!!data.hasLockers}
              onValueChange={(val) => updateField('hasLockers', val)}
              trackColor={{ false: colors.borderStrong, true: colors.primaryMuted }}
              thumbColor={data.hasLockers ? colors.primary : '#ffffff'}
            />
          </View>

          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchLabel}>Agricultural & Kisan Credit Card (KCC) Loans</Text>
            </View>
            <Switch
              value={data.hasAgriLoans !== false}
              onValueChange={(val) => updateField('hasAgriLoans', val)}
              trackColor={{ false: colors.borderStrong, true: colors.primaryMuted }}
              thumbColor={data.hasAgriLoans !== false ? colors.primary : '#ffffff'}
            />
          </View>
        </>
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
  twoCol: {
    flexDirection: 'row',
    gap: 12,
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
