import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useSession } from "@/lib/session";

export type Currency = "GEL" | "USD" | "EUR";

export type Rates = Record<Currency, number>;

/** Fallback exchange rates -> GEL (used until the user overrides them) */
export const DEFAULT_RATES: Rates = {
  GEL: 1,
  USD: 2.7,
  EUR: 2.95,
};

export const CURRENCY_SYMBOL: Record<Currency, string> = {
  GEL: "₾",
  USD: "$",
  EUR: "€",
};

const RATES_KEY = "customRates";
const RATES_UPDATED_KEY = "customRatesUpdatedAt";

type Ctx = {
  rates: Rates;
  /** ISO timestamp of the last rates change, or null if never saved */
  updatedAt: string | null;
  setRate: (currency: Extract<Currency, "USD" | "EUR">, value: number) => void;
  resetRates: () => void;
};

const RatesContext = createContext<Ctx>({
  rates: DEFAULT_RATES,
  updatedAt: null,
  setRate: () => {},
  resetRates: () => {},
});

export function RatesProvider({ children }: { children: ReactNode }) {
  const { user } = useSession();
  const storageKey = user ? `${RATES_KEY}:${user.id}` : null;
  const updatedKey = user ? `${RATES_UPDATED_KEY}:${user.id}` : null;
  const [rates, setRates] = useState<Rates>(DEFAULT_RATES);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setRates(DEFAULT_RATES);
    setUpdatedAt(null);
    if (!storageKey || !updatedKey) {
      setHydrated(true);
      return;
    }
    setHydrated(false);
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<Rates>;
        setRates({
          GEL: 1,
          USD: Number(saved.USD) > 0 ? Number(saved.USD) : DEFAULT_RATES.USD,
          EUR: Number(saved.EUR) > 0 ? Number(saved.EUR) : DEFAULT_RATES.EUR,
        });
      }
      setUpdatedAt(window.localStorage.getItem(updatedKey));
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, [storageKey, updatedKey]);

  useEffect(() => {
    if (!hydrated) return;
    if (storageKey) window.localStorage.setItem(storageKey, JSON.stringify(rates));
  }, [rates, hydrated, storageKey]);

  useEffect(() => {
    if (!hydrated) return;
    if (!updatedKey) return;
    if (updatedAt) window.localStorage.setItem(updatedKey, updatedAt);
    else window.localStorage.removeItem(updatedKey);
  }, [updatedAt, hydrated, updatedKey]);

  const touch = () => setUpdatedAt(new Date().toISOString());

  const value = useMemo<Ctx>(
    () => ({
      rates,
      updatedAt,
      setRate: (currency, v) => {
        setRates((prev) => ({ ...prev, [currency]: v > 0 ? v : DEFAULT_RATES[currency] }));
        touch();
      },
      resetRates: () => {
        setRates(DEFAULT_RATES);
        setUpdatedAt(null);
      },
    }),
    [rates, updatedAt],
  );

  return <RatesContext.Provider value={value}>{children}</RatesContext.Provider>;
}

export const useRates = () => useContext(RatesContext);
