**Reports covered: 374** of the 412 merged into #4471.

## Problem
The shared parser reads every date month first. All 11 tenants write dates day first (`Intl` for each tenant locale), so dates with day ≤ 12 come out with day and month swapped (for example 7 April becomes 4 July).

## Scope
- Tenants: all 11 on file
- Received: 2026-04-01 → 2026-10-04
- Channels: app, email, and form reports from booking-v2 tenants (hint `DD/MM/YYYY`)

## How it was counted
Unique ids from `reports-4471.json`. Excludes booking-v3 form reports (issue 2) and the five `oneDayMove` ids in `desk-notes.json` (issue 3). Count uses tenant locale + form from `causes.ts`, not `meta.intakeTag`.

The fix queued for #4471 covers this problem only.
