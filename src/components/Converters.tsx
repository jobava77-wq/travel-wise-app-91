import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { RATES, type Currency, CURRENCY_SYMBOL } from "@/lib/expenses";
import { useI18n } from "@/lib/i18n";
import { Input } from "@/components/ui/input";

function Converter({ from }: { from: Extract<Currency, "EUR" | "USD"> }) {
  const [value, setValue] = useState("100");
  const num = Number(value.replace(",", ".")) || 0;
  const gel = num * RATES[from];

  return (
    <div className="ios-card flex-1 p-4">
      <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
        <span>{from}</span>
        <ArrowRight className="size-3" />
        <span>GEL</span>
      </div>
      <div className="mt-2 flex items-center gap-1.5">
        <span className="text-lg font-bold text-muted-foreground">{CURRENCY_SYMBOL[from]}</span>
        <Input
          inputMode="decimal"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          aria-label={`${from} amount`}
          className="tabular h-9 rounded-xl border-0 bg-secondary px-2.5 text-base font-bold focus-visible:ring-2"
        />
      </div>
      <p className="tabular mt-2.5 text-lg font-extrabold text-primary">
        {gel.toFixed(2)} ₾
      </p>
      <p className="tabular mt-0.5 text-[11px] font-medium text-muted-foreground">
        1 {from} = {RATES[from].toFixed(2)} ₾
      </p>
    </div>
  );
}

export function Converters() {
  const { t } = useI18n();
  return (
    <section>
      <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {t("converters")}
      </h2>
      <div className="flex gap-3">
        <Converter from="EUR" />
        <Converter from="USD" />
      </div>
    </section>
  );
}
