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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) throw new Error('Not authenticated');
        const res = await fetch(`${API_URL}/scans/${scanId}`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (!res.ok) throw new Error('Scan not found');
        setScan(await res.json());
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
      headerExtra={
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link href={`/dashboard/chat?scan_id=${scanId}`} className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 text-slate-700 font-medium px-3 py-1.5 text-xs hover:bg-slate-200 transition-colors">
            <MessageSquare className="w-3.5 h-3.5" />
            Ask AI
          </Link>
          <Link href="/dashboard/history" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to History
          </Link>
        </div>
      }
    />
  );
}
