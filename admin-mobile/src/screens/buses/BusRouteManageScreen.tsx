import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
  FlatList,
} from 'react-native';
import { colors } from '../../theme/colors';
import { AppButton } from '../../components/common/AppButton';
import { AppTextInput } from '../../components/common/AppTextInput';
import { AppCard } from '../../components/common/AppCard';
import { AppBadge } from '../../components/common/AppBadge';
import { busApi } from '../../api/busApi';
import { BusRoute, BusStop, BusTiming, RouteStop, PlaceStatus } from '../../types';

interface BusRouteManageScreenProps {
  navigation?: any;
  route?: any;
}

export const BusRouteManageScreen: React.FC<BusRouteManageScreenProps> = ({ navigation, route }) => {
  // Routes catalog state
  const [routes, setRoutes] = useState<BusRoute[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<BusRoute | null>(null);
  const [loadingRoutes, setLoadingRoutes] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [operatorFilter, setOperatorFilter] = useState<string>('ALL');

  // Master bus stops catalog for dropdown
  const [availableStops, setAvailableStops] = useState<BusStop[]>([]);
  const [loadingStops, setLoadingStops] = useState<boolean>(false);

  // Modals
  const [showRouteModal, setShowRouteModal] = useState<boolean>(false);
  const [isEditingRoute, setIsEditingRoute] = useState<boolean>(false);
  const [showAddStopModal, setShowAddStopModal] = useState<boolean>(false);
  const [showAddTimingModal, setShowAddTimingModal] = useState<boolean>(false);

  // Route Form State
  const [routeForm, setRouteForm] = useState({
    routeCode: '',
    source: '',
    destination: '',
    viaText: '',
    operator: 'KSRTC',
    frequencyNote: '',
    status: 'PUBLISHED' as PlaceStatus,
    isTimetableLive: true,
  });

  // Add Stop Form State
  const [stopForm, setStopForm] = useState({
    stopId: '',
    isMajorStop: false,
    arrivalEstimateMinutes: '',
    newStopName: '',
  });

  // Add Timing Form State
  const [timingForm, setTimingForm] = useState({
    departureTime: '',
    arrivalTime: '',
    dayType: 'DAILY' as BusTiming['dayType'],
    busType: 'KSRTC Sarige',
    remarks: '',
  });

  const [savingAction, setSavingAction] = useState<boolean>(false);

  // Initial load
  const loadRoutes = useCallback(async () => {
    try {
      setLoadingRoutes(true);
      const res = await busApi.getBusRoutes();
      const items = res.items || [];
      setRoutes(items);

      // If route ID passed via navigation or existing selected
      const targetId = route?.params?.routeId || selectedRoute?.id;
      if (targetId) {
        const found = items.find((r) => r.id === targetId);
        if (found) {
          // fetch full route details
          const full = await busApi.getBusRouteById(found.id);
          setSelectedRoute(full);
        } else if (items.length > 0) {
          setSelectedRoute(items[0]);
        }
      } else if (items.length > 0 && !selectedRoute) {
        const full = await busApi.getBusRouteById(items[0].id);
        setSelectedRoute(full);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to load bus routes');
    } finally {
      setLoadingRoutes(false);
      setRefreshing(false);
    }
  }, [route?.params?.routeId, selectedRoute?.id]);

  const loadStopsCatalog = async () => {
    try {
      setLoadingStops(true);
      const stops = await busApi.getBusStops();
      setAvailableStops(stops || []);
    } catch (err) {
      console.warn('Failed to fetch bus stops catalog', err);
    } finally {
      setLoadingStops(false);
    }
  };

  useEffect(() => {
    loadRoutes();
    loadStopsCatalog();
  }, []);

  const refreshCurrentRoute = async (routeId: string) => {
    try {
      const full = await busApi.getBusRouteById(routeId);
      setSelectedRoute(full);
      setRoutes((prev) => prev.map((r) => (r.id === full.id ? full : r)));
    } catch (err: any) {
      console.warn('Failed to refresh route', err);
    }
  };

  // Switch Selected Route
  const handleSelectRoute = async (r: BusRoute) => {
    try {
      setLoadingRoutes(true);
      const full = await busApi.getBusRouteById(r.id);
      setSelectedRoute(full);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not fetch route details');
    } finally {
      setLoadingRoutes(false);
    }
  };

  // Open Create Route Modal
  const handleOpenCreateRoute = () => {
    setIsEditingRoute(false);
    setRouteForm({
      routeCode: '',
      source: 'Pavagada',
      destination: '',
      viaText: '',
      operator: 'KSRTC',
      frequencyNote: 'Every 30-45 mins',
      status: 'PUBLISHED',
      isTimetableLive: true,
    });
    setShowRouteModal(true);
  };

  // Open Edit Route Modal
  const handleOpenEditRoute = () => {
    if (!selectedRoute) return;
    setIsEditingRoute(true);
    setRouteForm({
      routeCode: selectedRoute.routeCode || '',
      source: selectedRoute.source,
      destination: selectedRoute.destination,
      viaText: Array.isArray(selectedRoute.via) ? selectedRoute.via.join(', ') : '',
      operator: selectedRoute.operator || 'KSRTC',
      frequencyNote: selectedRoute.frequencyNote || '',
      status: selectedRoute.status || 'PUBLISHED',
      isTimetableLive: selectedRoute.isTimetableLive ?? true,
    });
    setShowRouteModal(true);
  };

  // Save Route (Create or Update)
  const handleSaveRoute = async () => {
    if (!routeForm.routeCode.trim() || !routeForm.source.trim() || !routeForm.destination.trim()) {
      Alert.alert('Validation Error', 'Route Code, Source, and Destination are required.');
      return;
    }

    try {
      setSavingAction(true);
      const viaArray = routeForm.viaText
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const payload: Partial<BusRoute> = {
        routeCode: routeForm.routeCode.trim(),
        source: routeForm.source.trim(),
        destination: routeForm.destination.trim(),
        via: viaArray,
        operator: routeForm.operator,
        frequencyNote: routeForm.frequencyNote.trim(),
        status: routeForm.status,
        isTimetableLive: routeForm.isTimetableLive,
      };

      if (isEditingRoute && selectedRoute) {
        const updated = await busApi.updateBusRoute(selectedRoute.id, payload);
        setShowRouteModal(false);
        Alert.alert('Success', 'Route metadata updated successfully.');
        await refreshCurrentRoute(updated.id);
      } else {
        const created = await busApi.createBusRoute(payload);
        setShowRouteModal(false);
        Alert.alert('Success', 'New route registered successfully.');
        await loadRoutes();
        handleSelectRoute(created);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save route');
    } finally {
      setSavingAction(false);
    }
  };

  // Delete Route
  const handleDeleteRoute = () => {
    if (!selectedRoute) return;
    Alert.alert(
      'Delete Bus Route',
      `Are you sure you want to delete route ${selectedRoute.routeCode} (${selectedRoute.source} → ${selectedRoute.destination})? This will also remove its stops and timings.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setSavingAction(true);
              await busApi.deleteBusRoute(selectedRoute.id);
              Alert.alert('Deleted', 'Bus route removed.');
              setSelectedRoute(null);
              await loadRoutes();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to delete route');
            } finally {
              setSavingAction(false);
            }
          },
        },
      ]
    );
  };

  // Reorder Stops (Up / Down)
  const handleMoveStop = async (index: number, direction: 'UP' | 'DOWN') => {
    if (!selectedRoute || !selectedRoute.stops) return;
    const targetIndex = direction === 'UP' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= selectedRoute.stops.length) return;

    const reordered = [...selectedRoute.stops];
    const temp = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = temp;

    // Build stopIds array in new sequence
    const stopIds = reordered.map((s) => s.stopId);

    try {
      // Optimistic update
      setSelectedRoute({ ...selectedRoute, stops: reordered });
      await busApi.reorderRouteStops(selectedRoute.id, stopIds);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to reorder stops');
      await refreshCurrentRoute(selectedRoute.id);
    }
  };

  // Remove Stop from Route
  const handleRemoveStop = (stop: RouteStop) => {
    if (!selectedRoute) return;
    Alert.alert('Remove Stop', `Remove "${stop.stopName}" from this route?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await busApi.removeStopFromRoute(selectedRoute.id, stop.stopId);
            await refreshCurrentRoute(selectedRoute.id);
          } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to remove stop');
          }
        },
      },
    ]);
  };

  // Add Stop
  const handleSaveAddStop = async () => {
    if (!selectedRoute) return;
    if (!stopForm.stopId) {
      Alert.alert('Selection Error', 'Please select a bus stop from the catalog.');
      return;
    }

    try {
      setSavingAction(true);
      await busApi.addStopToRoute(selectedRoute.id, {
        stopId: stopForm.stopId,
        isMajorStop: stopForm.isMajorStop,
        arrivalEstimateMinutes: stopForm.arrivalEstimateMinutes
          ? parseInt(stopForm.arrivalEstimateMinutes, 10)
          : undefined,
      });

      setShowAddStopModal(false);
      setStopForm({ stopId: '', isMajorStop: false, arrivalEstimateMinutes: '', newStopName: '' });
      await refreshCurrentRoute(selectedRoute.id);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to add stop');
    } finally {
      setSavingAction(false);
    }
  };

  // Add Timing
  const handleSaveAddTiming = async () => {
    if (!selectedRoute) return;
    if (!timingForm.departureTime.trim()) {
      Alert.alert('Validation Error', 'Departure time is required (e.g. 07:30).');
      return;
    }

    try {
      setSavingAction(true);
      await busApi.addBusTiming(selectedRoute.id, {
        departureTime: timingForm.departureTime.trim(),
        arrivalTime: timingForm.arrivalTime.trim() || undefined,
        dayType: timingForm.dayType,
        busType: timingForm.busType.trim(),
        remarks: timingForm.remarks.trim() || undefined,
      });

      setShowAddTimingModal(false);
      setTimingForm({
        departureTime: '',
        arrivalTime: '',
        dayType: 'DAILY',
        busType: 'KSRTC Sarige',
        remarks: '',
      });
      await refreshCurrentRoute(selectedRoute.id);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to add departure timing');
    } finally {
      setSavingAction(false);
    }
  };

  // Delete Timing
  const handleDeleteTiming = (timing: BusTiming) => {
    Alert.alert(
      'Delete Timing',
      `Delete departure time ${timing.departureTime} (${timing.busType})?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await busApi.deleteBusTiming(timing.id);
              if (selectedRoute) {
                await refreshCurrentRoute(selectedRoute.id);
              }
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to delete timing');
            }
          },
        },
      ]
    );
  };

  // Filter routes
  const filteredRoutes = routes.filter((r) => {
    const matchesSearch =
      r.routeCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (Array.isArray(r.via) && r.via.some((v) => v.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesOperator =
      operatorFilter === 'ALL' ||
      r.operator.toUpperCase() === operatorFilter.toUpperCase();

    return matchesSearch && matchesOperator;
  });

  return (
    <View style={styles.container}>
      {/* Header Bar */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>🚌 Bus Transit & Corridors</Text>
          <Text style={styles.headerSubtitle}>
            Sequenced Stops & Multi-Operator Timetables
          </Text>
        </View>
        <AppButton
          title="+ New Route"
          variant="primary"
          size="sm"
          onPress={handleOpenCreateRoute}
        />
      </View>

      {/* Main Content Layout */}
      <ScrollView
        style={styles.mainScroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadRoutes} colors={[colors.primary]} />
        }
      >
        {/* Route Selector & Quick Filter Bar */}
        <AppCard style={styles.selectorCard}>
          <Text style={styles.selectorLabel}>SELECT ACTIVE ROUTE</Text>
          <View style={styles.searchRow}>
            <View style={{ flex: 1 }}>
              <AppTextInput
                placeholder="Search route code, town, via..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>

          {/* Operator Chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
            {['ALL', 'KSRTC', 'PRIVATE', 'CITY'].map((op) => (
              <TouchableOpacity
                key={op}
                style={[
                  styles.filterChip,
                  operatorFilter === op && styles.filterChipActive,
                ]}
                onPress={() => setOperatorFilter(op)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    operatorFilter === op && styles.filterChipTextActive,
                  ]}
                >
                  {op}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Horizontal Route Quick Picker */}
          {loadingRoutes && !selectedRoute ? (
            <ActivityIndicator color={colors.primary} style={{ marginVertical: 12 }} />
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.routesScroll}>
              {filteredRoutes.map((r) => {
                const isSelected = selectedRoute?.id === r.id;
                return (
                  <TouchableOpacity
                    key={r.id}
                    style={[
                      styles.routeBadgeCard,
                      isSelected && styles.routeBadgeCardActive,
                    ]}
                    onPress={() => handleSelectRoute(r)}
                  >
                    <View style={styles.routeBadgeHeader}>
                      <Text
                        style={[
                          styles.routeBadgeCode,
                          isSelected && styles.routeBadgeCodeActive,
                        ]}
                      >
                        {r.routeCode}
                      </Text>
                      <Text style={styles.routeBadgeOp}>{r.operator}</Text>
                    </View>
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.routeBadgePath,
                        isSelected && styles.routeBadgePathActive,
                      ]}
                    >
                      {r.source} → {r.destination}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </AppCard>

        {/* Selected Route Workspace */}
        {selectedRoute ? (
          <View style={styles.workspace}>
            {/* Route Metadata Header Card */}
            <AppCard style={styles.routeHeaderCard}>
              <View style={styles.metaTop}>
                <View style={styles.codeTag}>
                  <Text style={styles.codeTagText}>{selectedRoute.routeCode}</Text>
                </View>
                <View style={styles.metaBadges}>
                  <AppBadge label={selectedRoute.operator} variant="info" />
                  <AppBadge
                    label={selectedRoute.status}
                    variant={selectedRoute.status === 'PUBLISHED' ? 'success' : 'neutral'}
                  />
                </View>
              </View>

              <Text style={styles.routeTerminalTitle}>
                {selectedRoute.source} ➔ {selectedRoute.destination}
              </Text>

              {Array.isArray(selectedRoute.via) && selectedRoute.via.length > 0 && (
                <View style={styles.viaBox}>
                  <Text style={styles.viaLabel}>Via:</Text>
                  <Text style={styles.viaText}>{selectedRoute.via.join(' • ')}</Text>
                </View>
              )}

              {selectedRoute.frequencyNote && (
                <Text style={styles.frequencyText}>⏱ {selectedRoute.frequencyNote}</Text>
              )}

              <View style={styles.routeActionRow}>
                <AppButton
                  title="Edit Route Info"
                  variant="outline"
                  size="sm"
                  onPress={handleOpenEditRoute}
                />
                <AppButton
                  title="Delete Route"
                  variant="danger"
                  size="sm"
                  onPress={handleDeleteRoute}
                />
              </View>
            </AppCard>

            {/* SECTION 1: Sequenced Stops */}
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>
                  🚏 Corridor Stops ({selectedRoute.stops?.length || 0})
                </Text>
                <Text style={styles.sectionSubtitle}>
                  Order of transit stops from source to destination
                </Text>
              </View>
              <AppButton
                title="+ Add Stop"
                variant="primary"
                size="sm"
                onPress={() => setShowAddStopModal(true)}
              />
            </View>

            {(!selectedRoute.stops || selectedRoute.stops.length === 0) ? (
              <AppCard style={styles.emptyCard}>
                <Text style={styles.emptyIcon}>📍</Text>
                <Text style={styles.emptyTitle}>No Stops Sequenced</Text>
                <Text style={styles.emptyText}>
                  Add the sequence of stops for this route so passengers know boarding points.
                </Text>
                <AppButton
                  title="+ Add First Stop"
                  variant="outline"
                  size="sm"
                  onPress={() => setShowAddStopModal(true)}
                />
              </AppCard>
            ) : (
              <View style={styles.stopsList}>
                {selectedRoute.stops.map((item, index) => {
                  const isFirst = index === 0;
                  const isLast = index === (selectedRoute.stops?.length || 0) - 1;

                  return (
                    <View key={item.id || item.stopId} style={styles.stopRowContainer}>
                      {/* Timeline connector dot */}
                      <View style={styles.timelineColumn}>
                        <View
                          style={[
                            styles.timelineDot,
                            item.isMajorStop && styles.timelineDotMajor,
                            isFirst && styles.timelineDotTerminal,
                            isLast && styles.timelineDotTerminal,
                          ]}
                        >
                          <Text style={styles.sequenceNumber}>{index + 1}</Text>
                        </View>
                        {!isLast && <View style={styles.timelineLine} />}
                      </View>

                      {/* Stop Content Card */}
                      <View style={styles.stopCard}>
                        <View style={styles.stopDetails}>
                          <View style={styles.stopTitleRow}>
                            <Text style={styles.stopNameText}>{item.stopName}</Text>
                            {item.isMajorStop && (
                              <AppBadge label="Major Hub" variant="warning" size="sm" />
                            )}
                          </View>
                          {item.arrivalEstimateMinutes !== undefined && item.arrivalEstimateMinutes > 0 && (
                            <Text style={styles.estimateText}>
                              ⏱ +{item.arrivalEstimateMinutes} mins from origin
                            </Text>
                          )}
                        </View>

                        {/* Sequencer Buttons (Up / Down / Delete) */}
                        <View style={styles.sequencerActions}>
                          <TouchableOpacity
                            disabled={isFirst}
                            style={[styles.arrowBtn, isFirst && styles.arrowBtnDisabled]}
                            onPress={() => handleMoveStop(index, 'UP')}
                          >
                            <Text style={styles.arrowText}>▲</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            disabled={isLast}
                            style={[styles.arrowBtn, isLast && styles.arrowBtnDisabled]}
                            onPress={() => handleMoveStop(index, 'DOWN')}
                          >
                            <Text style={styles.arrowText}>▼</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.deleteStopBtn}
                            onPress={() => handleRemoveStop(item)}
                          >
                            <Text style={styles.deleteStopText}>✕</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {/* SECTION 2: Timetable & Departure Slots */}
            <View style={[styles.sectionHeader, { marginTop: 24 }]}>
              <View>
                <Text style={styles.sectionTitle}>
                  🕒 Departure Timings ({selectedRoute.timings?.length || 0})
                </Text>
                <Text style={styles.sectionSubtitle}>
                  Scheduled departure slots and bus service types
                </Text>
              </View>
              <AppButton
                title="+ Add Slot"
                variant="primary"
                size="sm"
                onPress={() => setShowAddTimingModal(true)}
              />
            </View>

            {(!selectedRoute.timings || selectedRoute.timings.length === 0) ? (
              <AppCard style={styles.emptyCard}>
                <Text style={styles.emptyIcon}>⏰</Text>
                <Text style={styles.emptyTitle}>No Departure Timings Configured</Text>
                <Text style={styles.emptyText}>
                  Add scheduled departure slots (e.g. 06:15 AM KSRTC Sarige).
                </Text>
                <AppButton
                  title="+ Add First Timing"
                  variant="outline"
                  size="sm"
                  onPress={() => setShowAddTimingModal(true)}
                />
              </AppCard>
            ) : (
              <View style={styles.timingsGrid}>
                {selectedRoute.timings.map((t) => (
                  <View key={t.id} style={styles.timingCard}>
                    <View style={styles.timingTimeRow}>
                      <Text style={styles.timingDeparture}>{t.departureTime}</Text>
                      {t.arrivalTime && (
                        <Text style={styles.timingArrival}>➔ {t.arrivalTime}</Text>
                      )}
                    </View>
                    <View style={styles.timingTypeRow}>
                      <AppBadge label={t.dayType} variant="neutral" size="sm" />
                      <Text style={styles.timingBusType}>{t.busType}</Text>
                    </View>
                    {t.remarks ? (
                      <Text style={styles.timingRemarks}>{t.remarks}</Text>
                    ) : null}
                    <TouchableOpacity
                      style={styles.timingDeleteBtn}
                      onPress={() => handleDeleteTiming(t)}
                    >
                      <Text style={styles.timingDeleteText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        ) : (
          <AppCard style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>🚍</Text>
            <Text style={styles.emptyTitle}>Select a Route Above</Text>
            <Text style={styles.emptyText}>
              Choose an existing route from the horizontal list or tap "+ New Route" to register a transit corridor.
            </Text>
          </AppCard>
        )}
      </ScrollView>

      {/* MODAL 1: Create / Edit Bus Route */}
      <Modal visible={showRouteModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isEditingRoute ? 'Edit Route Corridor' : 'Register New Bus Route'}
              </Text>
              <TouchableOpacity onPress={() => setShowRouteModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <AppTextInput
                label="Route Number / Code"
                placeholder="e.g. KA-06-PVG-102 or 301"
                value={routeForm.routeCode}
                onChangeText={(v) => setRouteForm({ ...routeForm, routeCode: v })}
                required
              />

              <View style={styles.formRow}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <AppTextInput
                    label="Origin / Source"
                    placeholder="e.g. Pavagada"
                    value={routeForm.source}
                    onChangeText={(v) => setRouteForm({ ...routeForm, source: v })}
                    required
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <AppTextInput
                    label="Destination"
                    placeholder="e.g. Bengaluru / Tumakuru"
                    value={routeForm.destination}
                    onChangeText={(v) => setRouteForm({ ...routeForm, destination: v })}
                    required
                  />
                </View>
              </View>

              <AppTextInput
                label="Via Points (Comma Separated)"
                placeholder="e.g. Kotagudda, Madhugiri, Koratagere, Dobbaspet"
                value={routeForm.viaText}
                onChangeText={(v) => setRouteForm({ ...routeForm, viaText: v })}
                helperText="Intermediate towns and major highway junctions"
              />

              <AppTextInput
                label="Operator"
                placeholder="KSRTC, KSRTC Rural, Private, City Transit"
                value={routeForm.operator}
                onChangeText={(v) => setRouteForm({ ...routeForm, operator: v })}
              />

              <AppTextInput
                label="Frequency Note"
                placeholder="e.g. Every 30 minutes, Hourly, Twice a day"
                value={routeForm.frequencyNote}
                onChangeText={(v) => setRouteForm({ ...routeForm, frequencyNote: v })}
              />

              {/* Status Picker */}
              <Text style={styles.fieldLabel}>Publication Status</Text>
              <View style={styles.statusRow}>
                {(['PUBLISHED', 'DRAFT', 'TEMP_CLOSED'] as PlaceStatus[]).map((st) => (
                  <TouchableOpacity
                    key={st}
                    style={[
                      styles.statusSelectBtn,
                      routeForm.status === st && styles.statusSelectBtnActive,
                    ]}
                    onPress={() => setRouteForm({ ...routeForm, status: st })}
                  >
                    <Text
                      style={[
                        styles.statusSelectText,
                        routeForm.status === st && styles.statusSelectTextActive,
                      ]}
                    >
                      {st}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <AppButton
                title="Cancel"
                variant="outline"
                onPress={() => setShowRouteModal(false)}
                style={{ flex: 1, marginRight: 8 }}
              />
              <AppButton
                title={savingAction ? 'Saving...' : 'Save Route'}
                variant="primary"
                loading={savingAction}
                onPress={handleSaveRoute}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL 2: Add Stop to Route */}
      <Modal visible={showAddStopModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Stop to Corridor</Text>
              <TouchableOpacity onPress={() => setShowAddStopModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.fieldLabel}>Select Bus Stop from Catalog</Text>
              {loadingStops ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <View style={styles.stopsDropdownContainer}>
                  {availableStops.slice(0, 15).map((st) => {
                    const isSelected = stopForm.stopId === st.id;
                    return (
                      <TouchableOpacity
                        key={st.id}
                        style={[
                          styles.stopPickItem,
                          isSelected && styles.stopPickItemActive,
                        ]}
                        onPress={() => setStopForm({ ...stopForm, stopId: st.id })}
                      >
                        <Text
                          style={[
                            styles.stopPickName,
                            isSelected && styles.stopPickNameActive,
                          ]}
                        >
                          {st.stopName}
                        </Text>
                        {st.locationArea ? (
                          <Text style={styles.stopPickArea}>{st.locationArea}</Text>
                        ) : null}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              <View style={styles.formRow}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <AppTextInput
                    label="Arrival Offset (Minutes)"
                    placeholder="e.g. 25"
                    keyboardType="numeric"
                    value={stopForm.arrivalEstimateMinutes}
                    onChangeText={(v) =>
                      setStopForm({ ...stopForm, arrivalEstimateMinutes: v })
                    }
                    helperText="Estimated travel time from source"
                  />
                </View>
              </View>

              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() =>
                  setStopForm({ ...stopForm, isMajorStop: !stopForm.isMajorStop })
                }
              >
                <View
                  style={[
                    styles.checkbox,
                    stopForm.isMajorStop && styles.checkboxActive,
                  ]}
                >
                  {stopForm.isMajorStop && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.checkboxLabel}>Mark as Major Interchange / Bus Stand</Text>
              </TouchableOpacity>
            </ScrollView>

            <View style={styles.modalFooter}>
              <AppButton
                title="Cancel"
                variant="outline"
                onPress={() => setShowAddStopModal(false)}
                style={{ flex: 1, marginRight: 8 }}
              />
              <AppButton
                title={savingAction ? 'Adding...' : 'Add Stop'}
                variant="primary"
                loading={savingAction}
                onPress={handleSaveAddStop}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL 3: Add Timing Slot */}
      <Modal visible={showAddTimingModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Departure Timing</Text>
              <TouchableOpacity onPress={() => setShowAddTimingModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.formRow}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <AppTextInput
                    label="Departure Time (24h or AM/PM)"
                    placeholder="e.g. 06:30 or 06:30 AM"
                    value={timingForm.departureTime}
                    onChangeText={(v) =>
                      setTimingForm({ ...timingForm, departureTime: v })
                    }
                    required
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <AppTextInput
                    label="Arrival Time (Optional)"
                    placeholder="e.g. 10:15 or 10:15 AM"
                    value={timingForm.arrivalTime}
                    onChangeText={(v) =>
                      setTimingForm({ ...timingForm, arrivalTime: v })
                    }
                  />
                </View>
              </View>

              <Text style={styles.fieldLabel}>Operating Day Schedule</Text>
              <View style={styles.dayTypeRow}>
                {(['DAILY', 'MON_SAT', 'MON_FRI', 'SUNDAY', 'HOLIDAY'] as const).map(
                  (dt) => (
                    <TouchableOpacity
                      key={dt}
                      style={[
                        styles.dayTypeBtn,
                        timingForm.dayType === dt && styles.dayTypeBtnActive,
                      ]}
                      onPress={() => setTimingForm({ ...timingForm, dayType: dt })}
                    >
                      <Text
                        style={[
                          styles.dayTypeText,
                          timingForm.dayType === dt && styles.dayTypeTextActive,
                        ]}
                      >
                        {dt}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </View>

              <AppTextInput
                label="Bus Service Category"
                placeholder="e.g. KSRTC Sarige, Karnataka Vaibhav, Airavat, Private Express"
                value={timingForm.busType}
                onChangeText={(v) => setTimingForm({ ...timingForm, busType: v })}
              />

              <AppTextInput
                label="Remarks (Platform / Note)"
                placeholder="e.g. Platform 4, Via Chikkaballapura express"
                value={timingForm.remarks}
                onChangeText={(v) => setTimingForm({ ...timingForm, remarks: v })}
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <AppButton
                title="Cancel"
                variant="outline"
                onPress={() => setShowAddTimingModal(false)}
                style={{ flex: 1, marginRight: 8 }}
              />
              <AppButton
                title={savingAction ? 'Saving...' : 'Add Slot'}
                variant="primary"
                loading={savingAction}
                onPress={handleSaveAddTiming}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  mainScroll: {
    flex: 1,
  },
  selectorCard: {
    margin: 14,
    marginBottom: 8,
  },
  selectorLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  searchRow: {
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 6,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: colors.surface,
  },
  routesScroll: {
    flexDirection: 'row',
    marginTop: 4,
  },
  routeBadgeCard: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginRight: 10,
    minWidth: 150,
  },
  routeBadgeCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  routeBadgeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  routeBadgeCode: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  routeBadgeCodeActive: {
    color: colors.primary,
  },
  routeBadgeOp: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  routeBadgePath: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  routeBadgePathActive: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  workspace: {
    padding: 14,
    paddingTop: 4,
  },
  routeHeaderCard: {
    marginBottom: 16,
  },
  metaTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  codeTag: {
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  codeTagText: {
    color: colors.surface,
    fontWeight: '800',
    fontSize: 13,
  },
  metaBadges: {
    flexDirection: 'row',
    gap: 6,
  },
  routeTerminalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  viaBox: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: colors.surfaceLight,
    padding: 8,
    borderRadius: 6,
    marginVertical: 6,
  },
  viaLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    marginRight: 6,
  },
  viaText: {
    fontSize: 12,
    color: colors.textPrimary,
    flex: 1,
  },
  frequencyText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: 12,
  },
  routeActionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  stopsList: {
    marginBottom: 16,
  },
  stopRowContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
    minHeight: 56,
  },
  timelineColumn: {
    width: 36,
    alignItems: 'center',
  },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  timelineDotMajor: {
    backgroundColor: colors.warning,
    borderColor: colors.warning,
  },
  timelineDotTerminal: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  sequenceNumber: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.surface,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: colors.border,
    marginVertical: 4,
  },
  stopCard: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 8,
  },
  stopDetails: {
    flex: 1,
    marginRight: 8,
  },
  stopTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stopNameText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  estimateText: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  sequencerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  arrowBtn: {
    width: 28,
    height: 28,
    borderRadius: 4,
    backgroundColor: colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  arrowBtnDisabled: {
    opacity: 0.3,
  },
  arrowText: {
    fontSize: 11,
    color: colors.textPrimary,
  },
  deleteStopBtn: {
    width: 28,
    height: 28,
    borderRadius: 4,
    backgroundColor: colors.danger + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteStopText: {
    fontSize: 13,
    color: colors.danger,
    fontWeight: '700',
  },
  timingsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  timingCard: {
    width: '48%',
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  timingTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  timingDeparture: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary,
  },
  timingArrival: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginLeft: 6,
  },
  timingTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginVertical: 4,
  },
  timingBusType: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
    flex: 1,
  },
  timingRemarks: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  timingDeleteBtn: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  timingDeleteText: {
    fontSize: 11,
    color: colors.danger,
    fontWeight: '600',
  },
  emptyCard: {
    alignItems: 'center',
    padding: 24,
    marginTop: 10,
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  modalClose: {
    fontSize: 18,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  modalBody: {
    padding: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  formRow: {
    flexDirection: 'row',
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 6,
    marginTop: 6,
  },
  statusRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  statusSelectBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  statusSelectBtnActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '15',
  },
  statusSelectText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  statusSelectTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  stopsDropdownContainer: {
    maxHeight: 180,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    marginBottom: 12,
  },
  stopPickItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  stopPickItemActive: {
    backgroundColor: colors.primary + '15',
  },
  stopPickName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  stopPickNameActive: {
    color: colors.primary,
  },
  stopPickArea: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    color: colors.surface,
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 13,
    color: colors.textPrimary,
  },
  dayTypeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  dayTypeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dayTypeBtnActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '15',
  },
  dayTypeText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  dayTypeTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
});
