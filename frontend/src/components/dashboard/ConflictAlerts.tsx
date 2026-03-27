/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { AlertTriangle, Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ConflictAlertsProps {
  conflicts: any[];
}

export function ConflictAlerts({ conflicts }: ConflictAlertsProps) {
  if (!conflicts || conflicts.length === 0) return null;

  return (
    <TooltipProvider>
      <div>
        <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4 text-red-500" />
          Conflicts ({conflicts.length})
          <Tooltip>
            <TooltipTrigger><Info className="w-3 h-3 text-muted-foreground/50" /></TooltipTrigger>
            <TooltipContent side="top" className="max-w-[220px] text-xs">Skills claimed on resume but not backed by code or social evidence. These may raise red flags with recruiters.</TooltipContent>
          </Tooltip>
        </h3>
        <div className="space-y-2">
          {conflicts.map((c: any, i: number) => (
            <Card key={i} size="sm" className={`border-l-4 ${c.risk_level === 'high' ? 'border-l-red-500 bg-red-50/30' : 'border-l-amber-500 bg-amber-50/30'}`}>
              <CardContent className="pt-2.5 pb-2.5">
                <p className="text-xs font-medium">{c.skill}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{c.issue}</p>
                <p className="text-[11px] text-muted-foreground mt-1 italic">{c.action}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}
