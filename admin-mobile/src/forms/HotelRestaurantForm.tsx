import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { AppTextInput } from '../components/common/AppTextInput';

interface HotelRestaurantFormProps {
  data: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
  isHotel?: boolean;
}

export const HotelRestaurantForm: React.FC<HotelRestaurantFormProps> = ({ data, onChange, isHotel }) => {
  const updateField = (key: string, value: any) => {
    onChange({ ...data, [key]: value });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>
        {isHotel ? 'Accommodation & Room Amenities' : 'Dining & Food Service Details'}
      </Text>

      {isHotel ? (
        <>
          <AppTextInput
            label="Room Types Available"
            placeholder="e.g. AC Deluxe, Non-AC Standard, Family Room"
            value={data.roomTypes || ''}
            onChangeText={(t) => updateField('roomTypes', t)}
          />

          <View style={styles.twoCol}>
            <View style={{ flex: 1 }}>
              <AppTextInput
                label="Check-in Time"
                placeholder="12:00 PM / 24-hr"
                value={data.checkInTime || '24-hour check-in'}
                onChangeText={(t) => updateField('checkInTime', t)}
              />
            </View>
            <View style={{ flex: 1 }}>
              <AppTextInput
                label="Check-out Time"
                placeholder="11:00 AM"
                value={data.checkOutTime || '11:00 AM'}
                onChangeText={(t) => updateField('checkOutTime', t)}
              />
            </View>
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Air Conditioned (AC) Rooms</Text>
            <Switch
              value={!!data.hasAc}
              onValueChange={(val) => updateField('hasAc', val)}
              trackColor={{ false: colors.borderStrong, true: colors.primaryMuted }}
              thumbColor={data.hasAc ? colors.primary : '#ffffff'}
            />
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Hot Water Facility (Solar / Geyser)</Text>
            <Switch
              value={data.hasHotWater !== false}
              onValueChange={(val) => updateField('hasHotWater', val)}
              trackColor={{ false: colors.borderStrong, true: colors.primaryMuted }}
              thumbColor={data.hasHotWater !== false ? colors.primary : '#ffffff'}
            />
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Wi-Fi Internet Available</Text>
            <Switch
              value={!!data.hasWifi}
              onValueChange={(val) => updateField('hasWifi', val)}
              trackColor={{ false: colors.borderStrong, true: colors.primaryMuted }}
              thumbColor={data.hasWifi ? colors.primary : '#ffffff'}
            />
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Attached Restaurant / Dining</Text>
            <Switch
              value={!!data.hasRestaurant}
              onValueChange={(val) => updateField('hasRestaurant', val)}
              trackColor={{ false: colors.borderStrong, true: colors.primaryMuted }}
              thumbColor={data.hasRestaurant ? colors.primary : '#ffffff'}
            />
          </View>

          <AppTextInput
            label="Approximate Room Tariff"
            placeholder="e.g. ₹600 – ₹1,800 per night"
            value={data.tariffRange || ''}
            onChangeText={(t) => updateField('tariffRange', t)}
          />
        </>
      ) : (
        <>
          <AppTextInput
            label="Food Classification"
            placeholder="Pure Vegetarian / Non-Vegetarian / Multi-Cuisine"
            value={data.foodClassification || 'Pure Vegetarian'}
            onChangeText={(t) => updateField('foodClassification', t)}
          />

          <AppTextInput
            label="Cuisines Served"
            placeholder="e.g. South Indian, North Indian, Andhra Style, Chinese"
            value={data.cuisines || 'South Indian, Meals, Tiffins'}
            onChangeText={(t) => updateField('cuisines', t)}
          />

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Breakfast Available</Text>
            <Switch
              value={data.hasBreakfast !== false}
              onValueChange={(val) => updateField('hasBreakfast', val)}
              trackColor={{ false: colors.borderStrong, true: colors.primaryMuted }}
              thumbColor={data.hasBreakfast !== false ? colors.primary : '#ffffff'}
            />
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Lunch / South Indian Meals</Text>
            <Switch
              value={data.hasLunch !== false}
              onValueChange={(val) => updateField('hasLunch', val)}
              trackColor={{ false: colors.borderStrong, true: colors.primaryMuted }}
              thumbColor={data.hasLunch !== false ? colors.primary : '#ffffff'}
            />
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Dinner Available</Text>
            <Switch
              value={data.hasDinner !== false}
              onValueChange={(val) => updateField('hasDinner', val)}
              trackColor={{ false: colors.borderStrong, true: colors.primaryMuted }}
              thumbColor={data.hasDinner !== false ? colors.primary : '#ffffff'}
            />
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Takeaway / Parcel Counter</Text>
            <Switch
              value={data.hasTakeaway !== false}
              onValueChange={(val) => updateField('hasTakeaway', val)}
              trackColor={{ false: colors.borderStrong, true: colors.primaryMuted }}
              thumbColor={data.hasTakeaway !== false ? colors.primary : '#ffffff'}
            />
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Accepts UPI Payments (GPay / PhonePe / Paytm)</Text>
            <Switch
              value={data.acceptsUpi !== false}
              onValueChange={(val) => updateField('acceptsUpi', val)}
              trackColor={{ false: colors.borderStrong, true: colors.primaryMuted }}
              thumbColor={data.acceptsUpi !== false ? colors.primary : '#ffffff'}
            />
          </View>
        </>
      )}

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Vehicle Parking Available</Text>
        <Switch
          value={data.hasParking !== false}
          onValueChange={(val) => updateField('hasParking', val)}
          trackColor={{ false: colors.borderStrong, true: colors.primaryMuted }}
          thumbColor={data.hasParking !== false ? colors.primary : '#ffffff'}
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
    marginBottom: 8,
  },
  switchLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMain,
  },
});
