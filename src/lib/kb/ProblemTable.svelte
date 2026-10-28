<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { groupByCause, readAs, uniqueById, type Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';

  // Counted the desk's way (causes.ts, as CauseTable does). One-day moves stay counted where they're
  // filed; their own ticket counts them too.
  // `tickets`: where each problem is tracked, problem → issue URL.
  let { ticket, tickets }: { ticket: number; tickets: Record<string, string> } = $props();

  const merged = $derived(uniqueById(reports as Report[]).filter((r) => r.mergedInto === ticket));
  const groups = $derived(groupByCause(merged, tenantOf));
  const moved = $derived(groups.map((g) => ({ cause: g.cause, n: readAs(g, notes.oneDayMove) })).filter((m) => m.n));
  const rows = $derived([
    ...groups.map((g) => ({ problem: g.cause as string, reports: g.reports.length, tenants: g.tenants, seen: `${g.firstSeen} → ${g.lastSeen}` })),
    ...moved.map((m) => ({ problem: 'oneDayMove', reports: m.n, tenants: null, seen: `filed under ${m.cause}` })),
  ]);
  const issue = (url: string) => url.replace(/^https:\/\/github\.com\//, '').replace('/issues/', '#');
</script>

<p class="sum">
  <strong>{merged.length}</strong> reports merged into #{ticket} ·
  <strong>{rows.length}</strong>
  {rows.length === 1 ? 'problem' : 'problems'}
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>tenants</th><th>seen</th><th>ticket</th></tr>
  </thead>
  <tbody>
    {#each rows as r (r.problem)}
      {@const url = tickets[r.problem]}
      <tr class:untracked={!url}>
        <td><code>{r.problem}</code></td>
        <td>{r.reports}</td>
        <td>{r.tenants ?? ''}</td>
        <td>{r.seen}</td>
        <td>{#if url}<a href={url}>{issue(url)}</a>{:else}no ticket yet{/if}</td>
      </tr>
    {/each}
  </tbody>
</table>

{#each moved as m (m.cause)}
  <p class="note">The {m.n} <code>oneDayMove</code> reports are also inside <code>{m.cause}</code>'s count, where the desk files them by tenant.</p>
{/each}

<style>
  .sum { font-size: 1.1rem; }
  .note { color: var(--muted); font-size: 0.85em; }
  .untracked td { background: var(--warn-bg); }
  .untracked td:last-child { color: var(--warn); font-weight: 600; }
</style>
