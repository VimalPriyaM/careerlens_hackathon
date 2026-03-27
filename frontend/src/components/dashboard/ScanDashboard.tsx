/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, AlertTriangle, Sparkles, ChevronDown, ChevronRight, TrendingUp } from 'lucide-react';
import { EvidenceMatrix } from './EvidenceMatrix';
import { ProjectRoadmap } from './ProjectRoadmap';
import { QuickWins } from './QuickWins';
import { ScoreGauge } from './ScoreGauge';
import { SkillRadarChart } from './SkillRadarChart';
import { SourceComparisonChart } from './SourceComparisonChart';

const scoreColor = (s: number) => s >= 60 ? 'text-emerald-600' : s >= 35 ? 'text-amber-600' : 'text-red-600';

function Tip({ text }: { text: string }) {
  return (
    <Tooltip>
      <TooltipTrigger><Info className="w-3 h-3 text-muted-foreground/40 hover:text-muted-foreground" /></TooltipTrigger>
      <TooltipContent side="top" className="max-w-[200px] text-xs">{text}</TooltipContent>
    </Tooltip>
  );
}

interface ScanDashboardProps {
  scan: any;
  headerExtra?: React.ReactNode;
}

export function ScanDashboard({ scan, headerExtra }: ScanDashboardProps) {
  const evidenceMatrix = scan.evidence_scores || scan.evidence_matrix || [];
  const conflicts = scan.conflicts || [];
  const hiddenSkills = scan.hidden_skills || [];
  const projects = scan.project_recommendations || [];
  const quickWins = scan.quick_wins || [];
  const delta = scan.delta_projection || { current_readiness: scan.overall_readiness_percentage || 0, projected_readiness: scan.projected_readiness || 0 };
  const overallScore = scan.overall_score || 0;
  const verified = scan.verified_skill_count || 0;
  const total = scan.total_target_skills || 0;
  const targetRole = scan.target_role || '';
  const gapSummary = scan.gap_summary || '';

  const [alertsOpen, setAlertsOpen] = useState(false);
  const alertCount = conflicts.length + hiddenSkills.length;

  return (
    <TooltipProvider>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold tracking-tight">{targetRole}</h2>
            {scan.created_at && (
              <p className="text-[11px] text-muted-foreground">
                {new Date(scan.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            )}
          </div>
          {headerExtra}
        </div>

        {/* Row 1: Score Gauge + Stats + Radar Chart */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Score Gauge */}
          <div className="md:col-span-3">
            <ScoreGauge score={overallScore} verified={verified} total={total} />
          </div>

          {/* Stats Column */}
          <div className="md:col-span-3 space-y-3">
            <Card size="sm">
              <CardContent className="pt-3 pb-3">
                <p className="text-[10px] text-muted-foreground flex items-center gap-1">Current Readiness <Tip text="Your readiness for the target role based on all evidence" /></p>
                <p className={`text-xl font-bold ${scoreColor(delta.current_readiness)}`}>{delta.current_readiness}%</p>
              </CardContent>
            </Card>
            <Card size="sm">
              <CardContent className="pt-3 pb-3">
                <p className="text-[10px] text-muted-foreground flex items-center gap-1">After Projects <Tip text="Projected readiness after completing recommended projects" /></p>
                <div className="flex items-center gap-2">
                  <p className="text-xl font-bold text-blue-600">{delta.projected_readiness}%</p>
                  <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                    <TrendingUp className="w-3 h-3" />+{delta.projected_readiness - delta.current_readiness}%
                  </span>
                </div>
              </CardContent>
            </Card>
            <Card size="sm">
              <CardContent className="pt-3 pb-3">
                <p className="text-[10px] text-muted-foreground flex items-center gap-1">Skills Verified <Tip text="Skills with evidence score >= 55" /></p>
                <p className="text-xl font-bold">{verified}<span className="text-sm font-normal text-muted-foreground">/{total}</span></p>
              </CardContent>
            </Card>
          </div>

          {/* Radar Chart */}
          <div className="md:col-span-6">
            <SkillRadarChart evidenceScores={evidenceMatrix} />
          </div>
        </div>

        {/* Gap Summary */}
        {gapSummary && (
          <Card size="sm">
            <CardContent className="pt-3 pb-3">
              <p className="text-xs text-muted-foreground leading-relaxed">{gapSummary}</p>
            </CardContent>
          </Card>
        )}

        {/* Alerts — collapsed with badge counts */}
        {alertCount > 0 && (
          <div>
            <button onClick={() => setAlertsOpen(!alertsOpen)} className="flex items-center gap-2 text-xs font-semibold hover:text-foreground transition-colors">
              {alertsOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              Alerts
              {conflicts.length > 0 && <Badge variant="destructive" className="text-[9px] h-4 px-1.5">{conflicts.length} conflict{conflicts.length > 1 ? 's' : ''}</Badge>}
              {hiddenSkills.length > 0 && <Badge className="text-[9px] h-4 px-1.5 bg-blue-100 text-blue-700 border border-blue-200 hover:bg-blue-100">{hiddenSkills.length} hidden skill{hiddenSkills.length > 1 ? 's' : ''}</Badge>}
            </button>
            {alertsOpen && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                {conflicts.map((c: any, i: number) => (
                  <div key={`c${i}`} className={`flex items-start gap-2 p-2.5 rounded-lg border text-xs ${c.risk_level === 'high' ? 'bg-red-50/50 border-red-200' : 'bg-amber-50/50 border-amber-200'}`}>
                    <AlertTriangle className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${c.risk_level === 'high' ? 'text-red-500' : 'text-amber-500'}`} />
                    <div><p className="font-medium">{c.skill}</p><p className="text-muted-foreground mt-0.5">{c.action}</p></div>
                  </div>
                ))}
                {hiddenSkills.map((h: any, i: number) => (
                  <div key={`h${i}`} className="flex items-start gap-2 p-2.5 rounded-lg border bg-blue-50/50 border-blue-200 text-xs">
                    <Sparkles className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-blue-500" />
                    <div><p className="font-medium">{h.skill}</p><p className="text-muted-foreground mt-0.5">{h.action}</p></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Evidence Matrix + Bar Chart side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-8">
            <div className="flex items-center gap-1.5 mb-2">
              <h3 className="text-sm font-semibold">Evidence Matrix</h3>
              <Tip text="Click any skill row to see the 5-component scoring breakdown and source map." />
            </div>
            <EvidenceMatrix evidenceScores={evidenceMatrix} />
          </div>
          <div className="lg:col-span-4">
            <SourceComparisonChart evidenceScores={evidenceMatrix} />
          </div>
        </div>

        {/* Projects + Quick Wins */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {projects.length > 0 && (
            <div className="lg:col-span-3">
              <ProjectRoadmap projects={projects} />
            </div>
          )}
          {quickWins.length > 0 && (
            <div className={projects.length > 0 ? 'lg:col-span-2' : 'lg:col-span-5'}>
              <QuickWins quickWins={quickWins} />
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
