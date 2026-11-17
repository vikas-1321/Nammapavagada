import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
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
  const [viewingBusiness, setViewingBusiness] = useState<any | null>(null);

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

  const handleDeleteBusiness = (biz: any, unit: any) => {
    Alert.alert(
      'Archive Shop / Business?',
      `Are you sure you want to archive "${biz.name}" from ${unit.unitNumber}?\n\nThis will mark the shop as closed and make this unit vacant. Historical research records will be preserved safely.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Archive Shop',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await surveyApi.deleteBusiness(biz.id, true);
              Alert.alert('Shop Archived', `"${biz.name}" has been archived successfully.`);
              await loadBuilding();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to archive shop');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
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
                          <View style={styles.bizHeaderRow}>
                            <View style={{ flex: 1 }}>
                              <Text style={styles.bizName}>🛍️ {unit.activeBusiness.name}</Text>
                              {unit.activeBusiness.kannadaName && (
                                <Text style={styles.bizKannada}>{unit.activeBusiness.kannadaName}</Text>
                              )}
                              <Text style={styles.bizSub}>
                                {unit.activeBusiness.businessModel} • {unit.activeBusiness.subcategory || 'Commercial'}
                              </Text>
                              {unit.activeBusiness.ownerName && (
                                <Text style={styles.bizOwner}>Owner: {unit.activeBusiness.ownerName}</Text>
                              )}
                            </View>
                            <View style={styles.bizStatusBadge}>
                              <Text style={styles.bizStatusText}>
                                {unit.activeBusiness.businessStatus || 'Operating'}
                              </Text>
                            </View>
                          </View>

                          {/* 3 Clear Actions: View, Edit, Archive */}
                          <View style={styles.bizActionsRow}>
                            <TouchableOpacity
                              style={styles.bizActionBtnSecondary}
                              onPress={() => setViewingBusiness(unit.activeBusiness)}
                            >
                              <Text style={styles.bizActionTextSecondary}>👁️ View Details</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                              style={styles.bizActionBtnPrimary}
                              onPress={() =>
                                navigation.navigate('BusinessWizard', {
                                  businessId: unit.activeBusiness?.id,
                                  editBusinessId: unit.activeBusiness?.id,
                                  buildingId: building.id,
                                  unitId: unit.id,
                                  unitNumber: unit.unitNumber,
                                  floorName: floor.floorName,
                                })
                              }
                            >
                              <Text style={styles.bizActionTextPrimary}>✏️ Edit Shop</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                              style={styles.bizActionBtnDanger}
                              onPress={() => handleDeleteBusiness(unit.activeBusiness, unit)}
                            >
                              <Text style={styles.bizActionTextDanger}>🗑️ Archive</Text>
                            </TouchableOpacity>
                          </View>
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

      {/* Business Details Bottom Sheet / Modal */}
      {viewingBusiness && (
        <Modal
          visible={true}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setViewingBusiness(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalTitle}>{viewingBusiness.name}</Text>
                  {viewingBusiness.kannadaName && (
                    <Text style={styles.modalKannada}>{viewingBusiness.kannadaName}</Text>
                  )}
                  <Text style={styles.modalSub}>
                    {viewingBusiness.businessModel} • {viewingBusiness.subcategory || 'Commercial'}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setViewingBusiness(null)} style={styles.modalCloseBtn}>
                  <Text style={styles.modalCloseText}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                <View style={styles.modalDetailRow}>
                  <Text style={styles.modalLabel}>OWNER / CONTACT</Text>
                  <Text style={styles.modalValue}>
                    {viewingBusiness.ownerName || viewingBusiness.ownerOrRepName || 'Not specified'}
                  </Text>
                </View>

                {viewingBusiness.publicPhone ? (
                  <View style={styles.modalDetailRow}>
                    <Text style={styles.modalLabel}>PHONE</Text>
                    <Text style={styles.modalValue}>📞 {viewingBusiness.publicPhone}</Text>
                  </View>
                ) : null}

                {viewingBusiness.whatsappNumber ? (
                  <View style={styles.modalDetailRow}>
                    <Text style={styles.modalLabel}>WHATSAPP</Text>
                    <Text style={styles.modalValue}>💬 {viewingBusiness.whatsappNumber}</Text>
                  </View>
                ) : null}

                <View style={styles.modalDetailRow}>
                  <Text style={styles.modalLabel}>OPERATING HOURS</Text>
                  <Text style={styles.modalValue}>
                    ⏰ {viewingBusiness.openTime || '09:00'} - {viewingBusiness.closeTime || '21:00'} (Holiday: {viewingBusiness.weeklyHoliday || 'None'})
                  </Text>
                </View>

                {viewingBusiness.productSummary ? (
                  <View style={styles.modalDetailRow}>
                    <Text style={styles.modalLabel}>PRODUCTS / SERVICES</Text>
                    <Text style={styles.modalValue}>{viewingBusiness.productSummary}</Text>
                  </View>
                ) : null}

                <View style={styles.modalDetailRow}>
                  <Text style={styles.modalLabel}>PRICE POSITIONING</Text>
                  <Text style={styles.modalValue}>{viewingBusiness.pricePositioning || 'Economical'}</Text>
                </View>

                {viewingBusiness.whyCustomersChoose ? (
                  <View style={styles.modalDetailRow}>
                    <Text style={styles.modalLabel}>CUSTOMER VALUE PROPOSITION</Text>
                    <Text style={styles.modalValue}>{viewingBusiness.whyCustomersChoose}</Text>
                  </View>
                ) : null}
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.modalEditBtn}
                  onPress={() => {
                    const bz = viewingBusiness;
                    setViewingBusiness(null);
                    navigation.navigate('BusinessWizard', {
                      businessId: bz.id,
                      editBusinessId: bz.id,
                      buildingId: building.id,
                      unitId: bz.unitId,
                      unitNumber: bz.shopOrUnitNumber,
                      floorName: bz.floorName,
                    });
                  }}
                >
                  <Text style={styles.modalEditText}>✏️ Edit Shop Details</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
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
  bizHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  bizKannada: {
    fontSize: 11,
    color: '#7A5135',
    fontWeight: '600',
    marginTop: 1,
  },
  bizStatusBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  bizStatusText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#166534',
    textTransform: 'uppercase',
  },
  bizActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  bizActionBtnSecondary: {
    flex: 1,
    paddingVertical: 5,
    paddingHorizontal: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
    alignItems: 'center',
  },
  bizActionTextSecondary: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  bizActionBtnPrimary: {
    flex: 1,
    paddingVertical: 5,
    paddingHorizontal: 6,
    backgroundColor: 'rgba(198, 93, 58, 0.1)',
    borderRadius: 6,
    alignItems: 'center',
  },
  bizActionTextPrimary: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
  },
  bizActionBtnDanger: {
    paddingVertical: 5,
    paddingHorizontal: 8,
    backgroundColor: '#FEE2E2',
    borderRadius: 6,
    alignItems: 'center',
  },
  bizActionTextDanger: {
    fontSize: 10,
    fontWeight: '700',
    color: '#DC2626',
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalKannada: {
    fontSize: 13,
    color: '#7A5135',
    fontWeight: '600',
    marginTop: 2,
  },
  modalSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  modalCloseBtn: {
    padding: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    marginLeft: 8,
  },
  modalCloseText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  modalBody: {
    paddingVertical: 12,
  },
  modalDetailRow: {
    marginBottom: 12,
  },
  modalLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  modalValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
    lineHeight: 18,
  },
  modalFooter: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  modalEditBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalEditText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

