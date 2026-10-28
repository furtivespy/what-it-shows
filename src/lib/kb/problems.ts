// One ticket per problem. A problem is a cause from causes.ts, except where the desk read a report as
// something no tenant rule explains (desk-notes.json): those are their own problem, not a footnote.
import notes from '#lib/data/desk-notes.json';
import { causeOf, type Cause, type Report, type Tenant } from '#lib/kb/causes';

// `oneDayMove`: the invite moved by one day. A day/month flip cannot do that.
export type Problem = Cause | 'oneDayMove' | 'unplaced';

export function problemOf(r: Report, t: Tenant | undefined, oneDayMove: readonly string[] = notes.oneDayMove): Problem {
  if (oneDayMove.includes(r.id)) return 'oneDayMove';
  return causeOf(r, t) ?? 'unplaced';
}

export type ProblemGroup = {
  problem: Problem;
  reports: Report[];
  tenants: number;
  firstSeen: string;
  lastSeen: string;
};

export function groupByProblem(reports: Report[], tenantOf: (r: Report) => Tenant | undefined): ProblemGroup[] {
  const byProblem = new Map<Problem, Report[]>();
  for (const r of reports) {
    const p = problemOf(r, tenantOf(r));
    byProblem.set(p, [...(byProblem.get(p) ?? []), r]);
  }
  return [...byProblem.entries()]
    .map(([problem, rs]) => {
      const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
      return {
        problem,
        reports: rs,
        tenants: new Set(rs.map((r) => r.tenant)).size,
        firstSeen: days[0],
        lastSeen: days[days.length - 1],
      };
    })
    .sort((a, b) => b.reports.length - a.reports.length);
}
