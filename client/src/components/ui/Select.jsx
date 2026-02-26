// components/ui/Select.jsx
import { ChevronDown } from 'lucide-react';

export default function Select({
  label,
  error,
  hint,
  options = [],
  placeholder = 'Select option...',
  className = '',
  value,
  onChange,
  ...props
}) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-dark-200">
          {label}
        </label>
      )}

      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          className={`
            w-full px-4 py-3 bg-dark-800 border rounded-xl
            text-white appearance-none cursor-pointer
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
            transition-all duration-200
            ${error ? 'border-error-500' : 'border-dark-700'}
            ${className}
          `}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value} className="bg-dark-800">
              {option.label}
            </option>
          ))}
        </select>

        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500 pointer-events-none" />
      </div>

      {error && <p className="text-sm text-error-400">{error}</p>}
      {hint && !error && <p className="text-sm text-dark-500">{hint}</p>}
    </div>
  );
}