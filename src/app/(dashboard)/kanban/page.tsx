import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kanban',
};

export default function KanbanPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
        Kanban del Taller
      </h1>
      <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
        Próximamente: tablero Kanban en tiempo real con WebSockets.
      </p>
    </div>
  );
}
