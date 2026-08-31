import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { TripHeaderCard } from "@/components/TripHeaderCard";
import { TotalCard } from "@/components/TotalCard";
import { Converters } from "@/components/Converters";
import { ExpenseList } from "@/components/ExpenseList";
import { AddExpenseFab } from "@/components/AddExpenseSheet";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Voyage — Travel Expense Tracker in GEL" },
      {
        name: "description",
        content:
          "Track travel expenses on the go in GEL, USD and EUR with instant conversion, category charts and a bilingual EN/KA interface.",
      },
      { property: "og:title", content: "Voyage — Travel Expense Tracker in GEL" },
      {
        property: "og:description",
        content:
          "Track travel expenses in GEL, USD and EUR with instant conversion and category insights.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { t } = useI18n();
  return (
    <>
      <AppHeader title={t("appName")} />
      <main className="mx-auto w-full max-w-md space-y-5 px-4 pb-40 pt-4">
        <TotalCard />
        <Converters />
        <ExpenseList />
      </main>
      <AddExpenseFab />
    </>
  );
}
