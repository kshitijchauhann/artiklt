import 'dotenv/config';

import cors from 'cors';
import express from 'express';
import { fromNodeHeaders, toNodeHandler } from 'better-auth/node';

import { auth } from './auth.js';

const PORT = Number(process.env.PORT) || 3000;

const app = express();

const corsOrigins = (process.env.CORS_ORIGIN ?? 'http://localhost:8081')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  }),
);

// Better Auth must be mounted before express.json() so it can read the raw body.
app.all('/api/auth/*splat', toNodeHandler(auth));

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: '@artiklt/backend' });
});

app.get('/api/me', async (req, res) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
  res.json(session);
});

app.listen(PORT, () => {
  console.log(`@artiklt/backend listening on http://localhost:${PORT}`);
});
