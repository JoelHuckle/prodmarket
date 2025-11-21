// components/ui/Textarea.jsx
export default function Textarea({
  label,
  error,
  hint,
  rows = 4,
  className = '',
  ...props
}) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-dark-200">
          {label}
        </label>
      )}

      <textarea
        rows={rows}
        className={`
          w-full px-4 py-3 bg-dark-800 border rounded-xl
          text-white placeholder-dark-500 resize-none
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
          transition-all duration-200
          ${error ? 'border-error-500' : 'border-dark-700'}
          ${className}
        `}
        {...props}
      />

      {error && <p className="text-sm text-error-400">{error}</p>}
      {hint && !error && <p className="text-sm text-dark-500">{hint}</p>}
    </div>
  );
}