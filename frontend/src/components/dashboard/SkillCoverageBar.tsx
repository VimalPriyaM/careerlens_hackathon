/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip as RechartsTooltip, CartesianGrid } from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { buildSkillBarData } from '@/lib/analytics';

interface SkillCoverageBarProps {
  evidenceScores: any[];
}

const barColor = (score: number) => {
  if (score >= 60) return '#10b981';
  if (score >= 35) return '#f59e0b';
  return '#ef4444';
};

const importanceIcon = (imp: string) => {
  if (imp === 'critical') return '●';
  if (imp === 'important') return '◐';
  return '○';
};

export function SkillCoverageBar({ evidenceScores }: SkillCoverageBarProps) {
  const data = buildSkillBarData(evidenceScores);
  if (data.length === 0) return null;

  return (
    <Card className="bg-white border-slate-200/80 shadow-md rounded-2xl">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-semibold text-slate-900">Skill Scores</h3>
          <span className="text-[11px] text-slate-400">{data.length} skills · sorted by score</span>
        </div>
        <p className="text-xs text-slate-500 mb-4">Evidence score per skill, color-coded by strength tier</p>

        <div className="space-y-0">
          <ResponsiveContainer width="100%" height={Math.min(Math.max(data.length * 32, 180), 500)}>
            <BarChart data={data} layout="vertical" margin={{ left: 0, right: 12, top: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis
                type="category"
                dataKey="name"
                width={90}
                tick={({ x, y, payload }: any) => {
                  const item = data.find(d => d.name === payload.value);
                  const imp = item?.importance || '';
                  return (
                    <g transform={`translate(${x},${y})`}>
                      <text x={-8} y={0} dy={4} textAnchor="end" fontSize={11} fill="#475569">
                        <tspan fill={imp === 'critical' ? '#ef4444' : imp === 'important' ? '#3b82f6' : '#94a3b8'} fontSize={8}>
                          {importanceIcon(imp)}{' '}
                        </tspan>
                        {payload.value.length > 14 ? payload.value.substring(0, 14) + '…' : payload.value}
                      </text>
                    </g>
                  );
                }}
                axisLine={false}
                tickLine={false}
              />
              <RechartsTooltip
                contentStyle={{ fontSize: 12, borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgb(0 0 0 / 0.08)' }}
                formatter={(value: any, _: any, props: any) => {
                  const item = props.payload;
                  return [`${value}/100`, `${item.name} (${item.importance})`];
                }}
              />
              <Bar dataKey="score" radius={[0, 6, 6, 0]} barSize={16}>
                {data.map((entry, i) => (
                  <Cell key={i} fill={barColor(entry.score)} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-4 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-[10px] text-slate-500">Strong (60+)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span className="text-[10px] text-slate-500">Moderate (35-59)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <span className="text-[10px] text-slate-500">Weak (&lt;35)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
