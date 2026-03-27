/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { ProjectCard } from './ProjectCard';

interface ProjectRoadmapProps {
  projects: any[];
}

export function ProjectRoadmap({ projects }: ProjectRoadmapProps) {
  if (!projects || projects.length === 0) return null;

  return (
    <div>
      <h3 className="text-sm font-semibold mb-0.5">Recommended Projects</h3>
      <p className="text-xs text-muted-foreground mb-2">Ordered by impact — build the first one first.</p>
      <div className="space-y-3">
        {projects.map((p: any, i: number) => (
          <ProjectCard key={i} project={p} isFirst={i === 0} />
        ))}
      </div>
    </div>
  );
}
