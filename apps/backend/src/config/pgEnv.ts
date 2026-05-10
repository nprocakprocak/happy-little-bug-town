import { z } from "zod";

const pgEnvSchema = z.object({
  PGHOST: z.string().trim().min(1),
  PGPORT: z.coerce.number().int().min(1).max(65535),
  PGDATABASE: z.string().trim().min(1),
  PGUSER: z.string().trim().min(1),
  PGPASSWORD: z.string(),
});

export type PgEnvConfig = z.infer<typeof pgEnvSchema>;

export function parsePgEnv(): PgEnvConfig | null {
  const result = pgEnvSchema.safeParse({
    PGHOST: process.env.PGHOST,
    PGPORT: process.env.PGPORT,
    PGDATABASE: process.env.PGDATABASE,
    PGUSER: process.env.PGUSER,
    PGPASSWORD: process.env.PGPASSWORD ?? "",
  });
  return result.success ? result.data : null;
}
