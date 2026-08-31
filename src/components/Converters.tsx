import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { CURRENCY_SYMBOL, useRates, type Currency } from "@/lib/rates";
import { useI18n } from "@/lib/i18n";
import { Input } from "@/components/ui/input";

function CompactConverter({ from }: { from: Extract<Currency, "EUR" | "USD"> }) {
  const { rates } = useRates();
  const [value, setValue] = useState("100");
  const num = Number(value.replace(",", ".")) || 0;
  const gel = num * rates[from];

  return (
    <div className="flex-1 bg-white border border-slate-100 shadow-sm rounded-2xl p-2.5">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] font-bold text-muted-foreground uppercase">
          {from} → GEL
        </span>
        <span className="text-[10px] font-medium text-muted-foreground">
          1={rates[from].toFixed(2)}₾
        </span>
      </div>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <span className="text-xs font-bold text-muted-foreground">{CURRENCY_SYMBOL[from]}</span>
          <Input
            inputMode="decimal"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            aria-label={`${from} amount`}
            className="tabular h-7 w-14 rounded-lg border-0 bg-secondary px-1.5 text-xs font-bold focus-visible:ring-1"
          />
        </div>
        <div className="flex items-center gap-1 text-xs font-extrabold text-primary">
          <ArrowRight className="size-3 text-muted-foreground" />
          <span>{gel.toFixed(2)} ₾</span>
        </div>
      </div>
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
      <div className="flex gap-2">
        <CompactConverter from="EUR" />
        <CompactConverter from="USD" />
      </div>
    </section>
  );
}
