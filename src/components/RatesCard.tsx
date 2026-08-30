import { useEffect, useState } from "react";
import { RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { DEFAULT_RATES, useRates } from "@/lib/rates";

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
  const { rates, resetRates } = useRates();
  const custom = rates.EUR !== DEFAULT_RATES.EUR || rates.USD !== DEFAULT_RATES.USD;

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
      {custom && (
        <Button
          variant="secondary"
          className="mt-4 h-10 w-full rounded-2xl text-xs font-bold"
          onClick={resetRates}
        >
          <RotateCcw className="size-3.5" />
          {t("resetRates")}
        </Button>
      )}
    </section>
  );
}
