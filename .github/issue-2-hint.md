**Reports covered: 33** of the 412 merged into #4471.

## Problem
booking-v3 prints `MM/DD/YYYY` under the date field for day-first tenants. People type month first as instructed; the form reads day first. The shared parser is not involved, so the parser fix for #4471 does not apply.

## Scope
- Tenants: alder.physio, copper.studio, pale.harbour (booking-v3)
- Channel: form only
- Received: 2026-04-17 → 2026-09-22

## How it was counted
`causeOf` in `causes.ts`: day-first locale + form channel + booking-v3 form hint starting with `MM`.
