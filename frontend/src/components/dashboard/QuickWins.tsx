'use client';

import { useState } from 'react';
import { CheckCircle, Circle, Zap, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface QuickWinsProps {
  quickWins: string[];
  onCompletionChange?: (completedCount: number, totalCount: number) => void;
}

export function QuickWins({ quickWins, onCompletionChange }: QuickWinsProps) {
  const [checked, setChecked] = useState<Record<number, boolean>>({});

  if (!quickWins || quickWins.length === 0) return null;

  const toggle = (i: number) => {
    setChecked((prev) => {
      const next = { ...prev, [i]: !prev[i] };
      const completedCount = Object.values(next).filter(Boolean).length;
      onCompletionChange?.(completedCount, quickWins.length);
      return next;
    });
  };

  const doneCount = Object.values(checked).filter(Boolean).length;
  const progress = quickWins.length > 0 ? (doneCount / quickWins.length) * 100 : 0;
  const scoreBoost = Math.round((doneCount / quickWins.length) * 5);

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <Zap className="w-4 h-4 text-amber-500" />
        <h2 className="text-lg font-semibold text-slate-900">Quick Wins</h2>
      </div>
      <p className="text-xs text-slate-400 mb-4">Low-effort actions for immediate impact</p>

      <Card className="bg-white border-slate-200/80 shadow-md rounded-2xl">
        <CardContent className="p-5">
          {/* Progress header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-700">{doneCount}/{quickWins.length}</span>
              <span className="text-xs text-slate-400">completed</span>
            </div>
            {doneCount > 0 && (
              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 inline-flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                +{scoreBoost} pts potential
              </span>
            )}
          </div>

          {/* Progress bar */}
          <div className="h-2 rounded-full bg-slate-100 overflow-hidden mb-4">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Items */}
          <ul className="space-y-0.5">
            {quickWins.map((w, i) => (
              <li
                key={i}
                className={`flex items-start gap-3 py-2.5 cursor-pointer select-none group px-3 -mx-3 rounded-xl transition-all duration-200 ${
                  checked[i] ? 'bg-emerald-50/50' : 'hover:bg-slate-50'
                }`}
                onClick={() => toggle(i)}
              >
                {checked[i] ? (
                  <CheckCircle className="w-5 h-5 mt-0.5 text-emerald-500 flex-shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 mt-0.5 text-slate-300 flex-shrink-0 group-hover:text-slate-400" />
                )}
                <span className={`text-sm leading-relaxed break-words ${checked[i] ? 'line-through text-slate-400' : 'text-slate-600'}`}>{w}</span>
              </li>
            ))}
          </ul>

          {doneCount === quickWins.length && quickWins.length > 0 && (
            <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
              <p className="text-xs font-semibold text-emerald-700">All quick wins completed!</p>
              <p className="text-[11px] text-emerald-600 mt-0.5">Re-scan to see your updated score</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
