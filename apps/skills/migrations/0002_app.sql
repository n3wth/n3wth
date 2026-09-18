CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY REFERENCES user(id) ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  github_url TEXT,
  twitter_url TEXT,
  website_url TEXT,
  reputation INTEGER NOT NULL DEFAULT 0,
  streak INTEGER NOT NULL DEFAULT 0,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'maker', 'admin')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS upvotes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  skill_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE (user_id, skill_id)
);
CREATE INDEX IF NOT EXISTS idx_upvotes_skill_id ON upvotes(skill_id);
CREATE INDEX IF NOT EXISTS idx_upvotes_user_id ON upvotes(user_id);

CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  skill_id TEXT NOT NULL,
  parent_id TEXT REFERENCES comments(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_comments_skill_id ON comments(skill_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);

CREATE TABLE IF NOT EXISTS votes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  skill_id TEXT NOT NULL,
  fingerprint TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE (skill_id, fingerprint)
);
CREATE INDEX IF NOT EXISTS idx_votes_skill_id ON votes(skill_id);

CREATE TABLE IF NOT EXISTS analytics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  skill_id TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('view', 'copy')),
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_analytics_skill_id ON analytics(skill_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics(event_type);

CREATE TABLE IF NOT EXISTS playground_usage (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fingerprint TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_playground_usage_fingerprint ON playground_usage(fingerprint);

CREATE TABLE IF NOT EXISTS workflow_usage (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fingerprint TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_workflow_usage_fingerprint ON workflow_usage(fingerprint);

CREATE TABLE IF NOT EXISTS feature_requests (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  votes INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'planned', 'completed'))
);
CREATE INDEX IF NOT EXISTS idx_feature_requests_status ON feature_requests(status);
CREATE INDEX IF NOT EXISTS idx_feature_requests_created_at ON feature_requests(created_at DESC);
