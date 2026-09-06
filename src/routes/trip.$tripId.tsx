import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { Download, MapPinOff } from "lucide-react";
import { toast } from "sonner";
import { AppHeader } from "@/components/AppHeader";
import { TripHeaderCard } from "@/components/TripHeaderCard";
import { TotalCard } from "@/components/TotalCard";
import { BudgetCard } from "@/components/BudgetCard";
import { Converters } from "@/components/Converters";
import { ExpenseList } from "@/components/ExpenseList";
import { AddExpenseFab } from "@/components/AddExpenseSheet";
import { ExpenseMapLazy } from "@/components/MapLazy";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useI18n } from "@/lib/i18n";
import { CURRENCY_SYMBOL, useExpenses } from "@/lib/expenses";
import { downloadTripCsv } from "@/lib/csv";

export const Route = createFileRoute("/trip/$tripId")({
  head: () => ({
    meta: [
      { title: "Trip Expenses — Voyage Travel Expense Tracker" },
      {
        name: "description",
        content:
          "Track this trip's expenses in GEL, USD and EUR with instant conversion, category charts, a map view and a bilingual EN/KA interface.",
      },
      { property: "og:title", content: "Trip Expenses — Voyage Travel Expense Tracker" },
      {
        property: "og:description",
        content: "Log and convert this trip's expenses to Georgian lari with category and map insights.",
      },
    ],
  }),
  component: TripDetail,
});

function TripDetail() {
  const { tripId } = Route.useParams();
  const { t } = useI18n();
  const { setActiveTripId, activeTrip, expenses } = useExpenses();

  useEffect(() => {
    setActiveTripId(tripId);
  }, [tripId, setActiveTripId]);

  const geoExpenses = useMemo(
    () => expenses.filter((e) => e.lat != null && e.lng != null),
    [expenses],
  );

  const mapCenter = useMemo<[number, number]>(() => {
    if (geoExpenses.length > 0) {
      const lat = geoExpenses.reduce((s, e) => s + (e.lat as number), 0) / geoExpenses.length;
      const lng = geoExpenses.reduce((s, e) => s + (e.lng as number), 0) / geoExpenses.length;
      return [lat, lng];
    }
    if (activeTrip?.lat != null && activeTrip.lng != null) return [activeTrip.lat, activeTrip.lng];
    return [41.7151, 44.8271];
  }, [geoExpenses, activeTrip]);

  const exportCsv = () => {
    if (!activeTrip || expenses.length === 0) return;
    downloadTripCsv(activeTrip, expenses);
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

        <Tabs defaultValue="list">
          <TabsList className="h-11 w-full rounded-2xl bg-secondary p-1">
            <TabsTrigger value="list" className="flex-1 rounded-xl text-xs font-bold">
              {t("listView")}
            </TabsTrigger>
            <TabsTrigger value="map" className="flex-1 rounded-xl text-xs font-bold">
              {t("mapView")}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="list" className="mt-4">
            <ExpenseList />
          </TabsContent>
          <TabsContent value="map" className="mt-4">
            {geoExpenses.length === 0 ? (
              <div className="ios-card flex flex-col items-center gap-2 px-6 py-10 text-center">
                <div className="flex size-12 items-center justify-center rounded-full bg-secondary">
                  <MapPinOff className="size-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-bold">{t("noGeoExpenses")}</p>
                <p className="text-xs text-muted-foreground">{t("saveLocation")}</p>
              </div>
            ) : (
              <ExpenseMapLazy points={geoExpenses} center={mapCenter} />
            )}
          </TabsContent>
        </Tabs>
      </main>
      <AddExpenseFab />
      <span className="sr-only">{CURRENCY_SYMBOL.GEL}</span>
    </>
  );
}
