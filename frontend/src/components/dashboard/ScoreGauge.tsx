'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface ScoreGaugeProps {
  score: number;
  verified: number;
  total: number;
}

export function ScoreGauge({ score, verified, total }: ScoreGaugeProps) {
  const [displayed, setDisplayed] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const duration = 800;
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(eased * score));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [score]);

  const color = score >= 60 ? '#10b981' : score >= 35 ? '#f59e0b' : '#ef4444';
  const label = score >= 60 ? 'Strong' : score >= 35 ? 'Moderate' : 'Needs Work';
  const labelBg = score >= 60 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : score >= 35 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-red-50 text-red-700 border-red-200';

  // SVG arc gauge
  const size = 160;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  // Arc from 135deg to 405deg (270deg sweep)
  const startAngle = 135;
  const endAngle = 405;
  const sweepAngle = endAngle - startAngle; // 270
  const scoreAngle = startAngle + (displayed / 100) * sweepAngle;

  const polarToCartesian = (angle: number) => {
    const rad = (angle * Math.PI) / 180;
    return {
      x: center + radius * Math.cos(rad),
      y: center + radius * Math.sin(rad),
    };
  };

  const describeArc = (start: number, end: number) => {
    const s = polarToCartesian(start);
    const e = polarToCartesian(end);
    const largeArc = end - start > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${radius} ${radius} 0 ${largeArc} 1 ${e.x} ${e.y}`;
  };

  return (
    <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardContent className="pt-5 pb-4 flex flex-col items-center">
        <div className="relative" style={{ width: size, height: size }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {/* Background track */}
            <path
              d={describeArc(startAngle, endAngle)}
              fill="none"
              stroke="#e2e8f0"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
            {/* Score arc */}
            {displayed > 0 && (
              <path
                d={describeArc(startAngle, scoreAngle)}
                fill="none"
                stroke={color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
              />
            )}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-slate-900">{displayed}</span>
            <span className="text-xs text-slate-400 font-medium">/100</span>
          </div>
        </div>
        <div className="text-center mt-1">
          <span className={`inline-block text-[11px] font-semibold px-3 py-1 rounded-full border ${labelBg}`}>
            {label}
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-2">{verified} of {total} skills verified</p>
      </CardContent>
    </Card>
  );
}
