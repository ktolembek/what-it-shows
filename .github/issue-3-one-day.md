**Reports covered: 5** of the 412 merged into #4471.

## Problem
These reports describe a date moving by exactly one day, or different days for the same meeting across time zones. That is not a month/day swap. Likely time-zone or day-boundary handling, not the parser (issue 1) or form hint (issue 2).

## Reports
- R-41202: Invite Tuesday 12 May vs calendar Monday 11 May
- R-41209: Every June booking one day off
- R-41236: Invite arrived before booking was made
- R-41344: Lisbon Tuesday vs Toronto Monday, same meeting
- R-41620: Tuesday 6 October showed as Monday

## How it was counted
Ids listed in `desk-notes.json` as `oneDayMove`. Bodies checked: no exact day/month swap pattern.
