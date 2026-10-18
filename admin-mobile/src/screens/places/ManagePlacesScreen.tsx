import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { LocationItem, PlaceStatus, VerificationStatus } from '../../types';
import { placesApi, PlaceQueryParams } from '../../api/placesApi';
import { colors } from '../../theme/colors';
import { AppTextInput } from '../../components/common/AppTextInput';
import { AppButton } from '../../components/common/AppButton';
import { StatusBadge, VerificationBadge } from '../../components/common/AppBadge';
import { QuickVerifyModal } from '../../components/forms/QuickVerifyModal';
import { MAIN_CATEGORIES_TAXONOMY } from '../../constants/taxonomy';

export interface ManagePlacesScreenProps {
  navigation?: any;
  route?: any;
  initialFilter?: {
    verification?: string;
    needsVerification?: boolean;
    status?: string;
  };
  onSelectPlace?: (placeId: string) => void;
  onEditPlace?: (placeId: string) => void;
  onAddNew?: () => void;
}

const PAGE_SIZE = 20;

export const ManagePlacesScreen: React.FC<ManagePlacesScreenProps> = ({
  navigation,
  route,
  initialFilter,
  onSelectPlace,
  onEditPlace,
  onAddNew,
}) => {
  const handleSelectPlace = onSelectPlace || ((id: string) => navigation?.navigate('PlaceDetail', { placeId: id }));
  const handleEditPlace = onEditPlace || ((id: string) => navigation?.navigate('PlaceForm', { placeId: id, isEdit: true }));
  const handleAddNew = onAddNew || (() => navigation?.navigate('AddTab'));
  const [places, setPlaces] = useState<LocationItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>(initialFilter?.status || 'ALL');
  const [selectedVerification, setSelectedVerification] = useState<string>(
    initialFilter?.verification || 'ALL'
  );
  const [needsVerificationOnly, setNeedsVerificationOnly] = useState<boolean>(
    !!initialFilter?.needsVerification
  );
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Quick Verify Modal
  const [verifyingPlace, setVerifyingPlace] = useState<LocationItem | null>(null);

  const fetchPlaces = useCallback(
    async (offset: number = 0, isAppend: boolean = false) => {
      try {
        if (offset === 0) setLoading(true);
        else setLoadingMore(true);

        const params: PlaceQueryParams = {
          limit: PAGE_SIZE,
          offset,
        };

        if (searchQuery.trim()) params.q = searchQuery.trim();
        if (selectedCategory !== 'ALL') params.category = selectedCategory;
        if (selectedStatus !== 'ALL') params.status = selectedStatus;
        if (selectedVerification !== 'ALL') params.verification = selectedVerification;
        if (needsVerificationOnly) params.needsVerification = true;

        const res = await placesApi.getPlaces(params);

        if (isAppend) {
          setPlaces((prev) => [...prev, ...res.items]);
        } else {
          setPlaces(res.items);
        }
        setTotal(res.total);
      } catch (err: any) {
        Alert.alert('Error', err.message || 'Failed to fetch places from backend.');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [searchQuery, selectedCategory, selectedStatus, selectedVerification, needsVerificationOnly]
  );

  useEffect(() => {
    fetchPlaces(0, false);
  }, [fetchPlaces]);

  const handleLoadMore = () => {
    if (!loadingMore && places.length < total) {
      fetchPlaces(places.length, true);
    }
  };

  const handleDuplicate = async (place: LocationItem) => {
    Alert.alert(
      'Duplicate Record',
      `Create a draft copy of "${place.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Duplicate',
          onPress: async () => {
            try {
              const duplicated = await placesApi.duplicatePlace(place.id);
              Alert.alert('Cloned', `Created copy: ${duplicated.name}`);
              fetchPlaces(0, false);
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to duplicate place.');
            }
          },
        },
      ]
    );
  };

  const handleArchive = async (place: LocationItem) => {
    Alert.alert(
      'Archive Place',
      `Are you sure you want to archive "${place.name}"? This removes it from the public directory.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Archive',
          style: 'destructive',
          onPress: async () => {
            try {
              await placesApi.archivePlace(place.id);
              Alert.alert('Archived', `"${place.name}" moved to archives.`);
              fetchPlaces(0, false);
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to archive place.');
            }
          },
        },
      ]
    );
  };

  const renderPlaceCard = ({ item }: { item: LocationItem }) => (
    <View style={styles.card}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => handleSelectPlace(item.id)}
        style={styles.cardContent}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.name}
          </Text>
          <StatusBadge status={item.status} />
        </View>

        <Text style={styles.cardCategory}>
          {item.category} {item.subcategory ? `• ${item.subcategory}` : ''}
        </Text>

        <Text style={styles.cardAddress} numberOfLines={1}>
          📍 {item.area || item.address}
        </Text>

        {item.contact?.phone ? (
          <Text style={styles.cardPhone}>📞 {item.contact.phone}</Text>
        ) : null}

        <View style={styles.badgesRow}>
          <VerificationBadge
            status={item.verification?.status}
            isFresh={item.verification?.isFresh}
          />
          {item.tags?.slice(0, 2).map((t) => (
            <View key={t} style={styles.miniTag}>
              <Text style={styles.miniTagText}>{t}</Text>
            </View>
          ))}
        </View>
      </TouchableOpacity>

      {/* Action Row */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          onPress={() => handleEditPlace(item.id)}
          style={styles.actionBtn}
        >
          <Text style={styles.actionBtnText}>✎ Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setVerifyingPlace(item)}
          style={styles.actionBtn}
        >
          <Text style={styles.actionBtnText}>🛡️ Verify</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleDuplicate(item)}
          style={styles.actionBtn}
        >
          <Text style={styles.actionBtnText}>⧉ Duplicate</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleArchive(item)}
          style={[styles.actionBtn, styles.archiveBtn]}
        >
          <Text style={styles.archiveBtnText}>Archive</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const activeFiltersCount =
    (selectedCategory !== 'ALL' ? 1 : 0) +
    (selectedStatus !== 'ALL' ? 1 : 0) +
    (selectedVerification !== 'ALL' ? 1 : 0) +
    (needsVerificationOnly ? 1 : 0);

  return (
    <View style={styles.container}>
      {/* Search & Filter Header */}
      <View style={styles.topSearch}>
        <View style={styles.searchRow}>
          <View style={{ flex: 1 }}>
            <AppTextInput
              placeholder="Search places by name, area, phone..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              containerStyle={{ marginBottom: 0 }}
            />
          </View>
          <TouchableOpacity
            onPress={() => setIsFilterModalOpen(true)}
            style={[styles.filterToggleBtn, activeFiltersCount > 0 && styles.filterToggleActive]}
          >
            <Text style={[styles.filterToggleText, activeFiltersCount > 0 && styles.filterToggleTextActive]}>
              ⚙ Filters {activeFiltersCount > 0 ? `(${activeFiltersCount})` : ''}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.resultsBar}>
          <Text style={styles.resultsCount}>
            Found {total} places in registry
          </Text>
          <TouchableOpacity onPress={handleAddNew}>
            <Text style={styles.addNewLink}>+ Add New</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Searching taluk directory...</Text>
        </View>
      ) : places.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyTitle}>No Matching Places Found</Text>
          <Text style={styles.emptySub}>
            Try clearing search queries or filter categories.
          </Text>
          <AppButton
            title="Register New Place"
            size="small"
            style={{ marginTop: 16 }}
            onPress={handleAddNew}
          />
        </View>
      ) : (
        <FlatList
          data={places}
          keyExtractor={(item) => item.id}
          renderItem={renderPlaceCard}
          contentContainerStyle={styles.listContent}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator
                size="small"
                color={colors.primary}
                style={{ paddingVertical: 16 }}
              />
            ) : null
          }
        />
      )}

      {/* Quick Verify Modal */}
      <QuickVerifyModal
        visible={!!verifyingPlace}
        place={verifyingPlace}
        onClose={() => setVerifyingPlace(null)}
        onSuccess={() => fetchPlaces(0, false)}
      />

      {/* Filter Bottom Sheet Modal */}
      <Modal visible={isFilterModalOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalTop}>
              <Text style={styles.modalTitle}>Filter Places Directory</Text>
              <TouchableOpacity onPress={() => setIsFilterModalOpen(false)}>
                <Text style={styles.closeText}>✕ Close</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 420 }}>
              {/* Category */}
              <Text style={styles.filterSectionTitle}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
                <TouchableOpacity
                  onPress={() => setSelectedCategory('ALL')}
                  style={[styles.filterChip, selectedCategory === 'ALL' && styles.filterChipActive]}
                >
                  <Text style={[styles.filterChipText, selectedCategory === 'ALL' && styles.filterChipTextActive]}>
                    All Categories
                  </Text>
                </TouchableOpacity>
                {MAIN_CATEGORIES_TAXONOMY.map((c) => (
                  <TouchableOpacity
                    key={c.id}
                    onPress={() => setSelectedCategory(c.name)}
                    style={[styles.filterChip, selectedCategory === c.name && styles.filterChipActive]}
                  >
                    <Text style={[styles.filterChipText, selectedCategory === c.name && styles.filterChipTextActive]}>
                      {c.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Status */}
              <Text style={styles.filterSectionTitle}>Publication Status</Text>
              <View style={styles.chipsRow}>
                {['ALL', 'PUBLISHED', 'DRAFT', 'TEMP_CLOSED', 'INACTIVE', 'ARCHIVED'].map((st) => (
                  <TouchableOpacity
                    key={st}
                    onPress={() => setSelectedStatus(st)}
                    style={[styles.filterChip, selectedStatus === st && styles.filterChipActive]}
                  >
                    <Text style={[styles.filterChipText, selectedStatus === st && styles.filterChipTextActive]}>
                      {st.replace('_', ' ')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Verification */}
              <Text style={styles.filterSectionTitle}>Verification Status</Text>
              <View style={styles.chipsRow}>
                {['ALL', 'VERIFIED', 'PENDING', 'NEEDS_REVERIFICATION', 'NOT_VERIFIED'].map((vs) => (
                  <TouchableOpacity
                    key={vs}
                    onPress={() => setSelectedVerification(vs)}
                    style={[styles.filterChip, selectedVerification === vs && styles.filterChipActive]}
                  >
                    <Text style={[styles.filterChipText, selectedVerification === vs && styles.filterChipTextActive]}>
                      {vs.replace('_', ' ')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Stale 6-month filter toggle */}
              <TouchableOpacity
                onPress={() => setNeedsVerificationOnly(!needsVerificationOnly)}
                style={[styles.toggleBox, needsVerificationOnly && styles.toggleBoxActive]}
              >
                <Text style={styles.toggleBoxIcon}>{needsVerificationOnly ? '☑' : '☐'}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.toggleBoxTitle}>Only Records Requiring Audit (&gt; 180 days)</Text>
                  <Text style={styles.toggleBoxSub}>Find records needing immediate field verification</Text>
                </View>
              </TouchableOpacity>
            </ScrollView>

            <View style={styles.modalButtons}>
              <AppButton
                title="Reset Filters"
                variant="outline"
                onPress={() => {
                  setSelectedCategory('ALL');
                  setSelectedStatus('ALL');
                  setSelectedVerification('ALL');
                  setNeedsVerificationOnly(false);
                }}
                style={{ flex: 1 }}
              />
              <AppButton
                title="Apply Filters"
                onPress={() => setIsFilterModalOpen(false)}
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
  topSearch: {
    backgroundColor: '#ffffff',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  filterToggleBtn: {
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  filterToggleActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  filterToggleText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMain,
  },
  filterToggleTextActive: {
    color: colors.primaryDark,
  },
  resultsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  resultsCount: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  addNewLink: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textMain,
  },
  emptySub: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
  listContent: {
    padding: 14,
    paddingBottom: 32,
    gap: 12,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textMain,
    flex: 1,
    marginRight: 8,
  },
  cardCategory: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primaryDark,
    marginTop: 2,
  },
  cardAddress: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 3,
  },
  cardPhone: {
    fontSize: 12,
    color: colors.textMain,
    marginTop: 2,
    fontWeight: '500',
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    alignItems: 'center',
    marginTop: 10,
  },
  miniTag: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 4,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  miniTagText: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surfaceSubtle,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMain,
  },
  archiveBtn: {
    borderRightWidth: 0,
  },
  archiveBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.danger,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 18,
  },
  modalTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textMain,
  },
  closeText: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '700',
  },
  filterSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMain,
    marginTop: 12,
    marginBottom: 8,
  },
  chipsScroll: {
    flexDirection: 'row',
    gap: 8,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  filterChip: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
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
    color: colors.textMain,
  },
  filterChipTextActive: {
    color: '#ffffff',
  },
  toggleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff1f2',
    borderWidth: 1,
    borderColor: '#fda4af',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  toggleBoxActive: {
    backgroundColor: '#ffe4e6',
  },
  toggleBoxIcon: {
    fontSize: 20,
    color: colors.danger,
  },
  toggleBoxTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#9f1239',
  },
  toggleBoxSub: {
    fontSize: 11,
    color: '#be123c',
    marginTop: 1,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
});
