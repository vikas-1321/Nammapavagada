import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  StyleSheet,
} from 'react-native';
import { StructuredHours, DaySchedule } from '../../types';
import { colors } from '../../theme/colors';
import { AppTextInput } from '../common/AppTextInput';

interface OperatingHoursEditorProps {
  value?: StructuredHours;
  onChange: (hours: StructuredHours) => void;
}

const DAYS: Array<'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'> = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

const DEFAULT_SCHEDULE: DaySchedule = {
  isClosed: false,
  slots: [{ open: '09:00 AM', close: '05:00 PM' }],
};

export const OperatingHoursEditor: React.FC<OperatingHoursEditorProps> = ({
  value = { is24Hours: false },
  onChange,
}) => {
  const is24Hours = !!value.is24Hours;

  const handleToggle24Hours = (val: boolean) => {
    onChange({
      ...value,
      is24Hours: val,
      open: val ? '24 Hours' : '09:00 AM',
      close: val ? '24 Hours' : '05:00 PM',
      days: val ? 'All Days' : 'Monday - Saturday',
    });
  };

  const handleToggleDayClosed = (day: typeof DAYS[number], closed: boolean) => {
    const currentDay = value[day] || { ...DEFAULT_SCHEDULE };
    onChange({
      ...value,
      [day]: {
        ...currentDay,
        isClosed: closed,
      },
    });
  };

  const handleSlotChange = (
    day: typeof DAYS[number],
    slotIndex: number,
    field: 'open' | 'close',
    text: string
  ) => {
    const currentDay = value[day] || { ...DEFAULT_SCHEDULE };
    const slots = [...(currentDay.slots || [{ open: '09:00 AM', close: '05:00 PM' }])];
    slots[slotIndex] = {
      ...slots[slotIndex],
      [field]: text,
    };
    onChange({
      ...value,
      [day]: {
        ...currentDay,
        slots,
      },
    });
  };

  const handleAddSlot = (day: typeof DAYS[number]) => {
    const currentDay = value[day] || { ...DEFAULT_SCHEDULE };
    const slots = [...(currentDay.slots || [])];
    slots.push({ open: '05:00 PM', close: '08:00 PM' });
    onChange({
      ...value,
      [day]: {
        ...currentDay,
        slots,
      },
    });
  };

  const handleRemoveSlot = (day: typeof DAYS[number], slotIndex: number) => {
    const currentDay = value[day] || { ...DEFAULT_SCHEDULE };
    const slots = [...(currentDay.slots || [])];
    slots.splice(slotIndex, 1);
    onChange({
      ...value,
      [day]: {
        ...currentDay,
        slots,
      },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.toggleRow}>
        <View style={styles.toggleInfo}>
          <Text style={styles.toggleTitle}>Open 24 Hours / 7 Days</Text>
          <Text style={styles.toggleSubtitle}>
            For emergency desks, police stations, fuel pumps, and ATMs
          </Text>
        </View>
        <Switch
          value={is24Hours}
          onValueChange={handleToggle24Hours}
          trackColor={{ false: colors.borderStrong, true: colors.primaryMuted }}
          thumbColor={is24Hours ? colors.primary : '#ffffff'}
        />
      </View>

      {!is24Hours && (
        <View style={styles.daysList}>
          {DAYS.map((day) => {
            const dayData: DaySchedule = value[day] || (day === 'sunday' ? { isClosed: true, slots: [] } : DEFAULT_SCHEDULE);
            const isClosed = dayData.isClosed;
            const slots = dayData.slots || [];

            return (
              <View key={day} style={styles.dayCard}>
                <View style={styles.dayHeader}>
                  <Text style={styles.dayName}>
                    {day.charAt(0).toUpperCase() + day.slice(1)}
                  </Text>
                  <View style={styles.closedToggle}>
                    <Text style={[styles.closedLabel, isClosed && styles.closedLabelActive]}>
                      {isClosed ? 'Closed' : 'Open'}
                    </Text>
                    <Switch
                      value={!isClosed}
                      onValueChange={(open) => handleToggleDayClosed(day, !open)}
                      trackColor={{ false: colors.borderStrong, true: colors.primaryMuted }}
                      thumbColor={!isClosed ? colors.primary : '#ffffff'}
                    />
                  </View>
                </View>

                {!isClosed && (
                  <View style={styles.slotsContainer}>
                    {slots.map((slot, idx) => (
                      <View key={idx} style={styles.slotRow}>
                        <View style={styles.timeInput}>
                          <AppTextInput
                            placeholder="09:00 AM"
                            value={slot.open}
                            onChangeText={(t) => handleSlotChange(day, idx, 'open', t)}
                            containerStyle={styles.noMargin}
                          />
                        </View>
                        <Text style={styles.toText}>–</Text>
                        <View style={styles.timeInput}>
                          <AppTextInput
                            placeholder="05:00 PM"
                            value={slot.close}
                            onChangeText={(t) => handleSlotChange(day, idx, 'close', t)}
                            containerStyle={styles.noMargin}
                          />
                        </View>
                        {slots.length > 1 && (
                          <TouchableOpacity
                            onPress={() => handleRemoveSlot(day, idx)}
                            style={styles.removeSlotBtn}
                          >
                            <Text style={styles.removeSlotText}>✕</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    ))}
                    {slots.length < 2 && (
                      <TouchableOpacity
                        onPress={() => handleAddSlot(day)}
                        style={styles.addSlotBtn}
                      >
                        <Text style={styles.addSlotText}>+ Add Evening Slot</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}

      <AppTextInput
        label="Operating Hours Notes"
        placeholder="e.g. Lunch break 01:30 PM - 02:30 PM. OPD 9 AM - 1 PM."
        value={value.notes || ''}
        onChangeText={(notes) => onChange({ ...value, notes })}
        multiline
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  toggleInfo: {
    flex: 1,
    marginRight: 12,
  },
  toggleTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textMain,
  },
  toggleSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  daysList: {
    marginBottom: 16,
  },
  dayCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dayName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textMain,
  },
  closedToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  closedLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  closedLabelActive: {
    color: colors.textMuted,
  },
  slotsContainer: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
  },
  slotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeInput: {
    flex: 1,
  },
  toText: {
    marginHorizontal: 8,
    color: colors.textMuted,
    fontWeight: '700',
  },
  noMargin: {
    marginBottom: 0,
  },
  removeSlotBtn: {
    marginLeft: 8,
    padding: 8,
  },
  removeSlotText: {
    color: colors.danger,
    fontWeight: '700',
  },
  addSlotBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  addSlotText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
});
