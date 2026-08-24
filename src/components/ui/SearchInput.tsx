import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../utils/cn';

interface SearchInputProps {
  value?: string;
  onSearch: (value: string) => void;
  placeholder?: string;
  className?: string;
  debounceMs?: number;
}

const SearchInput: React.FC<SearchInputProps> = ({
  value: controlledValue,
  onSearch,
  placeholder = 'Buscar...',
  className,
  debounceMs = 300,
}) => {
  const { t } = useTranslation();
  const [internal, setInternal] = useState(controlledValue ?? '');
  const [prevControlled, setPrevControlled] = useState(controlledValue);

  if (controlledValue !== prevControlled) {
    setPrevControlled(controlledValue);
    if (controlledValue !== undefined && controlledValue !== internal) {
      setInternal(controlledValue);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => onSearch(internal), debounceMs);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [internal, debounceMs]);

  return (
    <div className={cn('relative', className)}>
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted"
        aria-hidden="true"
      />
      <input
        type="text"
        value={internal}
        onChange={(e) => setInternal(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full rounded-lg border border-line bg-surface pl-9 pr-9 py-2 text-sm text-ink placeholder:text-muted/70 outline-none focus:border-brand transition-colors"
      />
      {internal && (
        <button
          onClick={() => {
            setInternal('');
            onSearch('');
          }}
          title={t('tooltips.clearSearch')}
          aria-label={t('tooltips.clearSearch')}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 inline-flex h-6 w-6 items-center justify-center rounded-md text-muted transition-colors hover:text-ink"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default SearchInput;
