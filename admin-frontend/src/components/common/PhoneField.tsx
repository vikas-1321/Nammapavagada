import React from 'react';
import { Phone } from 'lucide-react';
import { TextField } from './TextField';

interface PhoneFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  helperText?: string;
  error?: string;
}

export const PhoneField: React.FC<PhoneFieldProps> = ({
  label,
  value,
  onChange,
  required = false,
  placeholder = 'e.g. 08136-244222 or 9449800000',
  helperText = 'Official public landline or mobile contact',
  error,
}) => {
  return (
    <TextField
      label={label}
      required={required}
      type="tel"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      helperText={helperText}
      error={error}
      icon={<Phone size={15} />}
      rightElement={
        value ? (
          <a
            href={`tel:${value}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-emerald-400 hover:text-emerald-300 font-semibold"
          >
            Test Call
          </a>
        ) : undefined
      }
    />
  );
};
