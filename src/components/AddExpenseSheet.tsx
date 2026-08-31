import { useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import {
  CATEGORIES,
  CURRENCY_SYMBOL,
  formatGel,
  toGel,
  useExpenses,
  type CategoryId,
} from "@/lib/expenses";
import { useRates, type Currency } from "@/lib/rates";

export function AddExpenseFab() {
  const { t } = useI18n();
  const { addExpense, activeTrip, loading } = useExpenses();
  const { rates } = useRates();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<Currency>("GEL");
  const [category, setCategory] = useState<CategoryId>("tickets");
  const [note, setNote] = useState("");

  const num = Number(amount.replace(",", ".")) || 0;
  const valid = num > 0;

  const reset = () => {
    setAmount("");
    setCurrency("GEL");
    setCategory("tickets");
    setNote("");
  };

  const submit = () => {
    if (!valid) return;
    addExpense({ amount: num, currency, category, note: note.trim() });
    reset();
    setOpen(false);
  };

  return (
    <Drawer
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
      }}
    >
      <DrawerTrigger asChild>
        <button
          aria-label={t("addExpense")}
          className="fixed bottom-[76px] left-1/2 z-40 flex h-14 -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full bg-primary px-6 text-sm font-bold text-primary-foreground shadow-[var(--shadow-fab)] transition-transform active:scale-95"
        >
          <Plus className="size-5" strokeWidth={2.6} />
          {t("addExpense")}
        </button>
      </DrawerTrigger>

      <DrawerContent className="mx-auto max-w-md rounded-t-3xl">
        <DrawerHeader className="pb-2 text-center">
          <DrawerTitle className="text-lg font-extrabold">{t("addExpense")}</DrawerTitle>
        </DrawerHeader>

        <div className="space-y-5 px-5 pb-8">
          <div className="flex gap-3">
            <div className="flex-1">
              <label
                htmlFor="amount"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                {t("amount")}
              </label>
              <div className="flex items-center gap-1.5 rounded-2xl bg-secondary px-3">
                <span className="text-lg font-bold text-muted-foreground">
                  {CURRENCY_SYMBOL[currency]}
                </span>
                <Input
                  id="amount"
                  autoFocus
                  inputMode="decimal"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="tabular h-12 border-0 bg-transparent px-0 text-xl font-extrabold shadow-none focus-visible:ring-0"
                />
              </div>
            </div>
            <div className="w-28">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("currency")}
              </span>
              <Select value={currency} onValueChange={(v) => setCurrency(v as Currency)}>
                <SelectTrigger className="h-12 rounded-2xl border-0 bg-secondary font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(["GEL", "USD", "EUR"] as Currency[]).map((c) => (
                    <SelectItem key={c} value={c} className="font-semibold">
                      {CURRENCY_SYMBOL[c]} {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {currency !== "GEL" && valid && (
            <p className="tabular -mt-2 text-xs font-semibold text-primary">
              {t("converted")}: {formatGel(toGel(num, currency))}
            </p>
          )}

          <div>
            <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("category")}
            </span>
            <div className="grid grid-cols-4 gap-2">
              {CATEGORIES.map((c) => {
                const Icon = c.icon;
                const active = category === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setCategory(c.id)}
                    aria-pressed={active}
                    className={cn(
                      "flex flex-col items-center gap-1.5 rounded-2xl px-1 py-3 text-[10px] font-bold leading-tight transition-all",
                      active
                        ? "bg-accent text-accent-foreground ring-2 ring-primary"
                        : "bg-secondary text-muted-foreground",
                    )}
                  >
                    <Icon className="size-5" style={{ color: active ? c.color : undefined }} />
                    <span className="text-center">{t(c.key)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label
              htmlFor="note"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              {t("note")}
            </label>
            <Input
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="h-11 rounded-2xl border-0 bg-secondary font-medium"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <Button
              variant="secondary"
              className="h-12 flex-1 rounded-2xl font-bold"
              onClick={() => setOpen(false)}
            >
              {t("cancel")}
            </Button>
            <Button
              className="h-12 flex-1 rounded-2xl font-bold"
              disabled={!valid}
              onClick={submit}
            >
              {t("save")}
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
