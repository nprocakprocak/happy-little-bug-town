import { z } from "zod";

const authEnvSchema = z.object({
  GOOGLE_CLIENT_ID: z.string().trim().min(1),
  SESSION_SECRET: z.string().trim().min(16),
  SESSION_TTL_DAYS: z.coerce.number().int().min(1).max(365).optional(),
});

export interface AuthEnv {
  googleClientId: string;
  sessionSecret: string;
  sessionTtlDays: number;
}

let cachedAuthEnv: AuthEnv | undefined;

export function loadAuthEnv(): AuthEnv {
  if (cachedAuthEnv) {
    return cachedAuthEnv;
  }

  const result = authEnvSchema.safeParse({
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    SESSION_SECRET: process.env.SESSION_SECRET,
    SESSION_TTL_DAYS: process.env.SESSION_TTL_DAYS,
  });

  if (!result.success) {
    console.error("Invalid or missing auth environment variables:");
    for (const issue of result.error.issues) {
      const path = issue.path.length > 0 ? `${issue.path.join(".")}: ` : "";
      console.error(`  ${path}${issue.message}`);
    }
    process.exit(1);
  }

  const data = result.data;
  cachedAuthEnv = {
    googleClientId: data.GOOGLE_CLIENT_ID,
    sessionSecret: data.SESSION_SECRET,
    sessionTtlDays: data.SESSION_TTL_DAYS ?? 30,
  };

  return cachedAuthEnv;
}
