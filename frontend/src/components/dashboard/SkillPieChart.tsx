/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { Card, CardContent } from '@/components/ui/card';

interface SkillPieChartProps {
  evidenceScores: any[];
}

const COLORS = {
  strong: '#10b981',
  moderate: '#f59e0b',
  weak: '#ef4444',
};

export function SkillPieChart({ evidenceScores }: SkillPieChartProps) {
  if (!evidenceScores || evidenceScores.length === 0) return null;

  const strong = evidenceScores.filter((s) => (s.evidence_score ?? 0) >= 60).length;
  const moderate = evidenceScores.filter((s) => {
    const sc = s.evidence_score ?? 0;
    return sc >= 35 && sc < 60;
  }).length;
  const weak = evidenceScores.filter((s) => (s.evidence_score ?? 0) < 35).length;

  const data = [
    { name: 'Strong (60+)', value: strong, color: COLORS.strong },
    { name: 'Moderate (35-59)', value: moderate, color: COLORS.moderate },
    { name: 'Weak (<35)', value: weak, color: COLORS.weak },
  ].filter((d) => d.value > 0);

  const total = evidenceScores.length;

  return (
    <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200 h-full">
      <CardContent className="pt-5 pb-4">
        <p className="text-sm font-semibold text-slate-900 mb-1">Skill Distribution</p>
        <p className="text-xs text-slate-400 mb-4">{total} skills analyzed</p>
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-[160px] h-[160px] flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={72}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {data.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip
                  contentStyle={{ fontSize: 12, borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}
                  formatter={(value: any, name: any) => [`${value} skills`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-slate-900">{total}</span>
              <span className="text-[10px] text-slate-400">skills</span>
            </div>
          </div>
          <div className="w-full space-y-2.5">
            {strong > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-xs text-slate-600">Strong</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">{strong}</span>
                  <span className="text-[11px] text-slate-400 w-10 text-right">{Math.round((strong / total) * 100)}%</span>
                </div>
              </div>
            )}
            {moderate > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <span className="text-xs text-slate-600">Moderate</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">{moderate}</span>
                  <span className="text-[11px] text-slate-400 w-10 text-right">{Math.round((moderate / total) * 100)}%</span>
                </div>
              </div>
            )}
            {weak > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <span className="text-xs text-slate-600">Weak</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">{weak}</span>
                  <span className="text-[11px] text-slate-400 w-10 text-right">{Math.round((weak / total) * 100)}%</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
