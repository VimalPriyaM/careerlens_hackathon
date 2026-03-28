/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useCallback, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, AlertTriangle, Sparkles, ChevronDown, ChevronRight, Download, Loader2, MessageCircleWarning } from 'lucide-react';
import { EvidenceMatrix } from './EvidenceMatrix';
import { ProjectRoadmap } from './ProjectRoadmap';
import { QuickWins } from './QuickWins';
import { KPICards } from './KPICards';
import { StrengthDistributionBar } from './StrengthDistributionBar';
import { SkillCoverageBar } from './SkillCoverageBar';
import { FocusAreas } from './FocusAreas';
import { computeSkillMetrics, computeDelta } from '@/lib/analytics';

function Tip({ text }: { text: string }) {
  return (
    <Tooltip>
      <TooltipTrigger><Info className="w-3.5 h-3.5 text-slate-300 hover:text-slate-500 transition-colors" /></TooltipTrigger>
      <TooltipContent side="top" className="max-w-[220px] text-xs">{text}</TooltipContent>
    </Tooltip>
  );
}

interface ScanDashboardProps {
  scan: any;
  previousScan?: any | null;
  scanHistory?: any[];
  headerExtra?: React.ReactNode;
}

export function ScanDashboard({ scan, previousScan, headerExtra }: ScanDashboardProps) {
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
  const notes: string[] = scan.notes || [];

  // Dynamic analytics
  const metrics = computeSkillMetrics(evidenceMatrix);
  const deltaMetrics = computeDelta(scan, previousScan || null);

  const [alertsOpen, setAlertsOpen] = useState(false);
  const [scoreBoost, setScoreBoost] = useState(0);
  const [pdfLoading, setPdfLoading] = useState(false);
  const alertCount = conflicts.length + hiddenSkills.length;
  const dashboardRef = useRef<HTMLDivElement>(null);

  // Quick wins completion handler — boosts displayed score
  const handleQuickWinChange = useCallback((completedCount: number, totalCount: number) => {
    const boost = totalCount > 0 ? Math.round((completedCount / totalCount) * 5) : 0;
    setScoreBoost(boost);
  }, []);

  // PDF download
  const handleDownloadPdf = useCallback(async () => {
    setPdfLoading(true);
    try {
      const { default: html2canvas } = await import('html2canvas');
      const { default: jsPDF } = await import('jspdf');

      const el = dashboardRef.current;
      if (!el) return;

      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#f8fafc',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let y = 10;
      let remaining = imgHeight;

      while (remaining > 0) {
        if (y > 10) pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, y > 10 ? 10 : y, imgWidth, imgHeight, undefined, 'FAST',
          y > 10 ? -(imgHeight - remaining + (pageHeight - 20)) : 0
        );
        remaining -= (pageHeight - 20);
        y = 10;
      }

      pdf.save(`CareerLens-${targetRole.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch {
      // Fallback: print the page
      window.print();
    } finally {
      setPdfLoading(false);
    }
  }, [targetRole]);

  const boostedScore = Math.min(overallScore + scoreBoost, 100);
  const boostedReadiness = Math.min(delta.current_readiness + scoreBoost, 100);

  return (
    <TooltipProvider>
      <div className="space-y-6" ref={dashboardRef}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4">
          <div className="min-w-0 w-full sm:w-auto">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900">{targetRole}</h1>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1">
              {scan.created_at && (
                <p className="text-xs text-slate-400">
                  Scanned {new Date(scan.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              )}
              {deltaMetrics.hasPrevious && (
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                  deltaMetrics.direction === 'up'
                    ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                    : deltaMetrics.direction === 'down'
                      ? 'text-red-600 bg-red-50 border-red-200'
                      : 'text-slate-500 bg-slate-50 border-slate-200'
                }`}>
                  {deltaMetrics.direction === 'up' ? '↑' : deltaMetrics.direction === 'down' ? '↓' : '—'}{' '}
                  {deltaMetrics.scoreChange !== null ? `${Math.abs(deltaMetrics.scoreChange)} pts` : ''} from last
                </span>
              )}
              {scoreBoost > 0 && (
                <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  +{scoreBoost} pts from quick wins
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto">
            {/* PDF Download */}
            <button
              onClick={handleDownloadPdf}
              disabled={pdfLoading}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 text-slate-700 font-medium px-4 py-2 text-xs hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              {pdfLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              {pdfLoading ? 'Generating...' : 'Download PDF'}
            </button>
            {headerExtra}
          </div>
        </div>

        {/* Section 1: Overview KPI Cards */}
        <KPICards
          overallScore={boostedScore}
          readiness={boostedReadiness}
          projectedReadiness={delta.projected_readiness}
          verified={verified}
          total={total}
          metrics={metrics}
          delta={deltaMetrics}
        />

        {/* Edge case notes/warnings */}
        {notes.length > 0 && (
          <div className="space-y-2">
            {notes.map((note, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50/70 border border-amber-200">
                <MessageCircleWarning className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-amber-800">{note}</p>
              </div>
            ))}
          </div>
        )}

        {/* Section 2: Skills Analysis — Distribution + Strengths/Focus */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2">
            <StrengthDistributionBar evidenceScores={evidenceMatrix} />
          </div>
          <div className="lg:col-span-3">
            <FocusAreas evidenceScores={evidenceMatrix} />
          </div>
        </div>

        {/* Gap Summary */}
        {gapSummary && (
          <Card className="bg-gradient-to-r from-slate-50 to-white border-slate-200/80 shadow-md rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-lg bg-indigo-50 flex items-center justify-center">
                  <Info className="w-3.5 h-3.5 text-indigo-600" />
                </div>
                <p className="text-sm font-semibold text-slate-900">Gap Analysis</p>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">{gapSummary}</p>
            </CardContent>
          </Card>
        )}

        {/* Alerts */}
        {alertCount > 0 && (
          <div>
            <button
              onClick={() => setAlertsOpen(!alertsOpen)}
              className="flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors py-1"
            >
              {alertsOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              Alerts
              {conflicts.length > 0 && (
                <Badge variant="destructive" className="text-[10px] h-5 px-2 font-semibold">
                  {conflicts.length} conflict{conflicts.length > 1 ? 's' : ''}
                </Badge>
              )}
              {hiddenSkills.length > 0 && (
                <Badge className="text-[10px] h-5 px-2 bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-50 font-semibold">
                  {hiddenSkills.length} hidden skill{hiddenSkills.length > 1 ? 's' : ''}
                </Badge>
              )}
            </button>
            {alertsOpen && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                {conflicts.map((c: any, i: number) => (
                  <div key={`c${i}`} className={`flex items-start gap-3 p-4 rounded-2xl border text-sm transition-shadow hover:shadow-sm ${c.risk_level === 'high' ? 'bg-red-50/60 border-red-200' : 'bg-amber-50/60 border-amber-200'}`}>
                    <AlertTriangle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${c.risk_level === 'high' ? 'text-red-500' : 'text-amber-500'}`} />
                    <div>
                      <p className="font-medium text-slate-900 text-sm">{c.skill}</p>
                      <p className="text-slate-500 text-xs mt-0.5">{c.action}</p>
                    </div>
                  </div>
                ))}
                {hiddenSkills.map((h: any, i: number) => (
                  <div key={`h${i}`} className="flex items-start gap-3 p-4 rounded-2xl border bg-blue-50/60 border-blue-200 text-sm transition-shadow hover:shadow-sm">
                    <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-500" />
                    <div>
                      <p className="font-medium text-slate-900 text-sm">{h.skill}</p>
                      <p className="text-slate-500 text-xs mt-0.5">{h.action}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Skill Coverage Bar Chart */}
        <SkillCoverageBar evidenceScores={evidenceMatrix} />

        {/* Evidence Matrix */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-lg font-semibold text-slate-900">Evidence Matrix</h2>
            <Tip text="Click any skill row to see the 5-component scoring breakdown and source map." />
          </div>
          <EvidenceMatrix evidenceScores={evidenceMatrix} />
        </div>

        {/* Projects + Quick Wins */}
        {(projects.length > 0 || quickWins.length > 0) && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
            {projects.length > 0 && (
              <div className="lg:col-span-3">
                <ProjectRoadmap projects={projects} />
              </div>
            )}
            {quickWins.length > 0 && (
              <div className={projects.length > 0 ? 'lg:col-span-2' : 'lg:col-span-5'}>
                <QuickWins quickWins={quickWins} onCompletionChange={handleQuickWinChange} />
              </div>
            )}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
