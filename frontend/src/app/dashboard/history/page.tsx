/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-browser';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowUp, ArrowDown, Minus } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const scoreColor = (s: number) => s >= 60 ? 'text-emerald-600' : s >= 35 ? 'text-amber-600' : 'text-red-600';

export default function HistoryPage() {
  const supabase = createClient();
  const [scans, setScans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) return;
        const res = await fetch(`${API_URL}/scans?limit=20`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (res.ok) {
          const { scans: data } = await res.json();
          setScans(data || []);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [supabase]);

  const getDelta = (scan: any, index: number): number | null => {
    const prev = scans.slice(index + 1).find((s: any) => s.target_role === scan.target_role);
    if (!prev) return null;
    return scan.overall_score - prev.overall_score;
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Scan History</h2>
          <p className="text-sm text-muted-foreground">{scans.length} scan{scans.length !== 1 ? 's' : ''}</p>
        </div>
        <Link href="/dashboard/scan" className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground font-medium px-3 py-1.5 text-xs hover:bg-primary/90 transition-colors">
          New Scan
        </Link>
      </div>

      {scans.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-sm text-muted-foreground mb-3">No scans yet.</p>
            <Link href="/dashboard/scan" className="text-sm text-primary hover:underline">Run your first scan</Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {scans.map((scan: any, i: number) => {
            const delta = getDelta(scan, i);
            return (
              <Link key={scan.id} href={`/dashboard/scan/${scan.id}`}>
                <Card size="sm" className="hover:bg-muted/30 transition-colors cursor-pointer">
                  <CardContent className="py-3 flex items-center gap-3 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{scan.target_role}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {new Date(scan.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`text-lg font-bold ${scoreColor(scan.overall_score)}`}>{scan.overall_score}%</p>
                      <p className="text-[11px] text-muted-foreground">{scan.verified_skill_count}/{scan.total_target_skills} verified</p>
                    </div>
                    <div className="w-12 text-center flex-shrink-0">
                      {delta !== null ? (
                        <Badge variant={delta >= 0 ? 'default' : 'destructive'} className="text-[10px] gap-0.5">
                          {delta >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                          {Math.abs(delta)}
                        </Badge>
                      ) : (
                        <Minus className="w-3 h-3 text-muted-foreground mx-auto" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
