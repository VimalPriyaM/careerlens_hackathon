/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Rocket } from 'lucide-react';
import { ProjectCard } from './ProjectCard';

interface ProjectRoadmapProps {
  projects: any[];
}

export function ProjectRoadmap({ projects }: ProjectRoadmapProps) {
  if (!projects || projects.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <Rocket className="w-4 h-4 text-indigo-600" />
        <h2 className="text-lg font-semibold text-slate-900">Recommended Projects</h2>
      </div>
      <p className="text-xs text-slate-400 mb-4">Ordered by impact — build the first one first.</p>
      <div className="space-y-4">
        {projects.map((p: any, i: number) => (
          <ProjectCard key={i} project={p} isFirst={i === 0} index={i} />
        ))}
      </div>
    </div>
  );
}
