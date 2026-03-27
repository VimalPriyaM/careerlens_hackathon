import { supabaseAdmin } from '../utils/supabase';

/**
 * Create a new chat session linked to a user and optionally a scan.
 */
export async function createChatSession(
  userId: string,
  scanId: string | null,
  title: string
): Promise<string> {
  const { data, error } = await supabaseAdmin
    .from('chat_sessions')
    .insert({
      user_id: userId,
      scan_id: scanId,
      title,
    })
    .select('id')
    .single();

  if (error || !data) {
    throw new Error(`Failed to create chat session: ${error?.message || 'unknown error'}`);
  }

  return data.id;
}

/**
 * List all chat sessions for a user, ordered by most recently updated.
 */
export async function listChatSessions(userId: string): Promise<any[]> {
  const { data, error } = await supabaseAdmin
    .from('chat_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to list chat sessions: ${error.message}`);
  }

  return data || [];
}

/**
 * Get all messages for a session, in chronological order.
 * Verifies session belongs to user.
 */
export async function getSessionMessages(
  userId: string,
  sessionId: string
): Promise<any[]> {
  // Verify ownership
  const { data: session, error: sessionError } = await supabaseAdmin
    .from('chat_sessions')
    .select('id')
    .eq('id', sessionId)
    .eq('user_id', userId)
    .single();

  if (sessionError || !session) {
    throw new Error('Session not found or access denied');
  }

  const { data, error } = await supabaseAdmin
    .from('chat_messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`Failed to get messages: ${error.message}`);
  }

  return data || [];
}

/**
 * Store a single message in a chat session.
 */
export async function storeMessage(
  sessionId: string,
  role: 'user' | 'assistant',
  content: string
): Promise<void> {
  const { error } = await supabaseAdmin
    .from('chat_messages')
    .insert({
      session_id: sessionId,
      role,
      content,
    });

  if (error) {
    throw new Error(`Failed to store message: ${error.message}`);
  }

  // Update session's updated_at timestamp
  await supabaseAdmin
    .from('chat_sessions')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', sessionId);
}

/**
 * Fetch the linked scan data for a session, or null if no scan is linked.
 */
export async function getSessionScan(sessionId: string): Promise<any | null> {
  const { data: session, error: sessionError } = await supabaseAdmin
    .from('chat_sessions')
    .select('scan_id')
    .eq('id', sessionId)
    .single();

  if (sessionError || !session || !session.scan_id) {
    return null;
  }

  const { data: scan, error: scanError } = await supabaseAdmin
    .from('scans')
    .select('*')
    .eq('id', session.scan_id)
    .single();

  if (scanError || !scan) {
    return null;
  }

  return scan;
}
