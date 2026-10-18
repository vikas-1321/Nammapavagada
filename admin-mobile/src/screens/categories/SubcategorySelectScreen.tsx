import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { MainCategoryMeta, SubcategoryMeta } from '../../types';
import { colors } from '../../theme/colors';
import { AppTextInput } from '../../components/common/AppTextInput';
import { MAIN_CATEGORIES_TAXONOMY } from '../../constants/taxonomy';

export interface SubcategorySelectScreenProps {
  navigation?: any;
  route?: any;
  category?: MainCategoryMeta;
  onSelectSubcategory?: (subcategory: SubcategoryMeta) => void;
  onSelectSubcategories?: (subcategories: SubcategoryMeta[]) => void;
  onBack?: () => void;
}

export const SubcategorySelectScreen: React.FC<SubcategorySelectScreenProps> = ({
  navigation,
  route,
  category,
  onSelectSubcategory,
  onSelectSubcategories,
  onBack,
}) => {
  const activeCategory =
    category ||
    MAIN_CATEGORIES_TAXONOMY.find((c) => c.id === route?.params?.categoryId) ||
    MAIN_CATEGORIES_TAXONOMY[0];

  const initialSelected: string[] = route?.params?.initialSelectedIds || [];
  const [selectedSubIds, setSelectedSubIds] = useState<string[]>(initialSelected);
  const [search, setSearch] = useState('');

  const handleToggleSubcategory = (sub: SubcategoryMeta) => {
    setSelectedSubIds((prev) =>
      prev.includes(sub.id) ? prev.filter((id) => id !== sub.id) : [...prev, sub.id]
    );
  };

  const handleSelectAll = () => {
    setSelectedSubIds(activeCategory.subcategories.map((s) => s.id));
  };

  const handleClear = () => {
    setSelectedSubIds([]);
  };

  const handleConfirm = () => {
    if (selectedSubIds.length === 0) return;

    const selectedSubs = activeCategory.subcategories.filter((s) =>
      selectedSubIds.includes(s.id)
    );

    if (onSelectSubcategories) {
      onSelectSubcategories(selectedSubs);
    } else if (onSelectSubcategory && selectedSubs.length === 1) {
      onSelectSubcategory(selectedSubs[0]);
    } else {
      navigation?.navigate('PlaceForm', {
        categoryId: activeCategory.id,
        subcategoryId: selectedSubIds[0],
        subcategoryIds: selectedSubIds,
      });
    }
  };

  const handleBack = onBack || (() => navigation?.goBack());

  const filtered = activeCategory.subcategories.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
            <Text style={styles.backText}>← Change Category</Text>
          </TouchableOpacity>
          <Text style={styles.stepBadge}>Step 2 of 10</Text>
        </View>

        <View style={styles.catBanner}>
          <Text style={[styles.catBadge, { color: activeCategory.color.primary }]}>
            {activeCategory.name}
          </Text>
        </View>

        <View style={styles.titleRow}>
          <Text style={styles.title}>Select Subcategories</Text>
          <View style={styles.counterBadge}>
            <Text style={styles.counterText}>
              {selectedSubIds.length} selected
            </Text>
          </View>
        </View>

        <Text style={styles.subtitle}>
          Choose one or more subcategories for this place (multi-select enabled).
        </Text>

        <View style={styles.actionRow}>
          <TouchableOpacity onPress={handleSelectAll} style={styles.actionBtn}>
            <Text style={styles.actionBtnText}>Select All</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleClear} style={styles.actionBtn}>
            <Text style={styles.actionBtnText}>Clear</Text>
          </TouchableOpacity>
        </View>

        <AppTextInput
          placeholder={`Search ${activeCategory.name} types...`}
          value={search}
          onChangeText={setSearch}
          containerStyle={{ marginTop: 10, marginBottom: 0 }}
        />
      </View>

      {/* Subcategories List */}
      <ScrollView contentContainerStyle={styles.scrollList}>
        {filtered.map((sub) => {
          const isSelected = selectedSubIds.includes(sub.id);
          return (
            <TouchableOpacity
              key={sub.id}
              activeOpacity={0.7}
              onPress={() => handleToggleSubcategory(sub)}
              style={[
                styles.subCard,
                isSelected && {
                  borderColor: activeCategory.color.primary || colors.primary,
                  backgroundColor: '#f8fafc',
                },
              ]}
            >
              <View style={styles.subTopRow}>
                <Text
                  style={[
                    styles.subName,
                    isSelected && { color: activeCategory.color.primary || colors.primary },
                  ]}
                >
                  {sub.name}
                </Text>
                <View
                  style={[
                    styles.checkbox,
                    isSelected && {
                      backgroundColor: activeCategory.color.primary || colors.primary,
                      borderColor: activeCategory.color.primary || colors.primary,
                    },
                  ]}
                >
                  {isSelected && <Text style={styles.checkMark}>✓</Text>}
                </View>
              </View>

              <Text style={styles.subDesc}>{sub.description}</Text>

              {sub.suggestedTags && sub.suggestedTags.length > 0 && (
                <View style={styles.tagChips}>
                  {sub.suggestedTags.map((tag) => (
                    <View key={tag} style={styles.tagChip}>
                      <Text style={styles.tagChipText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Bottom Sticky Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          disabled={selectedSubIds.length === 0}
          onPress={handleConfirm}
          style={[
            styles.confirmBtn,
            { backgroundColor: activeCategory.color.primary || colors.primary },
            selectedSubIds.length === 0 && styles.confirmBtnDisabled,
          ]}
        >
          <Text style={styles.confirmBtnText}>
            {selectedSubIds.length === 0
              ? 'Select at least 1 Subcategory'
              : `Continue (${selectedSubIds.length} Selected) →`}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  backBtn: {
    paddingVertical: 4,
  },
  backText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  stepBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    backgroundColor: colors.surfaceSubtle,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  catBanner: {
    marginBottom: 4,
  },
  catBadge: {
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textMain,
  },
  counterBadge: {
    backgroundColor: colors.surfaceSubtle,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  counterText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMain,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  actionBtn: {
    backgroundColor: colors.surfaceSubtle,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMain,
  },
  scrollList: {
    padding: 16,
    paddingBottom: 90,
    gap: 10,
  },
  subCard: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  subTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textMain,
    flex: 1,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    backgroundColor: '#ffffff',
  },
  checkMark: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 14,
  },
  subDesc: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
    lineHeight: 17,
  },
  tagChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  tagChip: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 4,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tagChipText: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '600',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 8,
  },
  confirmBtn: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnDisabled: {
    opacity: 0.4,
  },
  confirmBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});
