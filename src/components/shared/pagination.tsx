'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  function getPageNumbers(): (number | 'ellipsis')[] {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | 'ellipsis')[] = [];

    if (page <= 4) {
      pages.push(1, 2, 3, 4, 5, 'ellipsis', totalPages);
    } else if (page >= totalPages - 3) {
      pages.push(
        1,
        'ellipsis',
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      );
    } else {
      pages.push(
        1,
        'ellipsis',
        page - 1,
        page,
        page + 1,
        'ellipsis',
        totalPages,
      );
    }

    return pages;
  }

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 px-1">
      <p className="text-sm text-[var(--color-text-secondary)]">
        Mostrando{' '}
        <span className="font-medium text-[var(--color-text-primary)]">
          {start}
        </span>{' '}
        -{' '}
        <span className="font-medium text-[var(--color-text-primary)]">
          {end}
        </span>{' '}
        de{' '}
        <span className="font-medium text-[var(--color-text-primary)]">
          {total}
        </span>
      </p>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="rounded-xl h-8 w-8 text-[var(--color-text-secondary)]"
          aria-label="Página anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {pageNumbers.map((p, idx) =>
          p === 'ellipsis' ? (
            <span
              key={`ellipsis-${idx}`}
              className="w-8 text-center text-sm text-[var(--color-text-secondary)]"
            >
              ...
            </span>
          ) : (
            <Button
              key={p}
              variant={p === page ? 'default' : 'ghost'}
              size="icon-sm"
              onClick={() => onPageChange(p)}
              className={
                p === page
                  ? 'rounded-xl h-8 w-8 bg-[#1e3a5f] text-white hover:bg-[#162d4a]'
                  : 'rounded-xl h-8 w-8 text-[var(--color-text-secondary)]'
              }
              aria-label={`Página ${p}`}
              aria-current={p === page ? 'page' : undefined}
            >
              {p}
            </Button>
          ),
        )}

        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="rounded-xl h-8 w-8 text-[var(--color-text-secondary)]"
          aria-label="Página siguiente"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
