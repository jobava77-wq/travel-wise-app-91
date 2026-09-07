import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useSession } from "@/lib/session";
import { fetchNbgRates } from "./rates.functions";

export type Currency = "GEL" | "USD" | "EUR";

export type Rates = Record<Currency, number>;

const EMPTY_RATES: Rates = { GEL: 1, USD: 0, EUR: 0 };

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
  rates: EMPTY_RATES,
  updatedAt: null,
  setRate: () => {},
  resetRates: () => {},
});

export function RatesProvider({ children }: { children: ReactNode }) {
  const { user } = useSession();
  const fetchLiveRates = useServerFn(fetchNbgRates);
  const storageKey = user ? `${RATES_KEY}:${user.id}` : null;
  const updatedKey = user ? `${RATES_UPDATED_KEY}:${user.id}` : null;
  const [rates, setRates] = useState<Rates>(EMPTY_RATES);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setRates(EMPTY_RATES);
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
          USD: Number(saved.USD) > 0 ? Number(saved.USD) : 0,
          EUR: Number(saved.EUR) > 0 ? Number(saved.EUR) : 0,
        });
      }
      setUpdatedAt(window.localStorage.getItem(updatedKey));
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, [storageKey, updatedKey]);

  useEffect(() => {
    if (!user) return;
    let alive = true;
    void fetchLiveRates()
      .then((live) => {
        if (alive) setRates((prev) => ({ ...prev, ...live }));
      })
      .catch(() => {
        // Keep user-saved rates when the official source is unavailable.
      });
    return () => {
      alive = false;
    };
  }, [fetchLiveRates, user]);

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
        if (v > 0) setRates((prev) => ({ ...prev, [currency]: v }));
        touch();
      },
      resetRates: () => {
        setRates(EMPTY_RATES);
        setUpdatedAt(null);
      },
    }),
    [rates, updatedAt],
  );

  return <RatesContext.Provider value={value}>{children}</RatesContext.Provider>;
}

export const useRates = () => useContext(RatesContext);
