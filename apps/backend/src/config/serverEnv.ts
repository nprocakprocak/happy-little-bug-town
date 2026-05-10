import { z } from "zod";

const serverEnvSchema = z.object({
  RAILWAY_PUBLIC_DOMAIN: z.string().trim().min(1),
  CORS_ORIGIN: z.string().trim().min(1),
  PORT: z.coerce.number().int().min(1).max(65535),
});

export interface ServerEnv {
  railwayPublicDomain: string;
  corsOrigin: string;
  port: number;
}

export function loadServerEnv(): ServerEnv {
  const result = serverEnvSchema.safeParse({
    RAILWAY_PUBLIC_DOMAIN: process.env.RAILWAY_PUBLIC_DOMAIN,
    CORS_ORIGIN: process.env.CORS_ORIGIN,
    PORT: process.env.PORT,
  });

  if (!result.success) {
    console.error("Invalid or missing server environment variables:");
    for (const issue of result.error.issues) {
      const path = issue.path.length > 0 ? `${issue.path.join(".")}: ` : "";
      console.error(`  ${path}${issue.message}`);
    }
    process.exit(1);
  }

  const data = result.data;
  return {
    railwayPublicDomain: data.RAILWAY_PUBLIC_DOMAIN,
    corsOrigin: data.CORS_ORIGIN,
    port: data.PORT,
  };
}
