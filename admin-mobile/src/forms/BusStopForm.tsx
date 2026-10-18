import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { AppTextInput } from '../components/common/AppTextInput';

interface BusStopFormProps {
  data: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
}

export const BusStopForm: React.FC<BusStopFormProps> = ({ data, onChange }) => {
  const updateField = (key: string, value: any) => {
    onChange({ ...data, [key]: value });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Bus Stop & Passenger Stage Amenities</Text>

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Passenger Rain/Sun Shelter Available</Text>
        <Switch
          value={data.hasShelter !== false}
          onValueChange={(val) => updateField('hasShelter', val)}
          trackColor={{ false: colors.borderStrong, true: colors.primaryMuted }}
          thumbColor={data.hasShelter !== false ? colors.primary : '#ffffff'}
        />
      </View>

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Seating Benches Available</Text>
        <Switch
          value={data.hasSeating !== false}
          onValueChange={(val) => updateField('hasSeating', val)}
          trackColor={{ false: colors.borderStrong, true: colors.primaryMuted }}
          thumbColor={data.hasSeating !== false ? colors.primary : '#ffffff'}
        />
      </View>

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Lighting / Solar Lamp at Stage</Text>
        <Switch
          value={data.hasLighting !== false}
          onValueChange={(val) => updateField('hasLighting', val)}
          trackColor={{ false: colors.borderStrong, true: colors.primaryMuted }}
          thumbColor={data.hasLighting !== false ? colors.primary : '#ffffff'}
        />
      </View>

      <AppTextInput
        label="Corridor / Highway Name"
        placeholder="e.g. SH-3 Pavagada - Tumakuru Highway"
        value={data.highwayName || 'State Highway'}
        onChangeText={(t) => updateField('highwayName', t)}
      />

      <AppTextInput
        label="Key Bus Routes Passing Through"
        placeholder="e.g. Pavagada - Tumakuru, Pavagada - Bengaluru, Challakere"
        value={data.routesPassingThrough || ''}
        onChangeText={(t) => updateField('routesPassingThrough', t)}
        multiline
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
