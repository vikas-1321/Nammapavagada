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
  onBack?: () => void;
}

export const SubcategorySelectScreen: React.FC<SubcategorySelectScreenProps> = ({
  navigation,
  route,
  category,
  onSelectSubcategory,
  onBack,
}) => {
  const activeCategory =
    category ||
    MAIN_CATEGORIES_TAXONOMY.find((c) => c.id === route?.params?.categoryId) ||
    MAIN_CATEGORIES_TAXONOMY[0];

  const handleSelectSubcategory =
    onSelectSubcategory ||
    ((sub: SubcategoryMeta) =>
      navigation?.navigate('PlaceForm', {
        categoryId: activeCategory.id,
        subcategoryId: sub.id,
      }));

  const handleBack = onBack || (() => navigation?.goBack());

  const [search, setSearch] = useState('');

  const filtered = activeCategory.subcategories.filter((s) =>
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

        <Text style={styles.title}>Select Specific Subcategory</Text>
        <Text style={styles.subtitle}>
          This dynamically tunes the form fields, emergency tags, and citizen procedures.
        </Text>

        <AppTextInput
          placeholder={`Search ${activeCategory.name} types...`}
          value={search}
          onChangeText={setSearch}
          containerStyle={{ marginTop: 12, marginBottom: 0 }}
        />
      </View>

      {/* Subcategories List */}
      <ScrollView contentContainerStyle={styles.scrollList}>
        {filtered.map((sub) => (
          <TouchableOpacity
            key={sub.id}
            activeOpacity={0.7}
            onPress={() => handleSelectSubcategory(sub)}
            style={styles.subCard}
          >
            <View style={styles.subTopRow}>
              <Text style={styles.subName}>{sub.name}</Text>
              <Text style={styles.arrowIcon}>→</Text>
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
        ))}
      </ScrollView>
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
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textMain,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  scrollList: {
    padding: 16,
    paddingBottom: 32,
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
  arrowIcon: {
    fontSize: 18,
    color: colors.primary,
    fontWeight: '700',
    marginLeft: 8,
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
});
