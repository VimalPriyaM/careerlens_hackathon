/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase-browser';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronRight, ChevronDown, Copy, RefreshCw, Loader2, Sparkles } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface BulletGeneratorProps {
  scanId: string | null;
}

export function BulletGenerator({ scanId }: BulletGeneratorProps) {
  const supabase = createClient();
  const [expanded, setExpanded] = useState(false);
  const [description, setDescription] = useState('');
  const [techStack, setTechStack] = useState('');
  const [bullet, setBullet] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const generate = async () => {
    if (!description.trim() || !techStack.trim()) return;
    setLoading(true);
    setError('');
    setBullet('');
    setCopied(false);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Not authenticated');

      const body: any = {
        project_description: description.trim(),
        tech_stack: techStack.split(',').map((s: string) => s.trim()).filter(Boolean),
      };
      if (scanId) body.scan_id = scanId;

      const res = await fetch(`${API_URL}/generate-bullet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to generate bullet');
      }

      const data = await res.json();
      setBullet(data.bullet);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(bullet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <Card className="mb-4">
      <CardContent className="py-3">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors w-full text-left"
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          Generate Resume Bullet
          {expanded ? (
            <ChevronDown className="w-4 h-4 ml-auto" />
          ) : (
            <ChevronRight className="w-4 h-4 ml-auto" />
          )}
        </button>

        {expanded && (
          <div className="mt-4 space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Describe the project you built
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Built a REST API that processes user uploads and stores results in PostgreSQL..."
                rows={3}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-slate-300"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Tech stack (comma separated)
              </label>
              <input
                type="text"
                value={techStack}
                onChange={(e) => setTechStack(e.target.value)}
                placeholder="Python, FastAPI, PostgreSQL, Docker"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
              />
            </div>

            <button
              onClick={generate}
              disabled={loading || !description.trim() || !techStack.trim()}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-800 text-white px-4 py-2 text-sm font-medium hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate'
              )}
            </button>

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            {bullet && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm font-medium text-green-900">{bullet}</p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={copyToClipboard}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 hover:text-green-900 bg-green-100 hover:bg-green-200 rounded-md px-3 py-1.5 transition-colors"
                  >
                    <Copy className="w-3 h-3" />
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                  <button
                    onClick={generate}
                    disabled={loading}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 hover:text-green-900 bg-green-100 hover:bg-green-200 rounded-md px-3 py-1.5 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Regenerate
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
