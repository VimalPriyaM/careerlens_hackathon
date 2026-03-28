/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, CheckSquare, Square, Clock, Layers, ArrowUpRight, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface ProjectCardProps {
  project: any;
  isFirst?: boolean;
  index?: number;
}

const difficultyConfig: Record<string, { color: string; bg: string; border: string }> = {
  beginner: { color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  intermediate: { color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
  advanced: { color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' },
};

export function ProjectCard({ project, isFirst, index = 0 }: ProjectCardProps) {
  const [checklistOpen, setChecklistOpen] = useState(false);
  const [checked, setChecked] = useState<Record<number, boolean>>({});

  const toggleCheck = (i: number) => setChecked((prev) => ({ ...prev, [i]: !prev[i] }));
  const checklist: string[] = project.github_checklist || [];
  const checkedCount = Object.values(checked).filter(Boolean).length;
  const diff = difficultyConfig[project.difficulty] || difficultyConfig.beginner;

  return (
    <Card className={`bg-white border-slate-200/80 shadow-md rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-lg ${isFirst ? 'ring-2 ring-indigo-500/20 border-indigo-200' : ''}`}>
      {/* Top accent bar */}
      <div className={`h-1 ${isFirst ? 'bg-gradient-to-r from-indigo-500 to-violet-500' : 'bg-gradient-to-r from-slate-200 to-slate-100'}`} />

      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isFirst ? 'bg-indigo-50' : 'bg-slate-100'}`}>
              {isFirst ? (
                <Sparkles className="w-4 h-4 text-indigo-600" />
              ) : (
                <span className="text-xs font-bold text-slate-500">{index + 1}</span>
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-semibold text-slate-900">{project.title}</h3>
                {isFirst && (
                  <span className="text-[10px] font-semibold bg-indigo-600 text-white px-2 py-0.5 rounded-full">
                    Recommended
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{project.description}</p>
            </div>
          </div>
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${diff.bg} ${diff.color} ${diff.border}`}>
            {project.difficulty}
          </span>
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3" /> ~{project.estimated_hours}h
          </span>
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <Layers className="w-3 h-3" /> {(project.skills_covered || []).length} skills
          </span>
        </div>

        {/* Tech stack */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {(project.tech_stack || []).map((t: string) => (
            <span key={t} className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded-md border border-slate-200">
              {t}
            </span>
          ))}
        </div>

        {/* Skills covered */}
        <p className="text-[11px] text-slate-400 mb-3">
          Covers: {(project.skills_covered || []).join(', ')}
        </p>

        {/* Evidence impact */}
        {project.evidence_impact && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80 mb-3">
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
            <p className="text-[11px] text-emerald-700 leading-relaxed font-medium">{project.evidence_impact}</p>
          </div>
        )}

        {/* GitHub checklist */}
        {checklist.length > 0 && (
          <div className="pt-3 border-t border-slate-100">
            <button
              type="button"
              className="flex items-center justify-between w-full text-xs text-slate-500 hover:text-slate-700 transition-colors py-1"
              onClick={() => setChecklistOpen(!checklistOpen)}
            >
              <div className="flex items-center gap-1.5">
                {checklistOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                <span className="font-medium">GitHub Push Checklist</span>
              </div>
              <span className="text-[10px] text-slate-400">
                {checkedCount}/{checklist.length}
              </span>
            </button>

            {checklistOpen && (
              <div className="mt-2 space-y-1">
                {/* Progress bar */}
                <div className="h-1 rounded-full bg-slate-100 overflow-hidden mb-2">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                    style={{ width: checklist.length > 0 ? `${(checkedCount / checklist.length) * 100}%` : '0%' }}
                  />
                </div>
                <ul className="space-y-1">
                  {checklist.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-xs cursor-pointer select-none group py-1.5 px-2 rounded-lg hover:bg-slate-50 transition-colors"
                      onClick={() => toggleCheck(i)}
                    >
                      {checked[i] ? (
                        <CheckSquare className="w-4 h-4 mt-0.5 text-emerald-600 flex-shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 mt-0.5 text-slate-300 flex-shrink-0 group-hover:text-slate-400" />
                      )}
                      <span className={`leading-relaxed ${checked[i] ? 'line-through text-slate-400' : 'text-slate-600'}`}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
