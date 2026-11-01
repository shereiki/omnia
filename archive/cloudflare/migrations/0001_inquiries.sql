CREATE TABLE IF NOT EXISTS inquiries (
 id TEXT PRIMARY KEY,
 name TEXT NOT NULL,
 email TEXT NOT NULL,
 interest TEXT NOT NULL CHECK (interest IN ('business', 'partner', 'investor', 'updates')),
 message TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewed')),
 created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX IF NOT EXISTS inquiries_created ON inquiries (created_at DESC, id DESC);
CREATE TABLE IF NOT EXISTS submission_limits (key TEXT PRIMARY KEY, window_start INTEGER NOT NULL, count INTEGER NOT NULL);
