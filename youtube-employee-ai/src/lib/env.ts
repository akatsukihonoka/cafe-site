import { z } from 'zod';

const serverEnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  YOUTUBE_OAUTH_REDIRECT_URI: z.string().url(),
  OPENAI_API_KEY: z.string().min(1),
  TOKEN_ENCRYPTION_KEY: z.string().min(32),
  CRON_SECRET: z.string().min(1),
});

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type PublicEnv = z.infer<typeof publicEnvSchema>;

function formatIssues(error: z.ZodError): string {
  return error.issues.map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`).join('\n');
}

type EnvSource = Record<string, string | undefined>;

export function parseServerEnv(source: EnvSource): ServerEnv {
  const parsed = serverEnvSchema.safeParse(source);
  if (!parsed.success) {
    throw new Error(
      `Invalid or missing server environment variables:\n${formatIssues(parsed.error)}`,
    );
  }
  return parsed.data;
}

export function parsePublicEnv(source: EnvSource): PublicEnv {
  const parsed = publicEnvSchema.safeParse(source);
  if (!parsed.success) {
    throw new Error(
      `Invalid or missing public environment variables:\n${formatIssues(parsed.error)}`,
    );
  }
  return parsed.data;
}

// Server-only. Importing this module from client code is a mistake by
// construction: `serverEnvSchema` requires secrets that must never reach
// the browser bundle.
//
// Validation is deferred to first access (rather than running at module
// import time) so that importing `parseServerEnv`/`parsePublicEnv` in tests
// never triggers a real `process.env` parse.
let cachedServerEnv: ServerEnv | undefined;
export function getServerEnv(): ServerEnv {
  if (!cachedServerEnv) {
    cachedServerEnv = parseServerEnv(process.env);
  }
  return cachedServerEnv;
}

let cachedPublicEnv: PublicEnv | undefined;
export function getPublicEnv(): PublicEnv {
  if (!cachedPublicEnv) {
    cachedPublicEnv = parsePublicEnv(process.env);
  }
  return cachedPublicEnv;
}
