import { Receipt, X } from "lucide-react";
import { useExpenses, categoryById, formatGel, CURRENCY_SYMBOL } from "@/lib/expenses";
import { useI18n } from "@/lib/i18n";

export function ExpenseList() {
  const { t, lang } = useI18n();
  const { expenses, removeExpense } = useExpenses();

  return (
    <section>
      <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {t("expenses")}
      </h2>

      {expenses.length === 0 ? (
        <div className="ios-card flex flex-col items-center gap-2 px-6 py-10 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-secondary">
            <Receipt className="size-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-bold">{t("noData")}</p>
          <p className="text-xs text-muted-foreground">{t("emptyList")}</p>
        </div>
      ) : (
        <ul className="ios-card divide-y divide-border overflow-hidden">
          {expenses.map((e) => {
            const cat = categoryById(e.category);
            const Icon = cat.icon;
            return (
              <li key={e.id} className="flex items-center gap-3 px-4 py-3">
                <div
                  className="flex size-10 shrink-0 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `color-mix(in oklab, ${cat.color} 16%, transparent)` }}
                >
                  <Icon className="size-5" style={{ color: cat.color }} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{t(cat.key)}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {e.note ||
                      new Date(e.createdAt).toLocaleDateString(lang === "ka" ? "ka-GE" : "en-US", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="tabular text-sm font-extrabold">{formatGel(e.amountGel)}</p>
                  {e.currency !== "GEL" && (
                    <p className="tabular text-[11px] text-muted-foreground">
                      {CURRENCY_SYMBOL[e.currency]}
                      {e.amount.toFixed(2)}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => removeExpense(e.id)}
                  aria-label="Remove expense"
                  className="ml-1 flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-destructive"
                >
                  <X className="size-4" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
