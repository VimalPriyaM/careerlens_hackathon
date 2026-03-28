/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase-browser';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { BulletGenerator } from '@/components/chat/BulletGenerator';
import { MessageSquare, Plus, PanelLeftOpen, PanelLeftClose, Loader2, Link2, X } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface ChatSession {
  id: string;
  title: string;
  scan_id: string | null;
  updated_at: string;
}

function relativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'yesterday';
  return `${days}d ago`;
}

export default function ChatPage() {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const queryScanId = searchParams.get('scan_id');

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [scanId, setScanId] = useState<string | null>(queryScanId);
  const [scanContext, setScanContext] = useState<{ target_role: string; created_at: string } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) { setLoading(false); return; }

        const sessRes = await fetch(`${API_URL}/chat/sessions`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (sessRes.ok) {
          const { sessions: s } = await sessRes.json();
          setSessions(s || []);
        }

        let effectiveScanId = queryScanId;
        if (!effectiveScanId) {
          const scansRes = await fetch(`${API_URL}/scans?limit=1`, {
            headers: { Authorization: `Bearer ${session.access_token}` },
          });
          if (scansRes.ok) {
            const { scans } = await scansRes.json();
            if (scans && scans.length > 0) {
              effectiveScanId = scans[0].id;
            }
          }
        }

        if (effectiveScanId) {
          setScanId(effectiveScanId);
          try {
            const scanRes = await fetch(`${API_URL}/scans/${effectiveScanId}`, {
              headers: { Authorization: `Bearer ${session.access_token}` },
            });
            if (scanRes.ok) {
              const scanData = await scanRes.json();
              setScanContext({
                target_role: scanData.target_role || 'Unknown Role',
                created_at: scanData.created_at || '',
              });
            }
          } catch {
            // ignore
          }
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [supabase, queryScanId]);

  const handleSessionCreated = useCallback((newSessionId: string) => {
    setActiveSessionId(newSessionId);
    const refresh = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;
      const res = await fetch(`${API_URL}/chat/sessions`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const { sessions: s } = await res.json();
        setSessions(s || []);
      }
    };
    refresh();
  }, [supabase]);

  const startNewChat = () => {
    setActiveSessionId(null);
    setSidebarOpen(false);
  };

  const selectSession = (s: ChatSession) => {
    setActiveSessionId(s.id);
    if (s.scan_id) setScanId(s.scan_id);
    setSidebarOpen(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-5rem)] md:h-[calc(100vh-4rem)] -mx-3 sm:-mx-4 md:-mx-8 -mt-2 relative">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-black/30 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          fixed md:relative z-40 md:z-auto
          w-[80vw] max-w-[300px] md:w-72
          h-full
          transition-transform duration-200 ease-in-out
          flex-shrink-0 bg-white border-r border-slate-200
          ${!sidebarOpen ? 'md:w-0 md:overflow-hidden md:border-0' : 'md:w-72'}
        `}
      >
        <div className="w-full h-full flex flex-col">
          {/* Sidebar header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
            <h3 className="text-sm font-semibold text-slate-700">Conversations</h3>
            <div className="flex items-center gap-1">
              <button
                onClick={startNewChat}
                className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg px-2.5 py-1.5 transition-colors min-h-[36px]"
              >
                <Plus className="w-3.5 h-3.5" />
                New
              </button>
              <button
                onClick={() => setSidebarOpen(false)}
                className="md:hidden p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Session list */}
          <div className="flex-1 overflow-y-auto">
            {sessions.length === 0 ? (
              <p className="px-4 py-8 text-xs text-slate-400 text-center">No conversations yet</p>
            ) : (
              sessions.map((s) => (
                <button
                  key={s.id}
                  onClick={() => selectSession(s)}
                  className={`w-full text-left px-4 py-3 border-b border-slate-100 hover:bg-slate-50 transition-colors min-h-[52px] ${
                    activeSessionId === s.id ? 'bg-slate-100' : ''
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <MessageSquare className="w-4 h-4 mt-0.5 text-slate-400 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-700 truncate">
                        {s.title || 'New conversation'}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-slate-400">{relativeTime(s.updated_at)}</span>
                        {s.scan_id && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-blue-600 bg-blue-50 rounded px-1 py-0.5">
                            <Link2 className="w-2.5 h-2.5" />
                            scan
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0 w-full">
        {/* Toolbar */}
        <div className="flex items-center gap-2 px-3 sm:px-4 py-2.5 border-b border-slate-200 bg-white">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
            title={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
          >
            {sidebarOpen ? (
              <PanelLeftClose className="w-4 h-4" />
            ) : (
              <PanelLeftOpen className="w-4 h-4" />
            )}
          </button>

          {scanContext && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500 min-w-0 truncate">
              <Link2 className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
              <span className="truncate">
                <span className="hidden sm:inline">Context: </span>
                <span className="font-medium text-slate-700">{scanContext.target_role}</span>
                {scanContext.created_at && (
                  <span className="hidden sm:inline">
                    {' '}&mdash; {new Date(scanContext.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                )}
              </span>
            </div>
          )}
        </div>

        {/* Chat interface — takes all remaining space */}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <ChatInterface
            sessionId={activeSessionId}
            scanId={scanId}
            onSessionCreated={handleSessionCreated}
            bulletGenerator={<BulletGenerator scanId={scanId} />}
          />
        </div>
      </div>
    </div>
  );
}
