/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-browser';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, MessageSquare } from 'lucide-react';
import { ScanDashboard } from '@/components/dashboard/ScanDashboard';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export default function DashboardPage() {
  const supabase = createClient();
  const [scan, setScan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) { setLoading(false); return; }

        const res = await fetch(`${API_URL}/scans?limit=1`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch scans');
        const { scans } = await res.json();

        if (scans.length === 0) { setLoading(false); return; }

        const detailRes = await fetch(`${API_URL}/scans/${scans[0].id}`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (!detailRes.ok) throw new Error('Failed to fetch scan details');
        setScan(await detailRes.json());
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <Card><CardContent className="py-10 text-center">
        <p className="text-sm text-destructive mb-3">{error}</p>
        <button onClick={() => window.location.reload()} className="text-sm text-primary hover:underline">Try again</button>
      </CardContent></Card>
    );
  }

  if (!scan) {
    return (
      <div>
        <div className="mb-6">
          <h2 className="text-lg font-semibold tracking-tight">Dashboard</h2>
          <p className="text-sm text-muted-foreground">Welcome to CareerLens AI. Start a new scan to analyze your profile.</p>
        </div>
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
              Upload your Resume and LinkedIn PDF along with your GitHub username to get your first evidence-backed skill analysis.
            </p>
            <Link href="/dashboard/scan" className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground font-medium px-4 py-2 text-sm hover:bg-primary/90 transition-colors">
              Start Your First Scan
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <ScanDashboard
      scan={scan}
      headerExtra={
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link href={`/dashboard/chat?scan_id=${scan.id}`} className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 text-slate-700 font-medium px-3 py-1.5 text-xs hover:bg-slate-200 transition-colors">
            <MessageSquare className="w-3.5 h-3.5" />
            Ask AI
          </Link>
          <Link href="/dashboard/scan" className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground font-medium px-3 py-1.5 text-xs hover:bg-primary/90 transition-colors">
            New Scan
          </Link>
        </div>
      }
    />
  );
}
