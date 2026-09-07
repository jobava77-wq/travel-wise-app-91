import { useState } from "react";
import { Loader2, Plane } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useSession } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LanguageToggle } from "@/components/AppHeader";

export function AuthScreen() {
  const { t } = useI18n();
  const { signIn, signUp, signInWithGoogle } = useSession();
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email.trim() || password.length < 6 || loading) return;
    setLoading(true);
    setMessage(null);
    const result = mode === "signIn"
      ? await signIn(email.trim(), password)
      : await signUp(email.trim(), password);
    setLoading(false);
    if (result.error) {
      setIsError(true);
      setMessage(t("authFailed"));
      return;
    }
    setIsError(false);
    const needsConfirmation = mode === "signUp" && "needsConfirmation" in result && result.needsConfirmation;
    setMessage(mode === "signIn" ? t("signedIn") : needsConfirmation ? t("checkEmail") : t("accountCreated"));
  };

  const google = async () => {
    setLoading(true);
    const result = await signInWithGoogle();
    if (result.error) {
      setLoading(false);
      setIsError(true);
      setMessage(t("authFailed"));
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 py-8">
      <section className="w-full max-w-md">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Plane className="size-5" aria-hidden />
          </div>
          <LanguageToggle />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">{t("authWelcome")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("authHint")}</p>
        <div className="ios-card mt-6 space-y-4 p-5">
          <div className="grid grid-cols-2 rounded-xl bg-secondary p-1">
            {(["signIn", "signUp"] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => { setMode(item); setMessage(null); }}
                className={`rounded-lg py-2 text-sm font-bold transition-colors ${mode === item ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
              >
                {t(item)}
              </button>
            ))}
          </div>
          <Button type="button" variant="outline" className="h-12 w-full rounded-2xl font-bold" onClick={() => void google()} disabled={loading}>
            <span className="grid size-5 place-items-center rounded-full bg-white text-sm font-extrabold text-[#4285F4]">G</span>
            {t("continueGoogle")}
          </Button>
          <div className="flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />{t("or")}<span className="h-px flex-1 bg-border" /></div>
          <div className="space-y-1.5">
            <label htmlFor="auth-email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t("email")}</label>
            <Input id="auth-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("emailPlaceholder")} autoComplete="email" className="h-12 rounded-2xl" />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="auth-password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t("password")}</label>
            <Input id="auth-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && void submit()} placeholder={t("passwordPlaceholder")} autoComplete={mode === "signIn" ? "current-password" : "new-password"} className="h-12 rounded-2xl" />
          </div>
          {password.length > 0 && password.length < 6 && <p className="text-xs text-destructive">{t("passwordTooShort")}</p>}
          {message && <p className={`text-sm ${isError ? "text-destructive" : "text-primary"}`}>{message}</p>}
          <Button type="button" className="h-12 w-full rounded-2xl font-bold" disabled={!email.includes("@") || password.length < 6 || loading} onClick={() => void submit()}>
            {loading && <Loader2 className="size-4 animate-spin" />}
            {t(mode === "signIn" ? "signIn" : "signUp")}
          </Button>
        </div>
      </section>
    </main>
  );
}