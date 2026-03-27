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
}

const QUICK_ACTIONS = [
  'Which project should I build first?',
  "What's my biggest weakness?",
  'Is my GitHub strong enough?',
  'Write me a resume bullet',
];

/* ---------- lightweight markdown ---------- */
function renderMarkdown(text: string): string {
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  // code blocks (```)
  html = html.replace(/```([\s\S]*?)```/g, '<pre class="bg-slate-100 rounded p-2 my-1 text-xs overflow-x-auto"><code>$1</code></pre>');
  // inline code
  html = html.replace(/`([^`]+)`/g, '<code class="bg-slate-100 px-1 py-0.5 rounded text-xs">$1</code>');
  // bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  // newlines
  html = html.replace(/\n/g, '<br/>');
  return html;
}

/* ---------- sub-components ---------- */

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <div
        className={
          isUser
            ? 'bg-slate-800 text-white rounded-2xl rounded-br-md px-4 py-2 max-w-[75%]'
            : 'bg-white border border-slate-200 rounded-2xl rounded-bl-md px-4 py-2 max-w-[85%]'
        }
      >
        {isUser ? (
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div
            className="text-sm prose-sm"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(message.content) }}
          />
        )}
        <p className="text-xs text-slate-400 mt-1">
          {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start mb-3">
      <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-md px-4 py-3">
        <div className="flex gap-1">
          <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}

function QuickActions({ onSelect }: { onSelect: (text: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2 mb-3">
      {QUICK_ACTIONS.map((q) => (
        <button
          key={q}
          onClick={() => onSelect(q)}
          className="bg-slate-100 hover:bg-slate-200 text-sm text-slate-600 rounded-full px-4 py-1.5 transition-colors"
        >
          {q}
        </button>
      ))}
    </div>
  );
}

/* ---------- main component ---------- */

export function ChatInterface({ sessionId, scanId, onSessionCreated }: ChatInterfaceProps) {
  const supabase = createClient();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(sessionId);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // sync prop changes
  useEffect(() => {
    setCurrentSessionId(sessionId);
  }, [sessionId]);

  // load messages when session changes
  useEffect(() => {
    if (!currentSessionId) {
      setMessages([]);
      return;
    }
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
      } catch {
        // ignore
      }
    };
    load();
    return () => { cancelled = true; };
  }, [currentSessionId, supabase]);

  // auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || sending) return;
    const trimmed = text.trim();
    setInput('');
    setSending(true);

    const tempUserMsg: Message = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: trimmed,
      created_at: new Date().toISOString(),
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
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
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

      const assistantMsg: Message = {
        id: `resp-${Date.now()}`,
        role: 'assistant',
        content: data.reply,
        created_at: data.created_at || new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errMsg: Message = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `Sorry, something went wrong: ${err.message}`,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setSending(false);
    }
  }, [sending, currentSessionId, scanId, supabase, onSessionCreated]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* message list */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 && !sending && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-sm text-slate-500 mb-6">Start a conversation about your career profile.</p>
            <QuickActions onSelect={sendMessage} />
          </div>
        )}
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
        {sending && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* quick actions when messages exist */}
      {messages.length > 0 && !sending && (
        <div className="px-4">
          <QuickActions onSelect={sendMessage} />
        </div>
      )}

      {/* input area */}
      <div className="border-t border-slate-200 p-4">
        <div className="relative flex items-end">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about your profile..."
            disabled={sending}
            rows={1}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pr-12 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:opacity-50"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={sending || !input.trim()}
            className="absolute right-2 bottom-2 p-2 rounded-lg bg-slate-800 text-white hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
