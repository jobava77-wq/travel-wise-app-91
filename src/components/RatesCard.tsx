import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, RotateCcw, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { DEFAULT_RATES, useRates } from "@/lib/rates";
import { fetchNbgRates } from "@/lib/rates.functions";

function RateInput({ currency }: { currency: "EUR" | "USD" }) {
  const { rates, setRate } = useRates();
  const [text, setText] = useState(String(rates[currency]));

  useEffect(() => {
    setText(String(rates[currency]));
  }, [rates, currency]);

  const commit = (raw: string) => {
    const num = Number(raw.replace(",", "."));
    if (num > 0) setRate(currency, Math.round(num * 10000) / 10000);
    else setText(String(rates[currency]));
  };

  return (
    <div className="flex items-center gap-3">
      <span className="tabular w-16 text-sm font-bold">1 {currency}</span>
      <Input
        inputMode="decimal"
        aria-label={`${currency} to GEL rate`}
        value={text}
        onChange={(e) => setText(e.target.value.replace(/[^0-9.,]/g, ""))}
        onBlur={(e) => commit(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
        }}
        className="tabular h-11 flex-1 rounded-2xl border-0 bg-secondary text-right text-base font-extrabold"
      />
      <span className="w-4 text-base font-bold text-muted-foreground">₾</span>
    </div>
  );
}

export function RatesCard() {
  const { t } = useI18n();
  const { rates, setRate, resetRates } = useRates();
  const fetchLive = useServerFn(fetchNbgRates);
  const [fetching, setFetching] = useState(false);
  const custom = rates.EUR !== DEFAULT_RATES.EUR || rates.USD !== DEFAULT_RATES.USD;

  const useLiveRates = async () => {
    if (fetching) return;
    setFetching(true);
    try {
      const live = await fetchLive();
      setRate("USD", live.USD);
      setRate("EUR", live.EUR);
      toast.success(t("ratesFetched"));
    } catch {
      toast.error(t("ratesFetchFailed"));
    } finally {
      setFetching(false);
    }
  };

  return (
    <section className="ios-card p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {t("rates")}
      </p>
      <p className="mt-1 text-xs font-medium text-muted-foreground">{t("ratesHint")}</p>
      <div className="mt-3 space-y-2.5">
        <RateInput currency="EUR" />
        <RateInput currency="USD" />
      </div>
      <div className="mt-4 flex gap-2">
        <Button
          variant="secondary"
          className="h-10 flex-1 rounded-2xl text-xs font-bold"
          disabled={fetching}
          onClick={() => void useLiveRates()}
        >
          {fetching ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <RefreshCw className="size-3.5" />
          )}
          {t("fetchLiveRates")}
        </Button>
        {custom && (
          <Button
            variant="secondary"
            className="h-10 rounded-2xl px-3 text-xs font-bold"
            onClick={resetRates}
            aria-label={t("resetRates")}
          >
            <RotateCcw className="size-3.5" />
          </Button>
        )}
      </div>
    </section>
  );
}
