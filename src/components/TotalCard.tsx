import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useExpenses, formatGel, categoryById } from "@/lib/expenses";
import { useI18n } from "@/lib/i18n";

export function TotalCard() {
  const { t } = useI18n();
  const { totalGel, byCategory } = useExpenses();
  const isEmpty = byCategory.length === 0;
  const data = isEmpty ? [{ id: "empty", value: 1, color: "var(--muted)" }] : byCategory;

  return (
    <section className="ios-card p-5">
      <div className="flex items-center gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t("totalSpent")}
          </p>
          <p className="tabular mt-1 text-[34px] font-extrabold leading-none tracking-tight">
            {formatGel(totalGel)}
          </p>
          <p className="mt-2 text-xs font-medium text-muted-foreground">
            {isEmpty ? t("noData") : t("byCategory")}
          </p>
        </div>
        <div className="size-[104px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                innerRadius={30}
                outerRadius={50}
                paddingAngle={isEmpty ? 0 : 2}
                stroke="none"
                isAnimationActive={!isEmpty}
              >
                {data.map((d) => (
                  <Cell key={d.id} fill={d.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {!isEmpty && (
        <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-border pt-4">
          {byCategory.map((c) => (
            <li key={c.id} className="flex items-center gap-2 text-xs font-semibold">
              <span
                className="size-2.5 rounded-full"
                style={{ backgroundColor: c.color }}
                aria-hidden
              />
              {t(categoryById(c.id).key)}
              <span className="tabular text-muted-foreground">{formatGel(c.value)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
