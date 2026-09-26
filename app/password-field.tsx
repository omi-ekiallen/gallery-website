'use client';

import { useState } from 'react';

/**
 * Password input with a Show / Hide toggle. The toggle is a real button so it
 * reaches keyboard and screen-reader users, and it never submits the form.
 */
export default function PasswordField({
  label,
  value,
  onChange,
  placeholder,
  autoComplete,
  minLength,
  required = true,
  className = '',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
  minLength?: number;
  required?: boolean;
  className?: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="label-caps text-ink-soft">{label}</label>
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-pressed={visible}
          className="label-caps text-ink-soft hover:text-ink transition"
        >
          {visible ? 'Hide' : 'Show'}
        </button>
      </div>

      <input
        type={visible ? 'text' : 'password'}
        required={required}
        minLength={minLength}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`field ${className}`}
      />
    </div>
  );
}
