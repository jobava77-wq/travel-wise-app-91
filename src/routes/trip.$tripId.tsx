import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppHeader } from "@/components/AppHeader";
import { TripHeaderCard } from "@/components/TripHeaderCard";
import { TotalCard } from "@/components/TotalCard";
import { Converters } from "@/components/Converters";
import { ExpenseList } from "@/components/ExpenseList";
import { AddExpenseFab } from "@/components/AddExpenseSheet";
import { useI18n } from "@/lib/i18n";
import { useExpenses } from "@/lib/expenses";

export const Route = createFileRoute("/trip/$tripId")({
  head: () => ({
    meta: [
      { title: "Trip Expenses — Voyage Travel Expense Tracker" },
      {
        name: "description",
        content:
          "Track this trip's expenses in GEL, USD and EUR with instant conversion, category charts and a bilingual EN/KA interface.",
      },
      { property: "og:title", content: "Trip Expenses — Voyage Travel Expense Tracker" },
      {
        property: "og:description",
        content: "Log and convert this trip's expenses to Georgian lari with category insights.",
      },
    ],
  }),
  component: TripDetail,
});

function TripDetail() {
  const { tripId } = Route.useParams();
  const { t } = useI18n();
  const { setActiveTripId } = useExpenses();

  useEffect(() => {
    setActiveTripId(tripId);
  }, [tripId, setActiveTripId]);

  return (
    <>
      <AppHeader title={t("appName")} back />
      <main className="mx-auto w-full max-w-md space-y-5 px-4 pb-40 pt-4">
        <TripHeaderCard />
        <TotalCard />
        <Converters />
        <ExpenseList />
      </main>
      <AddExpenseFab />
    </>
  );
}
