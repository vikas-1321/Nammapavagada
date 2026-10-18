import React from 'react';
import { Mail } from 'lucide-react';
import { TextField } from './TextField';

interface EmailFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  helperText?: string;
  error?: string;
}

export const EmailField: React.FC<EmailFieldProps> = ({
  label,
  value,
  onChange,
  required = false,
  placeholder = 'official@department.gov.in',
  helperText = 'Official email address for correspondence',
  error,
}) => {
  return (
    <TextField
      label={label}
      required={required}
      type="email"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      helperText={helperText}
      error={error}
      icon={<Mail size={15} />}
    />
  );
};
