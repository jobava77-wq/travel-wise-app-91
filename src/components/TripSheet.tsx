import { useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
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
import { useI18n } from "@/lib/i18n";
import { useExpenses, type Trip } from "@/lib/expenses";

export function TripSheet({ trigger, trip }: { trigger: ReactNode; trip?: Trip }) {
  const { t } = useI18n();
  const { addTrip, updateTrip } = useExpenses();
  const navigate = useNavigate();
  const isEdit = !!trip;
  const today = new Date().toISOString().slice(0, 10);

  const [open, setOpen] = useState(false);
  const [name, setName] = useState(trip?.name ?? "");
  const [start, setStart] = useState(trip?.startDate ?? today);
  const [end, setEnd] = useState(trip?.endDate ?? today);
  const [budget, setBudget] = useState(trip?.budgetGel != null ? String(trip.budgetGel) : "");
  const [saving, setSaving] = useState(false);

  const budgetNum = budget.trim() === "" ? null : Number(budget.replace(",", ".")) || null;
  const valid = name.trim().length > 0 && !!start && !!end && end >= start;

  const openSheet = (o: boolean) => {
    if (o && trip) {
      setName(trip.name);
      setStart(trip.startDate);
      setEnd(trip.endDate);
      setBudget(trip.budgetGel != null ? String(trip.budgetGel) : "");
    }
    setOpen(o);
  };

  const submit = async () => {
    if (!valid || saving) return;
    setSaving(true);
    try {
      if (isEdit && trip) {
        await updateTrip(trip.id, {
          name: name.trim(),
          startDate: start,
          endDate: end,
          budgetGel: budgetNum,
        });
        toast.success(t("tripUpdated"));
      } else {
        const id = await addTrip({
          name: name.trim(),
          startDate: start,
          endDate: end,
          budgetGel: budgetNum,
        });
        toast.success(t("tripCreated"));
        void navigate({ to: "/trip/$tripId", params: { tripId: id } });
      }
      setOpen(false);
      if (!isEdit) {
        setName("");
        setStart(today);
        setEnd(today);
        setBudget("");
      }
    } catch {
      toast.error(t("syncError"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={openSheet}>
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>
      <DrawerContent className="mx-auto max-w-md rounded-t-3xl">
        <DrawerHeader className="pb-2 text-center">
          <DrawerTitle className="text-lg font-extrabold">
            {isEdit ? t("editTrip") : t("newTrip")}
          </DrawerTitle>
        </DrawerHeader>

        <div className="space-y-4 px-5 pb-8">
          <div>
            <label
              htmlFor="tripName"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              {t("tripName")}
            </label>
            <Input
              id="tripName"
              autoFocus
              value={name}
              placeholder={t("tripNamePlaceholder")}
              onChange={(e) => setName(e.target.value)}
              className="h-12 rounded-2xl border-0 bg-secondary font-bold"
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label
                htmlFor="startDate"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                {t("startDate")}
              </label>
              <Input
                id="startDate"
                type="date"
                value={start}
                onChange={(e) => {
                  setStart(e.target.value);
                  if (end < e.target.value) setEnd(e.target.value);
                }}
                className="tabular h-12 rounded-2xl border-0 bg-secondary font-semibold"
              />
            </div>
            <div className="flex-1">
              <label
                htmlFor="endDate"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                {t("endDate")}
              </label>
              <Input
                id="endDate"
                type="date"
                value={end}
                min={start}
                onChange={(e) => setEnd(e.target.value)}
                className="tabular h-12 rounded-2xl border-0 bg-secondary font-semibold"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="tripBudget"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              {t("budget")}
            </label>
            <div className="flex items-center gap-1.5 rounded-2xl bg-secondary px-3">
              <span className="text-lg font-bold text-muted-foreground">₾</span>
              <Input
                id="tripBudget"
                inputMode="decimal"
                placeholder="0"
                value={budget}
                onChange={(e) => setBudget(e.target.value.replace(/[^0-9.,]/g, ""))}
                className="tabular h-12 border-0 bg-transparent px-0 text-base font-extrabold shadow-none focus-visible:ring-0"
              />
            </div>
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
              disabled={!valid || saving}
              onClick={() => void submit()}
            >
              {saving && <Loader2 className="size-4 animate-spin" />}
              {isEdit ? t("save") : t("create")}
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
