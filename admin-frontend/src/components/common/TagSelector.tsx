import React, { useState, useEffect, useRef } from 'react';
import { Tag as TagIcon, X, Plus, Search, Check, Sparkles } from 'lucide-react';
import { adminApi } from '../../services/api';
import { GroupedTags, TagItem } from '../../types';

interface TagSelectorProps {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
  suggestedTags?: string[];
}

const SMART_GROUP_LABELS: Record<string, { label: string; desc: string }> = {
  SERVICE: { label: 'Service Category', desc: 'Core domain of service' },
  AVAILABILITY: { label: 'Availability & Access', desc: '24/7, Open Now, Walk-in, By Appointment' },
  FACILITY: { label: 'Amenities & Facilities', desc: 'Parking, AC, Wi-Fi, Accessibility, Labs' },
  PAYMENT: { label: 'Payment Methods', desc: 'UPI, Cash, Cards, Online' },
  AUDIENCE: { label: 'Target Audience', desc: 'Children, Women, Students, Farmers, Senior Citizens' },
  SERVICE_MODE: { label: 'Service Mode', desc: 'Home Service, In-Person, Phone, Online' },
};

export const TagSelector: React.FC<TagSelectorProps> = ({
  selectedTags = [],
  onChange,
  suggestedTags = [],
}) => {
  const [groupedTags, setGroupedTags] = useState<GroupedTags | null>(null);
  const [allTags, setAllTags] = useState<TagItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<string>('AVAILABILITY');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const inputContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    adminApi
      .getGroupedTags()
      .then((data) => {
        if (!isMounted) return;
        setGroupedTags(data);
        const flattened: TagItem[] = Object.values(data).flat();
        setAllTags(flattened);
      })
      .catch((err) => console.warn('Could not load grouped tags:', err));

    return () => {
      isMounted = false;
    };
  }, []);

  // Handle outside click for autocomplete dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (inputContainerRef.current && !inputContainerRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTag = (tagName: string) => {
    const trimmed = tagName.trim();
    if (!trimmed) return;

    if (selectedTags.includes(trimmed)) {
      onChange(selectedTags.filter((t) => t !== trimmed));
    } else {
      onChange([...selectedTags, trimmed]);
    }
  };

  const createAndSelectTag = async (tagName: string) => {
    const trimmed = tagName.trim();
    if (!trimmed) return;

    if (!selectedTags.includes(trimmed)) {
      onChange([...selectedTags, trimmed]);
    }

    try {
      const newTag = await adminApi.createTag({
        name: trimmed,
        category: 'SERVICE',
      });
      setAllTags((prev) => [...prev, newTag]);
    } catch {
      // ignore if already exists or offline
    }

    setSearchQuery('');
    setIsDropdownOpen(false);
  };

  // Autocomplete matching tags
  const matchingTags = searchQuery.trim()
    ? allTags.filter((t) =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
      )
    : [];

  const exactMatchExists = allTags.some(
    (t) => t.name.toLowerCase() === searchQuery.toLowerCase().trim()
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <TagIcon size={14} className="text-emerald-400" />
            <span>Search & Discovery Tags</span>
          </label>
          <p className="text-[11px] text-slate-500">
            Selected tags directly power citizen search filters, keyword discovery, and map tags.
          </p>
        </div>

        <span className="text-[11px] text-slate-400 font-mono">
          <strong className="text-emerald-400">{selectedTags.length}</strong> selected
        </span>
      </div>

      {/* Selected Tags Display */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 p-3 rounded-2xl bg-slate-900 border border-slate-800">
          {selectedTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-950 text-emerald-300 border border-emerald-800/80 shadow-sm"
            >
              <span>{tag}</span>
              <button
                type="button"
                onClick={() => toggleTag(tag)}
                className="text-emerald-400 hover:text-white transition-colors"
                title={`Remove tag ${tag}`}
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Suggested Tags (Category Context) */}
      {suggestedTags.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] text-amber-400 font-semibold flex items-center gap-1">
            <Sparkles size={12} />
            <span>Suggested:</span>
          </span>
          {suggestedTags.map((tag) => {
            const isSelected = selectedTags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors ${
                  isSelected
                    ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/60'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                {isSelected ? '✓ ' : '+ '}
                {tag}
              </button>
            );
          })}
        </div>
      )}

      {/* Autocomplete Input */}
      <div ref={inputContainerRef} className="relative">
        <div className="relative">
          <Search size={14} className="absolute left-3.5 top-3 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsDropdownOpen(true);
            }}
            onFocus={() => setIsDropdownOpen(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (searchQuery.trim()) {
                  createAndSelectTag(searchQuery);
                }
              }
            }}
            placeholder="Type to search existing tags (e.g. 24/7, UPI, Hospital, Wheelchair Accessible)..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Autocomplete Dropdown */}
        {isDropdownOpen && searchQuery.trim() && (
          <div className="absolute left-0 right-0 top-full mt-1.5 z-30 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 max-h-56 overflow-y-auto space-y-1">
            {matchingTags.map((tag) => {
              const isSelected = selectedTags.includes(tag.name);
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => {
                    toggleTag(tag.name);
                    setSearchQuery('');
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-colors ${
                    isSelected
                      ? 'bg-emerald-950 text-emerald-300 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{tag.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      ({tag.category})
                    </span>
                  </div>
                  {isSelected && <Check size={13} className="text-emerald-400" />}
                </button>
              );
            })}

            {!exactMatchExists && (
              <button
                type="button"
                onClick={() => createAndSelectTag(searchQuery)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-emerald-400 bg-emerald-950/40 hover:bg-emerald-950/80 border border-emerald-800/40 transition-colors"
              >
                <Plus size={14} />
                <span>Create new tag "{searchQuery.trim()}"</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Smart Grouped Tags Tabs */}
      {groupedTags && (
        <div className="space-y-3 pt-2 border-t border-slate-800/70">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {Object.keys(SMART_GROUP_LABELS).map((groupKey) => {
              const meta = SMART_GROUP_LABELS[groupKey];
              const count = groupedTags[groupKey as keyof GroupedTags]?.length || 0;
              const isActive = activeTab === groupKey;
              return (
                <button
                  key={groupKey}
                  type="button"
                  onClick={() => setActiveTab(groupKey)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-forest text-white shadow-sm'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {meta.label} ({count})
                </button>
              );
            })}
          </div>

          {/* Group Content Chips */}
          <div className="p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800/60 min-h-[90px]">
            <p className="text-[11px] text-slate-500 mb-2 font-medium">
              {SMART_GROUP_LABELS[activeTab]?.desc}
            </p>

            <div className="flex flex-wrap gap-1.5">
              {(groupedTags[activeTab as keyof GroupedTags] || []).map((tag) => {
                const isSelected = selectedTags.includes(tag.name);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.name)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                        : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '}
                    {tag.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
