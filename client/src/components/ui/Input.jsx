// components/ui/Input.jsx
export default function Input({
  label,
  error,
  hint,
  icon: Icon,
  className = '',
  type = 'text',
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
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-500">
            <Icon className="w-5 h-5" />
          </div>
        )}

        <input
          type={type}
          className={`
            w-full px-4 py-3 bg-dark-800 border rounded-xl
            text-white placeholder-dark-500
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
            transition-all duration-200
            ${Icon ? 'pl-12' : ''}
            ${error ? 'border-error-500' : 'border-dark-700'}
            ${className}
          `}
          {...props}
        />
      </div>

      {error && <p className="text-sm text-error-400">{error}</p>}
      {hint && !error && <p className="text-sm text-dark-500">{hint}</p>}
    </div>
  );
}