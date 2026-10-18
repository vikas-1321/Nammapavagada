import React from 'react';
import { View, Text, Switch, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { AppTextInput } from '../components/common/AppTextInput';

interface CinemaTheatreFormProps {
  data: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
}

export const CinemaTheatreForm: React.FC<CinemaTheatreFormProps> = ({ data, onChange }) => {
  const updateField = (key: string, value: any) => {
    onChange({ ...data, [key]: value });
  };

  const movies = Array.isArray(data.currentMovies) ? data.currentMovies : [];

  const handleAddMovie = () => {
    updateField('currentMovies', [
      ...movies,
      {
        movieName: '',
        language: 'Kannada',
        screen: 'Screen 1',
        showTimes: '10:30 AM, 02:00 PM, 06:30 PM, 09:30 PM',
        ticketPrice: 'Balcony: ₹150, First: ₹100',
        bookingUrl: '',
      },
    ]);
  };

  const handleUpdateMovie = (index: number, field: string, val: string) => {
    const updated = [...movies];
    updated[index] = { ...updated[index], [field]: val };
    updateField('currentMovies', updated);
  };

  const handleRemoveMovie = (index: number) => {
    const updated = [...movies];
    updated.splice(index, 1);
    updateField('currentMovies', updated);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Theatre & Projection Specifications</Text>

      <View style={styles.twoCol}>
        <View style={{ flex: 1 }}>
          <AppTextInput
            label="Total Screens"
            placeholder="1 or 2"
            value={data.totalScreens ? String(data.totalScreens) : '1'}
            onChangeText={(t) => updateField('totalScreens', t)}
            keyboardType="numeric"
          />
        </View>
        <View style={{ flex: 1 }}>
          <AppTextInput
            label="Seating Capacity"
            placeholder="e.g. 450"
            value={data.seatingCapacity ? String(data.seatingCapacity) : ''}
            onChangeText={(t) => updateField('seatingCapacity', t)}
            keyboardType="numeric"
          />
        </View>
      </View>

      <AppTextInput
        label="Sound System"
        placeholder="e.g. Dolby Digital 7.1 / Dolby Atmos / 5.1 Surround"
        value={data.soundSystem || 'Dolby Digital 7.1'}
        onChangeText={(t) => updateField('soundSystem', t)}
      />

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Air Conditioned (AC)</Text>
        <Switch
          value={!!data.isAc}
          onValueChange={(val) => updateField('isAc', val)}
          trackColor={{ false: colors.borderStrong, true: colors.primaryMuted }}
          thumbColor={data.isAc ? colors.primary : '#ffffff'}
        />
      </View>

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Online Booking Available</Text>
        <Switch
          value={!!data.hasOnlineBooking}
          onValueChange={(val) => updateField('hasOnlineBooking', val)}
          trackColor={{ false: colors.borderStrong, true: colors.primaryMuted }}
          thumbColor={data.hasOnlineBooking ? colors.primary : '#ffffff'}
        />
      </View>

      {data.hasOnlineBooking && (
        <AppTextInput
          label="Online Booking Portal URL"
          placeholder="https://in.bookmyshow.com/..."
          value={data.onlineBookingUrl || ''}
          onChangeText={(t) => updateField('onlineBookingUrl', t)}
          autoCapitalize="none"
        />
      )}

      {/* Dynamic Current Movies Roster */}
      <View style={styles.repeatableHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.sectionTitle}>Current Movies & Showtimes ({movies.length})</Text>
          <Text style={styles.subText}>Live dynamic schedule shown to citizens</Text>
        </View>
        <TouchableOpacity onPress={handleAddMovie} style={styles.addBtn}>
          <Text style={styles.addBtnText}>+ Add Movie</Text>
        </TouchableOpacity>
      </View>

      {movies.map((mov: any, index: number) => (
        <View key={index} style={styles.movieCard}>
          <View style={styles.cardTop}>
            <Text style={styles.movieIdx}>Movie #{index + 1}</Text>
            <TouchableOpacity onPress={() => handleRemoveMovie(index)}>
              <Text style={styles.removeText}>✕ Remove</Text>
            </TouchableOpacity>
          </View>

          <AppTextInput
            label="Movie Title"
            required
            placeholder="e.g. Kantara, Martin, Devara"
            value={mov.movieName}
            onChangeText={(t) => handleUpdateMovie(index, 'movieName', t)}
          />

          <View style={styles.twoCol}>
            <View style={{ flex: 1 }}>
              <AppTextInput
                label="Language"
                placeholder="Kannada / Telugu / Hindi"
                value={mov.language}
                onChangeText={(t) => handleUpdateMovie(index, 'language', t)}
              />
            </View>
            <View style={{ flex: 1 }}>
              <AppTextInput
                label="Screen"
                placeholder="Screen 1"
                value={mov.screen}
                onChangeText={(t) => handleUpdateMovie(index, 'screen', t)}
              />
            </View>
          </View>

          <AppTextInput
            label="Show Timings"
            placeholder="10:30 AM, 02:00 PM, 06:30 PM, 09:30 PM"
            value={mov.showTimes}
            onChangeText={(t) => handleUpdateMovie(index, 'showTimes', t)}
          />

          <AppTextInput
            label="Ticket Price Classes"
            placeholder="Balcony: ₹150, First Class: ₹100, Second: ₹70"
            value={mov.ticketPrice}
            onChangeText={(t) => handleUpdateMovie(index, 'ticketPrice', t)}
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
    marginBottom: 4,
  },
  subText: {
    fontSize: 12,
    color: colors.textMuted,
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
  switchLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMain,
  },
  repeatableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 10,
  },
  addBtn: {
    backgroundColor: colors.primaryLight,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  movieCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  movieIdx: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  removeText: {
    fontSize: 12,
    color: colors.danger,
    fontWeight: '600',
  },
});
