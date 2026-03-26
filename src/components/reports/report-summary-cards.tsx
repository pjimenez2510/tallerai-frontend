'use client';

interface SummaryItem {
  label: string;
  value: string | number;
}

interface ReportSummaryCardsProps {
  cards: SummaryItem[];
}

export function ReportSummaryCards({ cards }: ReportSummaryCardsProps) {
  if (!cards || !cards.length) return null;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cards.map((card, i) => (
        <div
          key={i}
          className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4"
        >
          <p className="text-xs text-[var(--color-text-secondary)] font-medium">
            {card.label}
          </p>
          <p className="mt-1 text-xl font-bold text-[var(--color-text-primary)]">
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
}
