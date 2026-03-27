/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, Tooltip as RechartsTooltip } from 'recharts';
import { Card, CardContent } from '@/components/ui/card';

interface SourceComparisonChartProps {
  evidenceScores: any[];
}

export function SourceComparisonChart({ evidenceScores }: SourceComparisonChartProps) {
  if (!evidenceScores || evidenceScores.length === 0) return null;

  // Compute per-skill scores grouped by source
  const data = evidenceScores
    .sort((a, b) => (b.evidence_score ?? 0) - (a.evidence_score ?? 0))
    .slice(0, 10)
    .map((s) => {
      return {
        name: s.skill_name?.length > 10 ? s.skill_name.substring(0, 10) + '..' : s.skill_name,
        score: s.evidence_score ?? 0,
      };
    });

  const barColor = (score: number) => {
    if (score >= 60) return '#10b981';
    if (score >= 35) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <Card>
      <CardContent className="pt-4 pb-2">
        <p className="text-xs font-semibold mb-2">Evidence Scores by Skill</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} layout="vertical" margin={{ left: 0, right: 10, top: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" width={70} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <RechartsTooltip
              contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e2e8f0' }}
              formatter={(value: any) => [`${value}/100`, 'Score']}
            />
            <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={14}>
              {data.map((entry, i) => (
                <Cell key={i} fill={barColor(entry.score)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
