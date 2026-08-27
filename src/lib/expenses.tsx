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
import type { TKey, Lang } from "./i18n";

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
  tripId: string;
  amount: number;
  currency: Currency;
  amountGel: number;
  category: CategoryId;
  note?: string;
  createdAt: number;
};

export type Trip = {
  id: string;
  name: string;
  /** ISO date strings: YYYY-MM-DD */
  startDate: string;
  endDate: string;
  createdAt: number;
};

export const toGel = (amount: number, currency: Currency) =>
  Math.round(amount * RATES[currency] * 100) / 100;

export const formatGel = (value: number) =>
  `${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₾`;

const parseDate = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1);
};

/** e.g. "Oct 18 – Oct 22, 2026" */
export function formatTripPeriod(trip: Trip, lang: Lang = "en") {
  const locale = lang === "ka" ? "ka-GE" : "en-US";
  const start = parseDate(trip.startDate);
  const end = parseDate(trip.endDate);
  const md: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  const left = start.toLocaleDateString(locale, md);
  const sameYear = start.getFullYear() === end.getFullYear();
  const right = end.toLocaleDateString(locale, sameYear ? md : { ...md, year: "numeric" });
  return `${left} – ${right}, ${end.getFullYear()}`;
}

type Ctx = {
  trips: Trip[];
  activeTrip: Trip | null;
  activeTripId: string | null;
  setActiveTripId: (id: string) => void;
  addTrip: (t: Omit<Trip, "id" | "createdAt">) => Trip;
  removeTrip: (id: string) => void;
  /** expenses of the active trip only */
  expenses: Expense[];
  allExpenses: Expense[];
  totalGel: number;
  byCategory: { id: CategoryId; value: number; color: string }[];
  tripTotal: (tripId: string) => number;
  tripCount: (tripId: string) => number;
  addExpense: (e: Omit<Expense, "id" | "createdAt" | "amountGel" | "tripId">) => void;
  removeExpense: (id: string) => void;
  clearAll: () => void;
};

const ExpensesContext = createContext<Ctx | null>(null);

const STORAGE_KEY = "expenses";
const TRIPS_KEY = "trips";
const ACTIVE_KEY = "activeTripId";

const rid = () => Math.random().toString(36).slice(2);

export function ExpensesProvider({ children }: { children: ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [activeTripId, setActiveTripId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const rawTrips = window.localStorage.getItem(TRIPS_KEY);
      let loadedTrips: Trip[] = rawTrips ? (JSON.parse(rawTrips) as Trip[]) : [];
      const rawExp = window.localStorage.getItem(STORAGE_KEY);
      let loadedExp: Expense[] = rawExp ? (JSON.parse(rawExp) as Expense[]) : [];

      // migrate legacy expenses that were not linked to a trip
      const orphans = loadedExp.filter((e) => !e.tripId);
      if (orphans.length > 0) {
        let target = loadedTrips[0];
        if (!target) {
          const today = new Date().toISOString().slice(0, 10);
          target = { id: rid(), name: "My Trip", startDate: today, endDate: today, createdAt: Date.now() };
          loadedTrips = [target];
        }
        loadedExp = loadedExp.map((e) => (e.tripId ? e : { ...e, tripId: target.id }));
      }

      const savedActive = window.localStorage.getItem(ACTIVE_KEY);
      const active =
        loadedTrips.find((tr) => tr.id === savedActive)?.id ?? loadedTrips[0]?.id ?? null;

      setTrips(loadedTrips);
      setExpenses(loadedExp);
      setActiveTripId(active);
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
    window.localStorage.setItem(TRIPS_KEY, JSON.stringify(trips));
    if (activeTripId) window.localStorage.setItem(ACTIVE_KEY, activeTripId);
    else window.localStorage.removeItem(ACTIVE_KEY);
  }, [expenses, trips, activeTripId, hydrated]);

  const value = useMemo<Ctx>(() => {
    const activeTrip = trips.find((tr) => tr.id === activeTripId) ?? null;
    const tripExpenses = activeTrip ? expenses.filter((e) => e.tripId === activeTrip.id) : [];
    const sum = (list: Expense[]) =>
      Math.round(list.reduce((s, e) => s + e.amountGel, 0) * 100) / 100;

    const byCategory = CATEGORIES.map((c) => ({
      id: c.id,
      color: c.color,
      value: sum(tripExpenses.filter((e) => e.category === c.id)),
    })).filter((c) => c.value > 0);

    return {
      trips,
      activeTrip,
      activeTripId,
      setActiveTripId,
      addTrip: (t) => {
        const trip: Trip = { ...t, id: rid(), createdAt: Date.now() };
        setTrips((prev) => [trip, ...prev]);
        setActiveTripId(trip.id);
        return trip;
      },
      removeTrip: (id) => {
        setTrips((prev) => {
          const next = prev.filter((tr) => tr.id !== id);
          setActiveTripId((cur) => (cur === id ? next[0]?.id ?? null : cur));
          return next;
        });
        setExpenses((prev) => prev.filter((e) => e.tripId !== id));
      },
      expenses: tripExpenses,
      allExpenses: expenses,
      totalGel: sum(tripExpenses),
      byCategory,
      tripTotal: (tripId) => sum(expenses.filter((e) => e.tripId === tripId)),
      tripCount: (tripId) => expenses.filter((e) => e.tripId === tripId).length,
      addExpense: (e) => {
        if (!activeTripId) return;
        setExpenses((prev) => [
          {
            ...e,
            tripId: activeTripId,
            amountGel: toGel(e.amount, e.currency),
            id: rid(),
            createdAt: Date.now(),
          },
          ...prev,
        ]);
      },
      removeExpense: (id) => setExpenses((prev) => prev.filter((e) => e.id !== id)),
      clearAll: () => setExpenses([]),
    };
  }, [expenses, trips, activeTripId]);

  return <ExpensesContext.Provider value={value}>{children}</ExpensesContext.Provider>;
}

export function useExpenses() {
  const ctx = useContext(ExpensesContext);
  if (!ctx) throw new Error("useExpenses must be used within ExpensesProvider");
  return ctx;
}
