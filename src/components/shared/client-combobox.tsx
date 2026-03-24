'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Check, ChevronsUpDown, Search, Users, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { clientsApi } from '@/lib/api/clients';

interface ClientComboboxProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function ClientCombobox({ value, onChange, error }: ClientComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [manualLabel, setManualLabel] = useState('');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Search clients by API (only when 2+ chars)
  const { data: results, isLoading } = useQuery({
    queryKey: ['clients', 'search', debouncedSearch],
    queryFn: async () => {
      const response = await clientsApi.search(debouncedSearch);
      return response.data;
    },
    enabled: debouncedSearch.length >= 2,
  });

  // Fetch selected client details for display (edit mode)
  const { data: fetchedClient } = useQuery({
    queryKey: ['clients', 'detail', value],
    queryFn: async () => {
      const response = await clientsApi.getById(value);
      return response.data;
    },
    enabled: !!value && !manualLabel,
    staleTime: Infinity,
  });

  const displayLabel =
    manualLabel ||
    (fetchedClient
      ? `${fetchedClient.name} — ${fetchedClient.documentNumber}`
      : '');

  const filtered = results ?? [];

  function handleSelect(clientId: string, name: string, document: string) {
    onChange(clientId);
    setManualLabel(`${name} — ${document}`);
    setOpen(false);
    setSearch('');
  }

  return (
    <div className="space-y-1.5">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              type="button"
              variant="outline"
              className={cn(
                'w-full h-10 justify-between rounded-xl font-normal bg-transparent hover:bg-transparent hover:border-ring aria-expanded:bg-transparent dark:bg-transparent dark:hover:bg-transparent',
                !value && 'text-muted-foreground',
              )}
            />
          }
        >
          <span className="flex items-center gap-2 truncate">
            <Users className="h-4 w-4 text-[var(--color-text-secondary)] shrink-0" />
            {displayLabel || 'Busca un cliente...'}
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </PopoverTrigger>
        <PopoverContent className="w-[var(--anchor-width)] p-0" align="start">
          <div className="p-2 border-b border-[var(--color-border)]">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--color-text-secondary)]" />
              <Input
                placeholder="Buscar por nombre o cédula..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 pl-8 text-sm rounded-lg"
                autoFocus
              />
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto p-1">
            {isLoading ? (
              <div className="flex items-center justify-center py-4 gap-2 text-sm text-[var(--color-text-secondary)]">
                <Loader2 className="h-4 w-4 animate-spin" />
                Buscando...
              </div>
            ) : filtered.length > 0 ? (
              filtered.map((client) => (
                <button
                  key={client.id}
                  type="button"
                  onClick={() =>
                    handleSelect(
                      client.id,
                      client.name,
                      client.documentNumber,
                    )
                  }
                  className={cn(
                    'flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors hover:bg-[var(--color-bg-secondary)]',
                    value === client.id && 'bg-[var(--color-bg-secondary)]',
                  )}
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#1e3a5f] to-[#2563eb] text-[10px] font-bold text-white uppercase shrink-0">
                    {client.name.charAt(0)}
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="font-medium truncate">{client.name}</p>
                    <p className="text-xs text-[var(--color-text-secondary)]">
                      {client.documentNumber}
                    </p>
                  </div>
                  {value === client.id && (
                    <Check className="ml-auto h-4 w-4 text-[var(--color-success)] shrink-0" />
                  )}
                </button>
              ))
            ) : (
              <p className="py-4 text-center text-sm text-[var(--color-text-secondary)]">
                {search.length < 2
                  ? 'Escribe al menos 2 caracteres para buscar'
                  : 'Sin resultados'}
              </p>
            )}
          </div>
        </PopoverContent>
      </Popover>
      {error && (
        <p className="text-xs text-[var(--color-error)]">{error}</p>
      )}
    </div>
  );
}
