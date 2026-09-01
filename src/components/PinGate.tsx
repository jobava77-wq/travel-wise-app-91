import { useState } from "react";
import { Loader2, Plane } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { isValidPin, useSession } from "@/lib/session";
import { LanguageToggle } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const today = () => new Date().toISOString().slice(0, 10);

export function PinGate() {
  const { t } = useI18n();
  const { signIn } = useSession();
  const [mode, setMode] = useState<"join" | "create">("join");
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [tripName, setTripName] = useState("");
  const [startDate, setStartDate] = useState(today());
  const [endDate, setEndDate] = useState(today());
  const [busy, setBusy] = useState(false);

  const nameOk = username.trim().length >= 2;
  const pinOk = isValidPin(pin);
  const valid = nameOk && pinOk && (mode === "join" || tripName.trim().length >= 2);

  const submit = async () => {
    if (!valid || busy) return;
    setBusy(true);
    try {
      const { data, error } = await supabase.from("trips").select("id").eq("id", pin).maybeSingle();
      if (error) throw error;

      if (mode === "join") {
        if (!data) {
          toast.error(t("tripNotFound"));
          return;
        }
      } else {
        if (data) {
          toast.error(t("pinTaken"));
          return;
        }
        const { error: insertError } = await supabase.from("trips").insert({
          id: pin,
          name: tripName.trim(),
          start_date: startDate,
          end_date: endDate,
        });
        if (insertError) throw insertError;
      }

      signIn({ username: username.trim(), pin });
    } catch {
      toast.error(t("syncError"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background px-5 pb-10 pt-8">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Plane className="size-5" strokeWidth={2.4} />
          </div>
          <LanguageToggle />
        </div>

        <h1 className="text-[28px] font-extrabold leading-tight tracking-tight">
          {t("welcomeTitle")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("welcomeHint")}</p>

        <Tabs
          value={mode}
          onValueChange={(v) => setMode(v as "join" | "create")}
          className="mt-6"
        >
          <TabsList className="grid h-11 w-full grid-cols-2 rounded-2xl bg-secondary p-1">
            <TabsTrigger value="join" className="rounded-xl text-sm font-bold">
              {t("joinTrip")}
            </TabsTrigger>
            <TabsTrigger value="create" className="rounded-xl text-sm font-bold">
              {t("createTrip")}
            </TabsTrigger>
          </TabsList>

          <div className="ios-card mt-4 space-y-3 p-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("username")}
              </label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={t("usernamePlaceholder")}
                autoComplete="nickname"
                className="h-12 rounded-2xl"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("pinCode")}
              </label>
              <Input
                type="password"
                inputMode="numeric"
                autoComplete="off"
                maxLength={5}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 5))}
                placeholder="•••••"
                className="tabular h-12 rounded-2xl text-lg tracking-[0.5em]"
              />
              <p className="text-[11px] text-muted-foreground">{t("pinHint")}</p>
            </div>

            <TabsContent value="create" className="mt-0 space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("tripName")}
                </label>
                <Input
                  value={tripName}
                  onChange={(e) => setTripName(e.target.value)}
                  placeholder={t("tripNamePlaceholder")}
                  className="h-12 rounded-2xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {t("startDate")}
                  </label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-12 rounded-2xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {t("endDate")}
                  </label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="h-12 rounded-2xl"
                  />
                </div>
              </div>
            </TabsContent>

            <Button
              className="h-12 w-full rounded-2xl font-bold"
              disabled={!valid || busy}
              onClick={() => void submit()}
            >
              {busy && <Loader2 className="size-4 animate-spin" />}
              {mode === "join" ? t("joinTrip") : t("createTrip")}
            </Button>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
