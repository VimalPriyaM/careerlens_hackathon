import { Router, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { sendChatMessage } from '../services/chatService';
import { listChatSessions, getSessionMessages } from '../services/historyService';

const router = Router();

// Chat-specific rate limiter: 30 messages per 15 minutes per IP
const chatRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: true,
    code: 'CHAT_RATE_LIMITED',
    message: 'Too many chat messages. Please wait before sending more.',
  },
});

/**
 * POST /api/chat — Send a message, get a personalized response
 */
router.post('/chat', authMiddleware, chatRateLimiter, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { session_id, scan_id, message } = req.body;

    // Validate message
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      res.status(400).json({
        error: true,
        code: 'INVALID_MESSAGE',
        message: 'Message is required and must be a non-empty string.',
      });
      return;
    }

    if (message.length > 2000) {
      res.status(400).json({
        error: true,
        code: 'MESSAGE_TOO_LONG',
        message: 'Message must be 2000 characters or fewer.',
      });
      return;
    }

    const result = await sendChatMessage(
      userId,
      session_id || null,
      scan_id || null,
      message.trim()
    );

    res.json({
      session_id: result.sessionId,
      reply: result.reply,
      created_at: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Chat error:', error);

    if (error.message?.includes('not found') || error.message?.includes('access denied')) {
      res.status(404).json({
        error: true,
        code: 'NOT_FOUND',
        message: error.message,
      });
      return;
    }

    res.status(500).json({
      error: true,
      code: 'CHAT_ERROR',
      message: 'Failed to process chat message. Please try again.',
    });
  }
});

/**
 * GET /api/chat/sessions — List user's chat sessions
 */
router.get('/chat/sessions', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const sessions = await listChatSessions(userId);

    res.json({ sessions });
  } catch (error: any) {
    console.error('List sessions error:', error);
    res.status(500).json({
      error: true,
      code: 'LIST_SESSIONS_ERROR',
      message: 'Failed to list chat sessions.',
    });
  }
});

/**
 * GET /api/chat/sessions/:sessionId/messages — Get messages for a session
 */
router.get('/chat/sessions/:sessionId/messages', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const sessionId = req.params.sessionId as string;

    const messages = await getSessionMessages(userId, sessionId);

    res.json({ messages });
  } catch (error: any) {
    console.error('Get messages error:', error);

    if (error.message?.includes('not found') || error.message?.includes('access denied')) {
      res.status(404).json({
        error: true,
        code: 'NOT_FOUND',
        message: error.message,
      });
      return;
    }

    res.status(500).json({
      error: true,
      code: 'GET_MESSAGES_ERROR',
      message: 'Failed to get session messages.',
    });
  }
});

export default router;
