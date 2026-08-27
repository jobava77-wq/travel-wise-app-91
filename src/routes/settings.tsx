import { createFileRoute } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppHeader, LanguageToggle } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { RATES, useExpenses } from "@/lib/expenses";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Voyage Expense Tracker" },
      {
        name: "description",
        content: "Switch between English and Georgian, review exchange rates and clear your data.",
      },
      { property: "og:title", content: "Settings — Voyage Expense Tracker" },
      {
        property: "og:description",
        content: "Switch between English and Georgian, review exchange rates and clear your data.",
      },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { t } = useI18n();
  const { clearAll } = useExpenses();

  return (
    <>
      <AppHeader title={t("settings")} />
      <main className="mx-auto w-full max-w-md space-y-4 px-4 pb-32 pt-4">
        <section className="ios-card flex items-center justify-between p-5">
          <span className="text-sm font-bold">{t("language")}</span>
          <LanguageToggle />
        </section>

        <section className="ios-card p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t("rates")}
          </p>
          <ul className="mt-3 space-y-2">
            {(["USD", "EUR"] as const).map((c) => (
              <li key={c} className="tabular flex justify-between text-sm font-bold">
                <span>1 {c}</span>
                <span className="text-primary">{RATES[c].toFixed(2)} ₾</span>
              </li>
            ))}
          </ul>
        </section>

        <Button
          variant="secondary"
          className="h-12 w-full rounded-2xl font-bold text-destructive"
          onClick={() => {
            clearAll();
            toast.success(t("cleared"));
          }}
        >
          <Trash2 className="size-4" />
          {t("clearData")}
        </Button>
      </main>
    </>
  );
}
