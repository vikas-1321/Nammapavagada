import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { LocationItem } from '../../types';
import { placesApi } from '../../api/placesApi';
import { colors } from '../../theme/colors';
import { AppCard } from '../../components/common/AppCard';
import { AppButton } from '../../components/common/AppButton';
import { StatusBadge, VerificationBadge } from '../../components/common/AppBadge';
import { QuickVerifyModal } from '../../components/forms/QuickVerifyModal';

export interface PlaceDetailScreenProps {
  navigation?: any;
  route?: any;
  placeId?: string;
  onEdit?: (placeId: string) => void;
  onBack?: () => void;
}

export const PlaceDetailScreen: React.FC<PlaceDetailScreenProps> = ({
  navigation,
  route,
  placeId,
  onEdit,
  onBack,
}) => {
  const activePlaceId = placeId || route?.params?.placeId;
  const handleEdit =
    onEdit ||
    ((id: string) => navigation?.navigate('PlaceForm', { placeId: id, isEdit: true }));
  const handleBack = onBack || (() => navigation?.goBack());

  const [place, setPlace] = useState<LocationItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);

  const fetchPlace = async () => {
    if (!activePlaceId) return;
    try {
      setLoading(true);
      const data = await placesApi.getPlaceById(activePlaceId);
      setPlace(data);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to load place details.');
      handleBack();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlace();
  }, [activePlaceId]);

  if (loading || !place) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading place record...</Text>
      </View>
    );
  }

  const categoryDataEntries = Object.entries(place.categoryData || {});

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {place.name}
        </Text>
        <TouchableOpacity onPress={() => handleEdit(place.id)} style={styles.editBtn}>
          <Text style={styles.editText}>✎ Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Hero Card */}
        <AppCard style={styles.heroCard}>
          <View style={styles.badgeRow}>
            <StatusBadge status={place.status} />
            <VerificationBadge
              status={place.verification?.status}
              isFresh={place.verification?.isFresh}
            />
          </View>

          <Text style={styles.title}>{place.name}</Text>
          {place.kannadaName ? (
            <Text style={styles.kannadaName}>{place.kannadaName}</Text>
          ) : null}

          <Text style={styles.categorySub}>
            {place.category} {place.subcategory ? `• ${place.subcategory}` : ''}
          </Text>

          <Text style={styles.summaryText}>{place.summary}</Text>

          {place.fullDescription ? (
            <Text style={styles.fullDescText}>{place.fullDescription}</Text>
          ) : null}
        </AppCard>

        {/* Location Details */}
        <AppCard>
          <Text style={styles.sectionHeader}>📍 Location & Coordinates</Text>
          <Text style={styles.bodyText}>Address: {place.address}</Text>
          <Text style={styles.bodyText}>Area: {place.area || 'Pavagada'}</Text>
          <Text style={styles.bodyText}>Pincode: {place.pincode || '561202'}</Text>
          {place.landmark ? (
            <Text style={styles.bodyText}>Landmark: {place.landmark}</Text>
          ) : null}

          <View style={styles.coordsBox}>
            <Text style={styles.coordsTitle}>GPS Map Coordinates:</Text>
            <Text style={styles.coordsVal}>
              Latitude: {place.coordinates?.latitude}° N • Longitude: {place.coordinates?.longitude}° E
            </Text>
          </View>
        </AppCard>

        {/* Category Details */}
        {categoryDataEntries.length > 0 && (
          <AppCard>
            <Text style={styles.sectionHeader}>
              ⭐ {place.subcategory || place.category} Specific Attributes
            </Text>
            {categoryDataEntries.map(([k, v]) => {
              if (typeof v === 'boolean') {
                return (
                  <View key={k} style={styles.specRow}>
                    <Text style={styles.specKey}>{k.replace(/^has|^is/, '').replace(/([A-Z])/g, ' $1')}</Text>
                    <Text style={[styles.specVal, { color: v ? colors.primary : colors.textMuted }]}>
                      {v ? '✓ Available' : '✗ No'}
                    </Text>
                  </View>
                );
              }
              if (Array.isArray(v)) {
                return (
                  <View key={k} style={styles.specCol}>
                    <Text style={styles.specKey}>{k.replace(/([A-Z])/g, ' $1')}:</Text>
                    <Text style={styles.specVal}>{v.length} Items registered</Text>
                  </View>
                );
              }
              return (
                <View key={k} style={styles.specRow}>
                  <Text style={styles.specKey}>{k.replace(/([A-Z])/g, ' $1')}:</Text>
                  <Text style={styles.specVal}>{String(v)}</Text>
                </View>
              );
            })}
          </AppCard>
        )}

        {/* Contact Information */}
        <AppCard>
          <Text style={styles.sectionHeader}>📞 Contact Details</Text>
          {place.contact?.authority ? (
            <Text style={styles.bodyText}>Desk / Authority: {place.contact.authority}</Text>
          ) : null}
          {place.contact?.phone ? (
            <Text style={styles.bodyText}>Primary Phone: {place.contact.phone}</Text>
          ) : null}
          {place.contact?.alternatePhone ? (
            <Text style={styles.bodyText}>Alternate Phone: {place.contact.alternatePhone}</Text>
          ) : null}
          {place.contact?.whatsapp ? (
            <Text style={styles.bodyText}>WhatsApp: {place.contact.whatsapp}</Text>
          ) : null}
          {place.contact?.email ? (
            <Text style={styles.bodyText}>Email: {place.contact.email}</Text>
          ) : null}
          {place.contact?.website ? (
            <Text style={styles.bodyText}>Website: {place.contact.website}</Text>
          ) : null}
        </AppCard>

        {/* Operating Hours */}
        <AppCard>
          <Text style={styles.sectionHeader}>🕒 Operating Hours</Text>
          {place.hours?.is24Hours ? (
            <Text style={[styles.bodyText, { color: colors.primary, fontWeight: '700' }]}>
              Open 24 Hours / 7 Days a Week
            </Text>
          ) : (
            <Text style={styles.bodyText}>
              Timings: {place.hours?.open || '09:00 AM'} – {place.hours?.close || '05:00 PM'} ({place.hours?.days || 'Mon - Sat'})
            </Text>
          )}
          {place.hours?.notes ? (
            <Text style={styles.notesText}>Notes: {place.hours.notes}</Text>
          ) : null}
        </AppCard>

        {/* Tags */}
        <AppCard>
          <Text style={styles.sectionHeader}>🏷️ Search & Discovery Tags</Text>
          {place.tags && place.tags.length > 0 ? (
            <View style={styles.tagsWrap}>
              {place.tags.map((tag) => (
                <View key={tag} style={styles.tagBadge}>
                  <Text style={styles.tagBadgeText}>{tag}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyNotice}>No tags attached.</Text>
          )}
        </AppCard>

        {/* Verification Card */}
        <AppCard>
          <View style={styles.verifyHeaderRow}>
            <Text style={styles.sectionHeader}>🛡️ Verification Audit Details</Text>
            <TouchableOpacity
              onPress={() => setIsVerifyModalOpen(true)}
              style={styles.verifyActionBtn}
            >
              <Text style={styles.verifyActionText}>Update Verification</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.bodyText}>
            Status: {place.verification?.status || 'NOT_VERIFIED'}
          </Text>
          <Text style={styles.bodyText}>
            Source: {place.verification?.source || 'Admin Verification'}
          </Text>
          {place.verification?.verifiedBy ? (
            <Text style={styles.bodyText}>Verified By: {place.verification.verifiedBy}</Text>
          ) : null}
          {place.verification?.lastVerifiedAt ? (
            <Text style={styles.bodyText}>
              Last Verified: {new Date(place.verification.lastVerifiedAt).toLocaleDateString()}
            </Text>
          ) : null}
          {place.verification?.notes ? (
            <Text style={styles.notesText}>Audit Notes: {place.verification.notes}</Text>
          ) : null}
        </AppCard>
      </ScrollView>

      {/* Quick Verify Modal */}
      <QuickVerifyModal
        visible={isVerifyModalOpen}
        place={place}
        onClose={() => setIsVerifyModalOpen(false)}
        onSuccess={(updated) => setPlace(updated)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    paddingVertical: 4,
  },
  backText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textMain,
    maxWidth: '60%',
  },
  editBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  editText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
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
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 12,
  },
  heroCard: {
    padding: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textMain,
  },
  kannadaName: {
    fontSize: 14,
    color: colors.primaryDark,
    fontWeight: '600',
    marginTop: 2,
  },
  categorySub: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 4,
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    color: colors.textMain,
    lineHeight: 20,
    marginTop: 4,
  },
  fullDescText: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
    marginTop: 8,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textMain,
    marginBottom: 8,
  },
  bodyText: {
    fontSize: 13,
    color: colors.textMain,
    marginBottom: 4,
    lineHeight: 18,
  },
  coordsBox: {
    backgroundColor: colors.surfaceSubtle,
    padding: 10,
    borderRadius: 6,
    marginTop: 8,
  },
  coordsTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
  },
  coordsVal: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primaryDark,
    marginTop: 2,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  specCol: {
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  specKey: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
  },
  specVal: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMain,
  },
  notesText: {
    fontSize: 12,
    color: colors.textMuted,
    fontStyle: 'italic',
    marginTop: 4,
  },
  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tagBadge: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tagBadgeText: {
    fontSize: 12,
    color: colors.textMain,
    fontWeight: '600',
  },
  emptyNotice: {
    fontSize: 12,
    color: colors.textSubtle,
  },
  verifyHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  verifyActionBtn: {
    backgroundColor: colors.primaryLight,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  verifyActionText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primaryDark,
  },
});
