// components/ui/Card.jsx
export default function Card({
  children,
  hover = false,
  padding = 'md',
  className = '',
  onClick,
  ...props
}) {
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const baseStyles = 'bg-dark-800 border border-dark-700 rounded-2xl';
  const hoverStyles = hover ? 'hover:border-dark-600 hover:bg-dark-800/80 transition-all duration-200 cursor-pointer' : '';

  return (
    <div
      className={`${baseStyles} ${hoverStyles} ${paddings[padding]} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }) {
  return <div className={`mb-4 ${className}`}>{children}</div>;
}

export function CardTitle({ children, className = '' }) {
  return <h3 className={`text-lg font-semibold text-white ${className}`}>{children}</h3>;
}

export function CardDescription({ children, className = '' }) {
  return <p className={`text-sm text-dark-400 mt-1 ${className}`}>{children}</p>;
}

export function CardContent({ children, className = '' }) {
  return <div className={className}>{children}</div>;
}

export function CardFooter({ children, className = '' }) {
  return <div className={`mt-4 pt-4 border-t border-dark-700 ${className}`}>{children}</div>;
}