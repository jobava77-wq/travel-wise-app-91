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
import { useExpenses } from "@/lib/expenses";

export function CreateTripSheet({ trigger }: { trigger: ReactNode }) {
  const { t } = useI18n();
  const { addTrip } = useExpenses();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const today = new Date().toISOString().slice(0, 10);
  const [name, setName] = useState("");
  const [start, setStart] = useState(today);
  const [end, setEnd] = useState(today);

  const [saving, setSaving] = useState(false);
  const valid = name.trim().length > 0 && !!start && !!end && end >= start;

  const submit = async () => {
    if (!valid || saving) return;
    setSaving(true);
    try {
      const id = await addTrip({ name: name.trim(), startDate: start, endDate: end });
      toast.success(t("tripCreated"));
      setName("");
      setStart(today);
      setEnd(today);
      setOpen(false);
      void navigate({ to: "/trip/$tripId", params: { tripId: id } });
    } catch {
      toast.error(t("syncError"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>
      <DrawerContent className="mx-auto max-w-md rounded-t-3xl">
        <DrawerHeader className="pb-2 text-center">
          <DrawerTitle className="text-lg font-extrabold">{t("newTrip")}</DrawerTitle>
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
              {t("create")}
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
