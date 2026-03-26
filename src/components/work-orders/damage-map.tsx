'use client';

import { useState, useRef } from 'react';
import {
  CircleDot,
  Trash2,
  Save,
  Plus,
  AlertTriangle,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useUpdateWorkOrder } from '@/hooks/use-work-orders';

const DEFAULT_VEHICLE_SVG = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 450" fill="none" stroke="#94a3b8" stroke-width="1.5">
  <rect x="30" y="40" width="140" height="370" rx="40" fill="#f1f5f9" stroke="#94a3b8"/>
  <rect x="45" y="60" width="110" height="60" rx="10" fill="#e2e8f0" stroke="#94a3b8"/>
  <rect x="45" y="330" width="110" height="55" rx="10" fill="#e2e8f0" stroke="#94a3b8"/>
  <rect x="20" y="90" width="15" height="60" rx="5" fill="#cbd5e1"/>
  <rect x="165" y="90" width="15" height="60" rx="5" fill="#cbd5e1"/>
  <rect x="20" y="300" width="15" height="60" rx="5" fill="#cbd5e1"/>
  <rect x="165" y="300" width="15" height="60" rx="5" fill="#cbd5e1"/>
  <circle cx="100" cy="210" r="3" fill="#94a3b8"/>
  <line x1="60" y1="140" x2="140" y2="140" stroke="#cbd5e1"/>
  <line x1="60" y1="310" x2="140" y2="310" stroke="#cbd5e1"/>
  <text x="100" y="20" text-anchor="middle" fill="#94a3b8" font-size="12" font-family="sans-serif">FRENTE</text>
  <text x="100" y="440" text-anchor="middle" fill="#94a3b8" font-size="12" font-family="sans-serif">ATRÁS</text>
  <text x="8" y="220" text-anchor="middle" fill="#94a3b8" font-size="10" font-family="sans-serif" transform="rotate(-90, 8, 220)">IZQUIERDA</text>
  <text x="192" y="220" text-anchor="middle" fill="#94a3b8" font-size="10" font-family="sans-serif" transform="rotate(90, 192, 220)">DERECHA</text>
</svg>`)}`;

interface DamageMarker {
  id: string;
  x: number;
  y: number;
  severity: 'leve' | 'moderado' | 'grave';
  description: string;
}

interface DamageMapData {
  markers: DamageMarker[];
  template: string;
}

const SEVERITY_CONFIG = {
  leve: { label: 'Leve', color: 'bg-green-500', ring: 'ring-green-300', text: 'text-green-700', bg: 'bg-green-50' },
  moderado: { label: 'Moderado', color: 'bg-yellow-500', ring: 'ring-yellow-300', text: 'text-yellow-700', bg: 'bg-yellow-50' },
  grave: { label: 'Grave', color: 'bg-red-500', ring: 'ring-red-300', text: 'text-red-700', bg: 'bg-red-50' },
};

interface DamageMapProps {
  workOrderId: string;
  damageMap: DamageMapData | null;
  damageNotes: string | null;
  onSaved: () => void;
}

