export type OrderStatus = "pending" | "processing" | "shipped" | "delivered";

export const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "processing",
  "shipped",
  "delivered",
];

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "In attesa",
  processing: "In lavorazione",
  shipped: "Spedito",
  delivered: "Consegnato",
};

export interface Order {
  id: string;
  customer: string;
  product: string;
  quantity: number;
  status: OrderStatus;
  createdAt: string;
}
