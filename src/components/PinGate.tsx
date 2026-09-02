import { useState } from "react";
import { Plane } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { isValidPin, useSession } from "@/lib/session";
import { LanguageToggle } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function PinGate() {
  const { t } = useI18n();
  const { signIn } = useSession();
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");

  const valid = username.trim().length >= 2 && isValidPin(pin);

  const submit = () => {
    if (!valid) return;
    signIn({ username: username.trim(), pin });
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
        <p className="mt-2 text-sm text-muted-foreground">{t("personalPinHint")}</p>

        <div className="ios-card mt-6 space-y-3 p-5">
          <div className="space-y-1.5">
            <label
              htmlFor="username"
              className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              {t("username")}
            </label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={t("usernamePlaceholder")}
              autoComplete="nickname"
              className="h-12 rounded-2xl"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="pin"
              className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              {t("personalPin")}
            </label>
            <Input
              id="pin"
              type="password"
              inputMode="numeric"
              autoComplete="off"
              maxLength={5}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 5))}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="•••••"
              className="tabular h-12 rounded-2xl text-lg tracking-[0.5em]"
            />
          </div>

          <Button
            className="h-12 w-full rounded-2xl font-bold"
            disabled={!valid}
            onClick={submit}
          >
            {t("continueBtn")}
          </Button>
        </div>
      </div>
    </div>
  );
}
