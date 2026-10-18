"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createOrder,
  filterOrdersByStatus,
  sortOrdersByDateDesc,
  type OrderInput,
} from "@/lib/orders";
import { loadOrders, saveOrders } from "@/lib/storage";
import type { Order, OrderStatus } from "@/lib/types";

export type StatusFilter = OrderStatus | "all";

export interface UseOrdersResult {
  orders: Order[];
  addOrder: (input: OrderInput) => void;
  setStatus: (id: string, status: OrderStatus) => void;
  removeOrder: (id: string) => void;
  statusFilter: StatusFilter;
  setStatusFilter: (filter: StatusFilter) => void;
  visibleOrders: Order[];
  hydrated: boolean;
}

export function useOrders(): UseOrdersResult {
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [hydrated, setHydrated] = useState(false);

  // Carica una sola volta da localStorage al mount.
  // I setState qui sono voluti: l'idratazione richiede un primo render
  // identico al server ([]), quindi il caricamento non può avvenire
  // nell'initializer di useState.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOrders(loadOrders());
    setHydrated(true);
  }, []);

  // Persiste solo dopo l'idratazione, così il primo render non sovrascrive
  // i dati salvati con un array vuoto.
  useEffect(() => {
    if (!hydrated) {
      return;
    }
    saveOrders(orders);
  }, [orders, hydrated]);

  const addOrder = useCallback((input: OrderInput) => {
    setOrders((prev) => [createOrder(input), ...prev]);
  }, []);

  const setStatus = useCallback((id: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((order) => (order.id === id ? { ...order, status } : order))
    );
  }, []);

  const removeOrder = useCallback((id: string) => {
    setOrders((prev) => prev.filter((order) => order.id !== id));
  }, []);

  const visibleOrders = useMemo(
    () => filterOrdersByStatus(sortOrdersByDateDesc(orders), statusFilter),
    [orders, statusFilter]
  );

  return {
    orders,
    addOrder,
    setStatus,
    removeOrder,
    statusFilter,
    setStatusFilter,
    visibleOrders,
    hydrated,
  };
}
