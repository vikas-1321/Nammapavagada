import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  required?: boolean;
  helperText?: string;
  error?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  required = false,
  helperText,
  error,
  className = '',
  rows = 3,
  id,
  ...props
}) => {
  const textareaId = id || `textarea-${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className="space-y-1.5 w-full">
      <label htmlFor={textareaId} className="block text-xs font-semibold text-slate-300">
        {label} {required && <span className="text-rose-400 font-bold">*</span>}
      </label>

      <textarea
        id={textareaId}
        rows={rows}
        {...props}
        className={`w-full rounded-xl bg-slate-900 border px-3.5 py-2.5 text-xs text-white placeholder-slate-500 transition-all focus:outline-none focus:ring-2 resize-y ${
          error
            ? 'border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/30'
            : 'border-slate-800 hover:border-slate-700 focus:border-emerald-500 focus:ring-emerald-500/20'
        } ${className}`}
      />

      {error ? (
        <p className="text-[11px] text-rose-400 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
};
