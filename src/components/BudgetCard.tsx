import { TrendingUp, Wallet } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { formatGel, useExpenses } from "@/lib/expenses";

const DAY_MS = 86_400_000;

export function BudgetCard() {
  const { t } = useI18n();
  const { activeTrip, totalGel, expenses, loading } = useExpenses();

  if (loading || !activeTrip) return null;

  const budget = activeTrip.budget;
  const spent = totalGel;

  // trip day stats
  const start = new Date(activeTrip.startDate).getTime();
  const end = new Date(activeTrip.endDate).getTime();
  const now = Date.now();
  const today = new Date().toISOString().slice(0, 10);
  const elapsedDays = Math.max(
    1,
    Math.min(
      Math.floor((Math.min(now, end) - start) / DAY_MS) + 1,
      Math.floor((end - start) / DAY_MS) + 1,
    ),
  );
  const daysLeft = today > activeTrip.endDate ? 0 : Math.max(0, Math.ceil((end - now) / DAY_MS));
  const dailyAvg = Math.round((spent / elapsedDays) * 100) / 100;

  return (
    <section className="ios-card space-y-4 p-5">
      <div>
        <div className="flex items-center justify-between">
          <p className="flex shrink-0 items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Wallet className="size-3.5" />
            {t("budgetProgress")}
          </p>
          <p className="tabular min-w-0 truncate text-xs font-bold">
            {formatGel(spent)} {budget != null ? `/ ${formatGel(budget)}` : ""}
          </p>
        </div>
        <div
          role="progressbar"
          aria-valuenow={budget == null ? 0 : Math.min(100, (spent / budget) * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
          className={`mt-2 h-2.5 overflow-hidden rounded-full bg-secondary ${budget == null ? "opacity-50" : ""}`}
        >
          <div
            className={`h-full rounded-full transition-all ${
              spent > (budget ?? Infinity) ? "bg-destructive" : "bg-primary"
            }`}
            style={{ width: `${budget == null ? 0 : Math.min(100, (spent / budget) * 100)}%` }}
          />
        </div>
        <p
          className={`tabular mt-1.5 truncate text-xs font-bold ${
            spent > (budget ?? Infinity) ? "text-destructive" : "text-muted-foreground"
          }`}
        >
          {budget == null
            ? t("budgetNotSet")
            : spent > budget
              ? `${t("overBudget")} · ${formatGel(spent - budget)}`
              : `${formatGel(budget - spent)} ${t("budgetLeft")}`}
        </p>
      </div>

      <div className="flex items-center justify-between border-t border-border pt-4">
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <TrendingUp className="size-3.5" />
          {t("dailyAvg")}
        </p>
        <p className="tabular text-sm font-extrabold">
          {formatGel(dailyAvg)}
          {daysLeft > 0 && (
            <span className="ml-2 text-xs font-semibold text-muted-foreground">
              {daysLeft} {t("daysLeft")}
            </span>
          )}
        </p>
      </div>
    </section>
  );
}
