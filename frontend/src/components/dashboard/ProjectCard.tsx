/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, CheckSquare, Square, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface ProjectCardProps {
  project: any;
  isFirst?: boolean;
}

const difficultyColor: Record<string, string> = {
  beginner: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  intermediate: 'bg-amber-100 text-amber-700 border-amber-200',
  advanced: 'bg-red-100 text-red-700 border-red-200',
};

export function ProjectCard({ project, isFirst }: ProjectCardProps) {
  const [checklistOpen, setChecklistOpen] = useState(false);
  const [checked, setChecked] = useState<Record<number, boolean>>({});

  const toggleCheck = (i: number) => setChecked((prev) => ({ ...prev, [i]: !prev[i] }));
  const checklist: string[] = project.github_checklist || [];

  return (
    <Card size="sm" className={isFirst ? 'ring-2 ring-emerald-500/30' : ''}>
      <CardHeader className="pb-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm">{project.title}</CardTitle>
            {isFirst && (
              <Badge className="text-[10px] bg-emerald-600 hover:bg-emerald-600">Start Here</Badge>
            )}
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <Badge variant="outline" className={`text-[10px] border ${difficultyColor[project.difficulty] || ''}`}>
              {project.difficulty}
            </Badge>
            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
              <Clock className="w-3 h-3" /> ~{project.estimated_hours}h
            </span>
          </div>
        </div>
        <CardDescription className="text-xs">{project.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex flex-wrap gap-1">
          {(project.tech_stack || []).map((t: string) => (
            <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground">
          Covers: {(project.skills_covered || []).join(', ')}
        </p>
        {project.evidence_impact && (
          <p className="text-[11px] text-emerald-700 bg-emerald-50 p-2 rounded border border-emerald-200">
            {project.evidence_impact}
          </p>
        )}

        {/* GitHub Checklist */}
        {checklist.length > 0 && (
          <div>
            <button
              type="button"
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setChecklistOpen(!checklistOpen)}
            >
              {checklistOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              GitHub Push Checklist ({checklist.length})
            </button>
            {checklistOpen && (
              <ul className="mt-1.5 space-y-1 pl-1">
                {checklist.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-1.5 text-xs cursor-pointer select-none"
                    onClick={() => toggleCheck(i)}
                  >
                    {checked[i] ? (
                      <CheckSquare className="w-3.5 h-3.5 mt-0.5 text-emerald-600 flex-shrink-0" />
                    ) : (
                      <Square className="w-3.5 h-3.5 mt-0.5 text-muted-foreground flex-shrink-0" />
                    )}
                    <span className={checked[i] ? 'line-through text-muted-foreground' : ''}>{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
