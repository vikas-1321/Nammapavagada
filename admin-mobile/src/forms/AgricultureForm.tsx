import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { AppTextInput } from '../components/common/AppTextInput';

interface AgricultureFormProps {
  data: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
  isApmc?: boolean;
}

export const AgricultureForm: React.FC<AgricultureFormProps> = ({ data, onChange, isApmc }) => {
  const updateField = (key: string, value: any) => {
    onChange({ ...data, [key]: value });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>
        {isApmc ? 'APMC Wholesale Yard Details' : 'Agricultural Inputs & Farm Equipment'}
      </Text>

      {isApmc ? (
        <>
          <AppTextInput
            label="Wholesale Market Days"
            placeholder="e.g. Every Tuesday & Friday, Daily Season Trading"
            value={data.marketDays || 'Tuesday & Friday'}
            onChangeText={(t) => updateField('marketDays', t)}
          />

          <AppTextInput
            label="Auction & Trading Timings"
            placeholder="e.g. 10:00 AM – 02:00 PM"
            value={data.auctionTimings || '10:00 AM – 02:00 PM'}
            onChangeText={(t) => updateField('auctionTimings', t)}
          />

          <AppTextInput
            label="Major Commodities Traded"
            placeholder="e.g. Groundnut (Kadalekayi), Tamarind, Ragi, Maize"
            value={data.cropsHandled || 'Groundnut, Tamarind, Ragi, Maize'}
            onChangeText={(t) => updateField('cropsHandled', t)}
          />

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Electronic Weighbridge on Premises</Text>
            <Switch
              value={data.hasWeighingFacility !== false}
              onValueChange={(val) => updateField('hasWeighingFacility', val)}
              trackColor={{ false: colors.borderStrong, true: colors.primaryMuted }}
              thumbColor={data.hasWeighingFacility !== false ? colors.primary : '#ffffff'}
            />
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Farmer Rest Shed (Rytha Bhavana)</Text>
            <Switch
              value={data.hasFarmerRestRoom !== false}
              onValueChange={(val) => updateField('hasFarmerRestRoom', val)}
              trackColor={{ false: colors.borderStrong, true: colors.primaryMuted }}
              thumbColor={data.hasFarmerRestRoom !== false ? colors.primary : '#ffffff'}
            />
          </View>
        </>
      ) : (
        <>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Certified & Hybrid Seeds Stocked</Text>
            <Switch
              value={data.hasSeeds !== false}
              onValueChange={(val) => updateField('hasSeeds', val)}
              trackColor={{ false: colors.borderStrong, true: colors.primaryMuted }}
              thumbColor={data.hasSeeds !== false ? colors.primary : '#ffffff'}
            />
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Fertilizers Stocked (Urea, DAP, Potash)</Text>
            <Switch
              value={data.hasFertilizers !== false}
              onValueChange={(val) => updateField('hasFertilizers', val)}
              trackColor={{ false: colors.borderStrong, true: colors.primaryMuted }}
              thumbColor={data.hasFertilizers !== false ? colors.primary : '#ffffff'}
            />
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Pesticides & Bio-Pesticides</Text>
            <Switch
              value={data.hasPesticides !== false}
              onValueChange={(val) => updateField('hasPesticides', val)}
              trackColor={{ false: colors.borderStrong, true: colors.primaryMuted }}
              thumbColor={data.hasPesticides !== false ? colors.primary : '#ffffff'}
            />
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Drip Irrigation Pipes & Farm Tools</Text>
            <Switch
              value={!!data.hasIrrigationEquipment}
              onValueChange={(val) => updateField('hasIrrigationEquipment', val)}
              trackColor={{ false: colors.borderStrong, true: colors.primaryMuted }}
              thumbColor={data.hasIrrigationEquipment ? colors.primary : '#ffffff'}
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
