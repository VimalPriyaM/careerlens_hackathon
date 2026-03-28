/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { getFocusAreas, getStrongSkills, getWeakSkills } from '@/lib/analytics';

interface FocusAreasProps {
  evidenceScores: any[];
}

const scoreColor = (s: number) => s >= 60 ? 'text-emerald-600' : s >= 35 ? 'text-amber-500' : 'text-red-500';

export function FocusAreas({ evidenceScores }: FocusAreasProps) {
  const focusAreas = getFocusAreas(evidenceScores);
  const strongSkills = getStrongSkills(evidenceScores, 5);
  const weakSkills = getWeakSkills(evidenceScores, 5);

  if (focusAreas.length === 0 && strongSkills.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
      {/* Top Strengths */}
      {strongSkills.length > 0 && (
        <Card className="bg-white border-slate-200/80 shadow-md rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-lg bg-emerald-50 flex items-center justify-center">
                <span className="text-emerald-600 text-xs font-bold">✓</span>
              </div>
              <h3 className="text-sm font-semibold text-slate-900">Top Strengths</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">Your strongest verified skills</p>
            <div className="space-y-2.5">
              {strongSkills.map((s: any, i: number) => (
                <div key={i} className="flex items-center justify-between group">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-[11px] font-mono text-slate-400 w-4">{i + 1}.</span>
                    <span className="text-sm text-slate-700 font-medium truncate">{s.skill_name}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${
                      s.importance === 'critical' ? 'bg-red-50 text-red-600 border-red-200' :
                      s.importance === 'important' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                      'bg-slate-50 text-slate-500 border-slate-200'
                    }`}>
                      {s.importance === 'nice_to_have' ? 'nice' : s.importance}
                    </span>
                  </div>
                  <span className={`text-sm font-bold tabular-nums ${scoreColor(s.evidence_score ?? 0)}`}>
                    {s.evidence_score ?? 0}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Priority Focus */}
      {(focusAreas.length > 0 || weakSkills.length > 0) && (
        <Card className="bg-white border-slate-200/80 shadow-md rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-lg bg-amber-50 flex items-center justify-center">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">Priority Focus</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              {focusAreas.length > 0
                ? `${focusAreas.length} critical skill${focusAreas.length !== 1 ? 's' : ''} need attention`
                : 'Weakest skills to improve'}
            </p>
            <div className="space-y-2.5">
              {(focusAreas.length > 0 ? focusAreas.slice(0, 5) : weakSkills).map((s: any, i: number) => (
                <div key={i} className="flex items-center justify-between group">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-[11px] font-mono text-slate-400 w-4">{i + 1}.</span>
                    <span className="text-sm text-slate-700 font-medium truncate">{s.skill_name}</span>
                    {s.importance === 'critical' && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full border font-medium bg-red-50 text-red-600 border-red-200">
                        critical
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold tabular-nums ${scoreColor(s.evidence_score ?? 0)}`}>
                      {s.evidence_score ?? 0}
                    </span>
                    <ArrowRight className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))}
            </div>
            {focusAreas.length > 0 && focusAreas[0].cross_reference?.action && (
              <p className="text-[11px] text-slate-400 mt-3 pt-3 border-t border-slate-100">
                {focusAreas[0].cross_reference?.action}
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
