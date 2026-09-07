import { useEffect, useState, type ReactNode } from "react";
import { ChevronLeft, Moon, Sun } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const THEME_KEY = "theme";
type Theme = "light" | "dark";

function ThemeToggle() {
  const { t } = useI18n();
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const savedTheme = window.localStorage.getItem(THEME_KEY);
    const initialTheme: Theme =
      savedTheme === "light" || savedTheme === "dark"
        ? savedTheme
        : mediaQuery.matches
          ? "dark"
          : "light";

    setTheme(initialTheme);
    document.documentElement.classList.toggle("dark", initialTheme === "dark");

    if (savedTheme === "light" || savedTheme === "dark") return;

    const handleSystemThemeChange = (event: MediaQueryListEvent) => {
      const nextTheme: Theme = event.matches ? "dark" : "light";
      setTheme(nextTheme);
      document.documentElement.classList.toggle("dark", event.matches);
    };
    mediaQuery.addEventListener("change", handleSystemThemeChange);
    return () => mediaQuery.removeEventListener("change", handleSystemThemeChange);
  }, []);

  const toggleTheme = () => {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    window.localStorage.setItem(THEME_KEY, nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
  };

  const isDark = theme === "dark";
  const label = isDark ? t("switchToLightMode") : t("switchToDarkMode");
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className="rounded-full text-muted-foreground hover:text-foreground"
    >
      {isDark ? <Sun aria-hidden /> : <Moon aria-hidden />}
    </Button>
  );
}

export function LanguageToggle() {
  const { lang, setLang } = useI18n();
  return (
    <div
      role="group"
      aria-label="Language"
      className="flex items-center rounded-full bg-secondary p-0.5"
    >
      {(["en", "ka"] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={cn(
            "rounded-full px-3 py-1 text-xs font-bold uppercase transition-all",
            lang === l
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

export function AppHeader({
  title,
  back = false,
  right,
}: {
  title: string;
  back?: boolean;
  right?: ReactNode;
}) {
  const { t } = useI18n();
  return (
    <header className="ios-blur sticky top-0 z-30 border-b border-border/60">
      <div className="mx-auto flex h-14 w-full max-w-md items-center justify-between gap-2 px-5">
        <div className="flex min-w-0 items-center gap-1">
          {back && (
            <Link
              to="/"
              aria-label={t("backToTrips")}
              className="-ml-2 flex items-center rounded-full py-1 pr-1 text-sm font-bold text-primary"
            >
              <ChevronLeft className="size-5" strokeWidth={2.6} />
              {t("backToTrips")}
            </Link>
          )}
          {!back && <h1 className="truncate text-[22px] font-extrabold tracking-tight">{title}</h1>}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle />
          <LanguageToggle />
          {right}
        </div>
      </div>
    </header>
  );
}

export function useAppTitle() {
  const { t } = useI18n();
  return t;
}
