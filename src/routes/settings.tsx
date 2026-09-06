import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, Info, LogOut } from "lucide-react";
import { toast } from "sonner";
import { AppHeader, LanguageToggle } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { RatesCard } from "@/components/RatesCard";
import { useI18n } from "@/lib/i18n";
import { useSession } from "@/lib/session";
import { APP_VERSION } from "@/lib/version";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Voyage Expense Tracker" },
      {
        name: "description",
        content:
          "Switch between English and Georgian, set your own EUR and USD exchange rates, export a trip to CSV and manage your session.",
      },
      { property: "og:title", content: "Settings — Voyage Expense Tracker" },
      {
        property: "og:description",
        content: "Switch languages, edit exchange rates manually and export your trip data.",
      },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { t } = useI18n();
  const { username, signOut } = useSession();

  return (
    <>
      <AppHeader title={t("settings")} />
      <main className="mx-auto w-full max-w-md space-y-4 px-4 pb-32 pt-4">
        <section className="ios-card flex items-center justify-between p-5">
          <span className="text-sm font-bold">{t("language")}</span>
          <LanguageToggle />
        </section>

        {username && (
          <section className="ios-card p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("username")}
            </p>
            <p className="mt-1 text-sm font-bold">{username}</p>
          </section>
        )}

        <RatesCard />

        <Link
          to="/about"
          className="ios-card flex items-center justify-between p-5 transition-colors active:bg-secondary"
        >
          <span className="flex items-center gap-2.5 text-sm font-bold">
            <Info className="size-4 text-primary" aria-hidden />
            {t("aboutFeedback")}
          </span>
          <ChevronRight className="size-4 text-muted-foreground" aria-hidden />
        </Link>

        <Button
          variant="secondary"
          className="h-12 w-full rounded-2xl font-bold text-destructive"
          onClick={() => {
            signOut();
            toast.success(t("loggedOut"));
          }}
        >
          <LogOut className="size-4" />
          {t("logOut")}
        </Button>

        <p className="pt-2 text-center text-xs font-semibold text-muted-foreground">
          {t("version")} v{APP_VERSION}
        </p>
      </main>
    </>
  );
}
