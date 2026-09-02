import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, LogOut, Map, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { CreateTripSheet } from "@/components/CreateTripSheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useI18n } from "@/lib/i18n";
import { useSession } from "@/lib/session";
import { formatGel, formatTripPeriod, useExpenses } from "@/lib/expenses";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "My Trips — Voyage Travel Expense Tracker" },
      {
        name: "description",
        content:
          "See all of your trips in one dashboard with dates and total spend in Georgian lari, then open a trip to track its expenses.",
      },
      { property: "og:title", content: "My Trips — Voyage Travel Expense Tracker" },
      {
        property: "og:description",
        content: "All of your trips with dates and total spend in GEL, in one bilingual dashboard.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { t, lang } = useI18n();
  const { username, signOut } = useSession();
  const { trips, loading, tripTotal, tripCount, removeTrip } = useExpenses();

  return (
    <>
      <AppHeader
        title={t("dashboard")}
        right={
          <button
            aria-label={t("logOut")}
            onClick={() => {
              signOut();
              toast.success(t("loggedOut"));
            }}
            className="flex size-8 items-center justify-center rounded-full bg-secondary text-muted-foreground transition-colors hover:text-destructive"
          >
            <LogOut className="size-4" />
          </button>
        }
      />
      <main className="mx-auto w-full max-w-md space-y-4 px-4 pb-32 pt-4">
        {username && (
          <p className="px-1 text-sm font-semibold text-muted-foreground">
            {t("helloUser")}, <span className="font-extrabold text-foreground">{username}</span>
          </p>
        )}

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
            {trips.map((trip) => (
              <li key={trip.id} className="ios-card p-4">
                <div className="flex min-w-0 items-center gap-2">
                  <Link
                    to="/trip/$tripId"
                    params={{ tripId: trip.id }}
                    aria-label={t("openTrip")}
                    className="min-w-0 flex-1 text-left"
                  >
                    <p className="truncate text-base font-extrabold tracking-tight">{trip.name}</p>
                    <p className="tabular truncate text-xs font-semibold text-muted-foreground">
                      {formatTripPeriod(trip, lang)}
                    </p>
                    <p className="tabular mt-1.5 text-base font-extrabold text-primary">
                      {formatGel(tripTotal(trip.id))}
                      <span className="ml-2 text-xs font-semibold text-muted-foreground">
                        {tripCount(trip.id)} {t("expenses")}
                      </span>
                    </p>
                  </Link>
                  <button
                    onClick={() => {
                      removeTrip(trip.id)
                        .then(() => toast.success(t("tripDeleted")))
                        .catch(() => toast.error(t("syncError")));
                    }}
                    aria-label={t("deleteTrip")}
                    className="shrink-0 rounded-full p-2 text-muted-foreground transition-colors hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </button>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
