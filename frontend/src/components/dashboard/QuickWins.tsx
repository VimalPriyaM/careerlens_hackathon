'use client';

import { useState } from 'react';
import { CheckCircle, Circle, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface QuickWinsProps {
  quickWins: string[];
}

export function QuickWins({ quickWins }: QuickWinsProps) {
  const [checked, setChecked] = useState<Record<number, boolean>>({});

  if (!quickWins || quickWins.length === 0) return null;

  const toggle = (i: number) => setChecked((prev) => ({ ...prev, [i]: !prev[i] }));
  const doneCount = Object.values(checked).filter(Boolean).length;

  return (
    <div>
      <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
        <Zap className="w-3.5 h-3.5 text-emerald-600" /> Quick Wins
        {doneCount > 0 && <span className="text-[10px] text-muted-foreground font-normal">{doneCount}/{quickWins.length}</span>}
      </h3>
      <Card size="sm">
        <CardContent className="pt-2 pb-2">
          <ul className="divide-y">
            {quickWins.map((w, i) => (
              <li key={i} className="flex items-start gap-2 py-2 cursor-pointer select-none" onClick={() => toggle(i)}>
                {checked[i] ? (
                  <CheckCircle className="w-3.5 h-3.5 mt-0.5 text-emerald-500 flex-shrink-0" />
                ) : (
                  <Circle className="w-3.5 h-3.5 mt-0.5 text-muted-foreground/40 flex-shrink-0" />
                )}
                <span className={`text-xs leading-relaxed ${checked[i] ? 'line-through text-muted-foreground' : ''}`}>{w}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
