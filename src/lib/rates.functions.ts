import { createServerFn } from "@tanstack/react-start";

type NbgRow = { code?: string; rate?: number; quantity?: number };

/** Fetches today's official GEL rates from the National Bank of Georgia. */
export const fetchNbgRates = createServerFn({ method: "GET" }).handler(async () => {
  const res = await fetch(
    "https://nbg.gov.ge/gw/api/ct/monetarypolicy/currencies/en/json",
    { headers: { Accept: "application/json" } },
  );
  if (!res.ok) throw new Error(`NBG responded ${res.status}`);
  const json = (await res.json()) as { currencies?: NbgRow[] }[] | { currencies?: NbgRow[] };
  const currencies = Array.isArray(json) ? (json[0]?.currencies ?? []) : (json.currencies ?? []);
  const find = (code: string) => {
    const row = currencies.find((c) => c.code === code);
    if (!row || !row.rate) return null;
    const qty = row.quantity && row.quantity > 0 ? row.quantity : 1;
    return Math.round((row.rate / qty) * 10000) / 10000;
  };
  const USD = find("USD");
  const EUR = find("EUR");
  if (USD == null || EUR == null) throw new Error("Rates not found in NBG response");
  return { USD, EUR };
});
