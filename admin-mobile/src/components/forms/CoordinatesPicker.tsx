import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Coordinates } from '../../types';
import { colors } from '../../theme/colors';
import { AppTextInput } from '../common/AppTextInput';

interface CoordinatesPickerProps {
  coordinates: Coordinates;
  onChange: (coords: Coordinates) => void;
  mapReference?: string;
  onMapReferenceChange?: (ref: string) => void;
}

const PAVAGADA_PRESETS = [
  { name: 'Pavagada Town Center', lat: 14.1025, lng: 77.2798 },
  { name: 'KSRTC Bus Stand', lat: 14.1012, lng: 77.2785 },
  { name: 'Taluk Hospital', lat: 14.1030, lng: 77.2745 },
  { name: 'Mini Vidhana Soudha', lat: 14.0995, lng: 77.2815 },
  { name: 'Pavagada Fort', lat: 14.1050, lng: 77.2710 },
];

export const CoordinatesPicker: React.FC<CoordinatesPickerProps> = ({
  coordinates,
  onChange,
  mapReference,
  onMapReferenceChange,
}) => {
  const handleLatChange = (text: string) => {
    const num = parseFloat(text);
    onChange({
      ...coordinates,
      latitude: isNaN(num) ? 0 : num,
    });
  };

  const handleLngChange = (text: string) => {
    const num = parseFloat(text);
    onChange({
      ...coordinates,
      longitude: isNaN(num) ? 0 : num,
    });
  };

  const applyPreset = (lat: number, lng: number) => {
    onChange({
      ...coordinates,
      latitude: lat,
      longitude: lng,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>GPS Coordinates (Latitude & Longitude)</Text>
      <Text style={styles.subHeader}>
        Used to display exact location pins on the public interactive map.
      </Text>

      <View style={styles.inputsRow}>
        <View style={styles.inputCol}>
          <AppTextInput
            label="Latitude (°N)"
            required
            keyboardType="numeric"
            placeholder="14.1025"
            value={coordinates.latitude ? String(coordinates.latitude) : ''}
            onChangeText={handleLatChange}
          />
        </View>

        <View style={styles.inputCol}>
          <AppTextInput
            label="Longitude (°E)"
            required
            keyboardType="numeric"
            placeholder="77.2798"
            value={coordinates.longitude ? String(coordinates.longitude) : ''}
            onChangeText={handleLngChange}
          />
        </View>
      </View>

      {/* Quick Location Presets */}
      <View style={styles.presetsBox}>
        <Text style={styles.presetsTitle}>Quick Pavagada Presets:</Text>
        <View style={styles.presetsRow}>
          {PAVAGADA_PRESETS.map((p) => (
            <TouchableOpacity
              key={p.name}
              onPress={() => applyPreset(p.lat, p.lng)}
              style={styles.presetChip}
            >
              <Text style={styles.presetText}>{p.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {onMapReferenceChange && (
        <AppTextInput
          label="Google Maps Reference / CID URL"
          placeholder="https://maps.app.goo.gl/... or Plus Code"
          value={mapReference || ''}
          onChangeText={onMapReferenceChange}
          autoCapitalize="none"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  header: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textMain,
    marginBottom: 2,
  },
  subHeader: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 12,
  },
  inputsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputCol: {
    flex: 1,
  },
  presetsBox: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 8,
    padding: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  presetsTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  presetChip: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: 14,
    paddingVertical: 4,
    paddingHorizontal: 9,
  },
  presetText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMain,
  },
});
