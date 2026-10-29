Split from #4471 (support desk). **Reports: 379** of the 412 merged into #4471, as the desk counts them (CauseTable, cause `parser`).

**Problem.** The shared parser reads every date month first. All 11 tenants write the day first, so day and month trade places when the day is 12 or less.

**Example reports.**
- R-41203 (lantern.row, app): "Booked for 2 December. The invite says 12 February."
- R-41206 (long.table, app): "Second time this month: 4 March turned into 3 April."

**Scope.** 11 tenants; app ×204, email ×150, booking-v2 form ×25. First report 2026-04-01, last 2026-10-04.

**How the count was made.** Unique ids from `reports-4471.json` (412 merged into #4471), grouped by `causeOf()` in `src/lib/kb/causes.ts` (cause `parser`). Five of these are read as a one-day move in `desk-notes.json` and have their own ticket (#3); they remain in this CauseTable row as exported.

This is the bug #4471 describes; the queued parser fix is for this cause.
