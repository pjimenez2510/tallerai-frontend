'use client';

import { useState } from 'react';
import { Check, ChevronsUpDown, Search, Users } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useClients } from '@/hooks/use-clients';

interface ClientComboboxProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function ClientCombobox({ value, onChange, error }: ClientComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const { data: clients } = useClients();

  const filtered = clients?.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.documentNumber.toLowerCase().includes(q)
    );
  });

  const selectedClient = clients?.find((c) => c.id === value);

  return (
    <div className="space-y-1.5">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              type="button"
              variant="outline"
              className={cn(
                'w-full h-10 justify-between rounded-xl font-normal bg-transparent hover:bg-transparent aria-expanded:bg-transparent dark:bg-transparent',
                !value && 'text-muted-foreground',
              )}
            />
          }
        >
          <span className="flex items-center gap-2 truncate">
            <Users className="h-4 w-4 text-[var(--color-text-secondary)] shrink-0" />
            {selectedClient
              ? `${selectedClient.name} — ${selectedClient.documentNumber}`
              : 'Seleccionar cliente...'}
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </PopoverTrigger>
        <PopoverContent className="w-[var(--anchor-width)] p-0" align="start">
          <div className="p-2 border-b border-[var(--color-border)]">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--color-text-secondary)]" />
              <Input
                placeholder="Buscar cliente..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 pl-8 text-sm rounded-lg"
              />
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto p-1">
            {filtered && filtered.length > 0 ? (
              filtered.map((client) => (
                <button
                  key={client.id}
                  type="button"
                  onClick={() => {
                    onChange(client.id);
                    setOpen(false);
                    setSearch('');
                  }}
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
                {search ? 'Sin resultados' : 'No hay clientes'}
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
