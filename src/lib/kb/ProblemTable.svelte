<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { groupByProblem, uniqueById, type Problem, type Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';

  // `filed`: where each problem is tracked now, problem → { label, href }.
  let { ticket, filed }: { ticket: number; filed: Partial<Record<Problem, { label: string; href: string }>> } = $props();

  const merged = $derived(uniqueById(reports as Report[]).filter((r) => r.mergedInto === ticket));
  const groups = $derived(groupByProblem(merged, tenantOf, notes.oneDayMove));
  const placed = $derived(groups.reduce((n, g) => n + g.reports.length, 0));
  const tags = (g: { taggedAs: Record<string, number> }) =>
    Object.entries(g.taggedAs)
      .sort((a, b) => b[1] - a[1])
      .map(([tag, n]) => `${tag} ×${n}`)
      .join(' · ');
</script>

<p class="sum">
  <strong>{merged.length}</strong> reports merged into #{ticket} ·
  <strong>{groups.length}</strong>
  {groups.length === 1 ? 'problem' : 'problems'}
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>intake tagged them</th><th>tenants</th><th>seen</th><th>filed as</th></tr>
  </thead>
  <tbody>
    {#each groups as g (g.problem)}
      {@const f = g.problem === 'unplaced' ? undefined : filed[g.problem]}
      <tr class:unfiled={!f}>
        <td><code>{g.problem}</code></td>
        <td>{g.reports.length}</td>
        <td class="tags">{tags(g)}</td>
        <td>{g.tenants}</td>
        <td>{g.firstSeen} → {g.lastSeen}</td>
        <td>{#if f}<a href={f.href}>{f.label}</a>{:else}no ticket yet{/if}</td>
      </tr>
    {/each}
  </tbody>
  <tfoot>
    <tr><td>total</td><td>{placed}</td><td colspan="4"></td></tr>
  </tfoot>
</table>

<style>
  .sum { font-size: 1.1rem; }
  .tags { color: var(--muted); font-size: 0.85em; }
  .unfiled td { background: var(--warn-bg); }
  .unfiled td:last-child { color: var(--warn); font-weight: 600; }
  tfoot td { font-weight: 600; }
</style>
