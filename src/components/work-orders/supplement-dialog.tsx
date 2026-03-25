'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { GitBranch } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useCreateSupplement } from '@/hooks/use-work-orders';
import type { WorkOrderPriority } from '@/types/work-order.types';

const supplementSchema = z.object({
  description: z.string().min(1, 'La descripción es requerida').max(500),
  priority: z.enum(['baja', 'normal', 'alta', 'urgente'] as const).optional(),
});

type SupplementFormData = z.infer<typeof supplementSchema>;

interface SupplementDialogProps {
  parentId: string;
  parentOrderNumber: string;
  open: boolean;
  onClose: () => void;
}

export function SupplementDialog({
  parentId,
  parentOrderNumber,
  open,
  onClose,
}: SupplementDialogProps) {
  const createSupplement = useCreateSupplement();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SupplementFormData>({
    resolver: zodResolver(supplementSchema),
    defaultValues: { description: '', priority: 'normal' },
  });

  async function onSubmit(data: SupplementFormData) {
    await createSupplement.mutateAsync({
      parentId,
      data: {
        description: data.description,
        priority: data.priority as WorkOrderPriority | undefined,
      },
    });
    reset();
    onClose();
  }

  function handleClose() {
    reset();
    onClose();
  }

  const priorityOptions: { value: WorkOrderPriority; label: string }[] = [
    { value: 'baja', label: 'Baja' },
    { value: 'normal', label: 'Normal' },
    { value: 'alta', label: 'Alta' },
    { value: 'urgente', label: 'Urgente' },
  ];

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
              <GitBranch className="h-4 w-4 text-amber-700" />
            </div>
            <DialogTitle className="text-base">Crear OT Suplementaria</DialogTitle>
          </div>
        </DialogHeader>
        <p className="text-xs text-[var(--color-text-secondary)] -mt-2">
          Se creará vinculada a <span className="font-mono font-semibold">{parentOrderNumber}</span>
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="supp-description">Descripción del trabajo adicional</Label>
            <Input
              id="supp-description"
              {...register('description')}
              placeholder="Ej: Cambio de filtro de aceite adicional..."
              className="h-10 rounded-xl"
            />
            {errors.description && (
              <p className="text-xs text-[var(--color-error)]">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="supp-priority">Prioridad</Label>
            <div className="grid grid-cols-4 gap-2">
              {priorityOptions.map((opt) => (
                <label
                  key={opt.value}
                  className="flex flex-col items-center gap-1 cursor-pointer"
                >
                  <input
                    type="radio"
                    value={opt.value}
                    {...register('priority')}
                    className="sr-only peer"
                  />
                  <span className="w-full text-center rounded-lg border border-[var(--color-border)] py-1.5 text-xs font-medium transition-colors peer-checked:border-[#1e3a5f] peer-checked:bg-[#1e3a5f] peer-checked:text-white hover:bg-[var(--color-bg-secondary)]">
                    {opt.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 rounded-xl"
              disabled={createSupplement.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 rounded-xl bg-[#1e3a5f] text-white hover:bg-[#162d4a]"
              disabled={createSupplement.isPending}
            >
              {createSupplement.isPending ? 'Creando...' : 'Crear OT Suplementaria'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
