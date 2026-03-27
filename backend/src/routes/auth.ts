import { Router } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

router.post('/verify', authMiddleware, (req: AuthenticatedRequest, res) => {
  res.json({
    authenticated: true,
    userId: req.userId,
  });
});

export default router;
