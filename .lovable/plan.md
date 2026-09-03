# What could be improved next

Here's what stands out in the app today, ordered by impact. Pick any subset and I'll build it.

## 1. Data privacy (most important)

Right now the database rules allow anyone to read, edit and delete every trip and every expense — the PIN only filters what the app *asks for*, it does not protect the data. Confirmed: all eight policies on `trips` and `expenses` are open to the public role with no condition.

Two options:
- Quick: keep the PIN login, but move reads/writes behind server functions that enforce the PIN, and lock the tables down so the browser can't query them directly.
- Proper: switch to real email/password accounts, tie trips to the account, and use per-user rules. The PIN screen goes away.

## 2. Editing what already exists

- No way to edit a trip (rename, change dates) — only create and delete.
- No way to edit an expense — only delete and re-add.
- Trip deletion happens instantly with no confirmation, and it removes all of that trip's expenses.

Add an edit sheet for both, plus a confirm dialog before deleting a trip.

## 3. Trip-level insight

- Per-trip budget with a progress bar and an over-budget warning.
- Daily average spend and "days remaining" from the trip dates.
- Expense list grouped by day with day subtotals.
- Filter/search the expense list by category or note.

## 4. Rates

Rates are manual only. Add an optional "fetch today's rate" button pulling live GEL rates from the National Bank of Georgia, keeping manual override as the default behaviour.

## 5. Export and offline

- Export a trip to CSV (or a share sheet on mobile).
- The PWA has a manifest and icons but no service worker, so it doesn't work offline. Add caching of the app shell and a clear offline banner.

## 6. Polish

- Empty/error states when the network is down (currently a generic sync toast).
- Trip cards: the delete button sits inside the tappable row and is easy to hit by accident — move it into a swipe or overflow action.
- Add a per-trip cover colour or emoji so the dashboard reads faster.

## Technical notes

Items 1 and 2 touch `src/lib/expenses.tsx`, the migration layer, and the trip/expense sheets. Items 3-6 are mostly presentational and can be done independently in `src/routes/trip.$tripId.tsx`, `ExpenseList.tsx`, `TotalCard.tsx` and `RatesCard.tsx`.
