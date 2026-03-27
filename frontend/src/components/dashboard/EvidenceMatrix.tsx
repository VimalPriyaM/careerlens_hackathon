/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, FileText, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { FaLinkedin, FaGithub } from 'react-icons/fa';
import { SkillDetailPanel } from './SkillDetailPanel';

interface EvidenceMatrixProps {
  evidenceScores: any[];
}

const importanceOrder: Record<string, number> = { critical: 0, important: 1, nice_to_have: 2 };
const scoreColor = (s: number) => s >= 60 ? 'text-emerald-600' : s >= 35 ? 'text-amber-600' : 'text-red-500';
const barBg = (s: number) => s >= 60 ? 'bg-emerald-500' : s >= 35 ? 'bg-amber-400' : 'bg-red-400';
const barTrack = (s: number) => s >= 60 ? 'bg-emerald-100' : s >= 35 ? 'bg-amber-100' : 'bg-red-100';

const statusStyle: Record<string, string> = {
  fully_verified: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  hidden_skill: 'bg-blue-50 text-blue-700 border-blue-200',
  undiscovered: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  claimed_unproven: 'bg-amber-50 text-amber-700 border-amber-200',
  underreported: 'bg-orange-50 text-orange-700 border-orange-200',
  social_only: 'bg-slate-50 text-slate-600 border-slate-200',
  suspicious: 'bg-red-50 text-red-700 border-red-200',
  missing: 'bg-red-50 text-red-600 border-red-200',
};

const rowAccent: Record<string, string> = {
  fully_verified: 'border-l-emerald-500',
  hidden_skill: 'border-l-blue-500',
  undiscovered: 'border-l-indigo-500',
  claimed_unproven: 'border-l-amber-500',
  underreported: 'border-l-orange-500',
  suspicious: 'border-l-red-500',
  missing: 'border-l-red-400',
  social_only: 'border-l-slate-400',
};

function SourceIcon({ type, found }: { type: 'resume' | 'linkedin' | 'github'; found: boolean }) {
  const base = `w-5 h-5 rounded-md flex items-center justify-center`;
  if (type === 'resume') return (
    <div className={`${base} ${found ? 'bg-blue-100' : 'bg-muted/50'}`}>
      <FileText className={`w-2.5 h-2.5 ${found ? 'text-blue-600' : 'text-muted-foreground/30'}`} />
    </div>
  );
  if (type === 'linkedin') return (
    <div className={`${base} ${found ? 'bg-sky-100' : 'bg-muted/50'}`}>
      <FaLinkedin className={`w-2.5 h-2.5 ${found ? 'text-[#0A66C2]' : 'text-muted-foreground/30'}`} />
    </div>
  );
  return (
    <div className={`${base} ${found ? 'bg-gray-100' : 'bg-muted/50'}`}>
      <FaGithub className={`w-2.5 h-2.5 ${found ? 'text-gray-800' : 'text-muted-foreground/30'}`} />
    </div>
  );
}

function HeaderTip({ label, tip }: { label: string; tip: string }) {
  return (
    <Tooltip>
      <TooltipTrigger className="flex items-center gap-0.5 text-muted-foreground">
        {label} <Info className="w-2.5 h-2.5 opacity-40" />
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[180px] text-xs">{tip}</TooltipContent>
    </Tooltip>
  );
}

