import { neon } from "@neondatabase/serverless";

let _sql: ReturnType<typeof neon> | null = null;
function getSql() {
  if (!_sql) _sql = neon(process.env.NEON_DB_URL!);
  return _sql;
}

interface QueryOptions {
  orderBy?: string;
  orderDir?: "ASC" | "DESC";
  limit?: number;
  offset?: number;
}

const ALLOWED_COLUMNS = new Set([
  "id", "title", "email", "first_name", "role", "created_at", "updated_at",
  "date", "start_date", "end_date", "order_index", "name", "sort_order",
]);

const ALLOWED_DIRECTIONS = new Set(["ASC", "DESC"]);

function buildSelect(table: string, opts?: QueryOptions) {
  let q = `SELECT * FROM public.${table}`;
  const params: any[] = [];

  if (opts?.orderBy) {
    const col = ALLOWED_COLUMNS.has(opts.orderBy) ? opts.orderBy : "created_at";
    const dir = ALLOWED_DIRECTIONS.has(opts.orderDir || "ASC") ? opts.orderDir : "ASC";
    q += ` ORDER BY ${col} ${dir || "ASC"}`;
  }
  if (opts?.limit) {
    q += ` LIMIT $${params.length + 1}`;
    params.push(opts.limit);
  }
  if (opts?.offset) {
    q += ` OFFSET $${params.length + 1}`;
    params.push(opts.offset);
  }
  return { query: q, params };
}

export const db = {
  async getAll<T>(table: string, opts?: QueryOptions): Promise<T[]> {
    const sql = getSql();
    const { query, params } = buildSelect(table, opts);
    const rows: any[] = await sql.query(query, params) as any;
    return rows as unknown as T[];
  },

  async getById<T extends { id: string }>(table: string, id: string): Promise<T | null> {
    const sql = getSql();
    const rows: any[] = await sql.query(`SELECT * FROM public.${table} WHERE id = $1`, [id]) as any;
    return rows.length > 0 ? (rows[0] as unknown as T) : null;
  },

  async create<T extends Record<string, any>>(table: string, data: T): Promise<T> {
    const sql = getSql();
    const keys = Object.keys(data);
    const values = Object.values(data).map(v => v !== null && typeof v === "object" ? JSON.stringify(v) : v);
    const cols = keys.join(", ");
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");
    const rows: any[] = await sql.query(
      `INSERT INTO public.${table} (${cols}) VALUES (${placeholders}) RETURNING *`,
      values
    ) as any;
    return rows[0] as unknown as T;
  },

  async update<T extends Record<string, any>>(table: string, id: string, updates: Partial<T>): Promise<T | null> {
    const sql = getSql();
    const filtered: [string, unknown][] = Object.entries(updates).filter(
      ([, v]) => v !== undefined
    );
    if (filtered.length === 0) {
      const rows: any[] = await sql.query(
        `UPDATE public.${table} SET updated_at = now() WHERE id = $1 RETURNING *`,
        [id]
      ) as any;
      return rows.length > 0 ? (rows[0] as unknown as T) : null;
    }
    const keys = filtered.map(([k]) => k);
    const values = filtered.map(([, v]) => v !== null && typeof v === "object" ? JSON.stringify(v) : v);
    const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(", ");
    const rows: any[] = await sql.query(
      `UPDATE public.${table} SET ${setClause}, updated_at = now() WHERE id = $${keys.length + 1} RETURNING *`,
      [...values, id]
    ) as any;
    return rows.length > 0 ? (rows[0] as unknown as T) : null;
  },

  async remove(table: string, id: string): Promise<boolean> {
    const sql = getSql();
    const rows: any[] = await sql.query(`DELETE FROM public.${table} WHERE id = $1 RETURNING id`, [id]) as any;
    return rows.length > 0;
  },

  async exists(table: string): Promise<boolean> {
    const sql = getSql();
    const rows: any[] = await sql.query(`SELECT EXISTS (SELECT 1 FROM public.${table}) AS exists`) as any;
    return rows[0]?.exists ?? false;
  },

  async count(table: string): Promise<number> {
    const sql = getSql();
    const rows: any[] = await sql.query(`SELECT COUNT(*) AS count FROM public.${table}`) as any;
    return Number(rows[0]?.count ?? 0);
  },

  async query<T>(queryStr: string, params?: any[]): Promise<T[]> {
    const sql = getSql();
    return (await sql.query(queryStr, params ?? [])) as any as T[];
  },
};
