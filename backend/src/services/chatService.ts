import { getClaude } from '../utils/claude';
import { CLAUDE_MODEL } from '../config/constants';
import { buildChatSystemPrompt } from '../prompts/chatSystem';
import {
  createChatSession,
  storeMessage,
  getSessionMessages,
  getSessionScan,
} from './historyService';
import { supabaseAdmin } from '../utils/supabase';

/**
 * Send a chat message, get a personalized Claude response.
 * Creates a new session if sessionId is null.
 */
export async function sendChatMessage(
  userId: string,
  sessionId: string | null,
  scanId: string | null,
  message: string
): Promise<{ sessionId: string; reply: string }> {
  // 1. If no sessionId, create a new session
  let activeSessionId = sessionId;

  if (!activeSessionId) {
    const title = message.slice(0, 50).trim() || 'New conversation';
    activeSessionId = await createChatSession(userId, scanId, title);
  } else {
    // Verify session ownership
    const { data: session, error } = await supabaseAdmin
      .from('chat_sessions')
      .select('id, scan_id')
      .eq('id', activeSessionId)
      .eq('user_id', userId)
      .single();

    if (error || !session) {
      throw new Error('Session not found or access denied');
    }

    // If no scanId was provided but session has one, use it
    if (!scanId && session.scan_id) {
      scanId = session.scan_id;
    }
  }

  // 2. Build system prompt from scan data
  let systemPrompt: string;

  // Try to get scan data — either from provided scanId or from session's linked scan
  let scanData: any = null;
  if (scanId) {
    const { data: scan } = await supabaseAdmin
      .from('scans')
      .select('*')
      .eq('id', scanId)
      .single();
    scanData = scan;
  } else {
    scanData = await getSessionScan(activeSessionId);
  }

  if (scanData) {
    systemPrompt = buildChatSystemPrompt(scanData);
  } else {
    systemPrompt =
      'You are CareerLens AI, a career development co-pilot. The user has not loaded a scan yet. Suggest they run a scan first to get personalized advice. You can still answer general career questions.';
  }

  // 3. Load last 20 messages for context
  const pastMessages = await getSessionMessages(userId, activeSessionId);
  const recentMessages = pastMessages.slice(-20);

  // 4. Build messages array with system prompt
  const llmMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    { role: 'system', content: systemPrompt },
    ...recentMessages.map((m: any) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
  ];

  // Add the new user message
  llmMessages.push({ role: 'user', content: message });

  // 5. Call LLM
  const llm = getClaude();
  const response = await llm.chat.completions.create({
    model: CLAUDE_MODEL,
    max_tokens: 1024,
    messages: llmMessages,
  });

  // Extract text from response
  const reply = response.choices[0]?.message?.content || 'I was unable to generate a response. Please try again.';

  // 6. Store both messages
  await storeMessage(activeSessionId, 'user', message);
  await storeMessage(activeSessionId, 'assistant', reply);

  // 7. Return
  return { sessionId: activeSessionId, reply };
}
