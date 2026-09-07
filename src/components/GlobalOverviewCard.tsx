import { Wallet } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatGel, useExpenses } from "@/lib/expenses";
import { useI18n } from "@/lib/i18n";

export function GlobalOverviewCard() {
  const { t } = useI18n();
  const { allExpenses, categories, loading } = useExpenses();

  if (loading) {
    return (
      <section className="ios-card space-y-4 p-5">
        <div className="space-y-2">
          <Skeleton className="h-3 w-28 rounded-full" />
          <Skeleton className="h-9 w-40 rounded-xl" />
        </div>
        <Skeleton className="h-3 w-full rounded-full" />
        <div className="flex justify-between">
          <Skeleton className="h-3 w-20 rounded-full" />
          <Skeleton className="h-3 w-24 rounded-full" />
        </div>
      </section>
    );
  }

  const byCategory = categories
    .map((category) => ({
      ...category,
      value: allExpenses
        .filter((expense) => expense.category === category.id)
        .reduce((sum, expense) => sum + expense.amountGel, 0),
    }))
    .filter((category) => category.value > 0)
    .sort((a, b) => b.value - a.value);
  const total = byCategory.reduce((sum, category) => sum + category.value, 0);

  return (
    <section className="ios-card space-y-4 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Wallet className="size-3.5" />
            {t("globalOverview")}
          </p>
          <p className="tabular mt-1 text-[34px] font-extrabold leading-none tracking-tight">
            {formatGel(total)}
          </p>
          <p className="mt-2 text-xs font-medium text-muted-foreground">{t("globalAcrossTrips")}</p>
        </div>
        <span className="tabular rounded-full bg-accent px-2.5 py-1 text-xs font-extrabold text-accent-foreground">
          {allExpenses.length} {t("expenses")}
        </span>
      </div>

      <div
        role="img"
        aria-label={t("byCategory")}
        className="flex h-3 overflow-hidden rounded-full bg-secondary"
      >
        {byCategory.map((category) => (
          <span
            key={category.id}
            className="h-full first:rounded-l-full last:rounded-r-full"
            style={{ width: `${(category.value / total) * 100}%`, backgroundColor: category.color }}
          />
        ))}
      </div>

      {byCategory.length > 0 ? (
        <ul className="flex flex-wrap gap-x-4 gap-y-2 border-t border-border pt-4">
          {byCategory.slice(0, 6).map((category) => (
            <li key={category.id} className="flex items-center gap-2 text-xs font-semibold">
              <span
                className="size-2.5 rounded-full"
                style={{ backgroundColor: category.color }}
                aria-hidden
              />
              {category.key ? t(category.key) : (category.name ?? t("cat_other"))}
              <span className="tabular text-muted-foreground">{formatGel(category.value)}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs font-medium text-muted-foreground">{t("noData")}</p>
      )}
    </section>
  );
}
