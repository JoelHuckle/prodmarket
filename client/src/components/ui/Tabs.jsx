// components/ui/Tabs.jsx
import { useState, createContext, useContext } from 'react';

const TabsContext = createContext();

export function Tabs({ defaultValue, value, onValueChange, children, className = '' }) {
  const [internalValue, setInternalValue] = useState(defaultValue);

  const currentValue = value !== undefined ? value : internalValue;
  const handleChange = onValueChange || setInternalValue;

  return (
    <TabsContext.Provider value={{ value: currentValue, onChange: handleChange }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ children, className = '' }) {
  return (
    <div className={`flex gap-1 p-1 bg-dark-800 rounded-xl ${className}`}>
      {children}
    </div>
  );
}

export function TabsTrigger({ value, children, className = '' }) {
  const { value: selectedValue, onChange } = useContext(TabsContext);
  const isActive = selectedValue === value;

  return (
    <button
      onClick={() => onChange(value)}
      className={`
        px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200
        ${isActive
          ? 'bg-dark-700 text-white'
          : 'text-dark-400 hover:text-white hover:bg-dark-700/50'
        }
        ${className}
      `}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children, className = '' }) {
  const { value: selectedValue } = useContext(TabsContext);

  if (selectedValue !== value) return null;

  return <div className={`animate-fade-in ${className}`}>{children}</div>;
}