import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'forest' | 'terracotta' | 'earth' | 'sand' | 'cream' | 'white' | 'outline' | 'black' | 'red' | 'slate';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'sand',
  size = 'sm',
  className = '',
}) => {
  const base = 'inline-flex items-center font-sans font-semibold rounded-full';
  
  const sizeStyles = {
    sm: 'text-[11px] px-2.5 py-0.5',
    md: 'text-xs px-3 py-1',
  }[size];

  const variantStyles: Record<string, string> = {
    forest: 'bg-forest-green text-white',
    terracotta: 'bg-terracotta text-white',
    earth: 'bg-earth-brown text-white',
    sand: 'bg-soft-sand text-dark-text border border-soft-sand-dark/50',
    cream: 'bg-warm-cream text-forest-green border border-soft-sand',
    white: 'bg-white text-dark-text border border-soft-sand shadow-sm',
    outline: 'bg-transparent text-forest-green border border-forest-green/40',
    black: 'bg-forest-green text-white',
    red: 'bg-terracotta text-white',
    slate: 'bg-soft-sand text-dark-text',
  };

  const selectedVariantStyle = variantStyles[variant] || variantStyles.sand;

  return (
    <span className={`${base} ${sizeStyles} ${selectedVariantStyle} ${className}`}>
      {children}
    </span>
  );
};
