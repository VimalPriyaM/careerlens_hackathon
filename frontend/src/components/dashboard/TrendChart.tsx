/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, Area, AreaChart } from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Minus } from 'lucide-react';
import { TrendPoint } from '@/lib/analytics';

interface TrendChartProps {
  data: TrendPoint[];
}

export function TrendChart({ data }: TrendChartProps) {
  if (!data || data.length < 2) {
    return (
      <Card className="bg-white border-slate-200/80 shadow-md rounded-2xl">
        <CardContent className="p-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-1">Progress Over Time</h3>
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mb-3">
              <TrendingUp className="w-5 h-5 text-slate-400" />
            </div>
            <p className="text-sm text-slate-500">Run multiple scans to see your progress trend</p>
            <p className="text-xs text-slate-400 mt-1">Score history will appear here after your next scan</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const first = data[0];
  const last = data[data.length - 1];
  const change = last.score - first.score;
  const pctChange = first.score > 0 ? Math.round(((last.score - first.score) / first.score) * 100) : 0;

  return (
    <Card className="bg-white border-slate-200/80 shadow-md rounded-2xl">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-semibold text-slate-900">Progress Over Time</h3>
          <div className="flex items-center gap-1.5">
            {change > 0 ? (
              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                ↑ {pctChange}% overall
              </span>
            ) : change < 0 ? (
              <span className="text-[11px] font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                ↓ {Math.abs(pctChange)}% overall
              </span>
            ) : (
              <span className="text-[11px] font-medium text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200 inline-flex items-center gap-1">
                <Minus className="w-3 h-3" /> No change
              </span>
            )}
          </div>
        </div>
        <p className="text-xs text-slate-500 mb-4">{data.length} scans · {first.label} → {last.label}</p>

        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
            <defs>
              <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#6366f1" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={32} />
            <RechartsTooltip
              contentStyle={{
                fontSize: 12, borderRadius: 12, border: '1px solid #e2e8f0',
                boxShadow: '0 4px 12px rgb(0 0 0 / 0.08)', padding: '8px 12px',
              }}
              formatter={(value: any, name: any) => {
                if (name === 'score') return [`${value}/100`, 'Score'];
                if (name === 'readiness') return [`${value}%`, 'Readiness'];
                return [value, name];
              }}
            />
            <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2.5} fill="url(#scoreGradient)" dot={{ r: 4, fill: '#6366f1', stroke: '#fff', strokeWidth: 2 }} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="readiness" stroke="#10b981" strokeWidth={1.5} strokeDasharray="5 5" dot={false} />
          </AreaChart>
        </ResponsiveContainer>

        <div className="flex items-center gap-5 mt-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 rounded bg-indigo-500" />
            <span className="text-[10px] text-slate-500">Score</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 rounded bg-emerald-500 border-dashed" style={{ borderTop: '1.5px dashed #10b981', height: 0 }} />
            <span className="text-[10px] text-slate-500">Readiness</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
