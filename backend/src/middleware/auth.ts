import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../utils/supabase';

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export const authMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: true,
      code: 'AUTH_MISSING',
      message: 'Authorization header with Bearer token is required',
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      throw new Error(error?.message || 'Invalid token');
    }

    req.userId = user.id;
    next();
  } catch (error: any) {
    res.status(401).json({
      error: true,
      code: 'AUTH_INVALID',
      message: 'Invalid or expired authentication token',
    });
    return;
  }
};
