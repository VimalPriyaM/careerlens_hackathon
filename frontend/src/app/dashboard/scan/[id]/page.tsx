/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-browser';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, ArrowLeft, MessageSquare } from 'lucide-react';
import { ScanDashboard } from '@/components/dashboard/ScanDashboard';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export default function ScanDetailPage() {
  const params = useParams();
  const scanId = params.id as string;
  const supabase = createClient();
  const [scan, setScan] = useState<any>(null);
  const [previousScan, setPreviousScan] = useState<any>(null);
  const [scanHistory, setScanHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) throw new Error('Not authenticated');

        const headers = { Authorization: `Bearer ${session.access_token}` };

        // Fetch current scan and history in parallel
        const [scanRes, listRes] = await Promise.all([
          fetch(`${API_URL}/scans/${scanId}`, { headers }),
          fetch(`${API_URL}/scans?limit=20`, { headers }),
        ]);

        if (!scanRes.ok) throw new Error('Scan not found');
        const scanData = await scanRes.json();
        setScan(scanData);

        if (listRes.ok) {
          const { scans } = await listRes.json();
          setScanHistory(scans || []);

          // Find previous scan for same role
          const currentIdx = (scans || []).findIndex((s: any) => s.id === scanId);
          const currentRole = scanData.target_role;
          if (currentRole && currentIdx >= 0) {
            const prev = scans.slice(currentIdx + 1).find((s: any) => s.target_role === currentRole);
            if (prev) {
              try {
                const prevRes = await fetch(`${API_URL}/scans/${prev.id}`, { headers });
                if (prevRes.ok) setPreviousScan(await prevRes.json());
              } catch {
                setPreviousScan(prev);
              }
            }
          }
        }
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [supabase, scanId]);

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>;
  }

  if (error || !scan) {
    return (
      <Card><CardContent className="py-10 text-center">
        <p className="text-sm text-destructive mb-3">{error || 'Scan not found'}</p>
        <Link href="/dashboard/history" className="text-sm text-primary hover:underline">Back to History</Link>
      </CardContent></Card>
    );
  }

  return (
    <ScanDashboard
      scan={scan}
      previousScan={previousScan}
      scanHistory={scanHistory}
      headerExtra={
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link href={`/dashboard/chat?scan_id=${scanId}`} className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 text-slate-700 font-medium px-4 py-2 text-xs hover:bg-slate-200 transition-colors">
            <MessageSquare className="w-3.5 h-3.5" />
            Ask AI
          </Link>
          <Link href="/dashboard/history" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to History
          </Link>
        </div>
      }
    />
  );
}
