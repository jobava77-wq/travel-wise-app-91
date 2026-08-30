import { createFileRoute } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppHeader, LanguageToggle } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { RatesCard } from "@/components/RatesCard";
import { useI18n } from "@/lib/i18n";
import { useExpenses } from "@/lib/expenses";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Voyage Expense Tracker" },
      {
        name: "description",
        content:
          "Switch between English and Georgian, set your own EUR and USD exchange rates and clear trip data.",
      },
      { property: "og:title", content: "Settings — Voyage Expense Tracker" },
      {
        property: "og:description",
        content: "Switch languages, edit exchange rates manually and manage your synced trip data.",
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

        <RatesCard />

        <Button
          variant="secondary"
          className="h-12 w-full rounded-2xl font-bold text-destructive"
          onClick={async () => {
            try {
              await clearAll();
              toast.success(t("cleared"));
            } catch {
              toast.error(t("syncError"));
            }
          }}
        >
          <Trash2 className="size-4" />
          {t("clearData")}
        </Button>
      </main>
    </>
  );
}
