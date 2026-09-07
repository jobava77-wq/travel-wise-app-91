import { useState } from "react";
import { Check, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n";
import { CATEGORY_ICON_MAP, useExpenses, type CategoryOption } from "@/lib/expenses";

const ICON_NAMES = [
  "Plane",
  "Luggage",
  "BedDouble",
  "UtensilsCrossed",
  "Car",
  "ShoppingBag",
  "Wifi",
  "Bus",
  "MapPin",
  "ShieldCheck",
  "Tag",
];

export function CategoryManager({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useI18n();
  const { categories, addCategory, updateCategory, removeCategory } = useExpenses();
  const customCategories = categories.filter((category) => category.custom);
  const [editing, setEditing] = useState<CategoryOption | null>(null);
  const [name, setName] = useState("");
  const [iconName, setIconName] = useState("Tag");
  const [saving, setSaving] = useState(false);

  const startNew = () => {
    setEditing(null);
    setName("");
    setIconName("Tag");
  };

  const startEdit = (category: CategoryOption) => {
    setEditing(category);
    setName(category.name ?? "");
    setIconName(category.iconName);
  };

  const save = async () => {
    const trimmed = name.trim();
    if (!trimmed || saving) return;
    setSaving(true);
    try {
      if (editing) await updateCategory(editing.id, trimmed, iconName);
      else await addCategory(trimmed, iconName);
      startNew();
      toast.success(t("categorySaved"));
    } catch {
      toast.error(t("syncError"));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (category: CategoryOption) => {
    try {
      await removeCategory(category.id);
      if (editing?.id === category.id) startNew();
    } catch {
      toast.error(t("syncError"));
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="mx-auto flex max-h-[90dvh] max-w-md flex-col overflow-hidden rounded-t-3xl">
        <DrawerHeader className="shrink-0 pb-2 text-center">
          <DrawerTitle className="text-lg font-extrabold">{t("manageCategories")}</DrawerTitle>
        </DrawerHeader>
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-2">
          <div className="grid gap-2">
            <label
              htmlFor="categoryName"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              {t("categoryName")}
            </label>
            <Input
              id="categoryName"
              value={name}
              maxLength={40}
              onChange={(event) => setName(event.target.value)}
              placeholder={t("categoryNamePlaceholder")}
              className="h-11 rounded-2xl border-0 bg-secondary"
            />
          </div>
          <div>
            <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("categoryIcon")}
            </span>
            <div className="grid grid-cols-6 gap-2">
              {ICON_NAMES.map((nameValue) => {
                const Icon = CATEGORY_ICON_MAP[nameValue]!;
                const active = iconName === nameValue;
                return (
                  <button
                    key={nameValue}
                    type="button"
                    aria-label={nameValue}
                    aria-pressed={active}
                    onClick={() => setIconName(nameValue)}
                    className={`flex size-11 items-center justify-center rounded-xl ${active ? "bg-accent text-accent-foreground ring-2 ring-primary" : "bg-secondary text-muted-foreground"}`}
                  >
                    <Icon className="size-5" />
                  </button>
                );
              })}
            </div>
          </div>
          <Button
            className="h-11 w-full rounded-2xl font-bold"
            onClick={() => void save()}
            disabled={!name.trim() || saving}
          >
            {editing ? <Check className="size-4" /> : <Plus className="size-4" />}
            {editing ? t("save") : t("addCategory")}
          </Button>
          <div className="space-y-2 border-t pt-3">
            {customCategories.length === 0 ? (
              <p className="py-3 text-center text-sm text-muted-foreground">
                {t("noCustomCategories")}
              </p>
            ) : (
              customCategories.map((category) => {
                const Icon = category.icon;
                return (
                  <div
                    key={category.id}
                    className="flex items-center gap-2 rounded-2xl bg-secondary px-3 py-2"
                  >
                    <Icon className="size-5 shrink-0" style={{ color: category.color }} />
                    <span className="min-w-0 flex-1 truncate text-sm font-bold">
                      {category.name}
                    </span>
                    <button
                      type="button"
                      aria-label={`${t("editList")}: ${category.name}`}
                      onClick={() => startEdit(category)}
                      className="rounded-full p-2 text-muted-foreground hover:bg-background hover:text-foreground"
                    >
                      <Pencil className="size-4" aria-hidden />
                    </button>
                    <button
                      type="button"
                      aria-label={`${t("deleteBtn")}: ${category.name}`}
                      onClick={() => void remove(category)}
                      className="rounded-full p-2 text-muted-foreground hover:bg-background hover:text-destructive"
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
        <div className="shrink-0 border-t bg-background px-4 py-3">
          <Button
            variant="secondary"
            className="h-11 w-full rounded-2xl font-bold"
            onClick={() => onOpenChange(false)}
          >
            {t("doneEditing")}
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
