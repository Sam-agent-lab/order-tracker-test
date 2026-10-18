import { STATUS_LABELS, type OrderStatus } from "@/lib/types";

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending:
    "border-amber-300 bg-amber-100 text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/15 dark:text-amber-300",
  processing:
    "border-blue-300 bg-blue-100 text-blue-800 dark:border-blue-500/40 dark:bg-blue-500/15 dark:text-blue-300",
  shipped:
    "border-violet-300 bg-violet-100 text-violet-800 dark:border-violet-500/40 dark:bg-violet-500/15 dark:text-violet-300",
  delivered:
    "border-emerald-300 bg-emerald-100 text-emerald-800 dark:border-emerald-500/40 dark:bg-emerald-500/15 dark:text-emerald-300",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      data-testid="order-status"
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
