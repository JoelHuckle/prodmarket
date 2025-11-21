// components/ui/EmptyState.jsx
import { Inbox } from 'lucide-react';
import Button from './Button';

export default function EmptyState({
  icon: Icon = Inbox,
  title = 'No data found',
  description,
  action,
  actionLabel,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
      <div className="w-16 h-16 bg-dark-800 rounded-2xl flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-dark-500" />
      </div>

      <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>

      {description && (
        <p className="text-dark-400 text-sm max-w-sm mb-4">{description}</p>
      )}

      {action && actionLabel && (
        <Button onClick={action} variant="primary" size="sm">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}