import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { GroupedTags, TagItem } from '../../types';
import { tagsApi } from '../../api/tagsApi';
import { colors } from '../../theme/colors';
import { AppTextInput } from '../common/AppTextInput';

interface TagSelectorProps {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
  suggestedTags?: string[];
}

const CATEGORY_NAMES: Record<keyof GroupedTags, string> = {
  SERVICE: 'Service Focus',
  AVAILABILITY: 'Availability & Access',
  FACILITY: 'Premises & Facilities',
  PAYMENT: 'Payment Options',
  AUDIENCE: 'Audience & Beneficiary',
  SERVICE_MODE: 'Service Mode',
  OTHER: 'General & Custom',
};

export const TagSelector: React.FC<TagSelectorProps> = ({
  selectedTags,
  onChange,
  suggestedTags = [],
}) => {
  const [groupedTags, setGroupedTags] = useState<GroupedTags | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<keyof GroupedTags>('SERVICE');
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);
  const [newTagName, setNewTagName] = useState('');

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      setLoading(true);
      const data = await tagsApi.getGroupedTags();
      setGroupedTags(data);
    } catch (err) {
      console.error('Failed to load grouped tags:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleTag = (tagName: string) => {
    if (selectedTags.includes(tagName)) {
      onChange(selectedTags.filter((t) => t !== tagName));
    } else {
      onChange([...selectedTags, tagName]);
    }
  };

  const handleCreateCustomTag = async () => {
    const trimmed = newTagName.trim();
    if (!trimmed) return;

    try {
      setIsCreatingCustom(true);
      const created = await tagsApi.createTag({
        name: trimmed,
        category: activeTab,
        description: `Custom ${activeTab.toLowerCase()} tag created from mobile CMS`,
      });

      // Add to selected tags
      if (!selectedTags.includes(created.name)) {
        onChange([...selectedTags, created.name]);
      }

      setNewTagName('');
      await loadTags();
    } catch (err: any) {
      Alert.alert('Tag Creation Failed', err.message || 'Could not save tag to backend.');
    } finally {
      setIsCreatingCustom(false);
    }
  };

  if (loading && !groupedTags) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={styles.loadingText}>Loading smart tag taxonomy...</Text>
      </View>
    );
  }

  const currentCategoryTags = groupedTags ? groupedTags[activeTab] || [] : [];
  const filteredTags = currentCategoryTags.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Selected Tags Chips */}
      <View style={styles.selectedSection}>
        <Text style={styles.sectionHeader}>
          Selected Tags ({selectedTags.length})
        </Text>
        {selectedTags.length === 0 ? (
          <Text style={styles.emptySelectedText}>
            No tags selected yet. Tap tags below to attach them to this location.
          </Text>
        ) : (
          <View style={styles.chipsContainer}>
            {selectedTags.map((tag) => (
              <TouchableOpacity
                key={tag}
                activeOpacity={0.7}
                onPress={() => toggleTag(tag)}
                style={styles.selectedChip}
              >
                <Text style={styles.selectedChipText}>{tag}</Text>
                <Text style={styles.selectedChipRemove}>✕</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Suggested Tags from Subcategory if not selected yet */}
      {suggestedTags.length > 0 && (
        <View style={styles.suggestedSection}>
          <Text style={styles.suggestedHeader}>Recommended for this Subcategory:</Text>
          <View style={styles.chipsContainer}>
            {suggestedTags.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <TouchableOpacity
                  key={tag}
                  activeOpacity={0.7}
                  onPress={() => toggleTag(tag)}
                  style={[
                    styles.suggestedChip,
                    isSelected && styles.suggestedChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.suggestedChipText,
                      isSelected && styles.suggestedChipTextActive,
                    ]}
                  >
                    {isSelected ? '✓ ' : '+ '}
                    {tag}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      {/* Category Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsContainer}
      >
        {(Object.keys(CATEGORY_NAMES) as Array<keyof GroupedTags>).map((cat) => {
          const isActive = activeTab === cat;
          return (
            <TouchableOpacity
              key={cat}
              onPress={() => setActiveTab(cat)}
              style={[styles.tabButton, isActive && styles.tabButtonActive]}
            >
              <Text style={[styles.tabButtonText, isActive && styles.tabButtonTextActive]}>
                {CATEGORY_NAMES[cat]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Filter / Search inside group */}
      <AppTextInput
        placeholder={`Search tags in ${CATEGORY_NAMES[activeTab]}...`}
        value={search}
        onChangeText={setSearch}
        containerStyle={styles.searchInput}
      />

      {/* Tags Grid */}
      <View style={styles.chipsContainer}>
        {filteredTags.map((tag: TagItem) => {
          const isSelected = selectedTags.includes(tag.name);
          return (
            <TouchableOpacity
              key={tag.id}
              activeOpacity={0.7}
              onPress={() => toggleTag(tag.name)}
              style={[
                styles.tagChip,
                isSelected && styles.tagChipActive,
              ]}
            >
              <Text
                style={[
                  styles.tagChipText,
                  isSelected && styles.tagChipTextActive,
                ]}
              >
                {isSelected ? '✓ ' : ''}
                {tag.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Custom Tag Creation */}
      <View style={styles.createTagBox}>
        <Text style={styles.createTagTitle}>Can't find a tag? Create new:</Text>
        <View style={styles.createTagRow}>
          <View style={{ flex: 1 }}>
            <AppTextInput
              placeholder="e.g. Snakebite Treatment, 24x7 Pharmacy"
              value={newTagName}
              onChangeText={setNewTagName}
              containerStyle={styles.noMargin}
            />
          </View>
          <TouchableOpacity
            onPress={handleCreateCustomTag}
            disabled={isCreatingCustom || !newTagName.trim()}
            style={[
              styles.createTagBtn,
              (!newTagName.trim() || isCreatingCustom) && styles.disabledBtn,
            ]}
          >
            {isCreatingCustom ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.createTagBtnText}>Add Tag</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  selectedSection: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMain,
    marginBottom: 8,
  },
  emptySelectedText: {
    fontSize: 12,
    color: colors.textSubtle,
    fontStyle: 'italic',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 5,
    paddingHorizontal: 10,
    gap: 6,
  },
  selectedChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  selectedChipRemove: {
    fontSize: 11,
    color: '#ffffff',
    fontWeight: '700',
  },
  suggestedSection: {
    backgroundColor: colors.primaryLight,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  suggestedHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primaryDark,
    marginBottom: 8,
  },
  suggestedChip: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: colors.primaryMuted,
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 9,
  },
  suggestedChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  suggestedChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primaryDark,
  },
  suggestedChipTextActive: {
    color: '#ffffff',
  },
  tabsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    paddingVertical: 4,
  },
  tabButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabButtonActive: {
    backgroundColor: colors.primaryDark,
    borderColor: colors.primaryDark,
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  tabButtonTextActive: {
    color: '#ffffff',
  },
  searchInput: {
    marginBottom: 12,
  },
  tagChip: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  tagChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tagChipText: {
    fontSize: 13,
    color: colors.textMain,
    fontWeight: '500',
  },
  tagChipTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  createTagBox: {
    marginTop: 16,
    padding: 12,
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  createTagTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 6,
  },
  createTagRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  noMargin: {
    marginBottom: 0,
  },
  createTagBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledBtn: {
    opacity: 0.5,
  },
  createTagBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
});
