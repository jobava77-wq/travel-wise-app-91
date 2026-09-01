import { useEffect, useState } from "react";
import { User, LogOut, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AuthDialog() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        setEmail(session?.user?.email ?? null);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleAuth = async () => {
    const e = emailInput.trim();
    if (!e || password.length < 6 || loading) return;
    setLoading(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: e,
        password,
      });
      if (signInError) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: e,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (signUpError) throw signUpError;
        if (!data.session) {
          toast.success(t("checkEmail"));
        } else {
          toast.success(t("signedIn"));
        }
      } else {
        toast.success(t("signedIn"));
      }
      setPassword("");
    } catch {
      toast.error(t("authError"));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success(t("signedOut"));
    setOpen(false);
  };

  return (
    <>
      <button
        aria-label={t("account")}
        onClick={() => setOpen(true)}
        className="flex size-8 items-center justify-center rounded-full bg-secondary text-muted-foreground transition-colors hover:text-foreground"
      >
        <User className="size-4" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-sm rounded-3xl">
          <DialogHeader>
            <DialogTitle>{t("account")}</DialogTitle>
          </DialogHeader>

          {!ready ? (
            <div className="flex justify-center py-6">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : email ? (
            <div className="space-y-4">
              <div className="rounded-2xl bg-secondary p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("loggedInAs")}
                </p>
                <p className="mt-1 break-all text-sm font-bold">{email}</p>
              </div>
              <Button
                variant="secondary"
                className="h-11 w-full rounded-2xl font-bold text-destructive"
                onClick={() => void handleLogout()}
              >
                <LogOut className="size-4" />
                {t("logOut")}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <Input
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder={t("email")}
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="h-12 rounded-2xl"
              />
              <Input
                type="password"
                autoComplete="current-password"
                placeholder={t("password")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && void handleAuth()}
                className="h-12 rounded-2xl"
              />
              <Button
                className="h-12 w-full rounded-2xl font-bold"
                disabled={!emailInput.trim() || password.length < 6 || loading}
                onClick={() => void handleAuth()}
              >
                {loading && <Loader2 className="size-4 animate-spin" />}
                {t("signInSignUp")}
              </Button>
              <p className="text-center text-xs text-muted-foreground">{t("authHint")}</p>
            </div>
          )}

          <div className="mt-2 border-t border-border pt-3 text-center">
            <p className="text-xs text-muted-foreground">{t("aboutText")}</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
