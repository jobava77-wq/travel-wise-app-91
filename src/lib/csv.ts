import { formatGel, type Expense, type Trip } from "@/lib/expenses";

const esc = (v: string) => `"${String(v).replaceAll('"', '""')}"`;

/** Builds and downloads a structured CSV of a trip's expenses. */
export function downloadTripCsv(trip: Trip, expenses: Expense[]) {
  const header = [
    "date",
    "category",
    "custom_category",
    "note",
    "tags",
    "amount",
    "currency",
    "amount_gel",
    "latitude",
    "longitude",
  ];
  const lines = expenses.map((e) =>
    [
      e.spentAt,
      e.category,
      esc(e.customCategory ?? ""),
      esc(e.note ?? ""),
      esc((e.tags ?? []).join(" ")),
      String(e.amount),
      e.currency,
      e.amountGel.toFixed(2),
      e.lat ?? "",
      e.lng ?? "",
    ].join(","),
  );
  const total = expenses.reduce((s, e) => s + e.amountGel, 0);
  lines.push(["", "TOTAL", "", "", "", "", "", total.toFixed(2), "", ""].join(","));
  const csv = [header.join(","), ...lines].join("\r\n");
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${trip.name.replace(/[^\p{L}\p{N}]+/gu, "-").replace(/(^-|-$)/g, "") || "trip"}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  return formatGel(total);
}