export function DamageMap({
  workOrderId,
  damageMap,
  damageNotes: initialNotes,
  onSaved,
}: DamageMapProps) {
  const imageRef = useRef<HTMLDivElement>(null);
  const updateWorkOrder = useUpdateWorkOrder();

  const [markers, setMarkers] = useState<DamageMarker[]>(
    damageMap?.markers ?? [],
  );
  const [notes, setNotes] = useState(initialNotes ?? '');
  const [selectedSeverity, setSelectedSeverity] = useState<DamageMarker['severity']>('moderado');
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null);
  const [editingDescription, setEditingDescription] = useState('');
  const [isPlacing, setIsPlacing] = useState(false);

  function handleImageClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!isPlacing) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newMarker: DamageMarker = {
      id: `dmg-${Date.now()}`,
      x: Math.round(x * 10) / 10,
      y: Math.round(y * 10) / 10,
      severity: selectedSeverity,
      description: '',
    };

    setMarkers([...markers, newMarker]);
    setSelectedMarker(newMarker.id);
    setEditingDescription('');
    setIsPlacing(false);
  }

  function handleUpdateDescription(id: string) {
    setMarkers(
      markers.map((m) =>
        m.id === id ? { ...m, description: editingDescription } : m,
      ),
    );
    setSelectedMarker(null);
  }

  function handleDeleteMarker(id: string) {
    setMarkers(markers.filter((m) => m.id !== id));
    if (selectedMarker === id) setSelectedMarker(null);
  }

  async function handleSave() {
    const data: DamageMapData = {
      markers,
      template: 'default',
    };

    await updateWorkOrder.mutateAsync({
      id: workOrderId,
      data: {
        damageMap: data as unknown as Record<string, unknown>,
        damageNotes: notes || undefined,
      },
    });
    onSaved();
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant={isPlacing ? 'default' : 'outline'}
          size="sm"
          className={cn(
            'rounded-xl gap-1.5',
            isPlacing && 'bg-[#1e3a5f] text-white',
          )}
          onClick={() => setIsPlacing(!isPlacing)}
        >
          {isPlacing ? (
            <>
              <CircleDot className="h-3.5 w-3.5 animate-pulse" />
              Click en la imagen...
            </>
          ) : (
            <>
              <Plus className="h-3.5 w-3.5" />
              Agregar daño
            </>
          )}
        </Button>

        {isPlacing && (
          <div className="flex gap-1">
            {(Object.entries(SEVERITY_CONFIG) as [DamageMarker['severity'], (typeof SEVERITY_CONFIG)['leve']][]).map(
              ([key, config]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedSeverity(key)}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors',
                    selectedSeverity === key
                      ? `${config.bg} ${config.text} border-current`
                      : 'border-[var(--color-border)] text-[var(--color-text-secondary)]',
                  )}
                >
                  {config.label}
                </button>
              ),
            )}
          </div>
        )}

        <div className="ml-auto">
          <Button
            type="button"
            size="sm"
            className="rounded-xl bg-[#1e3a5f] text-white hover:bg-[#162d4a] gap-1.5"
            onClick={handleSave}
            disabled={updateWorkOrder.isPending}
          >
            <Save className="h-3.5 w-3.5" />
            Guardar
          </Button>
        </div>
      </div>

      {/* Vehicle image with markers */}
      <div
        ref={imageRef}
        className={cn(
          'relative rounded-xl border-2 border-dashed border-[var(--color-border)] bg-white overflow-hidden mx-auto',
          isPlacing && 'cursor-crosshair border-[#1e3a5f]',
        )}
        style={{ maxWidth: 300, aspectRatio: '200/450' }}
        onClick={handleImageClick}
      >
        <img
          src={DEFAULT_VEHICLE_SVG}
          alt="Vista superior del vehículo"
          className="w-full h-full object-contain pointer-events-none select-none"
          draggable={false}
        />

        {markers.map((marker, index) => {
          const config = SEVERITY_CONFIG[marker.severity];
          const isSelected = selectedMarker === marker.id;

          return (
            <button
              key={marker.id}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedMarker(isSelected ? null : marker.id);
                setEditingDescription(marker.description);
              }}
              className={cn(
                'absolute flex items-center justify-center h-7 w-7 -ml-3.5 -mt-3.5 rounded-full text-white text-xs font-bold shadow-lg transition-transform',
                config.color,
                isSelected && `ring-3 ${config.ring} scale-125`,
              )}
              style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
            >
              {index + 1}
            </button>
          );
        })}
      </div>

      {/* Selected marker editor */}
      {selectedMarker && (() => {
        const marker = markers.find((m) => m.id === selectedMarker);
        if (!marker) return null;
        const config = SEVERITY_CONFIG[marker.severity];
        const index = markers.indexOf(marker);

        return (
          <div className={cn('rounded-xl border p-3 space-y-2', config.bg, 'border-current', config.text)}>
            <div className="flex items-center justify-between">
              <Badge className={cn(config.color, 'text-white')}>
                #{index + 1} — {config.label}
              </Badge>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => handleDeleteMarker(marker.id)}
                className="text-red-500 hover:text-red-700 hover:bg-red-100"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
            <div className="flex gap-2">
              <Input
                value={editingDescription}
                onChange={(e) => setEditingDescription(e.target.value)}
                placeholder="Describe el daño (ej: Rayón en puerta derecha)"
                className="h-9 rounded-lg text-sm bg-white text-[var(--color-text-primary)]"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleUpdateDescription(marker.id);
                }}
              />
              <Button
                type="button"
                size="sm"
                className="rounded-lg h-9 bg-[#1e3a5f] text-white"
                onClick={() => handleUpdateDescription(marker.id)}
              >
                OK
              </Button>
            </div>
          </div>
        );
      })()}

      {/* Markers list */}
      {markers.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
            Daños registrados ({markers.length})
          </p>
          <div className="space-y-1">
            {markers.map((marker, index) => {
              const config = SEVERITY_CONFIG[marker.severity];
              return (
                <div
                  key={marker.id}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-3 py-2 text-sm cursor-pointer transition-colors',
                    selectedMarker === marker.id
                      ? `${config.bg} ${config.text}`
                      : 'hover:bg-[var(--color-bg-secondary)]',
                  )}
                  onClick={() => {
                    setSelectedMarker(marker.id);
                    setEditingDescription(marker.description);
                  }}
                >
                  <span className={cn('flex h-5 w-5 items-center justify-center rounded-full text-white text-[10px] font-bold', config.color)}>
                    {index + 1}
                  </span>
                  <span className="flex-1 truncate">
                    {marker.description || 'Sin descripción'}
                  </span>
                  <Badge variant="outline" className="text-[10px]">
                    {config.label}
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {markers.length === 0 && !isPlacing && (
        <div className="text-center py-6 text-sm text-[var(--color-text-secondary)]">
          <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-30" />
          <p>No hay daños registrados</p>
          <p className="text-xs mt-1">
            Haz click en &quot;Agregar daño&quot; y luego en la imagen del vehículo
          </p>
        </div>
      )}

      {/* Damage notes */}
      <div className="space-y-1.5">
        <p className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
          Notas adicionales
        </p>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Observaciones generales sobre el estado del vehículo..."
          className="min-h-[60px] rounded-xl resize-none text-sm"
        />
      </div>
    </div>
  );
}
