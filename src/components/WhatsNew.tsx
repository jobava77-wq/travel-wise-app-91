import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { APP_VERSION, CHANGELOG } from "@/lib/version";

const SEEN_KEY = "voyageSeenVersion";

export function WhatsNew() {
  const { t, lang } = useI18n();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const seen = window.localStorage.getItem(SEEN_KEY);
    if (seen !== APP_VERSION) setOpen(true);
  }, []);

  const dismiss = () => {
    window.localStorage.setItem(SEEN_KEY, APP_VERSION);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? setOpen(true) : dismiss())}>
      <DialogContent className="mx-auto max-w-[340px] rounded-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-extrabold">
            <Sparkles className="size-4 text-primary" aria-hidden />
            {t("whatsNew")} · v{APP_VERSION}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {t("whatsNew")} v{APP_VERSION}
          </DialogDescription>
        </DialogHeader>
        <ul className="space-y-2.5">
          {CHANGELOG.map((item) => (
            <li key={item.en} className="flex gap-2 text-sm font-medium leading-snug">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
              {item[lang]}
            </li>
          ))}
        </ul>
        <Button className="h-11 w-full rounded-2xl font-bold" onClick={dismiss}>
          {t("gotIt")}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
