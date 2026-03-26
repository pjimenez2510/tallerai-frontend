'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Plus,
  Pencil,
  UserX,
  Phone,
  Mail,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { ClientFormDialog } from './client-form-dialog';
import { useClients, useDeactivateClient } from '@/hooks/use-clients';
import { usePermissions } from '@/hooks/use-permissions';
import type { Client } from '@/types/client.types';

const docTypeLabels: Record<string, string> = {
  cedula: 'Cédula',
  ruc: 'RUC',
  pasaporte: 'Pasaporte',
};

export function ClientsTable() {
  const router = useRouter();
  const { data: clients, isLoading } = useClients();
  const deactivateClient = useDeactivateClient();
  const { hasPermission } = usePermissions();

  const canCreate = hasPermission('clients.create');
  const canEdit = hasPermission('clients.edit');
  const canDelete = hasPermission('clients.delete');

  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);

  const filtered = clients?.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.documentNumber.toLowerCase().includes(q) ||
      (c.phone?.toLowerCase().includes(q) ?? false) ||
      (c.email?.toLowerCase().includes(q) ?? false)
    );
  });

  function handleEdit(client: Client) {
    setEditingClient(client);
    setFormOpen(true);
  }

  function handleNew() {
    setEditingClient(null);
    setFormOpen(true);
  }

  async function handleDeactivate() {
    if (!deletingClient) return;
    await deactivateClient.mutateAsync(deletingClient.id);
    setDeletingClient(null);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-primary)] border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-secondary)]" />
          <Input
            placeholder="Buscar por nombre, cédula, teléfono..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 pl-10 rounded-xl"
          />
        </div>
        {canCreate && (
          <Button
            onClick={handleNew}
            className="rounded-xl bg-[#1e3a5f] text-white hover:bg-[#162d4a] shadow-md shadow-[#1e3a5f]/20"
            size="lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Cliente
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
          <p className="text-2xl font-bold text-[var(--color-text-primary)]">
            {clients?.length ?? 0}
          </p>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
            Clientes activos
          </p>
        </div>
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
          <p className="text-2xl font-bold text-[var(--color-text-primary)]">
            {clients?.filter((c) => c.email).length ?? 0}
          </p>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
            Con email registrado
          </p>
        </div>
        <div className="hidden sm:block rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
          <p className="text-2xl font-bold text-[var(--color-text-primary)]">
            {filtered?.length ?? 0}
          </p>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
            Resultados
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-secondary)]">
              <TableHead className="font-semibold">Cliente</TableHead>
              <TableHead className="font-semibold hidden md:table-cell">
                Documento
              </TableHead>
              <TableHead className="font-semibold hidden lg:table-cell">
                Contacto
              </TableHead>
              <TableHead className="font-semibold hidden xl:table-cell">
                Dirección
              </TableHead>
              <TableHead className="font-semibold text-right">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered && filtered.length > 0 ? (
              filtered.map((client) => (
                <TableRow
                  key={client.id}
                  className="group cursor-pointer hover:bg-[var(--color-bg-secondary)]/50"
                  onClick={() => router.push(`/clients/${client.id}`)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#1e3a5f] to-[#2563eb] text-sm font-bold text-white uppercase shrink-0">
                        {client.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-[var(--color-text-primary)] truncate">
                          {client.name}
                        </p>
                        <p className="text-xs text-[var(--color-text-secondary)] md:hidden">
                          {docTypeLabels[client.documentType]}:{' '}
                          {client.documentNumber}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="text-[10px] font-medium"
                      >
                        {docTypeLabels[client.documentType]}
                      </Badge>
                      <span className="text-sm font-mono text-[var(--color-text-secondary)]">
                        {client.documentNumber}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="space-y-1">
                      {client.phone && (
                        <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)]">
                          <Phone className="h-3 w-3" />
                          {client.phone}
                        </div>
                      )}
                      {client.email && (
                        <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)]">
                          <Mail className="h-3 w-3" />
                          <span className="truncate max-w-[180px]">
                            {client.email}
                          </span>
                        </div>
                      )}
                      {!client.phone && !client.email && (
                        <span className="text-xs text-[var(--color-text-secondary)]/50">
                          Sin contacto
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="hidden xl:table-cell">
                    <span className="text-sm text-[var(--color-text-secondary)] truncate max-w-[200px] block">
                      {client.address || '—'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {canEdit && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(client);
                          }}
                          className="text-[var(--color-text-secondary)] hover:text-[var(--color-secondary)]"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      {canDelete && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingClient(client);
                          }}
                          className="text-[var(--color-text-secondary)] hover:text-[var(--color-error)]"
                        >
                          <UserX className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12">
                  <FileText className="h-10 w-10 mx-auto text-[var(--color-text-secondary)]/30 mb-3" />
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    {search
                      ? 'No se encontraron clientes con esa búsqueda'
                      : 'Aún no hay clientes registrados'}
                  </p>
                  {!search && (
                    <Button
                      variant="link"
                      onClick={handleNew}
                      className="mt-2 text-[#f97316]"
                    >
                      Registra tu primer cliente
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Form Dialog */}
      <ClientFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        client={editingClient}
      />

      {/* Deactivate Confirmation */}
      <AlertDialog
        open={!!deletingClient}
        onOpenChange={(open) => !open && setDeletingClient(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Desactivar cliente?</AlertDialogTitle>
            <AlertDialogDescription>
              El cliente{' '}
              <span className="font-semibold">{deletingClient?.name}</span> será
              desactivado. No se eliminará su historial y podrá reactivarse
              después.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">
              Cancelar
            </AlertDialogCancel>
            <Button
              onClick={handleDeactivate}
              className="rounded-xl bg-[var(--color-error)] text-white hover:bg-[var(--color-error)]/90"
            >
              Desactivar
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
