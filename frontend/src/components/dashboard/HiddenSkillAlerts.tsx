/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Sparkles, Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface HiddenSkillAlertsProps {
  hiddenSkills: any[];
}

export function HiddenSkillAlerts({ hiddenSkills }: HiddenSkillAlertsProps) {
  if (!hiddenSkills || hiddenSkills.length === 0) return null;

  return (
    <TooltipProvider>
      <div>
        <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-blue-500" />
          Hidden Skills ({hiddenSkills.length})
          <Tooltip>
            <TooltipTrigger><Info className="w-3 h-3 text-muted-foreground/50" /></TooltipTrigger>
            <TooltipContent side="top" className="max-w-[220px] text-xs">Skills found on GitHub or LinkedIn but missing from your resume. Add these for an instant boost.</TooltipContent>
          </Tooltip>
        </h3>
        <div className="space-y-2">
          {hiddenSkills.map((h: any, i: number) => (
            <Card key={i} size="sm" className="border-l-4 border-l-blue-500 bg-blue-50/30">
              <CardContent className="pt-2.5 pb-2.5">
                <p className="text-xs font-medium">{h.skill}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Found on {Array.isArray(h.found_on) ? h.found_on.join(' & ') : h.found_on}</p>
                <p className="text-[11px] text-muted-foreground mt-1 italic">{h.action}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}
