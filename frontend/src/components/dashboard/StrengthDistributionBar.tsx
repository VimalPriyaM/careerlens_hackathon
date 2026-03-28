/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { buildStrengthDistribution, buildSourceCoverage } from '@/lib/analytics';

interface StrengthDistributionBarProps {
  evidenceScores: any[];
}

export function StrengthDistributionBar({ evidenceScores }: StrengthDistributionBarProps) {
  const distribution = buildStrengthDistribution(evidenceScores);
  const coverage = buildSourceCoverage(evidenceScores);
  const total = evidenceScores?.length || 0;

  if (total === 0) return null;

  const sourceColors: Record<string, { bar: string; bg: string; text: string }> = {
    Resume: { bar: 'bg-blue-500', bg: 'bg-blue-50', text: 'text-blue-700' },
    LinkedIn: { bar: 'bg-sky-500', bg: 'bg-sky-50', text: 'text-sky-700' },
    GitHub: { bar: 'bg-slate-700', bg: 'bg-slate-100', text: 'text-slate-700' },
  };

  return (
    <Card className="bg-white border-slate-200/80 shadow-md rounded-2xl h-full">
      <CardContent className="p-6">
        <h3 className="text-sm font-semibold text-slate-900 mb-1">Skill Distribution</h3>
        <p className="text-xs text-slate-500 mb-5">{total} skills analyzed across 3 sources</p>

        {/* Stacked horizontal bar */}
        <div className="mb-5">
          <div className="flex h-4 rounded-full overflow-hidden bg-slate-100">
            {distribution.map(d => (
              d.count > 0 && (
                <div
                  key={d.label}
                  className="h-full transition-all duration-700 first:rounded-l-full last:rounded-r-full"
                  style={{ width: `${d.pct}%`, backgroundColor: d.color }}
                />
              )
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-3">
            {distribution.map(d => (
              <div key={d.label} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-[11px] text-slate-600 font-medium">{d.label}</span>
                <span className="text-[11px] text-slate-400">{d.count} ({d.pct}%)</span>
              </div>
            ))}
          </div>
        </div>

        {/* Source coverage bars */}
        <div className="space-y-3.5 pt-4 border-t border-slate-100">
          <p className="text-xs font-medium text-slate-700">Source Coverage</p>
          {coverage.map(src => {
            const colors = sourceColors[src.source] || sourceColors.GitHub;
            return (
              <div key={src.source}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-medium text-slate-600">{src.source}</span>
                  <span className={`text-[11px] font-semibold ${colors.text}`}>{src.found}/{total} ({src.pct}%)</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${colors.bar}`}
                    style={{ width: `${src.pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
