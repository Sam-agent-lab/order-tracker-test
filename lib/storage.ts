import { ORDER_STATUSES, type Order } from "./types";

export const STORAGE_KEY = "order-tracker:orders:v1";

// Verifica a runtime che un valore sconosciuto sia un Order valido.
function isValidOrder(value: unknown): value is Order {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.customer === "string" &&
    typeof candidate.product === "string" &&
    typeof candidate.quantity === "number" &&
    typeof candidate.createdAt === "string" &&
    typeof candidate.status === "string" &&
    (ORDER_STATUSES as string[]).includes(candidate.status)
  );
}

// Carica gli ordini da localStorage ignorando dati corrotti o malformati.
export function loadOrders(): Order[] {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter(isValidOrder);
  } catch {
    return [];
  }
}

// Salva gli ordini; no-op se window non è disponibile (es. SSR).
export function saveOrders(orders: Order[]): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  } catch {
    // localStorage può non essere disponibile (es. modalità privata).
  }
}
