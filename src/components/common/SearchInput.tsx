import React from 'react';

export interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  onClear?: () => void;
  compact?: boolean;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  label = 'Search places in Pavagada',
  value,
  onChange,
  onClear,
  placeholder = 'Search places, fort structures, solar park, hospitals, bus routes...',
  className = '',
  compact = false,
  ...props
}) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          className={`block uppercase tracking-wider font-bold text-forest-green ${
            compact ? 'text-[11px] mb-1' : 'text-xs mb-2'
          }`}
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {/* Search Glyph */}
        <div
          className={`absolute left-3.5 text-forest-green/60 select-none pointer-events-none ${
            compact ? 'text-sm' : 'text-base'
          }`}
        >
          🔍
        </div>
        <input
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full bg-white text-dark-text rounded-xl border border-soft-sand font-sans placeholder:text-muted-text/60 shadow-xs focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta/20 transition-all duration-150 ${
            compact
              ? 'text-xs md:text-sm pl-9 pr-16 py-2 md:py-2.5'
              : 'text-sm pl-11 pr-20 py-3.5'
          }`}
          {...props}
        />
        {value && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-2.5 text-[11px] font-semibold text-muted-text hover:text-terracotta px-2 py-0.5 rounded-md bg-warm-cream hover:bg-soft-sand transition-colors cursor-pointer"
            aria-label="Clear search input"
          >
            Clear ✕
          </button>
        )}
      </div>
    </div>
  );
};
