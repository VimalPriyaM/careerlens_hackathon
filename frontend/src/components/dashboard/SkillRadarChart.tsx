/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent } from '@/components/ui/card';

interface SkillRadarChartProps {
  evidenceScores: any[];
}

export function SkillRadarChart({ evidenceScores }: SkillRadarChartProps) {
  if (!evidenceScores || evidenceScores.length === 0) return null;

  // Take top 8 skills by importance for radar readability
  const sorted = [...evidenceScores].sort((a, b) => {
    const order: Record<string, number> = { critical: 0, important: 1, nice_to_have: 2 };
    return (order[a.importance] ?? 2) - (order[b.importance] ?? 2);
  }).slice(0, 8);

  const data = sorted.map((s) => {
    const c = s.components || {};
    const get = (v: any) => (typeof v === 'object' ? v?.score : v) || 0;
    return {
      skill: s.skill_name?.length > 12 ? s.skill_name.substring(0, 12) + '...' : s.skill_name,
      github: get(c.github_language) + get(c.github_structure) + get(c.github_code_quality) + get(c.github_readme),
      linkedin: get(c.linkedin_corroboration),
      resume: s.cross_reference?.resume ? 25 : 0,
      fullMark: 100,
    };
  });

  return (
    <Card>
      <CardContent className="pt-4 pb-2">
        <p className="text-xs font-semibold mb-2">Skill Coverage Map</p>
        <ResponsiveContainer width="100%" height={260}>
          <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis dataKey="skill" tick={{ fontSize: 10, fill: '#64748b' }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <Radar name="GitHub" dataKey="github" stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} strokeWidth={1.5} />
            <Radar name="LinkedIn" dataKey="linkedin" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.1} strokeWidth={1.5} />
            <Radar name="Resume" dataKey="resume" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.08} strokeWidth={1.5} />
            <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
