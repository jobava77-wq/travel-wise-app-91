import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { useSession } from "@/lib/session";
import { APP_VERSION } from "@/lib/version";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About & Feedback — Voyage Travel Expense Tracker" },
      {
        name: "description",
        content:
          "Learn about Voyage, a streamlined travel expense tracker, and send your ideas or bug reports straight to the developer.",
      },
      { property: "og:title", content: "About & Feedback — Voyage Travel Expense Tracker" },
      {
        property: "og:description",
        content: "About Voyage and a quick form to share feedback with the developer.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { t } = useI18n();
  const { pin, username } = useSession();
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const submit = async () => {
    const text = message.trim();
    if (text.length === 0 || sending) return;
    setSending(true);
    const { error } = await supabase.from("feedback").insert({
      owner_pin: pin ?? "",
      owner_name: username ?? "",
      message: text.slice(0, 2000),
    });
    setSending(false);
    if (error) {
      toast.error(t("syncError"));
      return;
    }
    setMessage("");
    toast.success(t("feedbackSent"));
  };

  return (
    <>
      <AppHeader title={t("aboutFeedback")} back />
      <main className="mx-auto w-full max-w-md space-y-4 px-4 pb-32 pt-4">
        <section className="ios-card p-5">
          <h1 className="text-sm font-extrabold">{t("appName")}</h1>
          <p className="mt-2 text-sm font-medium leading-relaxed text-muted-foreground">
            {t("aboutText")}
          </p>
        </section>

        <section className="ios-card space-y-3 p-5">
          <h2 className="text-sm font-extrabold">{t("feedbackTitle")}</h2>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value.slice(0, 2000))}
            placeholder={t("feedbackPlaceholder")}
            rows={5}
            className="rounded-2xl border-0 bg-secondary font-medium"
          />
          <Button
            className="h-12 w-full rounded-2xl font-bold"
            disabled={message.trim().length === 0 || sending}
            onClick={() => void submit()}
          >
            {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            {t("send")}
          </Button>
        </section>

        <p className="pb-2 text-center text-xs font-semibold text-muted-foreground">
          {t("version")} v{APP_VERSION}
        </p>
      </main>
    </>
  );
}
