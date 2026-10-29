import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = path.join(root, 'src/lib/data');

const tenants = Object.fromEntries(
  fs.readdirSync(path.join(dataDir, 'tenants')).map((f) => {
    const t = JSON.parse(fs.readFileSync(path.join(dataDir, 'tenants', f), 'utf8'));
    return [t.handle, t];
  }),
);
const notes = JSON.parse(fs.readFileSync(path.join(dataDir, 'desk-notes.json'), 'utf8'));
const reports = [...new Map(JSON.parse(fs.readFileSync(path.join(dataDir, 'reports-4471.json'), 'utf8')).map((r) => [r.id, r])).values()].filter(
  (r) => r.mergedInto === 4471,
);

const DATE_HINT = { 'booking-v2': 'DD/MM/YYYY', 'booking-v3': 'MM/DD/YYYY' };

function dayFirst(locale) {
  const order = new Intl.DateTimeFormat(locale, { year: 'numeric', month: '2-digit', day: '2-digit' })
    .formatToParts(new Date(Date.UTC(2026, 0, 2, 12)))
    .map((p) => p.type);
  return order.indexOf('day') < order.indexOf('month');
}

function causeOf(r, t) {
  if (!t || !dayFirst(t.locale)) return null;
  return r.channel === 'form' && DATE_HINT[t.form].startsWith('MM') ? 'hint' : 'parser';
}

function groupByCause(rs) {
  const by = new Map();
  for (const r of rs) {
    const c = causeOf(r, tenants[r.tenant]) ?? 'unplaced';
    by.set(c, [...(by.get(c) ?? []), r]);
  }
  return [...by.entries()].map(([cause, list]) => ({
    cause,
    list,
    tags: list.reduce((n, r) => ({ ...n, [r.meta.intakeTag]: (n[r.meta.intakeTag] ?? 0) + 1 }), {}),
    tenants: new Set(list.map((r) => r.tenant)).size,
    days: list.map((r) => r.receivedAt.slice(0, 10)).sort(),
  }));
}

function groupByProblem(all) {
  const oneDay = notes.oneDayMove;
  const moved = all.filter((r) => oneDay.includes(r.id));
  const rest = groupByCause(all.filter((r) => !oneDay.includes(r.id))).map(({ cause, list, ...g }) => ({
    problem: cause,
    list,
    ...g,
  }));
  if (!moved.length) return rest;
  const [one] = groupByCause(moved);
  return [...rest, { problem: 'one-day', list: moved, tags: one.tags, tenants: one.tenants, days: one.days }].sort(
    (a, b) => b.list.length - a.list.length,
  );
}

const problems = groupByProblem(reports);
const causes = groupByCause(reports).sort((a, b) => b.list.length - a.list.length);
const repo = 'https://github.com/ktolembek/what-it-shows/issues';
const filed = { parser: 1, hint: 2, 'one-day': 3 };

function tagStr(tags) {
  return Object.entries(tags)
    .sort((a, b) => b[1] - a[1])
    .map(([t, n]) => `${t} ×${n}`)
    .join(' · ');
}

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const problemRows = problems
  .map((g) => {
    const n = filed[g.problem];
    return `<tr><td><code>${g.problem}</code></td><td>${g.list.length}</td><td class="tags">${tagStr(g.tags)}</td><td>${g.tenants}</td><td>${g.days[0]} → ${g.days[g.days.length - 1]}</td><td><a href="${repo}/${n}">issue ${n}</a></td></tr>`;
  })
  .join('\n');

const causeRows = causes
  .map((g) => {
    const wrong = g.cause !== 'parser';
    return `<tr class="${wrong ? 'wrong' : ''}"><td><code>${g.cause}</code></td><td>${g.list.length}</td><td class="tags">${tagStr(g.tags)}</td><td>${g.tenants}</td><td>${g.days[0]} → ${g.days[g.days.length - 1]}</td><td>${wrong ? 'not this ticket — no ticket of its own' : '#4471'}</td></tr>`;
  })
  .join('\n');

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" />
<title>#4471 · three problems, not one · support kb</title>
<style>
:root{--bg:#fbfaf7;--fg:#1d1d1b;--muted:#6b6a66;--line:#e3e0d8;--accent:#2f6f5e;--warn:#b4501f;--warn-bg:#fbeee6;--note-bg:#eef5f2;--mono:ui-monospace,Menlo,monospace}
body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.6 system-ui,sans-serif}
.kb{max-width:760px;margin:0 auto;padding:2rem 16px 4rem}
.kb table{border-collapse:collapse;width:100%;margin:1rem 0;font-size:.92rem}
.kb th,.kb td{border-bottom:1px solid var(--line);padding:.35rem .5rem;text-align:left}
.kb code{font-family:var(--mono);font-size:.88em}
.kb a{color:var(--accent)}
.tags{color:var(--muted);font-size:.85em}
aside.warn{border-left:4px solid var(--warn);padding:.5rem 1rem;margin:1rem 0;background:var(--warn-bg)}
.wrong td{background:var(--warn-bg)}.wrong td:last-child{color:var(--warn);font-weight:600}
.stamp{margin:2rem 0 0;font:.85rem var(--mono);color:var(--muted)}.stamp b{color:var(--accent)}
</style></head><body>
<div class="kb">
<header><a href="/kb">support desk · kb</a>
<h1>#4471 · three problems, not one</h1>
<p>owner <b>Kenessary Tolembek</b> · status open · reviewed 2026-10-29</p></header>
<main>
<p><a href="/kb/incidents/4471">#4471</a> is marked known: one issue, one fix queued. The reports merged into it describe three problems. The queued parser fix closes the first one only.</p>
<aside class="warn">Fixing the parser leaves two problems open: the booking-v3 date hint, and dates that move by one day. Each now has a ticket of its own.</aside>
<h2>The problems</h2>
<p><strong>${reports.length}</strong> reports merged into #4471 · <strong>${problems.length}</strong> problems</p>
<table><thead><tr><th>problem</th><th>reports</th><th>intake tagged them</th><th>tenants</th><th>seen</th><th>filed as</th></tr></thead>
<tbody>${problemRows}</tbody>
<tfoot><tr><td>total</td><td>${reports.length}</td><td colspan="4"></td></tr></tfoot></table>
<h2>Cause table (unchanged from #4471 page)</h2>
<p><strong>${reports.length}</strong> reports merged into #4471 · <strong>${causes.length}</strong> causes</p>
<table><thead><tr><th>cause</th><th>reports</th><th>tagged as</th><th>tenants</th><th>seen</th><th></th></tr></thead>
<tbody>${causeRows}</tbody></table>
<p class="tags">${notes.oneDayMove.length} reports read as a one-day move; filed under <code>parser</code> by tenant.</p>
<p class="stamp">desk ref <b>DR-VN3D-VMGE</b></p>
</main>
<footer>Pages are written by people. Tables and charts are built from data at render time.</footer>
</div></body></html>`;

const outDir = path.join(root, 'rendered');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, '4471-problems.html'), html);
console.log('wrote', path.join(outDir, '4471-problems.html'));
