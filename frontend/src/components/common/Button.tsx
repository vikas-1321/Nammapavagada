import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'earth';
  withArrow?: boolean;
  arrowText?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  withArrow = true,
  size = 'md',
  className = '',
  ...props
}) => {
  const baseStyles = 'group relative inline-flex items-center justify-between font-sans font-semibold rounded-lg transition-all duration-200 ease-out focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm';

  const sizeStyles = {
    sm: 'text-xs px-3.5 py-1.5 gap-2',
    md: 'text-sm px-5 py-2.5 gap-2.5',
    lg: 'text-base px-6 py-3.5 gap-3',
  }[size];

  const variantStyles = {
    primary: 'bg-forest-green text-white hover:bg-forest-green-dark active:bg-forest-green-dark border border-forest-green hover:shadow-md',
    secondary: 'bg-white text-forest-green border border-soft-sand hover:bg-warm-cream hover:border-forest-green active:bg-soft-sand',
    accent: 'bg-terracotta text-white border border-terracotta hover:bg-terracotta-dark active:bg-terracotta-dark hover:shadow-md',
    earth: 'bg-earth-brown text-white border border-earth-brown hover:bg-earth-brown-light active:bg-earth-brown-light hover:shadow-md',
  }[variant];

  return (
    <button
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
      {...props}
    >
      <span>{children}</span>
      {withArrow && (
        <span
          className="inline-block transition-transform duration-200 ease-out group-hover:translate-x-1 motion-reduce:transform-none select-none text-current"
          aria-hidden="true"
        >
          →
        </span>
      )}
    </button>
  );
};
