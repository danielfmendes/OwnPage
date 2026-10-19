DROP TABLE IF EXISTS feedback;

CREATE TABLE feedback
(
    id                 TEXT PRIMARY KEY,
    content            TEXT NOT NULL,
    source             TEXT NOT NULL,
    author             TEXT,
    original_timestamp TEXT,

    -- AI Analysis Columns
    sentiment_score    TEXT,
    urgency_score      INTEGER,
    summary            TEXT,
    root_cause         TEXT,
    suggested_fix      TEXT,

    created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


DROP INDEX IF EXISTS idx_urgency;
DROP INDEX IF EXISTS idx_created;
CREATE INDEX idx_urgency ON feedback (urgency_score);
CREATE INDEX idx_created ON feedback (created_at);