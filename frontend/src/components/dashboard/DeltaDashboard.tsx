'use client';

import { ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface DeltaDashboardProps {
  currentReadiness: number;
  projectedReadiness: number;
}

function scoreColor(s: number) {
  if (s >= 60) return 'text-emerald-600';
  if (s >= 35) return 'text-amber-600';
  return 'text-red-600';
}

export function DeltaDashboard({ currentReadiness, projectedReadiness }: DeltaDashboardProps) {
  const delta = projectedReadiness - currentReadiness;

  return (
    <div>
      <h3 className="text-sm font-semibold mb-2">Readiness Projection</h3>
      <Card size="sm">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center justify-center gap-4 sm:gap-8">
            {/* Current */}
            <div className="text-center flex-1">
              <p className="text-xs text-muted-foreground mb-1">You Today</p>
              <div className="relative mx-auto w-24 h-24 sm:w-28 sm:h-28">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="6" className="text-muted/30" />
                  <circle
                    cx="50" cy="50" r="42" fill="none" strokeWidth="6"
                    strokeDasharray={`${(currentReadiness / 100) * 264} 264`}
                    strokeLinecap="round"
                    className={scoreColor(currentReadiness).replace('text-', 'stroke-')}
                  />
                </svg>
                <span className={`absolute inset-0 flex items-center justify-center text-2xl sm:text-3xl font-bold ${scoreColor(currentReadiness)}`}>
                  {currentReadiness}%
                </span>
              </div>
            </div>

            {/* Delta arrow */}
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
              <ArrowRight className="w-6 h-6 text-muted-foreground" />
              <span className="text-sm font-semibold text-emerald-600">+{delta}%</span>
            </div>

            {/* Projected */}
            <div className="text-center flex-1">
              <p className="text-xs text-muted-foreground mb-1">After Projects</p>
              <div className="relative mx-auto w-24 h-24 sm:w-28 sm:h-28">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="6" className="text-muted/30" />
                  <circle
                    cx="50" cy="50" r="42" fill="none" strokeWidth="6"
                    strokeDasharray={`${(projectedReadiness / 100) * 264} 264`}
                    strokeLinecap="round"
                    className="stroke-blue-500"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-2xl sm:text-3xl font-bold text-blue-600">
                  {projectedReadiness}%
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
