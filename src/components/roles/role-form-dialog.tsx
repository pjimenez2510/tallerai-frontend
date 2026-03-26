'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Shield, ChevronDown, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useCreateRole, useUpdateRole, useRolePermissions } from '@/hooks/use-roles';
import type { Role } from '@/types/role.types';

const roleFormSchema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres').max(100),
  slug: z.string().min(2, 'Mínimo 2 caracteres').max(100).regex(/^[a-z0-9_-]+$/, 'Solo minúsculas, números, guiones y guiones bajos'),
  description: z.string().max(300).optional().or(z.literal('')),
});

type RoleFormData = z.infer<typeof roleFormSchema>;

interface RoleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role?: Role | null;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s_-]/g, '')
    .replace(/\s+/g, '_');
}

export function RoleFormDialog({ open, onOpenChange, role }: RoleFormDialogProps) {
  const isEditing = !!role;
  const createRole = useCreateRole();
  const updateRole = useUpdateRole();
  const { data: permissionGroups, isLoading: loadingPerms } = useRolePermissions();

  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RoleFormData>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: { name: '', slug: '', description: '' },
  });

  const nameValue = watch('name');

  useEffect(() => {
    if (!isEditing && nameValue) {
      setValue('slug', slugify(nameValue), { shouldValidate: false });
    }
  }, [nameValue, isEditing, setValue]);

  useEffect(() => {
    if (open) {
      if (role) {
        reset({ name: role.name, slug: role.slug, description: role.description ?? '' });
        setSelectedPermissions(new Set(role.permissions));
      } else {
        reset({ name: '', slug: '', description: '' });
        setSelectedPermissions(new Set());
      }
      // Expand all groups by default
      if (permissionGroups) {
        setExpandedGroups(new Set(permissionGroups.map((g) => g.module)));
      }
    }
  }, [open, role, reset, permissionGroups]);

  function togglePermission(key: string) {
    setSelectedPermissions((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  function toggleGroup(module: string, allKeys: string[]) {
    const allSelected = allKeys.every((k) => selectedPermissions.has(k));
    setSelectedPermissions((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        allKeys.forEach((k) => next.delete(k));
      } else {
        allKeys.forEach((k) => next.add(k));
      }
      return next;
    });
  }

  function toggleGroupExpand(module: string) {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(module)) {
        next.delete(module);
      } else {
        next.add(module);
      }
      return next;
    });
  }

  async function onSubmit(data: RoleFormData) {
    const permissions = Array.from(selectedPermissions);

    if (isEditing) {
      await updateRole.mutateAsync({
        id: role.id,
        data: { name: data.name, description: data.description || undefined, permissions },
      });
    } else {
      await createRole.mutateAsync({
        name: data.name,
        slug: data.slug,
        description: data.description || undefined,
        permissions,
      });
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">
            {isEditing ? 'Editar Rol' : 'Nuevo Rol'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Modifica el nombre, descripción y permisos del rol.'
              : 'Define un nuevo rol con los permisos que necesita.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          {/* Name */}
          <div className="space-y-1.5">
            <Label className="text-xs">Nombre del rol</Label>
            <Input
              placeholder="Ej: Jefe de Taller"
              className="h-10 rounded-xl"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-xs text-[var(--color-error)]">{errors.name.message}</p>
            )}
          </div>

          {/* Slug */}
          <div className="space-y-1.5">
            <Label className="text-xs">
              Slug{' '}
              {isEditing && role?.isSystem && (
                <span className="text-[var(--color-text-secondary)] font-normal">(no editable en roles del sistema)</span>
              )}
            </Label>
            <Input
              placeholder="jefe_taller"
              className="h-10 rounded-xl font-mono text-sm"
              disabled={isEditing && (role?.isSystem ?? false)}
              {...register('slug')}
            />
            {errors.slug && (
              <p className="text-xs text-[var(--color-error)]">{errors.slug.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label className="text-xs">
              Descripción{' '}
              <span className="text-[var(--color-text-secondary)] font-normal">(opcional)</span>
            </Label>
            <Input
              placeholder="Describe las responsabilidades de este rol..."
              className="h-10 rounded-xl"
              {...register('description')}
            />
            {errors.description && (
              <p className="text-xs text-[var(--color-error)]">{errors.description.message}</p>
            )}
          </div>

          {/* Permissions */}
          <div className="space-y-2">
            <Label className="text-xs">Permisos</Label>

            {loadingPerms ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent" />
              </div>
            ) : permissionGroups && permissionGroups.length > 0 ? (
              <div className="rounded-xl border border-[var(--color-border)] divide-y divide-[var(--color-border)]">
                {permissionGroups.map((group) => {
                  const allKeys = group.permissions.map((p) => p.key);
                  const allSelected = allKeys.every((k) => selectedPermissions.has(k));
                  const someSelected = allKeys.some((k) => selectedPermissions.has(k));
                  const isExpanded = expandedGroups.has(group.module);

                  return (
                    <div key={group.module}>
                      {/* Group header */}
                      <div className="flex items-center gap-3 px-4 py-3 bg-[var(--color-bg-secondary)]">
                        <button
                          type="button"
                          onClick={() => toggleGroupExpand(group.module)}
                          className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </button>
                        <span className="flex-1 text-sm font-semibold text-[var(--color-text-primary)] capitalize">
                          {group.module}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleGroup(group.module, allKeys)}
                          className={cn(
                            'text-xs font-medium px-2.5 py-1 rounded-lg transition-colors',
                            allSelected
                              ? 'bg-[#1e3a5f] text-white hover:bg-[#162d4a]'
                              : someSelected
                              ? 'bg-[#1e3a5f]/20 text-[#1e3a5f] hover:bg-[#1e3a5f]/30'
                              : 'bg-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]/70',
                          )}
                        >
                          {allSelected ? 'Quitar todos' : 'Seleccionar todos'}
                        </button>
                      </div>

                      {/* Permission checkboxes */}
                      {isExpanded && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 p-3">
                          {group.permissions.map((perm) => {
                            const checked = selectedPermissions.has(perm.key);
                            return (
                              <button
                                key={perm.key}
                                type="button"
                                onClick={() => togglePermission(perm.key)}
                                className={cn(
                                  'flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors',
                                  checked
                                    ? 'bg-[#1e3a5f]/10 text-[#1e3a5f]'
                                    : 'hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)]',
                                )}
                              >
                                <div
                                  className={cn(
                                    'h-4 w-4 rounded flex items-center justify-center border transition-colors shrink-0',
                                    checked
                                      ? 'bg-[#1e3a5f] border-[#1e3a5f]'
                                      : 'border-[var(--color-border)] bg-transparent',
                                  )}
                                >
                                  {checked && (
                                    <svg className="h-2.5 w-2.5 text-white" viewBox="0 0 10 10" fill="none">
                                      <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  )}
                                </div>
                                <span className="font-medium">{perm.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-[var(--color-border)] py-8 text-center">
                <Shield className="h-8 w-8 mx-auto text-[var(--color-text-secondary)]/30 mb-2" />
                <p className="text-sm text-[var(--color-text-secondary)]">No hay permisos disponibles</p>
              </div>
            )}

            {selectedPermissions.size > 0 && (
              <p className="text-xs text-[var(--color-text-secondary)]">
                {selectedPermissions.size} permiso{selectedPermissions.size !== 1 ? 's' : ''} seleccionado{selectedPermissions.size !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          <DialogFooter className="gap-2 pt-2 bg-transparent border-t-0">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="rounded-xl bg-[#1e3a5f] text-white hover:bg-[#162d4a]"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Guardando...
                </span>
              ) : isEditing ? (
                'Guardar Cambios'
              ) : (
                'Crear Rol'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
