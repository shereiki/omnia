import { neon } from "@neondatabase/serverless";

let sqlClient;

function iso(value) {
  if (value instanceof Date) return value.toISOString();
  return String(value);
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
    async insertInquiry(row) {
      await sql`
        INSERT INTO inquiries (id, name, email, interest, message)
        VALUES (${row.id}, ${row.name}, ${row.email}, ${row.interest}, ${row.message})
      `;
    },
    async listInquiries(offset) {
      const rows = await sql`
        SELECT id, name, email, interest, message, status, created_at
        FROM inquiries
        ORDER BY created_at DESC, id DESC
        LIMIT 51 OFFSET ${offset}
      `;
      return rows.map((row) => ({ ...row, created_at: iso(row.created_at) }));
    },
    async updateInquiry(id, status) {
      const rows = await sql`
        UPDATE inquiries SET status = ${status} WHERE id = ${id} RETURNING id
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
  const inquiries = [];
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
    async insertInquiry(row) {
      inquiries.push({
        ...row,
        status: "new",
        created_at: new Date().toISOString(),
      });
    },
    async listInquiries(offset) {
      return [...inquiries]
        .sort((a, b) => {
          if (a.created_at === b.created_at) return a.id < b.id ? 1 : -1;
          return a.created_at < b.created_at ? 1 : -1;
        })
        .slice(offset, offset + 51);
    },
    async updateInquiry(id, status) {
      const item = inquiries.find((row) => row.id === id);
      if (!item) return 0;
      item.status = status;
      return 1;
    },
  };
}
