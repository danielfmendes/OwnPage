-- Chat tables for CHAT_DB. Accounts live in the DWH users table (shared JWT cookie);
-- chat_users only holds the per-email profile (limits, AI mode), created on first use.

CREATE TABLE IF NOT EXISTS chat_users
(
    email        TEXT PRIMARY KEY,
    ai_mode      TEXT    NOT NULL DEFAULT 'balanced',
    max_chats    INTEGER NOT NULL DEFAULT 5,
    max_messages INTEGER NOT NULL DEFAULT 20
);

CREATE TABLE IF NOT EXISTS chat_sessions
(
    id         TEXT PRIMARY KEY,
    user_email TEXT NOT NULL REFERENCES chat_users (email),
    title      TEXT NOT NULL DEFAULT 'New Conversation',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chat_messages
(
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL REFERENCES chat_sessions (id),
    role       TEXT NOT NULL,
    content    TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_user ON chat_sessions (user_email, created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages (session_id, created_at);
