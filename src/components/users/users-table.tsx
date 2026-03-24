'use client';

import { useState } from 'react';
import {
  Search,
  Plus,
  Pencil,
  UserX,
  UserCheck,
  Shield,
  Wrench,
  ClipboardList,
  UserCog,
  Mail,
  Phone,
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
import { UserFormDialog } from './user-form-dialog';
import {
  useUsers,
  useDeactivateUser,
  useActivateUser,
} from '@/hooks/use-users';
import { useAuthStore } from '@/stores/auth.store';
import type { WorkshopUser } from '@/types/user.types';
import type { UserRole } from '@/types/auth.types';

const roleConfig: Record<
  UserRole,
  { label: string; icon: typeof Shield; color: string }
> = {
  admin: { label: 'Administrador', icon: Shield, color: 'text-red-500 bg-red-50' },
  jefe_taller: { label: 'Jefe de Taller', icon: UserCog, color: 'text-blue-600 bg-blue-50' },
  recepcionista: { label: 'Recepcionista', icon: ClipboardList, color: 'text-emerald-600 bg-emerald-50' },
  mecanico: { label: 'Mecánico', icon: Wrench, color: 'text-amber-600 bg-amber-50' },
};

export function UsersTable() {
  const { data: users, isLoading } = useUsers();
  const deactivateUser = useDeactivateUser();
  const activateUser = useActivateUser();
  const currentUser = useAuthStore((s) => s.user);

  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<WorkshopUser | null>(null);
  const [deactivatingUser, setDeactivatingUser] =
    useState<WorkshopUser | null>(null);

  const filtered = users?.filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      roleConfig[u.role].label.toLowerCase().includes(q)
    );
  });

  const activeCount = users?.filter((u) => u.isActive).length ?? 0;
  const inactiveCount = users?.filter((u) => !u.isActive).length ?? 0;

  function handleEdit(user: WorkshopUser) {
    setEditingUser(user);
    setFormOpen(true);
  }

  function handleNew() {
    setEditingUser(null);
    setFormOpen(true);
  }

  async function handleDeactivate() {
    if (!deactivatingUser) return;
    await deactivateUser.mutateAsync(deactivatingUser.id);
    setDeactivatingUser(null);
  }

  async function handleActivate(userId: string) {
    await activateUser.mutateAsync(userId);
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
            placeholder="Buscar por nombre, email o rol..."
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
          Nuevo Usuario
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
          <p className="text-2xl font-bold text-[var(--color-text-primary)]">
            {users?.length ?? 0}
          </p>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
            Total usuarios
          </p>
        </div>
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
          <p className="text-2xl font-bold text-[var(--color-success)]">
            {activeCount}
          </p>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
            Activos
          </p>
        </div>
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
          <p className="text-2xl font-bold text-[var(--color-text-secondary)]">
            {inactiveCount}
          </p>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
            Inactivos
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
              <TableHead className="font-semibold">Usuario</TableHead>
              <TableHead className="font-semibold hidden md:table-cell">
                Rol
              </TableHead>
              <TableHead className="font-semibold hidden lg:table-cell">
                Contacto
              </TableHead>
              <TableHead className="font-semibold hidden xl:table-cell">
                Estado
              </TableHead>
              <TableHead className="font-semibold text-right">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered && filtered.length > 0 ? (
              filtered.map((user) => {
                const role = roleConfig[user.role];
                const RoleIcon = role.icon;
                const isSelf = user.id === currentUser?.id;

                return (
                  <TableRow
                    key={user.id}
                    className="group cursor-pointer hover:bg-[var(--color-bg-secondary)]/50"
                    onClick={() => handleEdit(user)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#1e3a5f] to-[#2563eb] text-sm font-bold text-white uppercase shrink-0">
                          {user.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-[var(--color-text-primary)] truncate">
                              {user.name}
                            </p>
                            {isSelf && (
                              <Badge className="bg-[#1e3a5f]/10 text-[#1e3a5f] hover:bg-[#1e3a5f]/10 text-[10px]">
                                Tú
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-[var(--color-text-secondary)] truncate md:hidden">
                            {role.label}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div
                        className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium ${role.color}`}
                      >
                        <RoleIcon className="h-3.5 w-3.5" />
                        {role.label}
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)]">
                          <Mail className="h-3 w-3" />
                          <span className="truncate max-w-[200px]">
                            {user.email}
                          </span>
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)]">
                            <Phone className="h-3 w-3" />
                            {user.phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden xl:table-cell">
                      {user.isActive ? (
                        <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
                          Activo
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-500 hover:bg-gray-100">
                          Inactivo
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
                            handleEdit(user);
                          }}
                          className="text-[var(--color-text-secondary)] hover:text-[var(--color-secondary)]"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        {!isSelf &&
                          (user.isActive ? (
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeactivatingUser(user);
                              }}
                              className="text-[var(--color-text-secondary)] hover:text-[var(--color-error)]"
                            >
                              <UserX className="h-3.5 w-3.5" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleActivate(user.id);
                              }}
                              className="text-[var(--color-text-secondary)] hover:text-[var(--color-success)]"
                            >
                              <UserCheck className="h-3.5 w-3.5" />
                            </Button>
                          ))}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12">
                  <UserCog className="h-10 w-10 mx-auto text-[var(--color-text-secondary)]/30 mb-3" />
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    {search
                      ? 'No se encontraron usuarios'
                      : 'Aún no hay usuarios adicionales'}
                  </p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Form Dialog */}
      <UserFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        user={editingUser}
      />

      {/* Deactivate Confirmation */}
      <AlertDialog
        open={!!deactivatingUser}
        onOpenChange={(open) => !open && setDeactivatingUser(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Desactivar usuario?</AlertDialogTitle>
            <AlertDialogDescription>
              El usuario{' '}
              <span className="font-semibold">{deactivatingUser?.name}</span> no
              podrá acceder al sistema. Podrá reactivarse después.
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
