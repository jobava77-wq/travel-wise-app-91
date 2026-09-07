import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useSession } from "@/lib/session";

export const Route = createFileRoute("/auth/callback")({
  component: AuthCallback,
});

function AuthCallback() {
  const { t } = useI18n();
  const { ready, user } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (ready && user) void navigate({ to: "/", replace: true });
  }, [navigate, ready, user]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5">
      <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
        <Loader2 className="size-4 animate-spin" aria-hidden />
        {t("authLoading")}
      </div>
    </main>
  );
}
