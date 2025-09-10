CREATE TABLE IF NOT EXISTS creator_pages (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE,
  owner_user_id TEXT REFERENCES users(id),
  template_id TEXT,
  data_json TEXT,
  status TEXT,
  published_version_id TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS creator_page_versions (
  id TEXT PRIMARY KEY,
  page_id TEXT REFERENCES creator_pages(id) ON DELETE CASCADE,
  data_json TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
