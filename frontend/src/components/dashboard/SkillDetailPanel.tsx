/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { FileText, Info, CheckCircle, XCircle } from 'lucide-react';
import { FaLinkedin, FaGithub } from 'react-icons/fa';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SkillDetailPanelProps {
  entry: any;
}

const tips: Record<string, string> = {
  'GitHub Language': 'How many repos contain this language/framework.',
  'GitHub Structure': 'Tests, CI/CD, Docker, proper file structure, docs.',
  'Code Quality': 'AI-assessed code quality: naming, error handling, patterns.',
  'README Quality': 'AI-assessed README: purpose, setup, tech stack, visuals.',
  'LinkedIn': 'Skill listing, endorsements, job mentions, certifications.',
};

function Bar({ label, score, max, details }: { label: string; score: number; max: number; details?: string }) {
  const pct = max > 0 ? Math.round((score / max) * 100) : 0;
  const fill = pct >= 60 ? 'bg-emerald-500' : pct >= 35 ? 'bg-amber-400' : 'bg-red-400';
  const track = pct >= 60 ? 'bg-emerald-100' : pct >= 35 ? 'bg-amber-100' : 'bg-red-100';

  return (
    <div>
      <div className="flex justify-between items-center mb-0.5">
        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
          {label}
          <Tooltip>
            <TooltipTrigger><Info className="w-2.5 h-2.5 opacity-30" /></TooltipTrigger>
            <TooltipContent side="top" className="max-w-[180px] text-xs">{tips[label] || label}</TooltipContent>
          </Tooltip>
        </span>
        <span className="text-[11px] font-semibold tabular-nums">{score}<span className="font-normal text-muted-foreground">/{max}</span></span>
      </div>
      <div className={`h-1.5 rounded-full overflow-hidden ${track}`}>
        <div className={`h-full rounded-full ${fill}`} style={{ width: `${pct}%` }} />
      </div>
      {details && <p className="text-[10px] text-muted-foreground mt-0.5">{details}</p>}
    </div>
  );
}

export function SkillDetailPanel({ entry }: SkillDetailPanelProps) {
  const c = entry.components || {};
  const xref = entry.cross_reference || {};

  const get = (comp: any) => {
    if (typeof comp === 'object' && comp !== null) return comp;
    return { score: comp || 0, details: '' };
  };

  const gl = get(c.github_language);
  const gs = get(c.github_structure);
  const gc = get(c.github_code_quality);
  const gr = get(c.github_readme);
  const lc = get(c.linkedin_corroboration);

  return (
    <TooltipProvider>
      <div className="bg-muted/10 border-t">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
          {/* Left: Score Breakdown */}
          <div className="space-y-2.5">
            <p className="text-xs font-semibold">Score Breakdown</p>
            <Bar label="GitHub Language" score={gl.score} max={gl.max || 25} details={gl.details} />
            <Bar label="GitHub Structure" score={gs.score} max={gs.max || 20} details={gs.details} />
            <Bar label="Code Quality" score={gc.score} max={gc.max || 20} details={gc.details} />
            <Bar label="README Quality" score={gr.score} max={gr.max || 10} details={gr.details} />
            <Bar label="LinkedIn" score={lc.score} max={lc.max || 25} details={lc.details} />
          </div>

          {/* Right: Source Map */}
          <div className="space-y-3">
            <p className="text-xs font-semibold">Source Map</p>

            {/* Visual source indicators */}
            <div className="grid grid-cols-3 gap-2">
              <SourceCard icon={<FileText className="w-3.5 h-3.5" />} label="Resume" found={!!xref.resume} color="blue" />
              <SourceCard icon={<FaLinkedin className="w-3.5 h-3.5" />} label="LinkedIn" found={!!xref.linkedin} color="sky" />
              <SourceCard icon={<FaGithub className="w-3.5 h-3.5" />} label="GitHub" found={!!xref.github} color="gray" />
            </div>

            {/* Status */}
            {xref.label && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px]">{xref.label}</Badge>
              </div>
            )}

            {xref.description && <p className="text-[11px] text-muted-foreground leading-relaxed">{xref.description}</p>}

            {xref.action && (
              <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-100">
                <p className="text-[11px] text-blue-800"><span className="font-semibold">Action:</span> {xref.action}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

function SourceCard({ icon, label, found }: { icon: React.ReactNode; label: string; found: boolean; color: string }) {
  return (
    <div className={`rounded-lg border p-2.5 text-center ${found ? 'bg-emerald-50/50 border-emerald-200' : 'bg-muted/20 border-border'}`}>
      <div className={`mx-auto mb-1 w-7 h-7 rounded-full flex items-center justify-center ${found ? 'bg-emerald-100' : 'bg-muted'}`}>
        <span className={found ? 'text-emerald-600' : 'text-muted-foreground/30'}>{icon}</span>
      </div>
      <p className={`text-[10px] font-medium ${found ? '' : 'text-muted-foreground/50'}`}>{label}</p>
      {found
        ? <CheckCircle className="w-3 h-3 text-emerald-500 mx-auto mt-1" />
        : <XCircle className="w-3 h-3 text-muted-foreground/20 mx-auto mt-1" />}
    </div>
  );
}