export function EvidenceMatrix({ evidenceScores }: EvidenceMatrixProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  if (!evidenceScores || evidenceScores.length === 0) return null;

  const sorted = [...evidenceScores].sort((a, b) => {
    const ia = importanceOrder[a.importance] ?? 2;
    const ib = importanceOrder[b.importance] ?? 2;
    if (ia !== ib) return ia - ib;
    return (a.evidence_score ?? 0) - (b.evidence_score ?? 0);
  });

  return (
    <TooltipProvider>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/30 text-[11px]">
                <th className="w-7 p-2"></th>
                <th className="text-left p-2 font-medium">Skill</th>
                <th className="text-center p-2 font-medium hidden md:table-cell w-16">
                  <HeaderTip label="Level" tip="How critical this skill is for the target role: critical > important > nice to have" />
                </th>
                <th className="text-center p-2 font-medium hidden sm:table-cell w-8">
                  <HeaderTip label="" tip="Found on Resume" />
                  <FileText className="w-3 h-3 mx-auto text-blue-500" />
                </th>
                <th className="text-center p-2 font-medium hidden sm:table-cell w-8">
                  <HeaderTip label="" tip="Found on LinkedIn" />
                  <FaLinkedin className="w-3 h-3 mx-auto text-[#0A66C2]" />
                </th>
                <th className="text-center p-2 font-medium hidden sm:table-cell w-8">
                  <HeaderTip label="" tip="Found on GitHub (code evidence)" />
                  <FaGithub className="w-3 h-3 mx-auto text-gray-700" />
                </th>
                <th className="text-center p-2 font-medium w-28">
                  <HeaderTip label="Score" tip="Evidence score out of 100. Green >= 60, amber 35-59, red < 35" />
                </th>
                <th className="text-center p-2 font-medium hidden lg:table-cell w-28">
                  <HeaderTip label="Status" tip="Cross-reference classification: how consistently this skill appears across your 3 sources" />
                </th>
              </tr>
            </thead>
            {sorted.map((e: any, i: number) => {
              const xref = e.cross_reference || {};
              const status = xref.status || '';
              const isOpen = expandedIndex === i;
              const score = e.evidence_score ?? 0;

              return (
                <tbody key={i}>
                  <tr
                    className={`border-b border-l-[3px] cursor-pointer transition-all duration-150 text-xs ${isOpen ? 'bg-muted/20' : 'hover:bg-muted/10'} ${rowAccent[status] || 'border-l-transparent'}`}
                    onClick={() => setExpandedIndex(isOpen ? null : i)}
                  >
                    <td className="p-2 text-center text-muted-foreground">
                      {isOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                    </td>
                    <td className={`p-2 ${e.importance === 'critical' ? 'font-semibold' : 'font-medium'}`}>{e.skill_name}</td>
                    <td className="p-2 text-center hidden md:table-cell">
                      <Badge variant={e.importance === 'critical' ? 'destructive' : e.importance === 'important' ? 'default' : 'secondary'} className="text-[9px] px-1.5 py-0">
                        {e.importance === 'nice_to_have' ? 'nice' : e.importance}
                      </Badge>
                    </td>
                    <td className="p-2 text-center hidden sm:table-cell"><SourceIcon type="resume" found={!!xref.resume} /></td>
                    <td className="p-2 text-center hidden sm:table-cell"><SourceIcon type="linkedin" found={!!xref.linkedin} /></td>
                    <td className="p-2 text-center hidden sm:table-cell"><SourceIcon type="github" found={!!xref.github} /></td>
                    <td className="p-2">
                      <div className="flex items-center gap-2 justify-center">
                        <div className={`w-16 h-2 rounded-full overflow-hidden ${barTrack(score)}`}>
                          <div className={`h-full rounded-full transition-all ${barBg(score)}`} style={{ width: `${score}%` }} />
                        </div>
                        <span className={`font-bold tabular-nums text-xs w-6 text-right ${scoreColor(score)}`}>{score}</span>
                      </div>
                    </td>
                    <td className="p-2 text-center hidden lg:table-cell">
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-medium border ${statusStyle[status] || 'bg-muted text-muted-foreground border-border'}`}>
                        {xref.label || ''}
                      </span>
                    </td>
                  </tr>
                  {isOpen && (
                    <tr><td colSpan={8}><SkillDetailPanel entry={e} /></td></tr>
                  )}
                </tbody>
              );
            })}
          </table>
        </div>
      </Card>
    </TooltipProvider>
  );
}
