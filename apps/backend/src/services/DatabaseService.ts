import { Pool, type QueryResultRow } from "pg";
import { parsePgEnv } from "../config/pgEnv.js";

const pgConfig = parsePgEnv();

const pool = pgConfig
  ? new Pool({
      host: pgConfig.PGHOST,
      port: pgConfig.PGPORT,
      database: pgConfig.PGDATABASE,
      user: pgConfig.PGUSER,
      password: pgConfig.PGPASSWORD,
    })
  : null;

export const getVisits = async <TRow extends QueryResultRow = QueryResultRow>(): Promise<TRow[]> => {
  if (!pool) {
    return [];
  }
  const result = await pool.query<TRow>("SELECT * FROM visits");
  return result.rows;
};

interface VisitsRow extends QueryResultRow {
  ip: string;
  pedestrians: number;
}

export const getPedestriansFor = async (ip: string): Promise<number | undefined> => {
  if (!pool) {
    return 0;
  }
  const result = await pool.query<VisitsRow>("SELECT pedestrians FROM visits WHERE ip = $1 LIMIT 1", [ip]);
  const row = result.rows[0];

  if (!row) {
    return undefined;
  }

  const pedestriansCount = Number(row.pedestrians);
  return Number.isNaN(pedestriansCount) ? undefined : pedestriansCount;
};

export const saveVisitsFor = async (ip: string, visits: number): Promise<void> => {
  if (!pool) {
    return;
  }
  const updateResult = await pool.query("UPDATE visits SET pedestrians = $1 WHERE ip = $2", [visits, ip]);

  if (updateResult.rowCount && updateResult.rowCount > 0) {
    return;
  }

  await pool.query("INSERT INTO visits (ip, pedestrians) VALUES ($1, $2)", [ip, visits]);
};
