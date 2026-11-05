import { neon } from "@neondatabase/serverless";

type Sql = ReturnType<typeof neon>;

let cached: Sql | null = null;

export function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. The Neon database is connected on the prodvince Vercel project.",
    );
  }

  if (!cached) cached = neon(url);
  return cached;
}

export async function queryRaw(statement: string) {
  const sql = getSql() as Sql & { query: (queryText: string) => Promise<unknown> };
  await sql.query(statement);
}

export async function queryRows<T>(statement: string, params: unknown[] = []): Promise<T[]> {
  const sql = getSql() as unknown as {
    query: (queryText: string, params?: unknown[]) => Promise<T[]>;
  };
  return sql.query(statement, params);
}
