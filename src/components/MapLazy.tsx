import { Suspense, lazy, useEffect, useState, type ComponentProps } from "react";
import { useI18n } from "@/lib/i18n";

const PickerImpl = lazy(() => import("./MapPicker"));
const ExpenseMapImpl = lazy(() => import("./ExpenseMap"));

function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

function Placeholder({ className }: { className: string }) {
  const { t } = useI18n();
  return (
    <div
      className={`flex items-center justify-center rounded-2xl bg-secondary text-xs font-semibold text-muted-foreground ${className}`}
    >
      {t("loadingMap")}
    </div>
  );
}

export function MapPickerLazy(props: ComponentProps<typeof PickerImpl>) {
  const mounted = useMounted();
  if (!mounted) return <Placeholder className="h-52 w-full" />;
  return (
    <Suspense fallback={<Placeholder className="h-52 w-full" />}>
      <PickerImpl {...props} />
    </Suspense>
  );
}

export function ExpenseMapLazy(props: ComponentProps<typeof ExpenseMapImpl>) {
  const mounted = useMounted();
  if (!mounted) return <Placeholder className="h-[420px] w-full" />;
  return (
    <Suspense fallback={<Placeholder className="h-[420px] w-full" />}>
      <ExpenseMapImpl {...props} />
    </Suspense>
  );
}
