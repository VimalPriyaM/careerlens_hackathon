/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, FileText, Info, CheckCircle2, XCircle, ShieldAlert, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { FaLinkedin, FaGithub } from 'react-icons/fa';
import { SkillDetailPanel } from './SkillDetailPanel';

interface EvidenceMatrixProps {
  evidenceScores: any[];
}

const importanceOrder: Record<string, number> = { critical: 0, important: 1, nice_to_have: 2 };
const scoreColor = (s: number) => s >= 60 ? 'text-emerald-600' : s >= 35 ? 'text-amber-500' : 'text-red-500';
const barGradient = (s: number) => s >= 60 ? 'from-emerald-400 to-emerald-600' : s >= 35 ? 'from-amber-300 to-amber-500' : 'from-red-300 to-red-500';
const barTrack = (s: number) => s >= 60 ? 'bg-emerald-100/60' : s >= 35 ? 'bg-amber-100/60' : 'bg-red-100/60';
const scoreRing = (s: number) => s >= 60 ? 'ring-emerald-200 bg-emerald-50' : s >= 35 ? 'ring-amber-200 bg-amber-50' : 'ring-red-200 bg-red-50';

const statusConfig: Record<string, { bg: string; icon: any; iconColor: string }> = {
  fully_verified: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2, iconColor: 'text-emerald-500' },
  hidden_skill: { bg: 'bg-blue-50 text-blue-700 border-blue-200', icon: Eye, iconColor: 'text-blue-500' },
  undiscovered: { bg: 'bg-slate-100 text-slate-600 border-slate-200', icon: EyeOff, iconColor: 'text-slate-400' },
  claimed_unproven: { bg: 'bg-amber-50 text-amber-700 border-amber-200', icon: AlertTriangle, iconColor: 'text-amber-500' },
  underreported: { bg: 'bg-orange-50 text-orange-700 border-orange-200', icon: AlertTriangle, iconColor: 'text-orange-500' },
  social_only: { bg: 'bg-slate-50 text-slate-600 border-slate-200', icon: EyeOff, iconColor: 'text-slate-400' },
  suspicious: { bg: 'bg-red-50 text-red-700 border-red-200', icon: ShieldAlert, iconColor: 'text-red-500' },
  missing: { bg: 'bg-red-50 text-red-600 border-red-200', icon: XCircle, iconColor: 'text-red-400' },
};

const rowAccent: Record<string, string> = {
  fully_verified: 'border-l-emerald-500',
  hidden_skill: 'border-l-blue-500',
  undiscovered: 'border-l-slate-300',
  claimed_unproven: 'border-l-amber-500',
  underreported: 'border-l-orange-500',
  suspicious: 'border-l-red-500',
  missing: 'border-l-red-400',
  social_only: 'border-l-slate-400',
};

const importanceBadge: Record<string, { bg: string; dot: string; text: string }> = {
  critical: { bg: 'bg-red-50 border-red-200', dot: 'bg-red-500', text: 'text-red-700' },
  important: { bg: 'bg-blue-50 border-blue-200', dot: 'bg-blue-500', text: 'text-blue-700' },
  nice_to_have: { bg: 'bg-slate-50 border-slate-200', dot: 'bg-slate-400', text: 'text-slate-600' },
};

function SourceIcon({ type, found }: { type: 'resume' | 'linkedin' | 'github'; found: boolean }) {
  const base = 'w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200';
  if (!found) return (
    <div className={`${base} bg-slate-50 border border-slate-100`}>
      {type === 'resume' && <FileText className="w-3.5 h-3.5 text-slate-300" />}
      {type === 'linkedin' && <FaLinkedin className="w-3.5 h-3.5 text-slate-300" />}
      {type === 'github' && <FaGithub className="w-3.5 h-3.5 text-slate-300" />}
    </div>
  );
  if (type === 'resume') return (
    <div className={`${base} bg-blue-50 border border-blue-200 shadow-sm shadow-blue-100`}>
      <FileText className="w-3.5 h-3.5 text-blue-600" />
    </div>
  );
  if (type === 'linkedin') return (
    <div className={`${base} bg-sky-50 border border-sky-200 shadow-sm shadow-sky-100`}>
      <FaLinkedin className="w-3.5 h-3.5 text-[#0A66C2]" />
    </div>
  );
  return (
    <div className={`${base} bg-slate-50 border border-slate-200 shadow-sm shadow-slate-100`}>
      <FaGithub className="w-3.5 h-3.5 text-slate-800" />
    </div>
  );
}

function HeaderTip({ label, tip }: { label: string; tip: string }) {
  return (
    <Tooltip>
      <TooltipTrigger className="flex items-center gap-1 text-slate-500 hover:text-slate-700 transition-colors">
        {label} <Info className="w-3 h-3 opacity-40" />
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[200px] text-xs font-normal">{tip}</TooltipContent>
    </Tooltip>
  );
}

