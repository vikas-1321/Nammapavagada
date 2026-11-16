import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { surveyApi } from '../../api/surveyApi';
import { BuildingItem, FloorItem, UnitItem } from '../../types/survey';

export const BuildingDetailScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const buildingId = route.params?.buildingId;

  const [building, setBuilding] = useState<BuildingItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (buildingId) {
      loadBuilding();
    }
  }, [buildingId]);

  const loadBuilding = async () => {
    try {
      setLoading(true);
      const b = await surveyApi.getBuildingById(buildingId);
      setBuilding(b);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to load building');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading building details...</Text>
      </View>
    );
  }

  if (!building) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Building not found.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{building.name}</Text>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => navigation.navigate('BuildingWizard', { buildingId: building.id })}
        >
          <Text style={styles.editBtnText}>✏️ Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Main Card */}
        <View style={styles.card}>
          <View style={styles.badgeRow}>
            <Text style={styles.codeBadge}>{building.code}</Text>
            <Text style={styles.typeBadge}>● {building.buildingType}</Text>
            <Text style={styles.conditionBadge}>{building.buildingCondition}</Text>
          </View>

          <Text style={styles.bldName}>{building.name}</Text>
          {building.kannadaName && (
            <Text style={styles.kannadaName}>{building.kannadaName}</Text>
          )}

          <Text style={styles.address}>📍 {building.address}</Text>

          <View style={styles.infoGrid}>
            <View style={styles.infoCol}>
              <Text style={styles.infoLbl}>TOTAL FLOORS</Text>
              <Text style={styles.infoVal}>{building.totalFloors}</Text>
            </View>
            <View style={styles.infoCol}>
              <Text style={styles.infoLbl}>OCCUPANCY</Text>
              <Text style={styles.infoVal}>{building.occupancyStatus}</Text>
            </View>
            <View style={styles.infoCol}>
              <Text style={styles.infoLbl}>COMMERCIAL UNITS</Text>
              <Text style={styles.infoVal}>{building.commercialUnitsCount}</Text>
            </View>
            <View style={styles.infoCol}>
              <Text style={styles.infoLbl}>COORDINATES</Text>
              <Text style={styles.infoVal}>
                {building.latitude.toFixed(4)}, {building.longitude.toFixed(4)}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Button: Register Shop */}
        <TouchableOpacity
          style={styles.addShopBtn}
          onPress={() =>
            navigation.navigate('BusinessWizard', {
              buildingId: building.id,
              buildingName: building.name,
            })
          }
        >
          <Text style={styles.addShopText}>+ Register Business / Shop in this Building</Text>
        </TouchableOpacity>

        {/* Floors and Units Breakdown Hierarchy */}
        <View style={styles.hierarchyCard}>
          <Text style={styles.hierarchyTitle}>Building Floors & Business Directory</Text>

          {(!building.floors || building.floors.length === 0) ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>No structured floors recorded yet.</Text>
            </View>
          ) : (
            building.floors.map((floor) => (
              <View key={floor.id} style={styles.floorBlock}>
                <View style={styles.floorHeader}>
                  <Text style={styles.floorTitle}>🏢 {floor.floorName}</Text>
                  <Text style={styles.floorTag}>{floor.floorUsage}</Text>
                </View>

                {(!floor.units || floor.units.length === 0) ? (
                  <Text style={styles.noUnitsText}>No units registered on this floor.</Text>
                ) : (
                  floor.units.map((unit) => (
                    <View key={unit.id} style={styles.unitCard}>
                      <View style={styles.unitTopRow}>
                        <Text style={styles.unitBadge}>{unit.unitNumber}</Text>
                        <Text style={styles.unitType}>{unit.unitType}</Text>
                        <Text style={styles.unitStatus}>● {unit.occupancyStatus}</Text>
                      </View>

                      {unit.activeBusiness ? (
                        <View style={styles.businessPreview}>
                          <Text style={styles.bizName}>🛍️ {unit.activeBusiness.name}</Text>
                          <Text style={styles.bizSub}>
                            {unit.activeBusiness.businessModel} • {unit.activeBusiness.subcategory || 'Commercial'}
                          </Text>
                          {unit.activeBusiness.ownerName && (
                            <Text style={styles.bizOwner}>Owner: {unit.activeBusiness.ownerName}</Text>
                          )}
                        </View>
                      ) : (
                        <TouchableOpacity
                          style={styles.registerShopUnitBtn}
                          onPress={() =>
                            navigation.navigate('BusinessWizard', {
                              buildingId: building.id,
                              unitId: unit.id,
                              unitNumber: unit.unitNumber,
                              floorName: floor.floorName,
                            })
                          }
                        >
                          <Text style={styles.registerShopUnitText}>+ Register Shop in {unit.unitNumber}</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  ))
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: '#64748B',
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
  },
  backBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  headerTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginHorizontal: 8,
  },
  editBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
  },
  editBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  codeBadge: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
    backgroundColor: 'rgba(198, 93, 58, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  conditionBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: '#15803D',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  bldName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  kannadaName: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  address: {
    fontSize: 12,
    color: '#475569',
    marginTop: 6,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  infoCol: {
    flex: 1,
    minWidth: '45%',
  },
  infoLbl: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  infoVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 2,
  },
  addShopBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 14,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  addShopText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  hierarchyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
  },
  hierarchyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  emptyBox: {
    padding: 16,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 12,
    color: '#64748B',
  },
  floorBlock: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  floorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  floorTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  floorTag: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
  },
  noUnitsText: {
    fontSize: 11,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  unitCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 10,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  unitTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  unitBadge: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1E293B',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  unitType: {
    fontSize: 11,
    color: '#64748B',
  },
  unitStatus: {
    fontSize: 10,
    fontWeight: '600',
    color: '#10B981',
  },
  businessPreview: {
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  bizName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  bizSub: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
  bizOwner: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 1,
  },
  registerShopUnitBtn: {
    marginTop: 6,
    paddingVertical: 6,
    alignItems: 'center',
    backgroundColor: 'rgba(198, 93, 58, 0.08)',
    borderRadius: 6,
  },
  registerShopUnitText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
});
