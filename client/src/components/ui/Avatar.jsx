// components/ui/Avatar.jsx
export default function Avatar({
  src,
  alt,
  name,
  size = 'md',
  className = '',
}) {
  const sizes = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-20 h-20 text-2xl',
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getColor = (name) => {
    if (!name) return 'from-dark-600 to-dark-700';
    const colors = [
      'from-primary-500 to-primary-700',
      'from-blue-500 to-blue-700',
      'from-cyan-500 to-cyan-700',
      'from-teal-500 to-teal-700',
      'from-indigo-500 to-indigo-700',
      'from-violet-500 to-violet-700',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  if (src) {
    return (
      <img
        src={src}
        alt={alt || name || 'Avatar'}
        className={`rounded-full object-cover bg-dark-700 ${sizes[size]} ${className}`}
      />
    );
  }

  return (
    <div
      className={`
        rounded-full flex items-center justify-center font-semibold text-white
        bg-gradient-to-br ${getColor(name)}
        ${sizes[size]}
        ${className}
      `}
    >
      {getInitials(name)}
    </div>
  );
}