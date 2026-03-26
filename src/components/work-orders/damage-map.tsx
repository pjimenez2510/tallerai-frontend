'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RotateCcw, Save } from 'lucide-react';
import type { Canvas as FabricCanvas, FabricObject, RectProps, CircleProps, TextProps } from 'fabric';

interface DamageMapProps {
  initialMap: string | null;
  initialNotes: string | null;
  onSave: (damageMap: string | null, damageNotes: string | null) => void;
  isSaving: boolean;
}

type DamageColor = 'red' | 'yellow' | 'green';

const colorConfig: Record<DamageColor, { label: string; hex: string; stroke: string }> = {
  red: { label: 'Grave', hex: '#ef4444', stroke: '#b91c1c' },
  yellow: { label: 'Moderado', hex: '#eab308', stroke: '#a16207' },
  green: { label: 'Leve', hex: '#22c55e', stroke: '#15803d' },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FabricModule = any;

function drawCarOutline(canvas: FabricCanvas, fabric: FabricModule) {
  const { Rect, Polygon, Line, Text } = fabric as {
    Rect: new (opts: Partial<RectProps>) => FabricObject;
    Polygon: new (points: { x: number; y: number }[], opts: unknown) => FabricObject;
    Line: new (coords: number[], opts: unknown) => FabricObject;
    Text: new (text: string, opts: Partial<TextProps>) => FabricObject;
  };

  // Car body (top-down view)
  const body = new Rect({
    left: 60,
    top: 80,
    width: 280,
    height: 140,
    fill: '#e2e8f0',
    stroke: '#94a3b8',
    strokeWidth: 2,
    rx: 8,
    ry: 8,
    selectable: false,
    evented: false,
    excludeFromExport: true,
  });

  // Cabin / roof area
  const roof = new Polygon(
    [
      { x: 120, y: 80 },
      { x: 280, y: 80 },
      { x: 310, y: 130 },
      { x: 90, y: 130 },
    ],
    {
      fill: '#cbd5e1',
      stroke: '#94a3b8',
      strokeWidth: 2,
      selectable: false,
      evented: false,
      excludeFromExport: true,
    },
  );

  // Front windshield
  const frontWind = new Polygon(
    [
      { x: 280, y: 82 },
      { x: 320, y: 82 },
      { x: 318, y: 128 },
      { x: 282, y: 128 },
    ],
    {
      fill: '#bfdbfe',
      stroke: '#94a3b8',
      strokeWidth: 1.5,
      selectable: false,
      evented: false,
      excludeFromExport: true,
    },
  );

  // Rear windshield
  const rearWind = new Polygon(
    [
      { x: 82, y: 82 },
      { x: 118, y: 82 },
      { x: 118, y: 128 },
      { x: 84, y: 128 },
    ],
    {
      fill: '#bfdbfe',
      stroke: '#94a3b8',
      strokeWidth: 1.5,
      selectable: false,
      evented: false,
      excludeFromExport: true,
    },
  );

  // Bumpers
  const frontBumper = new Rect({
    left: 340,
    top: 95,
    width: 20,
    height: 110,
    fill: '#94a3b8',
    stroke: '#64748b',
    strokeWidth: 1,
    rx: 4,
    ry: 4,
    selectable: false,
    evented: false,
    excludeFromExport: true,
  });

  const rearBumper = new Rect({
    left: 40,
    top: 95,
    width: 20,
    height: 110,
    fill: '#94a3b8',
    stroke: '#64748b',
    strokeWidth: 1,
    rx: 4,
    ry: 4,
    selectable: false,
    evented: false,
    excludeFromExport: true,
  });

  // Wheels
  const wheelDefs = [
    { left: 90, top: 200 },
    { left: 90, top: 60 },
    { left: 270, top: 200 },
    { left: 270, top: 60 },
  ];

  const wheels = wheelDefs.map(
    (pos) =>
      new Rect({
        left: pos.left,
        top: pos.top,
        width: 40,
        height: 40,
        fill: '#475569',
        stroke: '#1e293b',
        strokeWidth: 2,
        rx: 6,
        ry: 6,
        selectable: false,
        evented: false,
        excludeFromExport: true,
      }),
  );

  // Center divider line
  const centerLine = new Line([200, 80, 200, 220], {
    stroke: '#94a3b8',
    strokeWidth: 1,
    strokeDashArray: [4, 4],
    selectable: false,
    evented: false,
    excludeFromExport: true,
  });

  // Direction labels
  const frontLabel = new Text('FRENTE', {
    left: 370,
    top: 150,
    fontSize: 10,
    fill: '#64748b',
    angle: 90,
    selectable: false,
    evented: false,
    excludeFromExport: true,
    originX: 'center',
    originY: 'center',
  });

  const rearLabel = new Text('ATRÁS', {
    left: 20,
    top: 150,
    fontSize: 10,
    fill: '#64748b',
    angle: 90,
    selectable: false,
    evented: false,
    excludeFromExport: true,
    originX: 'center',
    originY: 'center',
  });

  [
    body,
    roof,
    frontWind,
    rearWind,
    frontBumper,
    rearBumper,
    ...wheels,
    centerLine,
    frontLabel,
    rearLabel,
  ].forEach((obj) => canvas.add(obj));
}

function addDamageCircle(
  canvas: FabricCanvas,
  fabric: FabricModule,
  x: number,
  y: number,
  color: DamageColor,
) {
  const cfg = colorConfig[color];
  const Circle = fabric.Circle as new (opts: Partial<CircleProps>) => FabricObject;
  const circle = new Circle({
    left: x - 12,
    top: y - 12,
    radius: 12,
    fill: cfg.hex + 'cc',
    stroke: cfg.stroke,
    strokeWidth: 2,
    selectable: true,
    hasControls: false,
    hasBorders: false,
  });
  canvas.add(circle);
  canvas.setActiveObject(circle);
  canvas.renderAll();
}

export function DamageMap({ initialMap, initialNotes, onSave, isSaving }: DamageMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<FabricCanvas | null>(null);
  const fabricModuleRef = useRef<FabricModule | null>(null);
  const [selectedColor, setSelectedColor] = useState<DamageColor>('red');
  const selectedColorRef = useRef<DamageColor>('red');
  const [damageNotes, setDamageNotes] = useState(initialNotes ?? '');
  const [fabricLoaded, setFabricLoaded] = useState(false);

  // Keep ref in sync for event handlers
  selectedColorRef.current = selectedColor;

  useEffect(() => {
    let mounted = true;

    async function initFabric() {
      const fabric = await import('fabric');
      if (!mounted || !canvasRef.current) return;

      fabricModuleRef.current = fabric;

      const canvas = new fabric.Canvas(canvasRef.current, {
        width: 400,
        height: 300,
        backgroundColor: '#f8fafc',
        selection: false,
      });

      fabricRef.current = canvas;

      drawCarOutline(canvas, fabric);

      // Load existing damage map
      if (initialMap) {
        try {
          const parsed = JSON.parse(initialMap) as { objects?: unknown[] };
          if (parsed.objects) {
            for (const objData of parsed.objects) {
              const enlivened = await fabric.util.enlivenObjects([objData]);
              enlivened.forEach((o) => canvas.add(o as FabricObject));
            }
            canvas.renderAll();
          }
        } catch {
          // Ignore parse errors
        }
      }

      // Click handler to add damage circle
      canvas.on('mouse:down', (opt) => {
        const pointer = canvas.getViewportPoint(opt.e);
        addDamageCircle(canvas, fabric, pointer.x, pointer.y, selectedColorRef.current);
      });

      // Delete selected with keyboard
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Delete' || e.key === 'Backspace') {
          const active = canvas.getActiveObject();
          if (active) {
            canvas.remove(active);
            canvas.renderAll();
          }
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      setFabricLoaded(true);

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }

    void initFabric();

    return () => {
      mounted = false;
      if (fabricRef.current) {
        fabricRef.current.dispose();
        fabricRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleClear() {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const toRemove = canvas.getObjects().filter((obj) => {
      return (obj as unknown as Record<string, unknown>).excludeFromExport !== true;
    });
    toRemove.forEach((obj) => canvas.remove(obj));
    canvas.renderAll();
  }

  function handleSave() {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const damageObjects = canvas.getObjects().filter((obj) => {
      return (obj as unknown as Record<string, unknown>).excludeFromExport !== true;
    });

    const mapData =
      damageObjects.length > 0
        ? JSON.stringify({ objects: damageObjects.map((o) => o.toObject()) })
        : null;

    onSave(mapData, damageNotes || null);
  }

  return (
    <div className="space-y-4">
      {/* Color selector */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-xs font-medium text-[var(--color-text-secondary)]">
          Tipo de daño:
        </span>
        {(Object.entries(colorConfig) as [DamageColor, (typeof colorConfig)[DamageColor]][]).map(
          ([key, cfg]) => (
            <button
              key={key}
              onClick={() => setSelectedColor(key)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium border transition-all ${
                selectedColor === key
                  ? 'border-transparent text-white shadow-sm'
                  : 'border-[var(--color-border)] text-[var(--color-text-secondary)] bg-[var(--color-bg)]'
              }`}
              style={selectedColor === key ? { backgroundColor: cfg.hex } : undefined}
            >
              <span
                className="h-3 w-3 rounded-full border border-white/50"
                style={{ backgroundColor: cfg.hex }}
              />
              {cfg.label}
            </button>
          ),
        )}
      </div>

      {/* Canvas */}
      <div className="relative rounded-xl border border-[var(--color-border)] overflow-hidden bg-[#f8fafc]">
        {!fabricLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#f8fafc] z-10">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#1e3a5f] border-t-transparent" />
          </div>
        )}
        <canvas ref={canvasRef} />
        <p className="absolute bottom-2 right-3 text-[10px] text-[#94a3b8] pointer-events-none">
          Clic para marcar daño · Seleccionar + Delete para eliminar
        </p>
      </div>

      {/* Damage notes */}
      <div className="space-y-1.5">
        <Label className="text-xs">Notas de daños</Label>
        <textarea
          value={damageNotes}
          onChange={(e) => setDamageNotes(e.target.value)}
          placeholder="Describa los daños observados..."
          rows={3}
          className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm placeholder:text-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] resize-none"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border)]">
        <Button
          variant="outline"
          size="sm"
          onClick={handleClear}
          className="rounded-xl border-[var(--color-border)] text-[var(--color-text-secondary)]"
        >
          <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
          Limpiar
        </Button>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={isSaving}
          className="rounded-xl bg-[#1e3a5f] text-white hover:bg-[#162d4a]"
        >
          <Save className="h-3.5 w-3.5 mr-1.5" />
          Guardar mapa de daños
        </Button>
      </div>
    </div>
  );
}
