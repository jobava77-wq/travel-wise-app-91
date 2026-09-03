import { CalendarDays, MapPin } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useI18n } from "@/lib/i18n";
import { formatTripPeriod, useExpenses } from "@/lib/expenses";

export function TripHeaderCard() {
  const { t, lang } = useI18n();
  const { activeTrip, loading } = useExpenses();

  if (loading || !activeTrip) {
    return (
      <section className="ios-card flex items-center gap-3 p-5">
        <Skeleton className="size-11 shrink-0 rounded-2xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-40 rounded-lg" />
          <Skeleton className="h-3 w-28 rounded-full" />
        </div>
      </section>
    );
  }

  return (
    <section className="ios-card p-5">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-accent">
          <MapPin className="size-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-xl font-extrabold tracking-tight">{activeTrip.name}</h2>
          <p className="tabular mt-0.5 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <CalendarDays className="size-3.5 shrink-0" />
            {formatTripPeriod(activeTrip, lang)}
          </p>
        </div>
      </div>
      <span className="sr-only">{t("activeTrip")}</span>
    </section>
  );
}
