import { createFileRoute } from "@tanstack/react-router";
import { Map } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { useI18n } from "@/lib/i18n";
import { useExpenses, formatGel } from "@/lib/expenses";

export const Route = createFileRoute("/trips")({
  head: () => ({
    meta: [
      { title: "My Trips — Voyage Expense Tracker" },
      {
        name: "description",
        content: "Review your trips and see how much each journey cost in Georgian lari.",
      },
      { property: "og:title", content: "My Trips — Voyage Expense Tracker" },
      {
        property: "og:description",
        content: "Review your trips and see how much each journey cost in Georgian lari.",
      },
    ],
  }),
  component: Trips,
});

function Trips() {
  const { t } = useI18n();
  const { expenses, totalGel } = useExpenses();

  return (
    <>
      <AppHeader title={t("trips")} />
      <main className="mx-auto w-full max-w-md space-y-4 px-4 pb-32 pt-4">
        {expenses.length === 0 ? (
          <div className="ios-card flex flex-col items-center gap-2 px-6 py-12 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-secondary">
              <Map className="size-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-bold">{t("noTrips")}</p>
            <p className="text-xs text-muted-foreground">{t("tripsHint")}</p>
          </div>
        ) : (
          <div className="ios-card p-5">
            <p className="text-sm font-bold">{t("appName")}</p>
            <p className="tabular mt-1 text-2xl font-extrabold">{formatGel(totalGel)}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {expenses.length} {t("expenses")}
            </p>
          </div>
        )}
      </main>
    </>
  );
}
