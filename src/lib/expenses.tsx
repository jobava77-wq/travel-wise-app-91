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
import { supabase } from "@/integrations/supabase/client";
import type { TKey, Lang } from "./i18n";
import { CURRENCY_SYMBOL, DEFAULT_RATES, useRates, type Currency, type Rates } from "./rates";

export { CURRENCY_SYMBOL, DEFAULT_RATES, useRates };
export type { Currency, Rates };

/** Shared family trip used when no other trip is selected */
export const DEFAULT_TRIP_ID = "cyprus-2026";

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

export const categoryById = (id: CategoryId) =>
  CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[0]!;

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

export const toGel = (amount: number, currency: Currency, rates: Rates = DEFAULT_RATES) =>
  Math.round(amount * (rates[currency] || 1) * 100) / 100;

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

type ExpenseRow = {
  id: string;
  trip_id: string;
  title: string | null;
  amount: number | string;
  currency: string;
  category: string;
  created_at: string;
};

type TripRow = {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  created_at: string;
};

const mapTrip = (r: TripRow): Trip => ({
  id: r.id,
  name: r.name,
  startDate: r.start_date,
  endDate: r.end_date,
  createdAt: new Date(r.created_at).getTime(),
});

const asCurrency = (v: string): Currency =>
  v === "USD" || v === "EUR" || v === "GEL" ? v : "GEL";

const asCategory = (v: string): CategoryId =>
  (CATEGORIES.find((c) => c.id === v)?.id ?? "tickets") as CategoryId;

type Ctx = {
  loading: boolean;
  trips: Trip[];
  activeTrip: Trip | null;
  activeTripId: string | null;
  setActiveTripId: (id: string) => void;
  addTrip: (t: Omit<Trip, "id" | "createdAt">) => Promise<void>;
  removeTrip: (id: string) => Promise<void>;
  /** expenses of the active trip only */
  expenses: Expense[];
  allExpenses: Expense[];
  totalGel: number;
  byCategory: { id: CategoryId; value: number; color: string }[];
  tripTotal: (tripId: string) => number;
  tripCount: (tripId: string) => number;
  addExpense: (
    e: Pick<Expense, "amount" | "currency" | "category"> & { note?: string },
  ) => Promise<void>;
  removeExpense: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
};

const ExpensesContext = createContext<Ctx | null>(null);

const ACTIVE_KEY = "activeTripId";

const slugify = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40) || "trip";

