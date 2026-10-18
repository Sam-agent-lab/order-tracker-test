"use client";

import { useState, type FormEvent } from "react";
import { OrderRow } from "@/components/OrderRow";
import { useOrders } from "@/hooks/useOrders";
import { validateOrderInput, type OrderInput } from "@/lib/orders";
import { ORDER_STATUSES, STATUS_LABELS, type OrderStatus } from "@/lib/types";

type FieldErrors = Partial<Record<"customer" | "product" | "quantity", string>>;

const FILTERS: { value: OrderStatus | "all"; testId: string; label: string }[] = [
  { value: "all", testId: "filter-all", label: "Tutti" },
  ...ORDER_STATUSES.map((status) => ({
    value: status,
    testId: `filter-${status}`,
    label: STATUS_LABELS[status],
  })),
];

const fieldClass =
  "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500";

const labelClass = "mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300";

export default function Home() {
  const {
    orders,
    addOrder,
    setStatus: setOrderStatus,
    removeOrder,
    statusFilter,
    setStatusFilter,
    visibleOrders,
    hydrated,
  } = useOrders();

  const [customer, setCustomer] = useState("");
  const [product, setProduct] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [status, setStatus] = useState<OrderStatus>("pending");
  const [errors, setErrors] = useState<FieldErrors>({});

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const input: OrderInput = {
      customer,
      product,
      quantity: Number(quantity),
      status,
    };
    const result = validateOrderInput(input);

    if (!result.ok) {
      setErrors({
        customer: result.errors.customer,
        product: result.errors.product,
        quantity: result.errors.quantity,
      });
      return;
    }

    addOrder(input);
    setCustomer("");
    setProduct("");
    setQuantity("1");
    setStatus("pending");
    setErrors({});
  }

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-50">
          Order Tracker
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Gestione ordini — dati salvati nel browser
        </p>
      </header>

      <form
        data-testid="order-form"
        onSubmit={handleSubmit}
        noValidate
        className="mb-8 grid grid-cols-1 gap-4 rounded-xl border border-zinc-200 bg-zinc-50 p-4 sm:grid-cols-2 dark:border-zinc-800 dark:bg-zinc-900/50"
      >
        <div className="sm:col-span-2">
          <label htmlFor="customer" className={labelClass}>
            Cliente
          </label>
          <input
            id="customer"
            data-testid="input-customer"
            type="text"
            value={customer}
            onChange={(event) => setCustomer(event.target.value)}
            aria-invalid={errors.customer ? true : undefined}
            aria-describedby={errors.customer ? "error-customer" : undefined}
            placeholder="Mario Rossi"
            className={fieldClass}
          />
          {errors.customer && (
            <p
              id="error-customer"
              data-testid="error-customer"
              className="mt-1 text-sm text-red-600 dark:text-red-400"
            >
              {errors.customer}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="product" className={labelClass}>
            Prodotto
          </label>
          <input
            id="product"
            data-testid="input-product"
            type="text"
            value={product}
            onChange={(event) => setProduct(event.target.value)}
            aria-invalid={errors.product ? true : undefined}
            aria-describedby={errors.product ? "error-product" : undefined}
            placeholder="Scarpe da ginnastica"
            className={fieldClass}
          />
          {errors.product && (
            <p
              id="error-product"
              data-testid="error-product"
              className="mt-1 text-sm text-red-600 dark:text-red-400"
            >
              {errors.product}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="quantity" className={labelClass}>
            Quantità
          </label>
          <input
            id="quantity"
            data-testid="input-quantity"
            type="number"
            min={1}
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            aria-invalid={errors.quantity ? true : undefined}
            aria-describedby={errors.quantity ? "error-quantity" : undefined}
            className={fieldClass}
          />
          {errors.quantity && (
            <p
              id="error-quantity"
              data-testid="error-quantity"
              className="mt-1 text-sm text-red-600 dark:text-red-400"
            >
              {errors.quantity}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="status" className={labelClass}>
            Stato
          </label>
          <select
            id="status"
            data-testid="select-status"
            value={status}
            onChange={(event) => setStatus(event.target.value as OrderStatus)}
            className={fieldClass}
          >
            {ORDER_STATUSES.map((value) => (
              <option key={value} value={value}>
                {STATUS_LABELS[value]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end sm:col-span-2">
          <button
            type="submit"
            data-testid="submit-order"
            className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 sm:w-auto dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            Aggiungi ordine
          </button>
        </div>
      </form>

      <section aria-label="Ordini">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div
            role="group"
            aria-label="Filtra per stato"
            className="flex flex-wrap gap-2"
          >
            {FILTERS.map((filter) => {
              const active = statusFilter === filter.value;
              return (
                <button
                  key={filter.value}
                  type="button"
                  data-testid={filter.testId}
                  aria-pressed={active}
                  onClick={() => setStatusFilter(filter.value)}
                  className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 ${
                    active
                      ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                      : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>

          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Totale:{" "}
            <span data-testid="count-total" className="font-semibold">
              {orders.length}
            </span>
            {" · "}Visibili:{" "}
            <span data-testid="count-visible" className="font-semibold">
              {visibleOrders.length}
            </span>
          </p>
        </div>

        <div aria-live="polite" data-testid="orders-list">
          {!hydrated ? (
            <p className="rounded-lg border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
              Caricamento ordini…
            </p>
          ) : orders.length === 0 ? (
            <p className="rounded-lg border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
              Nessun ordine. Aggiungine uno qui sopra.
            </p>
          ) : visibleOrders.length === 0 ? (
            <p className="rounded-lg border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
              Nessun ordine con questo stato.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {visibleOrders.map((order) => (
                <OrderRow
                  key={order.id}
                  order={order}
                  onStatusChange={setOrderStatus}
                  onDelete={removeOrder}
                />
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}
