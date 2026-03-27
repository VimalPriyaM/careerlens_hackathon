'use client';

import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';
import { Card, CardContent } from '@/components/ui/card';

interface ScoreGaugeProps {
  score: number;
  verified: number;
  total: number;
}

export function ScoreGauge({ score, verified, total }: ScoreGaugeProps) {
  const color = score >= 60 ? '#10b981' : score >= 35 ? '#f59e0b' : '#ef4444';

  const data = [
    { name: 'score', value: score, fill: color },
  ];

  return (
    <Card>
      <CardContent className="pt-4 pb-3 flex flex-col items-center">
        <div className="relative w-32 h-32">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              innerRadius="75%"
              outerRadius="100%"
              data={data}
              startAngle={210}
              endAngle={-30}
              barSize={10}
            >
              <RadialBar
                dataKey="value"
                cornerRadius={5}
                background={{ fill: '#f1f5f9' }}
              />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold" style={{ color }}>{score}</span>
            <span className="text-[10px] text-muted-foreground">out of 100</span>
          </div>
        </div>
        <p className="text-xs font-semibold mt-1">Evidence Score</p>
        <p className="text-[10px] text-muted-foreground">{verified} of {total} skills verified</p>
      </CardContent>
    </Card>
  );
}
