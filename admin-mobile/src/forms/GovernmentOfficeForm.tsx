import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { colors } from '../theme/colors';
import { AppTextInput } from '../components/common/AppTextInput';

interface GovernmentOfficeFormProps {
  data: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
}

export const GovernmentOfficeForm: React.FC<GovernmentOfficeFormProps> = ({ data, onChange }) => {
  const updateField = (key: string, value: any) => {
    onChange({ ...data, [key]: value });
  };

  const services = Array.isArray(data.services) ? data.services : [];

  const handleAddService = () => {
    updateField('services', [
      ...services,
      {
        name: '',
        description: '',
        requiredDocuments: '',
        counterNumber: 'Counter 1',
        fee: 'Free / Nominal',
        turnaroundTime: '3-7 working days',
        isOnlineAvailable: true,
        onlineUrl: '',
      },
    ]);
  };

  const handleUpdateService = (index: number, field: string, val: any) => {
    const updated = [...services];
    updated[index] = { ...updated[index], [field]: val };
    updateField('services', updated);
  };

  const handleRemoveService = (index: number) => {
    const updated = [...services];
    updated.splice(index, 1);
    updateField('services', updated);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Civic Administration & Office Details</Text>

      <AppTextInput
        label="Department / Ministry"
        placeholder="e.g. Revenue Department, Government of Karnataka"
        value={data.department || ''}
        onChangeText={(t) => updateField('department', t)}
      />

      <AppTextInput
        label="Designation of Head of Office"
        placeholder="e.g. Tahsildar / Chief Officer / Sub-Registrar"
        value={data.headDesignation || ''}
        onChangeText={(t) => updateField('headDesignation', t)}
      />

      {/* Repeatable Citizen Services Catalog */}
      <View style={styles.repeatableHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.sectionTitle}>Citizen Services Offered ({services.length})</Text>
          <Text style={styles.subText}>List procedures citizens can avail at this office</Text>
        </View>
        <TouchableOpacity onPress={handleAddService} style={styles.addBtn}>
          <Text style={styles.addBtnText}>+ Add Service</Text>
        </TouchableOpacity>
      </View>

      {services.map((svc: any, index: number) => (
        <View key={index} style={styles.serviceCard}>
          <View style={styles.cardTop}>
            <Text style={styles.serviceIdx}>Service #{index + 1}</Text>
            <TouchableOpacity onPress={() => handleRemoveService(index)}>
              <Text style={styles.removeText}>✕ Remove</Text>
            </TouchableOpacity>
          </View>

          <AppTextInput
            label="Service / Certificate Name"
            required
            placeholder="e.g. Birth Certificate, Bhoomi RTC, Caste Certificate"
            value={svc.name}
            onChangeText={(t) => handleUpdateService(index, 'name', t)}
          />

          <AppTextInput
            label="Required Documents Checklist"
            placeholder="e.g. Aadhaar Card, Hospital Discharge Slip, Ration Card"
            value={svc.requiredDocuments}
            onChangeText={(t) => handleUpdateService(index, 'requiredDocuments', t)}
            multiline
          />

          <View style={styles.twoCol}>
            <View style={{ flex: 1 }}>
              <AppTextInput
                label="Office Counter"
                placeholder="Counter 2"
                value={svc.counterNumber}
                onChangeText={(t) => handleUpdateService(index, 'counterNumber', t)}
              />
            </View>
            <View style={{ flex: 1 }}>
              <AppTextInput
                label="Statutory Fee"
                placeholder="₹25 / Free"
                value={svc.fee}
                onChangeText={(t) => handleUpdateService(index, 'fee', t)}
              />
            </View>
          </View>

          <AppTextInput
            label="Expected Processing Time (SLA)"
            placeholder="e.g. Same Day or 7 Working Days"
            value={svc.turnaroundTime}
            onChangeText={(t) => handleUpdateService(index, 'turnaroundTime', t)}
          />

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Available Online (Seva Sindhu / Kaveri)</Text>
            <Switch
              value={!!svc.isOnlineAvailable}
              onValueChange={(val) => handleUpdateService(index, 'isOnlineAvailable', val)}
              trackColor={{ false: colors.borderStrong, true: colors.primaryMuted }}
              thumbColor={svc.isOnlineAvailable ? colors.primary : '#ffffff'}
            />
          </View>

          {svc.isOnlineAvailable && (
            <AppTextInput
              label="Direct Portal Application URL"
              placeholder="https://sevasindhu.karnataka.gov.in"
              value={svc.onlineUrl}
              onChangeText={(t) => handleUpdateService(index, 'onlineUrl', t)}
              autoCapitalize="none"
            />
          )}
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
  serviceCard: {
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
  serviceIdx: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  removeText: {
    fontSize: 12,
    color: colors.danger,
    fontWeight: '600',
  },
  twoCol: {
    flexDirection: 'row',
    gap: 12,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 6,
  },
  switchLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMain,
  },
});
