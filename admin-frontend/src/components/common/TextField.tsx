import React from 'react';

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  required?: boolean;
  helperText?: string;
  error?: string;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const TextField: React.FC<TextFieldProps> = ({
  label,
  required = false,
  helperText,
  error,
  icon,
  rightElement,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className="space-y-1.5 w-full">
      <div className="flex items-center justify-between">
        <label htmlFor={inputId} className="block text-xs font-semibold text-slate-300">
          {label} {required && <span className="text-rose-400 font-bold">*</span>}
        </label>
        {rightElement}
      </div>

      <div className="relative rounded-xl shadow-sm">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          {...props}
          className={`w-full rounded-xl bg-slate-900 border text-xs text-white placeholder-slate-500 transition-all focus:outline-none focus:ring-2 ${
            icon ? 'pl-10' : 'pl-3.5'
          } pr-3.5 py-2.5 ${
            error
              ? 'border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/30'
              : 'border-slate-800 hover:border-slate-700 focus:border-emerald-500 focus:ring-emerald-500/20'
          } ${className}`}
        />
      </div>

      {error ? (
        <p className="text-[11px] text-rose-400 flex items-center gap-1 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
};
