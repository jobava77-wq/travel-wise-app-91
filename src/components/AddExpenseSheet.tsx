import { useState, type ReactNode } from "react";
import { Loader2, Plus, Zap } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
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
  QUICK_ACTIONS,
  TAGS,
  formatGel,
  toGel,
  useExpenses,
  type CategoryId,
  type Expense,
} from "@/lib/expenses";
import { useRates, type Currency } from "@/lib/rates";

const AMOUNT_RE = /^\d{0,6}([.]\d{0,2})?$/;
const todayIso = () => new Date().toISOString().slice(0, 10);

export function ExpenseSheet({
  trigger,
  expense,
  open: controlledOpen,
  onOpenChange,
}: {
  trigger?: ReactNode;
  /** when set, the sheet edits this expense instead of adding a new one */
  expense?: Expense | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const { t } = useI18n();
  const { addExpense, updateExpense } = useExpenses();
  const { rates } = useRates();
  const isEdit = expense != null;

  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = (o: boolean) => {
    if (o && expense) {
      setAmount(String(expense.amount));
      setCurrency(expense.currency);
      setCategory(expense.category);
      setNote(expense.note ?? "");
      setCustomCategory(expense.customCategory);
      setSpentAt(expense.spentAt);
      setTags(expense.tags);
      setCoords(expense.lat != null && expense.lng != null ? { lat: expense.lat, lng: expense.lng } : null);
      setGeo(expense.lat != null);
    }
    setInternalOpen(o);
    onOpenChange?.(o);
  };

  const [saving, setSaving] = useState(false);
  const [amount, setAmount] = useState(expense ? String(expense.amount) : "");
  const [amountError, setAmountError] = useState(false);
  const [currency, setCurrency] = useState<Currency>(expense?.currency ?? "GEL");
  const [category, setCategory] = useState<CategoryId>(expense?.category ?? "tickets");
  const [customCategory, setCustomCategory] = useState(expense?.customCategory ?? "");
  const [note, setNote] = useState(expense?.note ?? "");
  const [spentAt, setSpentAt] = useState(expense?.spentAt ?? todayIso());
  const [tags, setTags] = useState<string[]>(expense?.tags ?? []);
  const [geo, setGeo] = useState(expense?.lat != null);
  const [locating, setLocating] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    expense?.lat != null && expense?.lng != null ? { lat: expense.lat, lng: expense.lng } : null,
  );

  const num = Number(amount) || 0;
  const valid = num > 0 && !amountError;

  const onAmountChange = (raw: string) => {
    const cleaned = raw.replace(",", ".").replace(/[^0-9.]/g, "");
    if (cleaned === "" || AMOUNT_RE.test(cleaned)) {
      setAmount(cleaned);
      setAmountError(false);
    } else {
      setAmountError(true);
    }
  };

  const toggleTag = (tag: string) =>
    setTags((prev) => (prev.includes(tag) ? prev.filter((x) => x !== tag) : [...prev, tag]));

  const toggleGeo = (on: boolean) => {
    setGeo(on);
    if (!on) {
      setCoords(null);
      return;
    }
    if (!("geolocation" in navigator)) {
      setGeo(false);
      toast.error(t("locationDenied"));
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
        toast.success(t("locationSaved"));
      },
      () => {
        setLocating(false);
        setGeo(false);
        toast.error(t("locationDenied"));
      },
      { timeout: 10000 },
    );
  };

  const reset = () => {
    setAmount("");
    setAmountError(false);
    setCurrency("GEL");
    setCategory("tickets");
    setCustomCategory("");
    setNote("");
    setSpentAt(todayIso());
    setTags([]);
    setGeo(false);
    setCoords(null);
  };

  const submit = async () => {
    if (!valid || saving) return;
    setSaving(true);
    const payload = {
      amount: num,
      currency,
      category,
      note: note.trim(),
      customCategory: category === "other" ? customCategory.trim() : "",
      spentAt,
      tags,
      lat: geo ? (coords?.lat ?? null) : null,
      lng: geo ? (coords?.lng ?? null) : null,
    };
    try {
      if (isEdit) {
        await updateExpense(expense.id, payload);
        toast.success(t("expenseUpdated"));
      } else {
        await addExpense(payload);
        reset();
      }
      setOpen(false);
    } catch {
      toast.error(t("syncError"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Drawer
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o && !isEdit) reset();
      }}
    >
      {trigger && <DrawerTrigger asChild>{trigger}</DrawerTrigger>}

      <DrawerContent className="mx-auto flex h-[100dvh] max-w-md flex-col overflow-hidden rounded-t-3xl">
        <DrawerHeader className="shrink-0 pb-2 text-center">
          <DrawerTitle className="text-lg font-extrabold">
            {isEdit ? t("editExpense") : t("addExpense")}
          </DrawerTitle>
        </DrawerHeader>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 pb-4">
          <div>
            <span className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Zap className="size-3.5" aria-hidden /> {t("quickAdd")}
            </span>
            <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
              {QUICK_ACTIONS.map((q) => (
                <button
                  key={q.key}
                  onClick={() => {
                    setNote(t(q.key));
                    setCategory(q.category);
                  }}
                  className="shrink-0 rounded-full bg-secondary px-3.5 py-2 text-xs font-bold text-foreground transition-transform active:scale-95"
                >
                  {t(q.key)}
                </button>
              ))}
            </div>
          </div>

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
                  onChange={(e) => onAmountChange(e.target.value)}
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

          {amountError && (
            <p className="-mt-2 text-xs font-semibold text-destructive">{t("amountTooBig")}</p>
          )}

          {currency !== "GEL" && valid && (
            <p className="tabular -mt-2 text-xs font-semibold text-primary">
              {t("converted")}: {formatGel(toGel(num, currency, rates))}
            </p>
          )}

          <div>
            <label
              htmlFor="spentAt"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              {t("expenseDate")}
            </label>
            <Input
              id="spentAt"
              type="date"
              value={spentAt}
              max={todayIso()}
              onChange={(e) => setSpentAt(e.target.value)}
              className="tabular h-12 rounded-2xl border-0 bg-secondary font-semibold"
            />
          </div>

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

          {category === "other" && (
            <div>
              <label
                htmlFor="customCategory"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                {t("customCategory")}
              </label>
              <Input
                id="customCategory"
                value={customCategory}
                placeholder={t("customCategoryPlaceholder")}
                onChange={(e) => setCustomCategory(e.target.value.slice(0, 40))}
                className="h-11 rounded-2xl border-0 bg-secondary font-medium"
              />
            </div>
          )}

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
              onChange={(e) => setNote(e.target.value.slice(0, 120))}
              className="h-11 rounded-2xl border-0 bg-secondary font-medium"
            />
          </div>

          <div>
            <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("tags")}
            </span>
            <div className="flex flex-wrap gap-2">
              {TAGS.map((tag) => {
                const active = tags.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    aria-pressed={active}
                    className={cn(
                      "rounded-full px-3.5 py-2 text-xs font-bold transition-all",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground",
                    )}
                  >
                    {t(tag)}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-2xl bg-secondary px-4 py-3">
            <span className="text-sm font-bold">
              {locating ? t("locating") : t("saveLocation")}
            </span>
            <Switch checked={geo} onCheckedChange={toggleGeo} aria-label={t("saveLocation")} />
          </div>
        </div>

        <div className="sticky bottom-0 z-50 flex gap-3 border-t bg-background p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <Button
            variant="secondary"
            className="h-12 flex-1 rounded-2xl font-bold"
            onClick={() => setOpen(false)}
          >
            {t("cancel")}
          </Button>
          <Button
            className="h-12 flex-1 rounded-2xl font-bold"
            disabled={!valid || saving}
            onClick={() => void submit()}
          >
            {saving && <Loader2 className="size-4 animate-spin" />}
            {t("save")}
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

export function AddExpenseFab() {
  const { t } = useI18n();
  const { activeTrip, loading } = useExpenses();

  return (
    <ExpenseSheet
      trigger={
        <button
          aria-label={t("addExpense")}
          disabled={loading || !activeTrip}
          className="fixed bottom-[76px] left-1/2 z-40 flex h-14 -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full bg-primary px-6 text-sm font-bold text-primary-foreground shadow-[var(--shadow-fab)] transition-transform active:scale-95 disabled:opacity-50"
        >
          <Plus className="size-5" strokeWidth={2.6} />
          {t("addExpense")}
        </button>
      }
    />
  );
}
