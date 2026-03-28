/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-browser';
import { MessageSquare, ScanSearch, ArrowRight } from 'lucide-react';
import { ScanDashboard } from '@/components/dashboard/ScanDashboard';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { ErrorCard } from '@/components/ui/ErrorCard';
import { useProfileStore } from '@/store/useProfileStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export default function DashboardPage() {
  const supabase = createClient();
  const { currentScan: cachedScan, setCachedScan, scanHistory: cachedHistory, setScanHistory } = useProfileStore();
  const [scan, setScan] = useState<any>(cachedScan);
  const [previousScan, setPreviousScan] = useState<any>(null);
  const [scanHistory, setScanHistoryState] = useState<any[]>(cachedHistory || []);
  const [loading, setLoading] = useState(!cachedScan);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) { setLoading(false); return; }

        const headers = { Authorization: `Bearer ${session.access_token}` };

        // Fetch scan list (for history + previous scan comparison)
        const listRes = await fetch(`${API_URL}/scans?limit=20`, { headers });
        if (!listRes.ok) throw new Error('Failed to fetch scans');
        const { scans } = await listRes.json();

        if (!scans || scans.length === 0) { setScan(null); setLoading(false); return; }

        // Store history for trend chart
        setScanHistoryState(scans);
        setScanHistory(scans);

        // Get full detail of latest scan (if not cached)
        let latestScan = cachedScan;
        if (!cachedScan || cachedScan.id !== scans[0].id) {
          const detailRes = await fetch(`${API_URL}/scans/${scans[0].id}`, { headers });
          if (!detailRes.ok) throw new Error('Failed to fetch scan details');
          latestScan = await detailRes.json();
          setScan(latestScan);
          setCachedScan(latestScan);
        }

        // Find previous scan for same role to compute deltas
        const currentRole = latestScan?.target_role;
        if (currentRole && scans.length > 1) {
          const prevScanSummary = scans.slice(1).find((s: any) => s.target_role === currentRole);
          if (prevScanSummary) {
            // Fetch full detail of previous scan for comparison
            try {
              const prevRes = await fetch(`${API_URL}/scans/${prevScanSummary.id}`, { headers });
              if (prevRes.ok) {
                const prevData = await prevRes.json();
                setPreviousScan(prevData);
              }
            } catch {
              // Previous scan detail fetch is non-critical
              setPreviousScan(prevScanSummary);
            }
          }
        }
      } catch (e: any) {
        if (!cachedScan) setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [supabase, cachedScan, setCachedScan, setScanHistory]);

  if (loading) return <DashboardSkeleton />;
  if (error) return <ErrorCard message={error} onRetry={() => window.location.reload()} />;

  if (!scan) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-6">
            <ScanSearch className="w-8 h-8 text-slate-700" />
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 mb-2">Welcome to CareerLens</h2>
          <p className="text-sm text-slate-500 mb-8 leading-relaxed">
            Upload your Resume and LinkedIn PDF along with your GitHub username to get your first evidence-backed skill analysis.
          </p>
          <Link
            href="/dashboard/scan"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 text-white font-medium px-6 py-3 text-sm hover:bg-slate-800 transition-colors shadow-sm shadow-slate-300"
          >
            Start Your First Scan
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ScanDashboard
      scan={scan}
      previousScan={previousScan}
      scanHistory={scanHistory}
      headerExtra={
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link
            href={`/dashboard/chat?scan_id=${scan.id}`}
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 text-slate-700 font-medium px-4 py-2 text-xs hover:bg-slate-200 transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Ask AI
          </Link>
          <Link
            href="/dashboard/scan"
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 text-white font-medium px-4 py-2 text-xs hover:bg-slate-800 transition-colors shadow-sm shadow-slate-300"
          >
            New Scan
          </Link>
        </div>
      }
    />
  );
}
