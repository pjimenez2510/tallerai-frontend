'use client';

import { useState } from 'react';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Shield,
  Lock,
  Users,
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
import { RoleFormDialog } from './role-form-dialog';
import { useRoles, useDeleteRole } from '@/hooks/use-roles';
import type { Role } from '@/types/role.types';

export function RolesTable() {
  const { data: roles, isLoading } = useRoles();
  const deleteRole = useDeleteRole();

  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [deletingRole, setDeletingRole] = useState<Role | null>(null);

  const filtered = roles?.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.name.toLowerCase().includes(q) ||
      r.slug.toLowerCase().includes(q) ||
      (r.description?.toLowerCase().includes(q) ?? false)
    );
  });

  function handleEdit(role: Role) {
    setEditingRole(role);
    setFormOpen(true);
  }

  function handleNew() {
    setEditingRole(null);
    setFormOpen(true);
  }

  async function handleDelete() {
    if (!deletingRole) return;
    await deleteRole.mutateAsync(deletingRole.id);
    setDeletingRole(null);
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
            placeholder="Buscar por nombre o slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 pl-10 rounded-xl"
          />
        </div>
        <Button
          onClick={handleNew}
          className="rounded-xl bg-[#1e3a5f] text-white hover:bg-[#162d4a] shadow-md shadow-[#1e3a5f]/20"
          size="lg"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Rol
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
          <p className="text-2xl font-bold text-[var(--color-text-primary)]">
            {roles?.length ?? 0}
          </p>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">Total roles</p>
        </div>
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
          <p className="text-2xl font-bold text-[var(--color-text-primary)]">
            {roles?.filter((r) => r.isSystem).length ?? 0}
          </p>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">Del sistema</p>
        </div>
        <div className="hidden sm:block rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
          <p className="text-2xl font-bold text-[var(--color-text-primary)]">
            {filtered?.length ?? 0}
          </p>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">Resultados</p>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-secondary)]">
              <TableHead className="font-semibold">Rol</TableHead>
              <TableHead className="font-semibold hidden md:table-cell">Permisos</TableHead>
              <TableHead className="font-semibold hidden lg:table-cell">Usuarios</TableHead>
              <TableHead className="font-semibold hidden xl:table-cell">Tipo</TableHead>
              <TableHead className="font-semibold text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered && filtered.length > 0 ? (
              filtered.map((role) => (
                <TableRow
                  key={role.id}
                  className="group cursor-pointer hover:bg-[var(--color-bg-secondary)]/50"
                  onClick={() => handleEdit(role)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#1e3a5f] to-[#2563eb] shrink-0">
                        {role.isSystem ? (
                          <Lock className="h-4 w-4 text-white" />
                        ) : (
                          <Shield className="h-4 w-4 text-white" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-[var(--color-text-primary)] truncate">
                          {role.name}
                        </p>
                        <p className="text-xs text-[var(--color-text-secondary)] font-mono truncate">
                          {role.slug}
                        </p>
                        {role.description && (
                          <p className="text-xs text-[var(--color-text-secondary)] truncate max-w-[260px] mt-0.5 md:hidden">
                            {role.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                        {role.permissions.length}
                      </span>
                      <span className="text-xs text-[var(--color-text-secondary)]">
                        permiso{role.permissions.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    {role.description && (
                      <p className="text-xs text-[var(--color-text-secondary)] truncate max-w-[220px] mt-0.5">
                        {role.description}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)]">
                      <Users className="h-3.5 w-3.5" />
                      <span>{role.userCount}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden xl:table-cell">
                    {role.isSystem ? (
                      <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-50">
                        Sistema
                      </Badge>
                    ) : (
                      <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
                        Personalizado
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(role);
                        }}
                        className="text-[var(--color-text-secondary)] hover:text-[var(--color-secondary)]"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      {!role.isSystem && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingRole(role);
                          }}
                          className="text-[var(--color-text-secondary)] hover:text-[var(--color-error)]"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12">
                  <Shield className="h-10 w-10 mx-auto text-[var(--color-text-secondary)]/30 mb-3" />
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    {search ? 'No se encontraron roles' : 'Aún no hay roles configurados'}
                  </p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Form Dialog */}
      <RoleFormDialog open={formOpen} onOpenChange={setFormOpen} role={editingRole} />

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deletingRole}
        onOpenChange={(open) => !open && setDeletingRole(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar rol?</AlertDialogTitle>
            <AlertDialogDescription>
              El rol{' '}
              <span className="font-semibold">{deletingRole?.name}</span> será
              eliminado permanentemente. Los usuarios con este rol perderán sus
              permisos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
            <Button
              onClick={handleDelete}
              className="rounded-xl bg-[var(--color-error)] text-white hover:bg-[var(--color-error)]/90"
            >
              Eliminar
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
