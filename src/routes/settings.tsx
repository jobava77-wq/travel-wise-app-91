import { createFileRoute } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppHeader, LanguageToggle } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { RatesCard } from "@/components/RatesCard";
import { useI18n } from "@/lib/i18n";
import { useExpenses } from "@/lib/expenses";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

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

function GoogleAuthSection() {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });
    setLoading(false);
  };

  return (
    <div className="ios-card p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          ავტორიზაცია
        </h3>
        <p className="text-sm font-bold text-slate-800 mt-0.5">Google-ით შესვლა</p>
      </div>
      <Button 
        onClick={handleGoogleLogin}
        disabled={loading}
        variant="outline"
        className="rounded-xl text-xs font-medium border-slate-200"
      >
        {loading ? 'იტვირთება...' : 'შესვლა'}
      </Button>
    </div>
  );
}

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

        <GoogleAuthSection />

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
