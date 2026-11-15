import { betterAuth } from 'better-auth';
import { drizzleAdapter } from '@better-auth/drizzle-adapter';

import { db } from './db/index.js';
import * as schema from './db/schema.js';

const googleClientIds = [
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_IOS_CLIENT_ID,
  process.env.GOOGLE_ANDROID_CLIENT_ID,
].filter((id): id is string => Boolean(id));

const googleClientId =
  googleClientIds.length > 1 ? googleClientIds : (googleClientIds[0] ?? '');

const trustedOrigins = (process.env.TRUSTED_ORIGINS ?? '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:3000',
  secret: process.env.BETTER_AUTH_SECRET ?? 'dev-only-change-me',
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema,
  }),
  socialProviders: {
    google: {
      clientId: googleClientId,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    },
  },
  ...(trustedOrigins.length > 0 ? { trustedOrigins } : {}),
  advanced: {
    database: {
      joins: true,
    },
  },
});
