'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  CircleDot,
  Trash2,
  Move,
  AlertTriangle,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';

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

type Mode = 'agregar' | 'mover' | null;

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
  const containerRef = useRef<HTMLDivElement>(null);
  const updateWorkOrder = useUpdateWorkOrder();
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasChangesRef = useRef(false);

  const [markers, setMarkers] = useState<DamageMarker[]>(
    damageMap?.markers ?? [],
  );
  const [notes, setNotes] = useState(initialNotes ?? '');
  const [mode, setMode] = useState<Mode>(null);
  const [selectedSeverity, setSelectedSeverity] = useState<DamageMarker['severity']>('moderado');
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null);
  const [editingDescription, setEditingDescription] = useState('');
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Auto-save with debounce
  const autoSave = useCallback(
    async (newMarkers: DamageMarker[], newNotes: string) => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

      saveTimerRef.current = setTimeout(async () => {
        setSaving(true);
        try {
          await updateWorkOrder.mutateAsync({
            id: workOrderId,
            data: {
              damageMap: { markers: newMarkers, template: 'default' } as unknown as Record<string, unknown>,
              damageNotes: newNotes || undefined,
            },
          });
          hasChangesRef.current = false;
          onSaved();
        } catch {
          // toast.error handled by hook
        } finally {
          setSaving(false);
        }
      }, 1500);
    },
    [workOrderId, updateWorkOrder, onSaved],
  );

  // Trigger auto-save when markers or notes change
  function updateMarkers(newMarkers: DamageMarker[]) {
    setMarkers(newMarkers);
    hasChangesRef.current = true;
    autoSave(newMarkers, notes);
  }

  function updateNotes(newNotes: string) {
    setNotes(newNotes);
    hasChangesRef.current = true;
    autoSave(markers, newNotes);
  }

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  function handleImageClick(e: React.MouseEvent<HTMLDivElement>) {
    if (mode !== 'agregar') return;

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

    const newMarkers = [...markers, newMarker];
    updateMarkers(newMarkers);
    setSelectedMarker(newMarker.id);
    setEditingDescription('');
    // Mode stays as 'agregar' — user can keep placing
  }

  // Drag handling for move mode
  function handleMarkerMouseDown(e: React.MouseEvent, markerId: string) {
    if (mode !== 'mover') return;
    e.preventDefault();
    e.stopPropagation();
    setDraggingId(markerId);
  }

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (mode !== 'mover' || !draggingId || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100));

    setMarkers((prev) =>
      prev.map((m) =>
        m.id === draggingId
          ? { ...m, x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 }
          : m,
      ),
    );
  }

  function handleMouseUp() {
    if (draggingId) {
      // Save after drag ends
      hasChangesRef.current = true;
      autoSave(markers, notes);
      setDraggingId(null);
    }
  }

  function handleUpdateDescription(id: string) {
    const newMarkers = markers.map((m) =>
      m.id === id ? { ...m, description: editingDescription } : m,
    );
    updateMarkers(newMarkers);
    setSelectedMarker(null);
  }

  function handleDeleteMarker(id: string) {
    const newMarkers = markers.filter((m) => m.id !== id);
    updateMarkers(newMarkers);
    if (selectedMarker === id) setSelectedMarker(null);
  }

  function toggleMode(newMode: Mode) {
    setMode(mode === newMode ? null : newMode);
    setDraggingId(null);
  }

  return (
    <div className="space-y-4">
      {/* Mode toggles + severity (compact toolbar) */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Agregar toggle */}
        <button
          type="button"
          onClick={() => toggleMode('agregar')}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
            mode === 'agregar'
              ? 'bg-[#1e3a5f] text-white border-[#1e3a5f]'
              : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-text-secondary)]',
          )}
        >
          <CircleDot className="h-3.5 w-3.5" />
          Agregar
        </button>

        {/* Mover toggle */}
        <button
          type="button"
          onClick={() => toggleMode('mover')}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
            mode === 'mover'
              ? 'bg-[#2563eb] text-white border-[#2563eb]'
              : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-text-secondary)]',
          )}
        >
          <Move className="h-3.5 w-3.5" />
          Mover
        </button>

        {/* Severity selector — always visible in agregar mode */}
        {mode === 'agregar' && (
          <div className="flex gap-1 ml-1">
            {(Object.entries(SEVERITY_CONFIG) as [DamageMarker['severity'], (typeof SEVERITY_CONFIG)['leve']][]).map(
              ([key, config]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedSeverity(key)}
                  className={cn(
                    'px-2 py-1 rounded-md text-[11px] font-medium border transition-colors',
                    selectedSeverity === key
                      ? `${config.bg} ${config.text} border-current`
                      : 'border-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)]',
                  )}
                >
                  {config.label}
                </button>
              ),
            )}
          </div>
        )}

        {/* Auto-save indicator */}
        <div className="ml-auto">
          {saving ? (
            <span className="flex items-center gap-1 text-[10px] text-[var(--color-text-secondary)]">
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent" />
              Guardando...
            </span>
          ) : hasChangesRef.current ? null : markers.length > 0 ? (
            <span className="flex items-center gap-1 text-[10px] text-green-600">
              <Check className="h-3 w-3" />
              Guardado
            </span>
          ) : null}
        </div>
      </div>

      {/* Hint text */}
      {mode === 'agregar' && (
        <p className="text-xs text-[#1e3a5f] bg-[#1e3a5f]/5 px-3 py-1.5 rounded-lg">
          Toca la imagen para marcar un daño. Puedes seguir agregando varios.
        </p>
      )}
      {mode === 'mover' && (
        <p className="text-xs text-[#2563eb] bg-[#2563eb]/5 px-3 py-1.5 rounded-lg">
          Arrastra los marcadores para cambiar su posición.
        </p>
      )}

      {/* Vehicle image with markers */}
      <div
        ref={containerRef}
        className={cn(
          'relative rounded-xl border-2 bg-white overflow-hidden mx-auto select-none',
          mode === 'agregar' && 'cursor-crosshair border-[#1e3a5f] border-solid',
          mode === 'mover' && 'cursor-grab border-[#2563eb] border-solid',
          !mode && 'border-dashed border-[var(--color-border)]',
        )}
        style={{ maxWidth: 300, aspectRatio: '200/450' }}
        onClick={handleImageClick}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <img
          src={DEFAULT_VEHICLE_SVG}
          alt="Vista superior del vehículo"
          className="w-full h-full object-contain pointer-events-none"
          draggable={false}
        />

        {markers.map((marker, index) => {
          const config = SEVERITY_CONFIG[marker.severity];
          const isSelected = selectedMarker === marker.id;
          const isDragging = draggingId === marker.id;

          return (
            <div
              key={marker.id}
              className={cn(
                'absolute flex items-center justify-center h-7 w-7 -ml-3.5 -mt-3.5 rounded-full text-white text-xs font-bold shadow-lg transition-transform',
                config.color,
                isSelected && `ring-3 ${config.ring} scale-125`,
                isDragging && 'scale-150 opacity-80',
                mode === 'mover' && 'cursor-grab active:cursor-grabbing',
              )}
              style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
              onMouseDown={(e) => handleMarkerMouseDown(e, marker.id)}
              onClick={(e) => {
                e.stopPropagation();
                if (mode !== 'mover') {
                  setSelectedMarker(isSelected ? null : marker.id);
                  setEditingDescription(marker.description);
                }
              }}
            >
              {index + 1}
            </div>
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
              <button
                type="button"
                onClick={() => handleDeleteMarker(marker.id)}
                className="p-1 rounded-md text-red-500 hover:text-red-700 hover:bg-red-100 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="flex gap-2">
              <Input
                value={editingDescription}
                onChange={(e) => setEditingDescription(e.target.value)}
                placeholder="Describe el daño..."
                className="h-9 rounded-lg text-sm bg-white text-[var(--color-text-primary)]"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleUpdateDescription(marker.id);
                  if (e.key === 'Escape') setSelectedMarker(null);
                }}
              />
              <button
                type="button"
                className="flex items-center justify-center h-9 w-9 rounded-lg bg-[#1e3a5f] text-white shrink-0"
                onClick={() => handleUpdateDescription(marker.id)}
              >
                <Check className="h-4 w-4" />
              </button>
            </div>
          </div>
        );
      })()}

      {/* Markers list */}
      {markers.length > 0 && (
        <div className="space-y-1">
          {markers.map((marker, index) => {
            const config = SEVERITY_CONFIG[marker.severity];
            return (
              <div
                key={marker.id}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm cursor-pointer transition-colors',
                  selectedMarker === marker.id
                    ? `${config.bg} ${config.text}`
                    : 'hover:bg-[var(--color-bg-secondary)]',
                )}
                onClick={() => {
                  setSelectedMarker(marker.id);
                  setEditingDescription(marker.description);
                }}
              >
                <span className={cn('flex h-5 w-5 items-center justify-center rounded-full text-white text-[10px] font-bold shrink-0', config.color)}>
                  {index + 1}
                </span>
                <span className="flex-1 truncate text-xs">
                  {marker.description || 'Sin descripción'}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteMarker(marker.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-[var(--color-text-secondary)] hover:text-red-500"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {markers.length === 0 && !mode && (
        <div className="text-center py-4 text-sm text-[var(--color-text-secondary)]">
          <AlertTriangle className="h-6 w-6 mx-auto mb-1.5 opacity-30" />
          <p className="text-xs">Usa &quot;Agregar&quot; para marcar daños en el vehículo</p>
        </div>
      )}

      {/* Damage notes */}
      <Textarea
        value={notes}
        onChange={(e) => updateNotes(e.target.value)}
        placeholder="Notas adicionales sobre el estado del vehículo..."
        className="min-h-[50px] rounded-xl resize-none text-sm"
      />
    </div>
  );
}
