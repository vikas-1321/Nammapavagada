import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { placesApi } from '../../api/placesApi';
import { DashboardOverview, DataFreshnessStats, LocationItem } from '../../types';
import { colors } from '../../theme/colors';
import { AppCard } from '../../components/common/AppCard';
import { AppButton } from '../../components/common/AppButton';
import { StatusBadge, VerificationBadge } from '../../components/common/AppBadge';
import { useAuth } from '../../context/AuthContext';

export interface DashboardScreenProps {
  navigation?: any;
  route?: any;
  onNavigateAddPlace?: () => void;
  onNavigateManagePlaces?: (filter?: { verification?: string; needsVerification?: boolean; status?: string }) => void;
  onNavigateEditPlace?: (placeId: string) => void;
  onNavigateBusRoutes?: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  navigation,
  route,
  onNavigateAddPlace,
  onNavigateManagePlaces,
  onNavigateEditPlace,
  onNavigateBusRoutes,
}) => {
  const handleAddPlace = onNavigateAddPlace || (() => navigation?.navigate('AddTab'));
  const handleManagePlaces = onNavigateManagePlaces || ((filter?: any) => navigation?.navigate('PlacesTab', filter));
  const handleEditPlace = onNavigateEditPlace || ((placeId: string) => navigation?.navigate('PlaceForm', { placeId, isEdit: true }));
  const handleBusRoutes = onNavigateBusRoutes || (() => navigation?.navigate('BusesTab'));
  const { user } = useAuth();
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [freshness, setFreshness] = useState<DataFreshnessStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [ovData, frData] = await Promise.all([
        placesApi.getDashboardOverview(),
        placesApi.getFreshnessStats(),
      ]);
      setOverview(ovData);
      setFreshness(frData);
    } catch (err) {
      console.error('Error loading dashboard stats:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading && !overview) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading taluk dashboard...</Text>
      </View>
    );
  }

  const stats = overview?.statistics;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
    >
      {/* Welcome Banner */}
      <View style={styles.welcomeBanner}>
        <View style={{ flex: 1 }}>
          <Text style={styles.welcomeText}>Welcome, {user?.fullName || 'Admin'}</Text>
          <Text style={styles.welcomeRole}>Role: {user?.role?.toUpperCase() || 'SUPER ADMIN'}</Text>
        </View>
        <AppButton
          title="+ Add Place"
          size="small"
          onPress={handleAddPlace}
        />
      </View>

      {/* Primary KPI Grid */}
      <View style={styles.kpiGrid}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => handleManagePlaces()}
          style={[styles.kpiCard, { borderColor: colors.primary }]}
        >
          <Text style={styles.kpiValue}>{stats?.totalLocations ?? 0}</Text>
          <Text style={styles.kpiLabel}>Total Places</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => handleManagePlaces({ status: 'PUBLISHED' })}
          style={[styles.kpiCard, { borderColor: colors.success }]}
        >
          <Text style={[styles.kpiValue, { color: colors.success }]}>
            {stats?.activeLocations ?? 0}
          </Text>
          <Text style={styles.kpiLabel}>Published</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => handleManagePlaces({ status: 'DRAFT' })}
          style={[styles.kpiCard, { borderColor: colors.warning }]}
        >
          <Text style={[styles.kpiValue, { color: colors.warning }]}>
            {stats?.draftLocations ?? 0}
          </Text>
          <Text style={styles.kpiLabel}>Drafts</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => handleManagePlaces({ needsVerification: true })}
          style={[styles.kpiCard, { borderColor: colors.danger }]}
        >
          <Text style={[styles.kpiValue, { color: colors.danger }]}>
            {freshness?.totalNeedingAttention ?? 0}
          </Text>
          <Text style={styles.kpiLabel}>Need Audit</Text>
        </TouchableOpacity>
      </View>

      {/* 6-Month Verification Freshness Advisory Barometer */}
      {freshness && freshness.totalNeedingAttention > 0 && (
        <View style={styles.alertCard}>
          <View style={styles.alertTop}>
            <Text style={styles.alertIcon}>⏳</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.alertTitle}>
                {freshness.totalNeedingAttention} Records Require Verification
              </Text>
              <Text style={styles.alertSub}>
                {freshness.staleRecords} unverified for &gt; 180 days • {freshness.pendingVerification} pending review
              </Text>
            </View>
          </View>
          <AppButton
            title="Review Stale Records Now →"
            variant="outline"
            size="small"
            style={{ marginTop: 8 }}
            onPress={() => handleManagePlaces({ needsVerification: true })}
          />
        </View>
      )}

      {/* Quick Action Buttons */}
      <Text style={styles.sectionTitle}>Quick Management Actions</Text>
      <View style={styles.actionsGrid}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleAddPlace}
          style={styles.actionCard}
        >
          <Text style={styles.actionIcon}>➕</Text>
          <Text style={styles.actionTitle}>Add New Place</Text>
          <Text style={styles.actionSub}>Choose category & start wizard</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => handleManagePlaces()}
          style={styles.actionCard}
        >
          <Text style={styles.actionIcon}>📋</Text>
          <Text style={styles.actionTitle}>Manage Places</Text>
          <Text style={styles.actionSub}>Search, edit, verify, filter</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleBusRoutes}
          style={styles.actionCard}
        >
          <Text style={styles.actionIcon}>🚌</Text>
          <Text style={styles.actionTitle}>Bus Corridor Routes</Text>
          <Text style={styles.actionSub}>Stop sequencer & timings</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => handleManagePlaces({ verification: 'PENDING' })}
          style={styles.actionCard}
        >
          <Text style={styles.actionIcon}>🛡️</Text>
          <Text style={styles.actionTitle}>Pending Verification</Text>
          <Text style={styles.actionSub}>Inspect & approve records</Text>
        </TouchableOpacity>
      </View>

      {/* Recently Updated Places Feed */}
      <View style={styles.recentSectionHeader}>
        <Text style={styles.sectionTitle}>Recently Registered Places</Text>
        <TouchableOpacity onPress={() => handleManagePlaces()}>
          <Text style={styles.viewAllText}>View All ({stats?.totalLocations ?? 0}) →</Text>
        </TouchableOpacity>
      </View>

      {(overview?.recentLocations || []).map((place: LocationItem) => (
        <AppCard
          key={place.id}
          onPress={() => handleEditPlace(place.id)}
          style={styles.placeCard}
        >
          <View style={styles.placeTopRow}>
            <Text style={styles.placeName} numberOfLines={1}>
              {place.name}
            </Text>
            <StatusBadge status={place.status} />
          </View>

          <Text style={styles.placeCategory}>
            {place.category} {place.subcategory ? `• ${place.subcategory}` : ''}
          </Text>

          <Text style={styles.placeAddress} numberOfLines={1}>
            📍 {place.area || place.address}
          </Text>

          <View style={styles.placeBottomRow}>
            <VerificationBadge
              status={place.verification?.status}
              isFresh={place.verification?.isFresh}
            />
            <Text style={styles.tapToEditText}>Tap to Edit ✎</Text>
          </View>
        </AppCard>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  welcomeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textMain,
  },
  welcomeRole: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 2,
    letterSpacing: 0.5,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  kpiCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  kpiValue: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.textMain,
  },
  kpiLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    marginTop: 2,
  },
  alertCard: {
    backgroundColor: '#fff1f2',
    borderColor: '#fda4af',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  alertTop: {
    flexDirection: 'row',
    gap: 10,
  },
  alertIcon: {
    fontSize: 22,
  },
  alertTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#9f1239',
  },
  alertSub: {
    fontSize: 11,
    color: '#be123c',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textMain,
    marginBottom: 10,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  actionCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionIcon: {
    fontSize: 22,
    marginBottom: 6,
  },
  actionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMain,
  },
  actionSub: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  recentSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  placeCard: {
    marginBottom: 10,
  },
  placeTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  placeName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textMain,
    flex: 1,
    marginRight: 8,
  },
  placeCategory: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primaryDark,
    marginTop: 3,
  },
  placeAddress: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  placeBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  tapToEditText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
});
