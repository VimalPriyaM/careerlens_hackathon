/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { createClient } from '@/lib/supabase-browser';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  FileText, Target, Upload, CheckCircle, AlertCircle, Loader2, Info,
  ArrowRight, Sparkles, X, ArrowLeft, Code2, Briefcase, Download,
} from 'lucide-react';
import { FaLinkedin, FaGithub } from 'react-icons/fa';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const PROGRESS_STEPS = [
  { key: 'uploading', label: 'Uploading documents', icon: Upload },
  { key: 'parsing_resume', label: 'Parsing your resume', icon: FileText },
  { key: 'analyzing_linkedin', label: 'Analyzing LinkedIn profile', icon: Briefcase },
  { key: 'scanning_github', label: 'Scanning GitHub repositories', icon: Code2 },
  { key: 'analyzing_role', label: 'Mapping target role skills', icon: Target },
  { key: 'scoring', label: 'Computing evidence scores', icon: Sparkles },
  { key: 'complete', label: 'Analysis complete!', icon: CheckCircle },
];

interface ScanResult {
  scan_id: string;
  target_role: string;
  overall_score: number;
  verified_skill_count: number;
  total_target_skills: number;
  evidence_matrix: any[];
  conflicts: any[];
  hidden_skills: any[];
  project_recommendations: any[];
  delta_projection: { current_readiness: number; projected_readiness: number };
  gap_summary: string;
  quick_wins: string[];
  notes?: string[];
  created_at: string;
}

