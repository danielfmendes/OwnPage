DROP TABLE IF EXISTS choice_tasks;
DROP TABLE IF EXISTS participants;

CREATE TABLE participants
(
    session_id          TEXT PRIMARY KEY,
    age                 INTEGER,
    nationality         TEXT,
    profession          TEXT,
    is_catolica_master  INTEGER,         -- 0/1 if profession = 'Student', else NULL
    device              TEXT CHECK (device IN ('Mobile','Desktop')),
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE choice_tasks
(
    id                          INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id                  TEXT    NOT NULL,
    round_number                INTEGER NOT NULL,

    -- Within-subjects context factor for this round.
    -- 'Clothing' (returning visit; cookies plausibly remember preferences)
    -- vs. 'Currency Converter' (one-shot utility; nothing to remember).
    environment                 TEXT    NOT NULL CHECK (environment IN ('Clothing', 'Currency Converter')),

    -- The two manipulated banner attributes for the single banner shown
    -- this round. 3 colors x 2 positions = 6 profiles. Color and Position
    -- are independent factors.
    accept_color                TEXT    NOT NULL CHECK (accept_color   IN ('Black', 'Grey', 'Outlined')),
    accept_position             TEXT    NOT NULL CHECK (accept_position IN ('Left',  'Right')),

    -- Outcome: which control on the banner the participant clicked.
    chosen_action               TEXT    NOT NULL CHECK (chosen_action IN ('Accept', 'Reject')),
    time_taken_ms               INTEGER NOT NULL,

    UNIQUE (session_id, round_number),
    FOREIGN KEY (session_id) REFERENCES participants (session_id) ON DELETE CASCADE
);

CREATE INDEX idx_session     ON choice_tasks (session_id);
CREATE INDEX idx_round       ON choice_tasks (round_number);
CREATE INDEX idx_environment ON choice_tasks (environment);
CREATE INDEX idx_action      ON choice_tasks (chosen_action);
