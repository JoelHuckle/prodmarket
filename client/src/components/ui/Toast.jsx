// components/ui/Toast.jsx
import { useState, useEffect, createContext, useContext } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const ToastContext = createContext();

const toastConfig = {
  success: {
    icon: CheckCircle,
    bg: 'bg-success-500/10',
    border: 'border-success-500/30',
    iconColor: 'text-success-400',
  },
  error: {
    icon: AlertCircle,
    bg: 'bg-error-500/10',
    border: 'border-error-500/30',
    iconColor: 'text-error-400',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-warning-500/10',
    border: 'border-warning-500/30',
    iconColor: 'text-warning-400',
  },
  info: {
    icon: Info,
    bg: 'bg-info-500/10',
    border: 'border-info-500/30',
    iconColor: 'text-info-400',
  },
};

function Toast({ id, type = 'info', title, message, onClose, duration = 5000 }) {
  const config = toastConfig[type];
  const Icon = config.icon;

  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => onClose(id), duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  return (
    <div
      className={`
        flex items-start gap-3 p-4 rounded-xl border backdrop-blur-sm
        animate-slide-in shadow-lg
        ${config.bg} ${config.border}
      `}
    >
      <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${config.iconColor}`} />

      <div className="flex-1 min-w-0">
        {title && <p className="font-medium text-white">{title}</p>}
        {message && <p className="text-sm text-dark-300 mt-0.5">{message}</p>}
      </div>

      <button
        onClick={() => onClose(id)}
        className="p-1 -m-1 text-dark-400 hover:text-white transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = ({ type = 'info', title, message, duration = 5000 }) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, title, message, duration }]);
    return id;
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const toast = {
    success: (title, message) => addToast({ type: 'success', title, message }),
    error: (title, message) => addToast({ type: 'error', title, message }),
    warning: (title, message) => addToast({ type: 'warning', title, message }),
    info: (title, message) => addToast({ type: 'info', title, message }),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}

      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm">
        {toasts.map((t) => (
          <Toast key={t.id} {...t} onClose={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}