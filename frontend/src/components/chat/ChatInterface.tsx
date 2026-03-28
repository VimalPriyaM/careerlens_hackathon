/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useRef, useState, useCallback, KeyboardEvent } from 'react';
import { createClient } from '@/lib/supabase-browser';
import { Send } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

interface ChatInterfaceProps {
  sessionId: string | null;
  scanId: string | null;
  onSessionCreated: (sessionId: string) => void;
  bulletGenerator?: React.ReactNode;
}

const QUICK_ACTIONS = [
  'Build first project?',
  'Biggest weakness?',
  'GitHub strong enough?',
  'Resume bullet',
];

function renderMarkdown(text: string): string {
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  html = html.replace(/```([\s\S]*?)```/g, '<pre class="bg-slate-100 rounded-lg p-3 my-2 text-xs overflow-x-auto"><code>$1</code></pre>');
  html = html.replace(/`([^`]+)`/g, '<code class="bg-slate-100 px-1.5 py-0.5 rounded text-xs">$1</code>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\n/g, '<br/>');
  return html;
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <div
        className={
          isUser
            ? 'bg-slate-800 text-white rounded-2xl rounded-br-sm px-3 sm:px-4 py-2.5 max-w-[82%] sm:max-w-[70%]'
            : 'bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-3 sm:px-4 py-2.5 max-w-[90%] sm:max-w-[80%]'
        }
      >
        {isUser ? (
          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        ) : (
          <div
            className="text-sm leading-relaxed break-words [&_pre]:max-w-full [&_pre]:overflow-x-auto"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(message.content) }}
          />
        )}
        <p className={`text-[10px] mt-1 ${isUser ? 'text-white/50' : 'text-slate-400'}`}>
          {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start mb-3">
      <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-4 py-3">
        <div className="flex gap-1">
          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}

export function ChatInterface({ sessionId, scanId, onSessionCreated, bulletGenerator }: ChatInterfaceProps) {
  const supabase = createClient();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(sessionId);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { setCurrentSessionId(sessionId); }, [sessionId]);

  useEffect(() => {
    if (!currentSessionId) { setMessages([]); return; }
    let cancelled = false;
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;
      try {
        const res = await fetch(`${API_URL}/chat/sessions/${currentSessionId}/messages`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (!res.ok) return;
        const { messages: msgs } = await res.json();
        if (!cancelled) setMessages(msgs || []);
      } catch { /* ignore */ }
    };
    load();
    return () => { cancelled = true; };
  }, [currentSessionId, supabase]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || sending) return;
    const trimmed = text.trim();
    setInput('');
    setSending(true);

    const tempUserMsg: Message = {
      id: `temp-${Date.now()}`, role: 'user', content: trimmed, created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Not authenticated');

      const body: any = { message: trimmed };
      if (currentSessionId) body.session_id = currentSessionId;
      if (scanId) body.scan_id = scanId;

      const res = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to send message');
      }

      const data = await res.json();
      if (!currentSessionId && data.session_id) {
        setCurrentSessionId(data.session_id);
        onSessionCreated(data.session_id);
      }

      setMessages((prev) => [...prev, {
        id: `resp-${Date.now()}`, role: 'assistant', content: data.reply,
        created_at: data.created_at || new Date().toISOString(),
      }]);
    } catch (err: any) {
      setMessages((prev) => [...prev, {
        id: `err-${Date.now()}`, role: 'assistant',
        content: `Sorry, something went wrong: ${err.message}`,
        created_at: new Date().toISOString(),
      }]);
    } finally {
      setSending(false);
    }
  }, [sending, currentSessionId, scanId, supabase, onSessionCreated]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="flex flex-col h-full">
      {/* Scrollable area */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-3">
        {/* Empty state */}
        {!hasMessages && !sending && (
          <div className="flex flex-col h-full">
            {/* Bullet generator at top of empty state */}
            {bulletGenerator && <div className="mb-3">{bulletGenerator}</div>}

            <div className="flex-1 flex flex-col items-center justify-center text-center px-2 pb-4">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mb-3">
                <Send className="w-4 h-4 text-slate-500" />
              </div>
              <p className="text-sm text-slate-500 mb-5">Ask anything about your career profile</p>
              <div className="flex flex-wrap justify-center gap-2">
                {QUICK_ACTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="bg-slate-100 hover:bg-slate-200 text-xs text-slate-600 rounded-full px-3.5 py-2 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        {hasMessages && (
          <>
            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} />
            ))}
            {sending && <TypingIndicator />}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input area — always at bottom */}
      <div className="border-t border-slate-200 bg-white p-2.5 sm:p-3">
        <div className="relative flex items-end max-w-3xl mx-auto">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything..."
            disabled={sending}
            rows={1}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 pr-11 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:opacity-50 min-h-[44px]"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={sending || !input.trim()}
            className="absolute right-1.5 bottom-1.5 p-2 rounded-lg bg-slate-800 text-white hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
