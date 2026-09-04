import { useMemo, useState } from "react";
import { Filter, Receipt, X } from "lucide-react";
import { toast } from "sonner";
import {
  useExpenses,
  categoryById,
  formatGel,
  CATEGORIES,
  CURRENCY_SYMBOL,
  type CategoryId,
  type Expense,
} from "@/lib/expenses";
import { useI18n } from "@/lib/i18n";
import { Skeleton } from "@/components/ui/skeleton";
import { ExpenseSheet } from "@/components/AddExpenseSheet";

const dayKey = (ts: number) => {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export function ExpenseList() {
  const { t, lang } = useI18n();
  const { expenses, removeExpense, loading } = useExpenses();
  const [categoryFilter, setCategoryFilter] = useState<CategoryId | "all">("all");
  const [editing, setEditing] = useState<Expense | null>(null);

  const locale = lang === "ka" ? "ka-GE" : "en-US";

  const filtered = useMemo(
    () =>
      categoryFilter === "all"
        ? expenses
        : expenses.filter((e) => e.category === categoryFilter),
    [expenses, categoryFilter],
  );

  const groups = useMemo(() => {
    const map = new Map<string, Expense[]>();
    for (const e of filtered) {
      const key = dayKey(e.createdAt);
      const list = map.get(key);
      if (list) list.push(e);
      else map.set(key, [e]);
    }
    return [...map.entries()]
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([key, list]) => ({
        key,
        label: new Date(list[0]!.createdAt).toLocaleDateString(locale, {
          weekday: "short",
          day: "numeric",
          month: "short",
        }),
        subtotal: list.reduce((s, e) => s + e.amountGel, 0),
        list,
      }));
  }, [filtered, locale]);

  const usedCategories = useMemo(
    () => [...new Set(expenses.map((e) => e.category))],
    [expenses],
  );

  return (
    <section>
      <div className="mb-2 flex items-center justify-between px-1">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t("expenses")}
        </h2>
        {usedCategories.length > 1 && (
          <div className="flex items-center gap-1.5">
            <Filter className="size-3.5 text-muted-foreground" aria-hidden />
            <select
              aria-label={t("filter")}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as CategoryId | "all")}
              className="h-7 rounded-full border-0 bg-secondary px-2.5 text-xs font-bold text-foreground"
            >
              <option value="all">{t("allCategories")}</option>
              {usedCategories.map((id) => (
                <option key={id} value={id}>
                  {t(categoryById(id).key)}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {loading ? (
        <ul className="ios-card divide-y divide-border overflow-hidden">
          {[0, 1, 2].map((i) => (
            <li key={i} className="flex items-center gap-3 px-4 py-3">
              <Skeleton className="size-10 shrink-0 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-24 rounded-full" />
                <Skeleton className="h-2.5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-4 w-16 rounded-full" />
            </li>
          ))}
        </ul>
      ) : expenses.length === 0 ? (
        <div className="ios-card flex flex-col items-center gap-2 px-6 py-10 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-secondary">
            <Receipt className="size-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-bold">{t("noData")}</p>
          <p className="text-xs text-muted-foreground">{t("emptyList")}</p>
        </div>
      ) : groups.length === 0 ? (
        <div className="ios-card px-6 py-8 text-center">
          <p className="text-sm font-bold">{t("noData")}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map((group) => (
            <div key={group.key}>
              <div className="mb-1.5 flex items-center justify-between px-1">
                <p className="text-xs font-bold text-muted-foreground">{group.label}</p>
                <p className="tabular text-xs font-bold text-muted-foreground">
                  {formatGel(group.subtotal)}
                </p>
              </div>
              <ul className="ios-card divide-y divide-border overflow-hidden">
                {group.list.map((e) => {
                  const cat = categoryById(e.category);
                  const Icon = cat.icon;
                  return (
                    <li key={e.id} className="flex items-center gap-3 px-4 py-3">
                      <button
                        onClick={() => setEditing(e)}
                        aria-label={t("editExpense")}
                        className="flex min-w-0 flex-1 items-center gap-3 text-left"
                      >
                        <div
                          className="flex size-10 shrink-0 items-center justify-center rounded-xl"
                          style={{
                            backgroundColor: `color-mix(in oklab, ${cat.color} 16%, transparent)`,
                          }}
                        >
                          <Icon className="size-5" style={{ color: cat.color }} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold">{t(cat.key)}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {e.note ||
                              new Date(e.createdAt).toLocaleTimeString(locale, {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="tabular text-sm font-extrabold">
                            {formatGel(e.amountGel)}
                          </p>
                          {e.currency !== "GEL" && (
                            <p className="tabular text-[11px] text-muted-foreground">
                              {CURRENCY_SYMBOL[e.currency]}
                              {e.amount.toFixed(2)}
                            </p>
                          )}
                        </div>
                      </button>
                      <button
                        onClick={() => {
                          removeExpense(e.id).catch(() => toast.error(t("syncError")));
                        }}
                        aria-label="Remove expense"
                        className="ml-1 flex size-7 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-destructive"
                      >
                        <X className="size-4" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}

      <ExpenseSheet
        expense={editing}
        open={editing != null}
        onOpenChange={(o) => {
          if (!o) setEditing(null);
        }}
      />
    </section>
  );
}

// re-export so existing imports keep working
export { CATEGORIES };
