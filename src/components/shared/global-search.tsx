'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Users, Car, ClipboardList, Package } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useSearch } from '@/hooks/use-search';

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

export function GlobalSearch() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedQuery = useDebounce(query, 300);
  const { data: results, isLoading } = useSearch(debouncedQuery);

  const hasResults =
    results &&
    (results.clients.length > 0 ||
      results.vehicles.length > 0 ||
      results.workOrders.length > 0 ||
      results.products.length > 0);

  // Derive open state: show dropdown when debounced query has 2+ chars and dropdown is not explicitly closed
  const showDropdown = open && debouncedQuery.length >= 2;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        setQuery('');
      }
    },
    [],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function navigate(path: string) {
    router.push(path);
    setOpen(false);
    setQuery('');
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-secondary)]" />
        <Input
          ref={inputRef}
          placeholder="Buscar clientes, vehículos, OTs..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          className="h-9 pl-10 rounded-xl bg-[var(--color-bg-secondary)] border-transparent focus-visible:border-[var(--color-border)]"
          aria-label="Buscar en el sistema"
          aria-expanded={showDropdown}
          aria-haspopup="listbox"
          role="combobox"
        />
        {isLoading && debouncedQuery.length >= 2 && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent" />
          </div>
        )}
      </div>

      {showDropdown && (
        <div
          role="listbox"
          className="absolute top-full left-0 right-0 mt-2 z-50 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] shadow-lg overflow-hidden"
        >
          {!hasResults && !isLoading && (
            <div className="px-4 py-6 text-center text-sm text-[var(--color-text-secondary)]">
              Sin resultados para &ldquo;{debouncedQuery}&rdquo;
            </div>
          )}

          {results && results.clients.length > 0 && (
            <div>
              <div className="flex items-center gap-2 px-3 py-2 bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)]">
                <Users className="h-3.5 w-3.5 text-[var(--color-text-secondary)]" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
                  Clientes
                </span>
              </div>
              {results.clients.map((c) => (
                <button
                  key={c.id}
                  role="option"
                  aria-selected={false}
                  onClick={() => navigate(`/clients/${c.id}`)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-[var(--color-bg-secondary)] transition-colors"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#1e3a5f] to-[#2563eb] text-[10px] font-bold text-white uppercase shrink-0">
                    {c.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                      {c.name}
                    </p>
                    <p className="text-xs text-[var(--color-text-secondary)]">
                      {c.documentNumber}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {results && results.vehicles.length > 0 && (
            <div>
              <div className="flex items-center gap-2 px-3 py-2 bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)]">
                <Car className="h-3.5 w-3.5 text-[var(--color-text-secondary)]" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
                  Vehículos
                </span>
              </div>
              {results.vehicles.map((v) => (
                <button
                  key={v.id}
                  role="option"
                  aria-selected={false}
                  onClick={() => navigate(`/vehicles/${v.id}`)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-[var(--color-bg-secondary)] transition-colors"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 text-white shrink-0">
                    <Car className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium font-mono text-[var(--color-text-primary)]">
                      {v.plate}
                    </p>
                    <p className="text-xs text-[var(--color-text-secondary)]">
                      {v.brand} {v.model}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {results && results.workOrders.length > 0 && (
            <div>
              <div className="flex items-center gap-2 px-3 py-2 bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)]">
                <ClipboardList className="h-3.5 w-3.5 text-[var(--color-text-secondary)]" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
                  Órdenes de Trabajo
                </span>
              </div>
              {results.workOrders.map((wo) => (
                <button
                  key={wo.id}
                  role="option"
                  aria-selected={false}
                  onClick={() => navigate(`/work-orders`)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-[var(--color-bg-secondary)] transition-colors"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white shrink-0">
                    <ClipboardList className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium font-mono text-[var(--color-text-primary)]">
                      {wo.orderNumber}
                    </p>
                    <p className="text-xs text-[var(--color-text-secondary)] truncate">
                      {wo.clientName}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {results && results.products.length > 0 && (
            <div>
              <div className="flex items-center gap-2 px-3 py-2 bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)]">
                <Package className="h-3.5 w-3.5 text-[var(--color-text-secondary)]" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
                  Productos
                </span>
              </div>
              {results.products.map((p) => (
                <button
                  key={p.id}
                  role="option"
                  aria-selected={false}
                  onClick={() => navigate(`/inventory`)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-[var(--color-bg-secondary)] transition-colors"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white shrink-0">
                    <Package className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                      {p.name}
                    </p>
                    <p className="text-xs text-[var(--color-text-secondary)] font-mono">
                      {p.code}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
