import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Plane,
  Luggage,
  BedDouble,
  UtensilsCrossed,
  Wifi,
  Bus,
  MapPin,
  type LucideIcon,
} from "lucide-react";
import type { TKey } from "./i18n";

export type Currency = "GEL" | "USD" | "EUR";

/** Fixed mock exchange rates -> GEL */
export const RATES: Record<Currency, number> = {
  GEL: 1,
  USD: 2.7,
  EUR: 2.95,
};

export const CURRENCY_SYMBOL: Record<Currency, string> = {
  GEL: "₾",
  USD: "$",
  EUR: "€",
};

export type CategoryId =
  | "tickets"
  | "luggage"
  | "hotel"
  | "food"
  | "internet"
  | "transport"
  | "local";

export const CATEGORIES: {
  id: CategoryId;
  key: TKey;
  icon: LucideIcon;
  color: string;
}[] = [
  { id: "tickets", key: "cat_tickets", icon: Plane, color: "var(--chart-1)" },
  { id: "luggage", key: "cat_luggage", icon: Luggage, color: "var(--chart-2)" },
  { id: "hotel", key: "cat_hotel", icon: BedDouble, color: "var(--chart-3)" },
  { id: "food", key: "cat_food", icon: UtensilsCrossed, color: "var(--chart-4)" },
  { id: "internet", key: "cat_internet", icon: Wifi, color: "var(--chart-5)" },
  { id: "transport", key: "cat_transport", icon: Bus, color: "var(--chart-6)" },
  { id: "local", key: "cat_local", icon: MapPin, color: "var(--chart-7)" },
];

export const categoryById = (id: CategoryId) => CATEGORIES.find((c) => c.id === id)!;

export type Expense = {
  id: string;
  amount: number;
  currency: Currency;
  amountGel: number;
  category: CategoryId;
  note?: string;
  createdAt: number;
};

export const toGel = (amount: number, currency: Currency) =>
  Math.round(amount * RATES[currency] * 100) / 100;

export const formatGel = (value: number) =>
  `${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₾`;

type Ctx = {
  expenses: Expense[];
  totalGel: number;
  byCategory: { id: CategoryId; value: number; color: string }[];
  addExpense: (e: Omit<Expense, "id" | "createdAt" | "amountGel">) => void;
  removeExpense: (id: string) => void;
  clearAll: () => void;
};

const ExpensesContext = createContext<Ctx | null>(null);

const STORAGE_KEY = "expenses";

export function ExpensesProvider({ children }: { children: ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setExpenses(JSON.parse(raw) as Expense[]);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
  }, [expenses]);

  const value = useMemo<Ctx>(() => {
    const totalGel = Math.round(expenses.reduce((s, e) => s + e.amountGel, 0) * 100) / 100;
    const byCategory = CATEGORIES.map((c) => ({
      id: c.id,
      color: c.color,
      value:
        Math.round(
          expenses.filter((e) => e.category === c.id).reduce((s, e) => s + e.amountGel, 0) * 100,
        ) / 100,
    })).filter((c) => c.value > 0);

    return {
      expenses,
      totalGel,
      byCategory,
      addExpense: (e) =>
        setExpenses((prev) => [
          {
            ...e,
            amountGel: toGel(e.amount, e.currency),
            id: Math.random().toString(36).slice(2),
            createdAt: Date.now(),
          },
          ...prev,
        ]),
      removeExpense: (id) => setExpenses((prev) => prev.filter((e) => e.id !== id)),
      clearAll: () => setExpenses([]),
    };
  }, [expenses]);

  return <ExpensesContext.Provider value={value}>{children}</ExpensesContext.Provider>;
}

export function useExpenses() {
  const ctx = useContext(ExpensesContext);
  if (!ctx) throw new Error("useExpenses must be used within ExpensesProvider");
  return ctx;
}
