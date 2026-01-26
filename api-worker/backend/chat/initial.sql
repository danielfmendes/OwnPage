-- 1. User table with integrated limits and AI mode
CREATE TABLE IF NOT EXISTS chat_users (
                                          email TEXT PRIMARY KEY,
                                          password TEXT NOT NULL,
                                          ai_mode TEXT DEFAULT 'balanced' CHECK(ai_mode IN ('creative', 'precise', 'balanced', 'technical')),
    max_chats INTEGER DEFAULT 5,
    max_messages INTEGER DEFAULT 10,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

-- 2. Chat sessions linked to user
CREATE TABLE IF NOT EXISTS chat_sessions (
                                             id TEXT PRIMARY KEY,
                                             user_email TEXT NOT NULL REFERENCES chat_users(email) ON DELETE CASCADE,
    title TEXT DEFAULT 'New Conversation',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

-- 3. Messages linked to session
CREATE TABLE IF NOT EXISTS chat_messages (
                                             id INTEGER PRIMARY KEY AUTOINCREMENT,
                                             session_id TEXT NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role TEXT CHECK(role IN ('user', 'assistant')) NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

-- 4. Indices for faster lookups
CREATE INDEX IF NOT EXISTS idx_sessions_user ON chat_sessions(user_email);
CREATE INDEX IF NOT EXISTS idx_messages_session ON chat_messages(session_id);

-- 5. Seed Demo User with default limits
INSERT OR IGNORE INTO chat_users (email, password, ai_mode, max_chats, max_messages)
VALUES ('test@email.com', '$2b$10$2DAQbSFOzC2qsDZrPihfUusA4dwpogyDrgja1ddxCTDGTJEYfpPY.', 'balanced', 5, 10);