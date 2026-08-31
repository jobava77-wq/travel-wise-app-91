import { createFileRoute } from "@tanstack/react-router";
import { Check, Map, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { CreateTripSheet } from "@/components/CreateTripSheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useI18n } from "@/lib/i18n";
import { formatGel, formatTripPeriod, useExpenses } from "@/lib/expenses";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/trips")({
  head: () => ({
    meta: [
      { title: "My Trips — Voyage Expense Tracker" },
      {
        name: "description",
        content:
          "Create separate trips with dates and switch the active journey to track its expenses in Georgian lari.",
      },
      { property: "og:title", content: "My Trips — Voyage Expense Tracker" },
      {
        property: "og:description",
        content: "Create trips with dates and see how much each journey cost in Georgian lari.",
      },
    ],
  }),
  component: Trips,
});

function Trips() {
  const { t, lang } = useI18n();
  const { trips, activeTripId, setActiveTripId, removeTrip, tripTotal, tripCount, loading } =
    useExpenses();

  return (
    <>
      <AppHeader title={t("trips")} />
      <main className="mx-auto w-full max-w-md space-y-4 px-4 pb-32 pt-4">
        <CreateTripSheet
          trigger={
            <Button className="h-12 w-full rounded-2xl font-bold">
              <Plus className="size-4" strokeWidth={2.6} />
              {t("newTrip")}
            </Button>
          }
        />

        {loading ? (
          <ul className="space-y-3">
            {[0, 1].map((i) => (
              <li key={i} className="ios-card space-y-2 p-4">
                <Skeleton className="h-4 w-40 rounded-lg" />
                <Skeleton className="h-3 w-28 rounded-full" />
                <Skeleton className="h-4 w-24 rounded-lg" />
              </li>
            ))}
          </ul>
        ) : trips.length === 0 ? (
          <div className="ios-card flex flex-col items-center gap-2 px-6 py-12 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-secondary">
              <Map className="size-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-bold">{t("noTrips")}</p>
            <p className="text-xs text-muted-foreground">{t("tripsHint")}</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {trips.map((trip) => {
              const active = trip.id === activeTripId;
              return (
                <li
                  key={trip.id}
                  className={cn("ios-card p-4", active && "ring-2 ring-primary")}
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <button
                      onClick={() => setActiveTripId(trip.id)}
                      aria-pressed={active}
                      aria-label={t("setActive")}
                      className={cn(
                        "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                        active ? "border-primary bg-primary" : "border-border",
                      )}
                    >
                      {active && (
                        <Check className="size-3.5 text-primary-foreground" strokeWidth={3} />
                      )}
                    </button>
                    <button
                      onClick={() => setActiveTripId(trip.id)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <p className="truncate text-sm font-extrabold">{trip.name}</p>
                      <p className="tabular truncate text-xs font-semibold text-muted-foreground">
                        {formatTripPeriod(trip, lang)}
                      </p>
                      <p className="tabular mt-1.5 text-base font-extrabold text-primary">
                        {formatGel(tripTotal(trip.id))}
                        <span className="ml-2 text-xs font-semibold text-muted-foreground">
                          {tripCount(trip.id)} {t("expenses")}
                        </span>
                      </p>
                    </button>
                    <button
                      onClick={() => {
                        removeTrip(trip.id);
                        toast.success(t("tripDeleted"));
                      }}
                      aria-label={t("deleteTrip")}
                      className="shrink-0 rounded-full p-2 text-muted-foreground transition-colors hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                  {active && (
                    <p className="mt-3 border-t border-border pt-2 text-[11px] font-bold uppercase tracking-wider text-primary">
                      {t("activeTrip")}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </>
  );
}