function StatusBadge({ status, label }: { status: string; label: string }) {
  const config = statusConfig[status] || { bg: 'bg-slate-50 text-slate-500 border-slate-200', icon: EyeOff, iconColor: 'text-slate-400' };
  const IconComp = config.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full font-medium border ${config.bg}`}>
      <IconComp className={`w-3 h-3 ${config.iconColor}`} />
      {label}
    </span>
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
      <Card className="overflow-hidden bg-white border-slate-200/80 shadow-md rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-0">
            <thead>
              <tr className="bg-gradient-to-b from-slate-50 to-slate-100/80 text-[11px] uppercase tracking-wider">
                <th className="w-8 p-2 sm:p-3 first:rounded-tl-2xl sticky left-0 bg-gradient-to-b from-slate-50 to-slate-100/80 z-10"></th>
                <th className="text-left px-2 sm:px-4 py-3.5 font-semibold text-slate-500 sticky left-8 sm:left-11 bg-gradient-to-b from-slate-50 to-slate-100/80 z-10 min-w-[100px] sm:min-w-[150px]">Skill</th>
                <th className="text-center px-3 py-3.5 font-semibold text-slate-500 hidden md:table-cell w-20">
                  <HeaderTip label="Level" tip="How critical this skill is for the target role: critical > important > nice to have" />
                </th>
                <th className="text-center px-2 py-3.5 font-semibold hidden sm:table-cell w-12">
                  <Tooltip>
                    <TooltipTrigger><FileText className="w-4 h-4 mx-auto text-blue-500" /></TooltipTrigger>
                    <TooltipContent side="top" className="text-xs font-normal">Found on Resume</TooltipContent>
                  </Tooltip>
                </th>
                <th className="text-center px-2 py-3.5 font-semibold hidden sm:table-cell w-12">
                  <Tooltip>
                    <TooltipTrigger><FaLinkedin className="w-4 h-4 mx-auto text-[#0A66C2]" /></TooltipTrigger>
                    <TooltipContent side="top" className="text-xs font-normal">Found on LinkedIn</TooltipContent>
                  </Tooltip>
                </th>
                <th className="text-center px-2 py-3.5 font-semibold hidden sm:table-cell w-12">
                  <Tooltip>
                    <TooltipTrigger><FaGithub className="w-4 h-4 mx-auto text-slate-700" /></TooltipTrigger>
                    <TooltipContent side="top" className="text-xs font-normal">Found on GitHub (code evidence)</TooltipContent>
                  </Tooltip>
                </th>
                <th className="text-center px-2 sm:px-3 py-3.5 font-semibold text-slate-500 w-28 sm:w-40">
                  <HeaderTip label="Score" tip="Evidence score out of 100. Green >= 60, amber 35-59, red < 35" />
                </th>
                <th className="text-center px-3 py-3.5 font-semibold text-slate-500 hidden lg:table-cell w-36 last:rounded-tr-2xl">
                  <HeaderTip label="Status" tip="Cross-reference classification across your 3 sources" />
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((e: any, i: number) => {
                const xref = e.cross_reference || {};
                const status = xref.status || '';
                const isOpen = expandedIndex === i;
                const score = e.evidence_score ?? 0;
                const badge = importanceBadge[e.importance] || importanceBadge.nice_to_have;

                return (
                  <React.Fragment key={i}>
                    <tr
                      className={`group border-l-[3px] cursor-pointer transition-all duration-200 text-[13px]
                        ${isOpen ? 'bg-slate-50/80 shadow-inner' : 'hover:bg-gradient-to-r hover:from-slate-50/80 hover:to-transparent'}
                        ${rowAccent[status] || 'border-l-transparent'}
                        ${i !== sorted.length - 1 ? 'border-b border-slate-100' : ''}`}
                      onClick={() => setExpandedIndex(isOpen ? null : i)}
                    >
                      <td className={`p-2 sm:p-3 text-center sticky left-0 z-10 ${isOpen ? 'bg-slate-50/80' : i % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'} group-hover:bg-slate-50/60`}>
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-all duration-200 ${isOpen ? 'bg-slate-200 text-slate-600' : 'text-slate-400 group-hover:bg-slate-100'}`}>
                          {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                        </div>
                      </td>
                      <td className={`px-2 sm:px-4 py-3.5 sticky left-8 sm:left-11 z-10 min-w-[100px] sm:min-w-[150px] ${isOpen ? 'bg-slate-50/80' : i % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'} group-hover:bg-slate-50/60 ${e.importance === 'critical' ? 'font-semibold text-slate-900' : 'font-medium text-slate-700'}`}>
                        <div className="flex items-center gap-2">
                          <span className="truncate max-w-[100px] sm:max-w-full">{e.skill_name}</span>
                          <span className="md:hidden">
                            <span className={`inline-block w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3.5 text-center hidden md:table-cell">
                        <span className={`inline-flex items-center gap-1.5 text-[10px] px-3 py-1.5 rounded-full font-semibold border ${badge.bg} ${badge.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                          {e.importance === 'nice_to_have' ? 'nice' : e.importance}
                        </span>
                      </td>
                      <td className="px-2 py-3.5 hidden sm:table-cell"><div className="flex justify-center"><SourceIcon type="resume" found={!!xref.resume} /></div></td>
                      <td className="px-2 py-3.5 hidden sm:table-cell"><div className="flex justify-center"><SourceIcon type="linkedin" found={!!xref.linkedin} /></div></td>
                      <td className="px-2 py-3.5 hidden sm:table-cell"><div className="flex justify-center"><SourceIcon type="github" found={!!xref.github} /></div></td>
                      <td className="px-3 py-3.5">
                        <div className="flex items-center gap-2 sm:gap-3 justify-center">
                          <div className={`w-14 sm:w-24 h-2 sm:h-2.5 rounded-full overflow-hidden ${barTrack(score)}`}>
                            <div className={`h-full rounded-full bg-gradient-to-r transition-all duration-700 ease-out ${barGradient(score)}`} style={{ width: `${score}%` }} />
                          </div>
                          <span className={`inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-[11px] sm:text-xs font-bold tabular-nums ring-1 ${scoreRing(score)} ${scoreColor(score)}`}>
                            {score}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3.5 text-center hidden lg:table-cell">
                        <StatusBadge status={status} label={xref.label || ''} />
                      </td>
                    </tr>
                    {isOpen && (
                      <tr>
                        <td colSpan={8} className="p-0 border-b border-slate-100">
                          <div className="mx-4 my-3 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                            <SkillDetailPanel entry={e} />
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </TooltipProvider>
  );
}
