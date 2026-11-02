import { neon } from "@neondatabase/serverless";

let sqlClient;

function iso(value) {
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

function insertedFlag(value) {
  return value === true || value === 1 || value === "1" || value === "t";
}

export function createNeonStore(sql) {
  return {
    async bumpLimit(key, hour) {
      const rows = await sql`
        INSERT INTO submission_limits (key, window_start, count)
        VALUES (${key}, ${hour}, 1)
        ON CONFLICT (key) DO UPDATE
          SET count = submission_limits.count + 1
        RETURNING count
      `;
      await sql`DELETE FROM submission_limits WHERE window_start < ${hour - 24}`;
      return Number(rows[0]?.count || 0);
    },
    async insertSignup(row) {
      const rows = await sql`
        INSERT INTO early_access (id, email, email_normalized, follow_token_hash)
        VALUES (${row.id}, ${row.email}, ${row.emailNormalized}, ${row.tokenHash})
        ON CONFLICT (email_normalized) DO UPDATE
          SET updated_at = now(),
              follow_token_hash = EXCLUDED.follow_token_hash
        RETURNING id, (xmax = 0) AS inserted
      `;
      const result = rows[0] || {};
      return {
        id: result.id || row.id,
        inserted: insertedFlag(result.inserted),
      };
    },
    async updateSignupDetails(id, tokenHash, details) {
      const rows = await sql`
        UPDATE early_access
        SET company = ${details.company || null},
            role = ${details.role || null},
            message = ${details.message || null},
            updated_at = now()
        WHERE id = ${id} AND follow_token_hash = ${tokenHash}
        RETURNING id
      `;
      return rows.length;
    },
    async listSignups(offset) {
      const rows = await sql`
        SELECT id, email, company, role, message, status, created_at
        FROM early_access
        ORDER BY created_at DESC, id DESC
        LIMIT 51 OFFSET ${offset}
      `;
      return rows.map((row) => ({ ...row, created_at: iso(row.created_at) }));
    },
    async updateSignupStatus(id, status) {
      const rows = await sql`
        UPDATE early_access SET status = ${status} WHERE id = ${id} RETURNING id
      `;
      return rows.length;
    },
  };
}

export function getStore() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  if (!sqlClient) sqlClient = neon(url);
  return createNeonStore(sqlClient);
}

export function createMemoryStore() {
  const limits = new Map();
  const signups = [];
  return {
    async bumpLimit(key, hour) {
      const current = limits.get(key);
      const count = (current?.window_start === hour ? current.count : 0) + 1;
      limits.set(key, { window_start: hour, count });
      for (const [storedKey, row] of limits) {
        if (row.window_start < hour - 24) limits.delete(storedKey);
      }
      return count;
    },
    async insertSignup(row) {
      const existing = signups.find(
        (item) => item.email_normalized === row.emailNormalized,
      );
      const now = new Date().toISOString();
      if (existing) {
        existing.follow_token_hash = row.tokenHash;
        existing.updated_at = now;
        return { id: existing.id, inserted: false };
      }
      signups.push({
        id: row.id,
        email: row.email,
        email_normalized: row.emailNormalized,
        follow_token_hash: row.tokenHash,
        company: null,
        role: null,
        message: null,
        status: "new",
        created_at: now,
        updated_at: now,
      });
      return { id: row.id, inserted: true };
    },
    async updateSignupDetails(id, tokenHash, details) {
      const item = signups.find(
        (row) => row.id === id && row.follow_token_hash === tokenHash,
      );
      if (!item) return 0;
      item.company = details.company || null;
      item.role = details.role || null;
      item.message = details.message || null;
      item.updated_at = new Date().toISOString();
      return 1;
    },
    async listSignups(offset) {
      return [...signups]
        .sort((a, b) => {
          if (a.created_at === b.created_at) return a.id < b.id ? 1 : -1;
          return a.created_at < b.created_at ? 1 : -1;
        })
        .slice(offset, offset + 51)
        .map(({ email, company, role, message, status, created_at, id }) => ({
          id,
          email,
          company,
          role,
          message,
          status,
          created_at,
        }));
    },
    async updateSignupStatus(id, status) {
      const item = signups.find((row) => row.id === id);
      if (!item) return 0;
      item.status = status;
      return 1;
    },
  };
}
