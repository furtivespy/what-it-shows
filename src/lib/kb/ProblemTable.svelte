<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import { uniqueById, type Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';
  import { groupByProblem, type Problem } from '#lib/kb/problems';

  // `tickets`: where each problem is tracked, problem → issue URL.
  let { ticket, tickets }: { ticket: number; tickets: Partial<Record<Problem, string>> } = $props();

  const merged = $derived(uniqueById(reports as Report[]).filter((r) => r.mergedInto === ticket));
  const groups = $derived(groupByProblem(merged, tenantOf));
  const counted = $derived(groups.reduce((n, g) => n + g.reports.length, 0));
  const issue = (url: string) => url.replace(/^https:\/\/github\.com\//, '').replace('/issues/', '#');
</script>

<p class="sum">
  <strong>{merged.length}</strong> reports merged into #{ticket} ·
  <strong>{groups.length}</strong>
  {groups.length === 1 ? 'problem' : 'problems'}
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>tenants</th><th>seen</th><th>ticket</th></tr>
  </thead>
  <tbody>
    {#each groups as g (g.problem)}
      {@const url = tickets[g.problem]}
      <tr class:untracked={!url}>
        <td><code>{g.problem}</code></td>
        <td>{g.reports.length}</td>
        <td>{g.tenants}</td>
        <td>{g.firstSeen} → {g.lastSeen}</td>
        <td>{#if url}<a href={url}>{issue(url)}</a>{:else}no ticket yet{/if}</td>
      </tr>
    {/each}
  </tbody>
  <tfoot>
    <tr><td>all</td><td>{counted}</td><td colspan="3">{counted === merged.length ? 'every report counted once' : 'counts do not add up'}</td></tr>
  </tfoot>
</table>

<style>
  .sum { font-size: 1.1rem; }
  .untracked td { background: var(--warn-bg); }
  .untracked td:last-child { color: var(--warn); font-weight: 600; }
  tfoot td { color: var(--muted); font-size: 0.85em; }
</style>
