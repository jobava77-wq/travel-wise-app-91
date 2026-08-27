import { Link } from "@tanstack/react-router";
import { Home, Map, Settings } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const items = [
  { to: "/", icon: Home, key: "home" },
  { to: "/trips", icon: Map, key: "myTrips" },
  { to: "/settings", icon: Settings, key: "settings" },
] as const;

export function BottomNav() {
  const { t } = useI18n();
  return (
    <nav className="ios-blur fixed inset-x-0 bottom-0 z-30 border-t border-border/60 pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex w-full max-w-md items-stretch">
        {items.map(({ to, icon: Icon, key }) => (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact: to === "/" }}
            activeProps={{ className: "text-primary" }}
            inactiveProps={{ className: "text-muted-foreground" }}
            className="flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-semibold transition-colors"
          >
            <Icon className="size-[22px]" strokeWidth={2.1} />
            {t(key)}
          </Link>
        ))}
      </div>
    </nav>
  );
}
