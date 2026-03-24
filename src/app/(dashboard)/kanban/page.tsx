import type { Metadata } from 'next';
import { KanbanBoard } from '@/components/kanban/kanban-board';

export const metadata: Metadata = {
  title: 'Kanban',
};

export default function KanbanPage() {
  return <KanbanBoard />;
}
