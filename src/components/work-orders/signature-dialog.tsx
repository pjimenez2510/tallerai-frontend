'use client';

import { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { PenLine, Trash2, Save } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useUpdateWorkOrder } from '@/hooks/use-work-orders';

interface SignatureDialogProps {
  workOrderId: string;
  open: boolean;
  onClose: () => void;
}

export function SignatureDialog({
  workOrderId,
  open,
  onClose,
}: SignatureDialogProps) {
  const canvasRef = useRef<SignatureCanvas>(null);
  const [isEmpty, setIsEmpty] = useState(true);
  const updateWorkOrder = useUpdateWorkOrder();

  function handleClear() {
    canvasRef.current?.clear();
    setIsEmpty(true);
  }

  async function handleSave() {
    if (!canvasRef.current || isEmpty) return;

    const dataUrl = canvasRef.current
      .getTrimmedCanvas()
      .toDataURL('image/png');

    await updateWorkOrder.mutateAsync({
      id: workOrderId,
      data: { clientSignature: dataUrl },
    });

    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1e3a5f]/10">
              <PenLine className="h-4 w-4 text-[#1e3a5f]" />
            </div>
            <DialogTitle>Firma del Cliente</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-[var(--color-text-secondary)]">
            Dibuje la firma del cliente en el recuadro de abajo.
          </p>

          <div className="rounded-xl border-2 border-dashed border-[var(--color-border)] overflow-hidden bg-white">
            <SignatureCanvas
              ref={canvasRef}
              penColor="#0f172a"
              canvasProps={{
                width: 440,
                height: 200,
                className: 'w-full h-[200px]',
                style: { touchAction: 'none' },
              }}
              backgroundColor="white"
              onEnd={() => setIsEmpty(false)}
            />
          </div>

          <div className="flex items-center gap-2 pt-1 border-t border-[var(--color-border)] bg-transparent">
            <Button
              type="button"
              variant="outline"
              onClick={handleClear}
              className="rounded-xl border-[var(--color-border)]"
              disabled={updateWorkOrder.isPending}
            >
              <Trash2 className="h-4 w-4 mr-1.5" />
              Limpiar
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              className="flex-1 rounded-xl bg-[#1e3a5f] text-white hover:bg-[#162d4a]"
              disabled={isEmpty || updateWorkOrder.isPending}
            >
              <Save className="h-4 w-4 mr-1.5" />
              Guardar Firma
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
