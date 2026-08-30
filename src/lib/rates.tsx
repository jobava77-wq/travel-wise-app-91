import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

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

type Ctx = {
  rates: Rates;
  setRate: (currency: Extract<Currency, "USD" | "EUR">, value: number) => void;
  resetRates: () => void;
};

const RatesContext = createContext<Ctx>({
  rates: DEFAULT_RATES,
  setRate: () => {},
  resetRates: () => {},
});

export function RatesProvider({ children }: { children: ReactNode }) {
  const [rates, setRates] = useState<Rates>(DEFAULT_RATES);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(RATES_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<Rates>;
        setRates({
          GEL: 1,
          USD: Number(saved.USD) > 0 ? Number(saved.USD) : DEFAULT_RATES.USD,
          EUR: Number(saved.EUR) > 0 ? Number(saved.EUR) : DEFAULT_RATES.EUR,
        });
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(RATES_KEY, JSON.stringify(rates));
  }, [rates, hydrated]);

  const value = useMemo<Ctx>(
    () => ({
      rates,
      setRate: (currency, v) =>
        setRates((prev) => ({ ...prev, [currency]: v > 0 ? v : DEFAULT_RATES[currency] })),
      resetRates: () => setRates(DEFAULT_RATES),
    }),
    [rates],
  );

  return <RatesContext.Provider value={value}>{children}</RatesContext.Provider>;
}

export const useRates = () => useContext(RatesContext);
