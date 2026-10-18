"use client";

import { ORDER_STATUSES, STATUS_LABELS, type Order, type OrderStatus } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";

const dateFormatter = new Intl.DateTimeFormat("it-IT", {
  dateStyle: "medium",
  timeStyle: "short",
});

const selectClass =
  "rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";

interface OrderRowProps {
  order: Order;
  onStatusChange: (id: string, status: OrderStatus) => void;
  onDelete: (id: string) => void;
}

export function OrderRow({ order, onStatusChange, onDelete }: OrderRowProps) {
  return (
    <li
      data-testid="order-row"
      className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="flex min-w-0 flex-col gap-1">
        <span
          data-testid="order-customer"
          className="truncate font-semibold text-zinc-900 dark:text-zinc-50"
        >
          {order.customer}
        </span>
        <span
          data-testid="order-product"
          className="truncate text-sm text-zinc-600 dark:text-zinc-400"
        >
          {order.product}
        </span>
        <span className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-500">
          <span>
            Qtà:{" "}
            <span data-testid="order-quantity" className="font-medium">
              {order.quantity}
            </span>
          </span>
          <span aria-hidden="true">·</span>
          <time dateTime={order.createdAt}>
            {dateFormatter.format(new Date(order.createdAt))}
          </time>
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={order.status} />

        <label className="sr-only" htmlFor={`status-${order.id}`}>
          Cambia stato per {order.customer}
        </label>
        <select
          id={`status-${order.id}`}
          data-testid="order-status-select"
          className={selectClass}
          value={order.status}
          onChange={(event) =>
            onStatusChange(order.id, event.target.value as OrderStatus)
          }
        >
          {ORDER_STATUSES.map((status) => (
            <option key={status} value={status}>
              {STATUS_LABELS[status]}
            </option>
          ))}
        </select>

        <button
          type="button"
          data-testid="order-delete"
          onClick={() => onDelete(order.id)}
          className="rounded-md border border-red-300 px-3 py-1 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 dark:border-red-500/40 dark:text-red-400 dark:hover:bg-red-500/10"
        >
          Elimina
        </button>
      </div>
    </li>
  );
}
