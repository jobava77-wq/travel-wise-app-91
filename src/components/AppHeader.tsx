import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

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

export function AppHeader({ title }: { title: string }) {
  return (
    <header className="ios-blur sticky top-0 z-30 border-b border-border/60">
      <div className="mx-auto flex h-14 w-full max-w-md items-center justify-between px-5">
        <h1 className="text-[22px] font-extrabold tracking-tight">{title}</h1>
        <LanguageToggle />
      </div>
    </header>
  );
}

export function useAppTitle() {
  const { t } = useI18n();
  return t;
}
