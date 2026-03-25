'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Bell,
  ClipboardList,
  Package,
  CreditCard,
  Settings,
  Users,
  Wrench,
  CheckCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return 'hace un momento';
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `hace ${days} días`;
  const months = Math.floor(days / 30);
  return `hace ${months} mes${months > 1 ? 'es' : ''}`;
}
import { Button } from '@/components/ui/button';
import {
  useNotifications,
  useUnreadCount,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from '@/hooks/use-notifications';
import type { NotificationType } from '@/types/notification.types';

const notificationIcons: Record<NotificationType, React.ElementType> = {
  work_order: ClipboardList,
  inventory: Package,
  payment: CreditCard,
  system: Settings,
  client: Users,
  mechanic: Wrench,
};

const notificationColors: Record<NotificationType, string> = {
  work_order: 'text-blue-500 bg-blue-500/10',
  inventory: 'text-amber-500 bg-amber-500/10',
  payment: 'text-emerald-500 bg-emerald-500/10',
  system: 'text-slate-500 bg-slate-500/10',
  client: 'text-purple-500 bg-purple-500/10',
  mechanic: 'text-orange-500 bg-orange-500/10',
};

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { data: unreadData } = useUnreadCount();
  const { data: notificationsData } = useNotifications(1, 10);
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const unreadCount = unreadData?.count ?? 0;
  const notifications = notificationsData?.items ?? [];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  function handleMarkRead(id: string) {
    markRead.mutate(id);
  }

  function handleMarkAllRead() {
    markAllRead.mutate();
  }

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="ghost"
        size="icon"
        className="relative text-[var(--color-text-secondary)]"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notificaciones"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#f97316] text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 top-10 z-50 w-80 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
            <div>
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                Notificaciones
              </p>
              {unreadCount > 0 && (
                <p className="text-xs text-[var(--color-text-secondary)]">
                  {unreadCount} sin leer
                </p>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center gap-1 text-xs text-[#2563eb] hover:text-[#1e3a5f] transition-colors"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Marcar todo
              </button>
            )}
          </div>

          {/* Notifications list */}
          <div className="max-h-[360px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                <Bell className="h-8 w-8 text-[var(--color-text-secondary)] mb-2 opacity-40" />
                <p className="text-sm text-[var(--color-text-secondary)]">
                  No hay notificaciones
                </p>
              </div>
            ) : (
              notifications.map((notification) => {
                const Icon = notificationIcons[notification.type] ?? Bell;
                const colorClass =
                  notificationColors[notification.type] ?? 'text-slate-500 bg-slate-500/10';

                return (
                  <button
                    key={notification.id}
                    onClick={() => {
                      if (!notification.read) {
                        handleMarkRead(notification.id);
                      }
                    }}
                    className={cn(
                      'flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--color-bg-secondary)]',
                      !notification.read && 'bg-[#2563eb]/5',
                    )}
                  >
                    <div
                      className={cn(
                        'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                        colorClass,
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={cn(
                            'text-xs font-medium leading-snug',
                            notification.read
                              ? 'text-[var(--color-text-secondary)]'
                              : 'text-[var(--color-text-primary)]',
                          )}
                        >
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#f97316]" />
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-[var(--color-text-secondary)] line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="mt-1 text-[10px] text-[var(--color-text-secondary)] opacity-60">
                        {timeAgo(notification.createdAt)}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
