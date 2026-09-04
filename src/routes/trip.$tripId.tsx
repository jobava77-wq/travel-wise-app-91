import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { AppHeader } from "@/components/AppHeader";
import { TripHeaderCard } from "@/components/TripHeaderCard";
import { TotalCard } from "@/components/TotalCard";
import { BudgetCard } from "@/components/BudgetCard";
import { Converters } from "@/components/Converters";
import { ExpenseList } from "@/components/ExpenseList";
import { AddExpenseFab } from "@/components/AddExpenseSheet";
import { useI18n } from "@/lib/i18n";
import { CURRENCY_SYMBOL, useExpenses } from "@/lib/expenses";

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
  const { setActiveTripId, activeTrip, expenses, tripTotal } = useExpenses();

  useEffect(() => {
    setActiveTripId(tripId);
  }, [tripId, setActiveTripId]);

  const exportCsv = () => {
    if (!activeTrip || expenses.length === 0) return;
    const esc = (v: string) => `"${v.replaceAll('"', '""')}"`;
    const header = ["date", "category", "note", "amount", "currency", "amount_gel"];
    const lines = expenses.map((e) =>
      [
        new Date(e.createdAt).toISOString(),
        e.category,
        esc(e.note ?? ""),
        String(e.amount),
        e.currency,
        e.amountGel.toFixed(2),
      ].join(","),
    );
    lines.push(["", "TOTAL", "", "", "", tripTotal(activeTrip.id).toFixed(2)].join(","));
    const csv = [header.join(","), ...lines].join("\r\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeTrip.name.replace(/[^\p{L}\p{N}]+/gu, "-").replace(/(^-|-$)/g, "") || "trip"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(t("exported"));
  };

  return (
    <>
      <AppHeader
        title={t("appName")}
        back
        right={
          <button
            aria-label={t("exportCsv")}
            onClick={exportCsv}
            disabled={!activeTrip || expenses.length === 0}
            className="flex size-8 items-center justify-center rounded-full bg-secondary text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
          >
            <Download className="size-4" />
          </button>
        }
      />
      <main className="mx-auto w-full max-w-md space-y-5 px-4 pb-40 pt-4">
        <TripHeaderCard />
        <TotalCard />
        <BudgetCard />
        <Converters />
        <ExpenseList />
      </main>
      <AddExpenseFab />
      <span className="sr-only">{CURRENCY_SYMBOL.GEL}</span>
    </>
  );
}
