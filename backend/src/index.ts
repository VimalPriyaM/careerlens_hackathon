import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { rateLimiter } from './middleware/rateLimiter';
import healthRouter from './routes/health';
import authRouter from './routes/auth';
import scanRouter from './routes/scan';
import chatRouter from './routes/chat';
import generateRouter from './routes/generate';

dotenv.config();

// ── Environment variable validation ──
const REQUIRED_ENV_VARS = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'GROQ_API_KEY'] as const;
for (const varName of REQUIRED_ENV_VARS) {
  if (!process.env[varName]) {
    console.error(`FATAL: Missing required environment variable: ${varName}`);
    process.exit(1);
  }
}

if (!process.env.GITHUB_TOKEN) {
  console.warn('WARNING: GITHUB_TOKEN is not set. GitHub API calls will be rate-limited to 60 requests/hour.');
}

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:3000',
    'http://localhost:3001',
  ].filter(Boolean),
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
app.use(rateLimiter);

// Routes
app.use('/api', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api', scanRouter);
app.use('/api', chatRouter);
app.use('/api', generateRouter);

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    error: true,
    code: err.code || 'INTERNAL_ERROR',
    message: err.message || 'An unexpected error occurred',
  });
});

app.listen(PORT, () => {
  console.log(`CareerLens API running on port ${PORT}`);
});

export default app;
