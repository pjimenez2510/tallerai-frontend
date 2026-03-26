import type { Metadata } from 'next';
import { PagePermissionGuard } from '@/components/auth/page-permission-guard';
import { KanbanBoard } from '@/components/kanban/kanban-board';

export const metadata: Metadata = {
  title: 'Kanban',
};

export default function KanbanBoardPage() {
  return (
    <PagePermissionGuard permission="kanban.view">
      <KanbanBoard />
    </PagePermissionGuard>
  );
}