export default function ScanPage() {
  const router = useRouter();
  const supabase = createClient();

  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [linkedinFile, setLinkedinFile] = useState<File | null>(null);
  const [githubUsername, setGithubUsername] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState('');
  const [result, setResult] = useState<ScanResult | null>(null);
  const [timeoutMsg, setTimeoutMsg] = useState('');
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const scanStartRef = useRef<number>(0);
  const resultRef = useRef<HTMLDivElement>(null);

  const onResumeDrop = useCallback((f: File[]) => { if (f.length > 0) setResumeFile(f[0]); }, []);
  const resumeDropzone = useDropzone({ onDrop: onResumeDrop, accept: { 'application/pdf': ['.pdf'] }, maxSize: 5 * 1024 * 1024, maxFiles: 1 });
  const onLinkedinDrop = useCallback((f: File[]) => { if (f.length > 0) setLinkedinFile(f[0]); }, []);
  const linkedinDropzone = useDropzone({ onDrop: onLinkedinDrop, accept: { 'application/pdf': ['.pdf'] }, maxSize: 5 * 1024 * 1024, maxFiles: 1 });

  const isFormValid = resumeFile && linkedinFile && githubUsername.trim() && targetRole.trim();

  const handleScan = async () => {
    setError('');
    setResult(null);
    if (!resumeFile) return setError('Please upload your resume PDF.');
    if (!linkedinFile) return setError('Please upload your LinkedIn PDF.');
    if (!githubUsername.trim()) return setError('Please enter your GitHub username.');
    if (!targetRole.trim()) return setError('Please enter your target job role.');

    setIsScanning(true);
    setCurrentStep(0);

    try {
      const { data: { session: refreshedSession } } = await supabase.auth.refreshSession();
      const activeSession = refreshedSession || (await supabase.auth.getSession()).data.session;
      if (!activeSession?.access_token) throw new Error('Session expired. Please log in again.');

      scanStartRef.current = Date.now();
      setTimeoutMsg('');

      const advanceStep = () => {
        setCurrentStep((prev) => {
          if (prev >= PROGRESS_STEPS.length - 2) return prev;
          return prev + 1;
        });
        const delay = 2500 + Math.random() * 1500;
        progressTimeout = setTimeout(advanceStep, delay);
      };
      let progressTimeout = setTimeout(advanceStep, 2500 + Math.random() * 1500);

      const timeoutChecker = setInterval(() => {
        const elapsed = (Date.now() - scanStartRef.current) / 1000;
        if (elapsed > 120) {
          setTimeoutMsg('This is taking unusually long. The analysis is still running — please don\'t close this page.');
        } else if (elapsed > 60) {
          setTimeoutMsg('This is taking longer than usual. The analysis is still running...');
        } else if (elapsed > 30) {
          setTimeoutMsg('Still working — analyzing GitHub repositories takes a moment for larger profiles.');
        }
      }, 5000);

      const formData = new FormData();
      formData.append('resume', resumeFile);
      formData.append('linkedin', linkedinFile);
      formData.append('github_username', githubUsername.trim());
      formData.append('target_role', targetRole.trim());

      const response = await fetch(`${API_URL}/scan`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${activeSession.access_token}` },
        body: formData,
      });

      clearTimeout(progressTimeout);
      clearInterval(timeoutChecker);

      if (!response.ok) {
        const errData = await response.json().catch(() => ({ message: 'Scan failed' }));
        throw new Error(errData.message || errData.details?.join('. ') || 'Scan failed');
      }

      setCurrentStep(PROGRESS_STEPS.length - 1);
      setResult(await response.json());
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsScanning(false);
    }
  };

  const handleDownloadPdf = async () => {
    setPdfGenerating(true);
    try {
      const { default: html2canvas } = await import('html2canvas');
      const { default: jsPDF } = await import('jspdf');
      const el = resultRef.current;
      if (!el) { window.print(); return; }
      const canvas = await html2canvas(el, { scale: 2, useCORS: true, logging: false, backgroundColor: '#f8fafc' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = pageWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      pdf.save(`CareerLens-${result?.target_role?.replace(/\s+/g, '-') || 'analysis'}-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch {
      window.print();
    } finally {
      setPdfGenerating(false);
    }
  };

  const scoreColor = (s: number) => s >= 60 ? 'text-emerald-600' : s >= 35 ? 'text-amber-600' : 'text-red-600';

  // ── Results ──
  if (result) {
    return (
      <div ref={resultRef}>
        <div className="flex items-start gap-3 mb-6">
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Analysis Complete</h2>
            <p className="text-sm text-muted-foreground">{result.gap_summary}</p>
          </div>
        </div>

        {/* Edge case notes */}
        {result.notes && result.notes.length > 0 && (
          <div className="space-y-2 mb-6">
            {result.notes.map((note: string, i: number) => (
              <div key={i} className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800">{note}</p>
              </div>
            ))}
          </div>
        )}

        {/* Score Cards */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-6">
          <Card size="sm">
            <CardContent className="pt-4 pb-4 text-center">
              <p className={`text-3xl font-bold ${scoreColor(result.overall_score)}`}>{result.overall_score}%</p>
              <p className="text-[11px] text-muted-foreground mt-1">Evidence Score</p>
            </CardContent>
          </Card>
          <Card size="sm">
            <CardContent className="pt-4 pb-4 text-center">
              <p className="text-3xl font-bold">{result.verified_skill_count}/{result.total_target_skills}</p>
              <p className="text-[11px] text-muted-foreground mt-1">Skills Verified</p>
            </CardContent>
          </Card>
          <Card size="sm">
            <CardContent className="pt-4 pb-4 text-center">
              <p className="text-3xl font-bold text-blue-600">{result.delta_projection.projected_readiness}%</p>
              <p className="text-[11px] text-muted-foreground mt-1">After Projects</p>
            </CardContent>
          </Card>
        </div>

        {/* Conflicts */}
        {result.conflicts.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-red-500" /> Conflicts ({result.conflicts.length})
            </h3>
            <div className="space-y-2">
              {result.conflicts.map((c: any, i: number) => (
                <div key={i} className={`p-3 rounded-lg border text-sm ${c.risk_level === 'high' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
                  <p className="font-medium">{c.skill}: {c.issue}</p>
                  <p className="text-xs text-muted-foreground mt-1">{c.action}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hidden Skills */}
        {result.hidden_skills.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-500" /> Hidden Skills ({result.hidden_skills.length})
            </h3>
            <div className="space-y-2">
              {result.hidden_skills.map((h: any, i: number) => (
                <div key={i} className="p-3 rounded-lg border bg-blue-50 border-blue-200 text-sm">
                  <p className="font-medium">{h.skill} — found on {h.found_on.join(' & ')}</p>
                  <p className="text-xs text-muted-foreground mt-1">{h.action}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Evidence Matrix */}
        <div className="mb-8">
          <h3 className="text-base font-semibold mb-3">Evidence Matrix</h3>
          <Card className="rounded-2xl border-slate-200 shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-b from-slate-50 to-slate-100/80 border-b border-slate-200">
                    <th className="text-left px-4 py-3.5 font-semibold text-sm text-slate-700">Skill</th>
                    <th className="text-center px-3 py-3.5 font-semibold text-sm text-slate-700 hidden sm:table-cell">Level</th>
                    <th className="text-center px-3 py-3.5 w-14">
                      <Tooltip><TooltipTrigger className="flex flex-col items-center gap-0.5 mx-auto">
                        <FileText className="w-4 h-4 text-blue-500" />
                        <span className="text-[10px] font-medium text-slate-500">Resume</span>
                      </TooltipTrigger><TooltipContent side="top" className="text-xs">Found on Resume</TooltipContent></Tooltip>
                    </th>
                    <th className="text-center px-3 py-3.5 w-14">
                      <Tooltip><TooltipTrigger className="flex flex-col items-center gap-0.5 mx-auto">
                        <FaLinkedin className="w-4 h-4 text-[#0A66C2]" />
                        <span className="text-[10px] font-medium text-slate-500">LinkedIn</span>
                      </TooltipTrigger><TooltipContent side="top" className="text-xs">Found on LinkedIn</TooltipContent></Tooltip>
                    </th>
                    <th className="text-center px-3 py-3.5 w-14">
                      <Tooltip><TooltipTrigger className="flex flex-col items-center gap-0.5 mx-auto">
                        <FaGithub className="w-4 h-4 text-slate-700" />
                        <span className="text-[10px] font-medium text-slate-500">GitHub</span>
                      </TooltipTrigger><TooltipContent side="top" className="text-xs">Found on GitHub</TooltipContent></Tooltip>
                    </th>
                    <th className="text-center px-3 py-3.5 font-semibold text-sm text-slate-700 w-20">Score</th>
                    <th className="text-center px-3 py-3.5 font-semibold text-sm text-slate-700 hidden sm:table-cell w-28">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {result.evidence_matrix.map((e: any, i: number) => {
                    const score = e.evidence_score ?? 0;
                    return (
                      <tr key={i} className={`border-b border-slate-100 last:border-0 transition-colors hover:bg-slate-50/60 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                        <td className="px-4 py-3 font-medium text-sm text-slate-800">{e.skill_name}</td>
                        <td className="px-3 py-3 text-center hidden sm:table-cell">
                          <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
                            e.importance === 'critical'
                              ? 'bg-red-50 text-red-600 border-red-200'
                              : e.importance === 'important'
                                ? 'bg-blue-50 text-blue-600 border-blue-200'
                                : 'bg-slate-50 text-slate-500 border-slate-200'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              e.importance === 'critical' ? 'bg-red-500' : e.importance === 'important' ? 'bg-blue-500' : 'bg-slate-400'
                            }`} />
                            {e.importance === 'nice_to_have' ? 'nice' : e.importance}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <div className={`w-7 h-7 rounded-lg mx-auto flex items-center justify-center ${e.cross_reference.resume ? 'bg-emerald-50 border border-emerald-200' : 'bg-slate-50 border border-slate-100'}`}>
                            {e.cross_reference.resume
                              ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                              : <X className="w-3.5 h-3.5 text-slate-300" />}
                          </div>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <div className={`w-7 h-7 rounded-lg mx-auto flex items-center justify-center ${e.cross_reference.linkedin ? 'bg-emerald-50 border border-emerald-200' : 'bg-slate-50 border border-slate-100'}`}>
                            {e.cross_reference.linkedin
                              ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                              : <X className="w-3.5 h-3.5 text-slate-300" />}
                          </div>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <div className={`w-7 h-7 rounded-lg mx-auto flex items-center justify-center ${e.cross_reference.github ? 'bg-emerald-50 border border-emerald-200' : 'bg-slate-50 border border-slate-100'}`}>
                            {e.cross_reference.github
                              ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                              : <X className="w-3.5 h-3.5 text-slate-300" />}
                          </div>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className={`inline-flex items-center justify-center w-9 h-9 rounded-xl text-sm font-bold ring-1 ${
                            score >= 60 ? 'ring-emerald-200 bg-emerald-50 text-emerald-600'
                              : score >= 35 ? 'ring-amber-200 bg-amber-50 text-amber-600'
                              : 'ring-red-200 bg-red-50 text-red-500'
                          }`}>{score}</span>
                        </td>
                        <td className="px-3 py-3 text-center hidden sm:table-cell">
                          <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full border ${
                            e.cross_reference.label === 'Fully Verified' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            e.cross_reference.label === 'Underreported' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                            e.cross_reference.label === 'Undiscovered' ? 'bg-slate-100 text-slate-600 border-slate-200' :
                            'bg-slate-50 text-slate-500 border-slate-200'
                          }`}>{e.cross_reference.label}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Projects */}
        {result.project_recommendations.length > 0 && (
          <div className="mb-8">
            <h3 className="text-base font-semibold mb-3">Recommended Projects</h3>
            <div className="space-y-4">
              {result.project_recommendations.map((p: any, i: number) => (
                <Card key={i} className="rounded-2xl border-slate-200 shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className={`h-1 ${i === 0 ? 'bg-gradient-to-r from-indigo-500 to-violet-500' : 'bg-gradient-to-r from-slate-200 to-slate-100'}`} />
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${i === 0 ? 'bg-indigo-50' : 'bg-slate-100'}`}>
                          {i === 0 ? <Sparkles className="w-4 h-4 text-indigo-600" /> : <span className="text-xs font-bold text-slate-500">{i + 1}</span>}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-semibold text-slate-900">{p.title}</h4>
                            {i === 0 && <span className="text-[10px] font-semibold bg-indigo-600 text-white px-2 py-0.5 rounded-full">Recommended</span>}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{p.description}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap mb-3">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        p.difficulty === 'beginner' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        p.difficulty === 'intermediate' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-red-50 text-red-700 border-red-200'
                      }`}>{p.difficulty}</span>
                      <span className="text-xs text-slate-400">~{p.estimated_hours}h</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {p.tech_stack.map((t: string) => (
                        <span key={t} className="text-[11px] font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded-lg border border-slate-200">{t}</span>
                      ))}
                    </div>
                    <p className="text-xs text-slate-400 mb-3">Covers: {p.skills_covered.join(', ')}</p>
                    {p.evidence_impact && (
                      <div className="flex items-start gap-2 p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
                        <ArrowRight className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-emerald-700 font-medium">{p.evidence_impact}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Quick Wins */}
        {result.quick_wins.length > 0 && (
          <div className="mb-8">
            <h3 className="text-base font-semibold mb-3">Quick Wins</h3>
            <Card className="rounded-2xl border-slate-200 shadow-md">
              <CardContent className="p-5">
                <ul className="space-y-2.5">
                  {result.quick_wins.map((w: string, i: number) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <CheckCircle className="w-4 h-4 mt-0.5 text-emerald-500 flex-shrink-0" />
                      <span className="text-slate-700">{w}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={() => router.push('/dashboard')} className="gap-2"><Sparkles className="w-3.5 h-3.5" />View Dashboard</Button>
          <Button variant="outline" onClick={handleDownloadPdf} disabled={pdfGenerating} className="gap-2">
            {pdfGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ArrowLeft className="w-3.5 h-3.5" />}
            {pdfGenerating ? 'Generating...' : 'Download as PDF'}
          </Button>
        </div>
      </div>
    );
  }

  // ── Progress ──
  if (isScanning) {
    return (
      <div className="max-w-md mx-auto pt-8 sm:pt-16">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <h2 className="text-lg font-semibold tracking-tight">Analyzing Your Profile</h2>
          <p className="text-xs text-muted-foreground mt-1">This takes 30-60 seconds with evidence scoring.</p>
        </div>
        <Card>
          <CardContent className="pt-4 pb-3 space-y-0.5">
            {PROGRESS_STEPS.map((step, index) => {
              const StepIcon = step.icon;
              const done = index < currentStep;
              const active = index === currentStep;
              return (
                <div key={step.key} className={`flex items-center gap-3 rounded-md px-3 py-2 transition-colors ${active ? 'bg-secondary' : ''}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${done ? 'bg-emerald-100' : active ? 'bg-primary/10' : 'bg-muted'}`}>
                    {done ? <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> : active ? <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" /> : <StepIcon className="w-3.5 h-3.5 text-muted-foreground" />}
                  </div>
                  <span className={`text-sm ${done ? 'text-emerald-700' : active ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>{step.label}</span>
                </div>
              );
            })}
          </CardContent>
          <div className="px-4 pb-4">
            <div className="h-1 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all duration-700" style={{ width: `${(currentStep / (PROGRESS_STEPS.length - 1)) * 100}%` }} />
            </div>
          </div>
        </Card>
        {timeoutMsg && (
          <p className="text-xs text-muted-foreground text-center mt-4">{timeoutMsg}</p>
        )}
      </div>
    );
  }

  // ── Form ──
  return (
    <TooltipProvider>
      <div>
        <div className="mb-6">
          <h2 className="text-lg font-semibold tracking-tight">New Scan</h2>
          <p className="text-sm text-muted-foreground">Upload your documents, connect GitHub, and set your target role.</p>
        </div>
        <div className="space-y-3">
          <Card size="sm">
            <CardHeader className="pb-1"><CardTitle className="text-xs font-medium flex items-center gap-2"><FileText className={`w-3.5 h-3.5 ${resumeFile ? 'text-emerald-600' : 'text-blue-600'}`} /> Resume PDF {resumeFile && <CheckCircle className="w-3 h-3 text-emerald-500 ml-auto" />}</CardTitle></CardHeader>
            <CardContent>
              <div {...resumeDropzone.getRootProps()} className={`border border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${resumeDropzone.isDragActive ? 'border-primary bg-primary/5' : resumeFile ? 'border-emerald-300 bg-emerald-50/50' : 'border-border hover:border-primary/50'}`}>
                <input {...resumeDropzone.getInputProps()} />
                {resumeFile ? (<div className="flex items-center justify-center gap-2 text-sm"><span className="font-medium text-emerald-700">{resumeFile.name}</span><span className="text-xs text-muted-foreground">({(resumeFile.size / 1024).toFixed(0)} KB)</span><button type="button" onClick={(e) => { e.stopPropagation(); setResumeFile(null); }} className="p-0.5 rounded hover:bg-muted"><X className="w-3 h-3 text-muted-foreground" /></button></div>
                ) : (<div className="py-1"><Upload className="w-5 h-5 mx-auto text-muted-foreground mb-1.5" /><p className="text-sm text-muted-foreground">Drop resume or <span className="text-primary font-medium">browse</span></p><p className="text-[11px] text-muted-foreground/70 mt-0.5">PDF, max 5MB</p></div>)}
              </div>
            </CardContent>
          </Card>
          <Card size="sm">
            <CardHeader className="pb-1"><CardTitle className="text-xs font-medium flex items-center gap-2"><FaLinkedin className={`w-3.5 h-3.5 ${linkedinFile ? 'text-emerald-600' : 'text-[#0A66C2]'}`} /> LinkedIn PDF {linkedinFile ? <CheckCircle className="w-3 h-3 text-emerald-500 ml-auto" /> : <Tooltip><TooltipTrigger><Info className="w-3 h-3 text-muted-foreground ml-auto" /></TooltipTrigger><TooltipContent side="top" className="max-w-[200px] text-xs">Profile &rarr; More &rarr; Save to PDF</TooltipContent></Tooltip>}</CardTitle></CardHeader>
            <CardContent>
              <div {...linkedinDropzone.getRootProps()} className={`border border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${linkedinDropzone.isDragActive ? 'border-primary bg-primary/5' : linkedinFile ? 'border-emerald-300 bg-emerald-50/50' : 'border-border hover:border-primary/50'}`}>
                <input {...linkedinDropzone.getInputProps()} />
                {linkedinFile ? (<div className="flex items-center justify-center gap-2 text-sm"><span className="font-medium text-emerald-700">{linkedinFile.name}</span><span className="text-xs text-muted-foreground">({(linkedinFile.size / 1024).toFixed(0)} KB)</span><button type="button" onClick={(e) => { e.stopPropagation(); setLinkedinFile(null); }} className="p-0.5 rounded hover:bg-muted"><X className="w-3 h-3 text-muted-foreground" /></button></div>
                ) : (<div className="py-1"><Upload className="w-5 h-5 mx-auto text-muted-foreground mb-1.5" /><p className="text-sm text-muted-foreground">Drop LinkedIn PDF or <span className="text-primary font-medium">browse</span></p></div>)}
              </div>
            </CardContent>
          </Card>
          <Card size="sm">
            <CardHeader className="pb-1"><CardTitle className="text-xs font-medium flex items-center gap-2"><FaGithub className={`w-3.5 h-3.5 ${githubUsername.trim() ? 'text-emerald-600' : ''}`} /> GitHub Username {githubUsername.trim() && <CheckCircle className="w-3 h-3 text-emerald-500 ml-auto" />}</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center rounded-md border bg-background overflow-hidden focus-within:ring-1 focus-within:ring-ring">
                <span className="text-xs text-muted-foreground pl-3 pr-0.5 select-none">github.com/</span>
                <Input placeholder="username" value={githubUsername} onChange={(e) => setGithubUsername(e.target.value)} className="border-0 shadow-none focus-visible:ring-0 h-8 text-sm" />
              </div>
            </CardContent>
          </Card>
          <Card size="sm">
            <CardHeader className="pb-1"><CardTitle className="text-xs font-medium flex items-center gap-2"><Target className={`w-3.5 h-3.5 ${targetRole.trim() ? 'text-emerald-600' : 'text-violet-600'}`} /> Target Job Role {targetRole.trim() && <CheckCircle className="w-3 h-3 text-emerald-500 ml-auto" />}</CardTitle></CardHeader>
            <CardContent><Input placeholder='e.g. "Senior Backend Engineer"' value={targetRole} onChange={(e) => setTargetRole(e.target.value)} className="h-8 text-sm" /></CardContent>
          </Card>
          {error && (<div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg"><AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" /><p className="text-sm text-destructive">{error}</p></div>)}
          <Button onClick={handleScan} className="w-full gap-2" disabled={!isFormValid}><Sparkles className="w-3.5 h-3.5" /> Analyze My Profile <ArrowRight className="w-3.5 h-3.5" /></Button>
          <p className="text-[11px] text-muted-foreground text-center pb-2">30-60 seconds. Your data is encrypted and private.</p>
        </div>
      </div>
    </TooltipProvider>
  );
}
