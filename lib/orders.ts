import { ORDER_STATUSES, type Order, type OrderStatus } from "./types";

// Lunghezza massima consentita per i campi testuali.
export const MAX_FIELD_LENGTH = 80;

export interface OrderInput {
  customer?: string;
  product?: string;
  quantity?: number;
  status?: OrderStatus;
}

export interface ValidationResult {
  ok: boolean;
  errors: Record<string, string>;
}

// Crea un ordine "pulito" partendo da un input grezzo.
export function createOrder(input: OrderInput): Order {
  const quantity = Number(input.quantity);
  return {
    id: crypto.randomUUID(),
    customer: (input.customer ?? "").trim(),
    product: (input.product ?? "").trim(),
    quantity: Number.isFinite(quantity) ? quantity : 0,
    status:
      input.status && ORDER_STATUSES.includes(input.status)
        ? input.status
        : "pending",
    createdAt: new Date().toISOString(),
  };
}

// Valida i campi di un ordine, restituendo gli errori per campo.
export function validateOrderInput(input: OrderInput): ValidationResult {
  const errors: Record<string, string> = {};

  const customer = (input.customer ?? "").trim();
  if (!customer) {
    errors.customer = "Il nome del cliente è obbligatorio";
  } else if (customer.length > MAX_FIELD_LENGTH) {
    errors.customer = `Massimo ${MAX_FIELD_LENGTH} caratteri`;
  }

  const product = (input.product ?? "").trim();
  if (!product) {
    errors.product = "Il prodotto è obbligatorio";
  } else if (product.length > MAX_FIELD_LENGTH) {
    errors.product = `Massimo ${MAX_FIELD_LENGTH} caratteri`;
  }

  const quantity = Number(input.quantity);
  if (!Number.isInteger(quantity)) {
    errors.quantity = "La quantità deve essere un numero intero";
  } else if (quantity < 1 || quantity > 999) {
    errors.quantity = "La quantità deve essere compresa tra 1 e 999";
  }

  return { ok: Object.keys(errors).length === 0, errors };
}

// Ordina gli ordini dal più recente al più vecchio, senza mutare l'input.
export function sortOrdersByDateDesc(orders: Order[]): Order[] {
  return [...orders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

// Filtra per stato; "all" restituisce tutti gli ordini.
export function filterOrdersByStatus(
  orders: Order[],
  status: OrderStatus | "all"
): Order[] {
  if (status === "all") {
    return orders;
  }
  return orders.filter((order) => order.status === status);
}
