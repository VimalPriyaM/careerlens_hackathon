/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, TrendingUp, TrendingDown, Minus, Target, ShieldCheck, BarChart3 } from 'lucide-react';
import { DeltaMetrics, SkillMetrics } from '@/lib/analytics';

interface KPICardsProps {
  overallScore: number;
  readiness: number;
  projectedReadiness: number;
  verified: number;
  total: number;
  metrics: SkillMetrics;
  delta: DeltaMetrics;
}

function AnimatedNumber({ value, duration = 800 }: { value: number; duration?: number }) {
  const [displayed, setDisplayed] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(eased * value));
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration]);

  return <>{displayed}</>;
}

function Tip({ text }: { text: string }) {
  return (
    <Tooltip>
      <TooltipTrigger><Info className="w-3 h-3 text-slate-300 hover:text-slate-500 transition-colors" /></TooltipTrigger>
      <TooltipContent side="top" className="max-w-[220px] text-xs font-normal">{text}</TooltipContent>
    </Tooltip>
  );
}

function ChangeIndicator({ change, suffix = '', label }: { change: number | null; suffix?: string; label?: string }) {
  if (change === null) return <span className="text-[11px] text-slate-400">First scan</span>;
  if (change === 0) return (
    <span className="text-[11px] text-slate-400 inline-flex items-center gap-0.5">
      <Minus className="w-3 h-3" /> No change{label ? ` ${label}` : ''}
    </span>
  );
  return change > 0 ? (
    <span className="text-[11px] font-semibold text-emerald-600 inline-flex items-center gap-0.5">
      <TrendingUp className="w-3 h-3" /> +{change}{suffix}{label ? ` ${label}` : ''}
    </span>
  ) : (
    <span className="text-[11px] font-semibold text-red-500 inline-flex items-center gap-0.5">
      <TrendingDown className="w-3 h-3" /> {change}{suffix}{label ? ` ${label}` : ''}
    </span>
  );
}

const scoreColor = (s: number) => s >= 60 ? 'text-emerald-600' : s >= 35 ? 'text-amber-500' : 'text-red-500';
const arcColor = (s: number) => s >= 60 ? '#10b981' : s >= 35 ? '#f59e0b' : '#ef4444';

export function KPICards({ overallScore, readiness, projectedReadiness, verified, total, metrics, delta }: KPICardsProps) {
  const readinessGain = projectedReadiness - readiness;

  // SVG arc gauge for overall score
  const size = 140;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const startAngle = 135;
  const endAngle = 405;
  const sweepAngle = endAngle - startAngle;

  const polarToCartesian = (angle: number) => {
    const rad = (angle * Math.PI) / 180;
    return { x: center + radius * Math.cos(rad), y: center + radius * Math.sin(rad) };
  };

  const describeArc = (start: number, end: number) => {
    const s = polarToCartesian(start);
    const e = polarToCartesian(end);
    const largeArc = end - start > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${radius} ${radius} 0 ${largeArc} 1 ${e.x} ${e.y}`;
  };

  return (
    <TooltipProvider>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Overall Score — Gauge Card */}
        <Card className="bg-white border-slate-200/80 shadow-md rounded-2xl hover:shadow-lg transition-shadow duration-300">
          <CardContent className="pt-5 pb-4 flex flex-col items-center">
            <div className="relative w-full max-w-[140px] aspect-square mx-auto">
              <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`}>
                <path d={describeArc(startAngle, endAngle)} fill="none" stroke="#f1f5f9" strokeWidth={strokeWidth} strokeLinecap="round" />
                {overallScore > 0 && (
                  <path
                    d={describeArc(startAngle, startAngle + (overallScore / 100) * sweepAngle)}
                    fill="none" stroke={arcColor(overallScore)} strokeWidth={strokeWidth} strokeLinecap="round"
                  />
                )}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-4xl font-bold ${scoreColor(overallScore)}`}>
                  <AnimatedNumber value={overallScore} />
                </span>
                <span className="text-[10px] text-slate-400 font-medium">/100</span>
              </div>
            </div>
            <p className="text-xs font-semibold text-slate-700 mt-1">Overall Score</p>
            <div className="mt-1">
              <ChangeIndicator change={delta.scoreChange} label="from last scan" />
            </div>
          </CardContent>
        </Card>

        {/* Current Readiness */}
        <Card className="bg-white border-slate-200/80 shadow-md rounded-2xl hover:shadow-lg transition-shadow duration-300">
          <CardContent className="p-5 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center">
                  <Target className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Current Readiness</p>
                  <Tip text="Your readiness for the target role based on all evidence" />
                </div>
              </div>
              <p className={`text-3xl font-bold ${scoreColor(readiness)}`}>
                <AnimatedNumber value={readiness} />
                <span className="text-lg">%</span>
              </p>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100">
              <ChangeIndicator change={delta.readinessChange} suffix="%" label="from last scan" />
              {readinessGain > 0 && (
                <p className="text-[10px] text-slate-400 mt-1">
                  +{readinessGain}% possible after projects
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Skills Verified */}
        <Card className="bg-white border-slate-200/80 shadow-md rounded-2xl hover:shadow-lg transition-shadow duration-300">
          <CardContent className="p-5 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Skills Verified</p>
                  <Tip text="Skills with evidence score >= 55 across your sources" />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-900">
                <AnimatedNumber value={verified} />
                <span className="text-lg font-normal text-slate-400">/{total}</span>
              </p>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100">
              <ChangeIndicator change={delta.verifiedChange} label="skills from last scan" />
              {total > 0 && (
                <div className="mt-2 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full bg-emerald-500 transition-all duration-700" style={{ width: `${(verified / total) * 100}%` }} />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Avg Score + Quick Stats */}
        <Card className="bg-white border-slate-200/80 shadow-md rounded-2xl hover:shadow-lg transition-shadow duration-300">
          <CardContent className="p-5 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Avg. Skill Score</p>
                  <Tip text="Mean evidence score across all target skills" />
                </div>
              </div>
              <p className={`text-3xl font-bold ${scoreColor(metrics.avgScore)}`}>
                <AnimatedNumber value={metrics.avgScore} />
              </p>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Critical skills</span>
                <span className="font-semibold text-slate-700">{metrics.criticalCount}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Strong skills</span>
                <span className="font-semibold text-emerald-600">{metrics.strong}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Need work</span>
                <span className="font-semibold text-red-500">{metrics.weak}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