export function ExpensesProvider({ children }: { children: ReactNode }) {
  const { rates } = useRates();
  const { pin } = useSession();
  const [rows, setRows] = useState<ExpenseRow[]>([]);
  const [tripRows, setTripRows] = useState<TripRow[]>([]);
  const [activeTripId, setActiveTripIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // initial fetch — scoped strictly to the current trip PIN
  useEffect(() => {
    if (!pin) {
      setRows([]);
      setTripRows([]);
      setActiveTripIdState(null);
      return;
    }
    let alive = true;
    setLoading(true);
    (async () => {
      const [tripsRes, expensesRes] = await Promise.all([
        supabase.from("trips").select("*").eq("id", pin),
        supabase
          .from("expenses")
          .select("*")
          .eq("trip_id", pin)
          .order("created_at", { ascending: false }),
      ]);
      if (!alive) return;
      setTripRows((tripsRes.data ?? []) as TripRow[]);
      setRows((expensesRes.data ?? []) as ExpenseRow[]);
      setActiveTripIdState(pin);
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [pin]);

  // realtime sync, filtered by PIN
  useEffect(() => {
    if (!pin) return;
    const channel = supabase
      .channel(`voyage-sync-${pin}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "expenses", filter: `trip_id=eq.${pin}` },
        (payload) => {
          setRows((prev) => {
            if (payload.eventType === "DELETE") {
              const old = payload.old as { id?: string };
              return prev.filter((r) => r.id !== old.id);
            }
            const row = payload.new as ExpenseRow;
            if (row.trip_id !== pin) return prev;
            const rest = prev.filter((r) => r.id !== row.id);
            return [row, ...rest].sort((a, b) => b.created_at.localeCompare(a.created_at));
          });
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "trips", filter: `id=eq.${pin}` },
        (payload) => {
          setTripRows((prev) => {
            if (payload.eventType === "DELETE") {
              const old = payload.old as { id?: string };
              return prev.filter((r) => r.id !== old.id);
            }
            const row = payload.new as TripRow;
            return [row, ...prev.filter((r) => r.id !== row.id)];
          });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [pin]);

  const setActiveTripId = (id: string) => {
    setActiveTripIdState(id);
  };

  const value = useMemo<Ctx>(() => {
    const trips = tripRows.map(mapTrip);
    const expensesAll: Expense[] = rows.map((r) => {
      const currency = asCurrency(r.currency);
      const amount = Number(r.amount) || 0;
      return {
        id: r.id,
        tripId: r.trip_id,
        amount,
        currency,
        amountGel: toGel(amount, currency, rates),
        category: asCategory(r.category),
        note: r.title ?? "",
        createdAt: new Date(r.created_at).getTime(),
      };
    });

    const activeTrip = trips.find((tr) => tr.id === activeTripId) ?? null;
    const tripExpenses = activeTrip ? expensesAll.filter((e) => e.tripId === activeTrip.id) : [];
    const sum = (list: Expense[]) =>
      Math.round(list.reduce((s, e) => s + e.amountGel, 0) * 100) / 100;

    const byCategory = CATEGORIES.map((c) => ({
      id: c.id,
      color: c.color,
      value: sum(tripExpenses.filter((e) => e.category === c.id)),
    })).filter((c) => c.value > 0);

    return {
      loading,
      trips,
      activeTrip,
      activeTripId,
      setActiveTripId,
      addTrip: async (t) => {
        if (!pin) return;
        const { data, error } = await supabase
          .from("trips")
          .upsert({ id: pin, name: t.name, start_date: t.startDate, end_date: t.endDate })
          .select("*")
          .single();
        if (error) throw error;
        const row = data as TripRow;
        setTripRows([row]);
        setActiveTripIdState(pin);
      },
      removeTrip: async (id) => {
        if (!pin || id !== pin) return;
        const { error: expensesError } = await supabase
          .from("expenses")
          .delete()
          .eq("trip_id", pin);
        if (expensesError) throw expensesError;
        const { error } = await supabase.from("trips").delete().eq("id", pin);
        if (error) throw error;
        setTripRows([]);
        setRows([]);
      },
      expenses: tripExpenses,
      allExpenses: expensesAll,
      totalGel: sum(tripExpenses),
      byCategory,
      tripTotal: (tripId) => sum(expensesAll.filter((e) => e.tripId === tripId)),
      tripCount: (tripId) => expensesAll.filter((e) => e.tripId === tripId).length,
      addExpense: async (e) => {
        if (!pin) return;
        const { data, error } = await supabase
          .from("expenses")
          .insert({
            trip_id: pin,
            title: e.note ?? "",
            amount: e.amount,
            currency: e.currency,
            category: e.category,
          })
          .select("*")
          .single();
        if (error) throw error;
        const row = data as ExpenseRow;
        setRows((prev) => [row, ...prev.filter((r) => r.id !== row.id)]);
      },
      removeExpense: async (id) => {
        if (!pin) return;
        setRows((prev) => prev.filter((r) => r.id !== id));
        const { error } = await supabase
          .from("expenses")
          .delete()
          .eq("id", id)
          .eq("trip_id", pin);
        if (error) throw error;
      },
      clearAll: async () => {
        if (!pin) return;
        setRows([]);
        const { error } = await supabase.from("expenses").delete().eq("trip_id", pin);
        if (error) throw error;
      },
    };
  }, [rows, tripRows, activeTripId, loading, rates, pin]);

  return <ExpensesContext.Provider value={value}>{children}</ExpensesContext.Provider>;
}

export function useExpenses() {
  const ctx = useContext(ExpensesContext);
  if (!ctx) throw new Error("useExpenses must be used within ExpensesProvider");
  return ctx;
}
