import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { MAIN_CATEGORIES_TAXONOMY } from '../../constants/taxonomy';
import { categoriesApi, BackendCategory } from '../../api/categoriesApi';
import { MainCategoryMeta } from '../../types';
import { colors } from '../../theme/colors';
import { AppTextInput } from '../../components/common/AppTextInput';

export interface CategorySelectScreenProps {
  navigation?: any;
  route?: any;
  onSelectCategory?: (category: MainCategoryMeta) => void;
  onCancel?: () => void;
}

export const CategorySelectScreen: React.FC<CategorySelectScreenProps> = ({
  navigation,
  route,
  onSelectCategory,
  onCancel,
}) => {
  const handleSelectCategory = onSelectCategory || ((cat: MainCategoryMeta) => navigation?.navigate('SubcategorySelect', { categoryId: cat.id }));
  const handleCancel = onCancel || (() => navigation?.goBack());
  const [categories, setCategories] = useState<MainCategoryMeta[]>(MAIN_CATEGORIES_TAXONOMY);
  const [search, setSearch] = useState('');
  const [backendCategories, setBackendCategories] = useState<BackendCategory[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Sync with backend categories
    const loadBackendCats = async () => {
      try {
        setLoading(true);
        const data = await categoriesApi.getCategories();
        setBackendCategories(data);
      } catch (err) {
        // Fallback to authoritative taxonomy
        console.warn('Using local taxonomy metadata:', err);
      } finally {
        setLoading(false);
      }
    };
    loadBackendCats();
  }, []);

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.description.toLowerCase().includes(search.toLowerCase()) ||
    c.subcategories.some((s) => s.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={handleCancel} style={styles.cancelBtn}>
            <Text style={styles.cancelText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.stepBadge}>Step 1 of 10</Text>
        </View>
        <Text style={styles.title}>Choose Main Category</Text>
        <Text style={styles.subtitle}>
          Select the core civic or commercial domain for this place or service in Pavagada.
        </Text>

        <AppTextInput
          placeholder="Search categories (e.g. Health, Education, Bank)..."
          value={search}
          onChangeText={setSearch}
          containerStyle={{ marginTop: 12, marginBottom: 0 }}
        />
      </View>

      {/* Categories List */}
      <ScrollView contentContainerStyle={styles.scrollList}>
        {loading && (
          <View style={styles.syncIndicator}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.syncText}>Syncing with backend registry...</Text>
          </View>
        )}

        {filtered.map((cat, index) => {
          return (
            <TouchableOpacity
              key={cat.id}
              activeOpacity={0.7}
              onPress={() => handleSelectCategory(cat)}
              style={[styles.categoryCard, { borderColor: cat.color.border }]}
            >
              <View style={styles.cardHeader}>
                <View style={[styles.badge, { backgroundColor: cat.color.badge }]}>
                  <Text style={[styles.badgeText, { color: cat.color.primary }]}>
                    #{index + 1} • {cat.shortCode}
                  </Text>
                </View>
                <Text style={styles.subCount}>
                  {cat.subcategories.length} Subcategories →
                </Text>
              </View>

              <Text style={styles.catName}>{cat.name}</Text>
              <Text style={styles.catDesc}>{cat.description}</Text>

              <View style={styles.sampleChips}>
                {cat.subcategories.slice(0, 3).map((sub) => (
                  <View key={sub.id} style={styles.sampleChip}>
                    <Text style={styles.sampleChipText}>{sub.name}</Text>
                  </View>
                ))}
                {cat.subcategories.length > 3 && (
                  <View style={styles.sampleChipMore}>
                    <Text style={styles.sampleChipMoreText}>
                      +{cat.subcategories.length - 3} more
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
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
  cancelBtn: {
    paddingVertical: 4,
  },
  cancelText: {
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
    gap: 12,
  },
  syncIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
    justifyContent: 'center',
  },
  syncText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  categoryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1.5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  subCount: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  catName: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textMain,
    marginBottom: 4,
  },
  catDesc: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 17,
    marginBottom: 12,
  },
  sampleChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  sampleChip: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 4,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sampleChipText: {
    fontSize: 11,
    color: colors.textMain,
    fontWeight: '500',
  },
  sampleChipMore: {
    backgroundColor: colors.primaryLight,
    borderRadius: 4,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  sampleChipMoreText: {
    fontSize: 11,
    color: colors.primaryDark,
    fontWeight: '700',
  },
});
