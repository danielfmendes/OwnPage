-- Neue Basistabelle für Projekte
CREATE TABLE projects
(
    id   INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
);

-- Users
CREATE TABLE users
(
    email                TEXT PRIMARY KEY,
    password             TEXT NOT NULL,
    username             TEXT NOT NULL,
    dob                  TEXT,
    is_verified          BOOLEAN,
    verification_expires TEXT,
    verification_token   TEXT
);

-- Rollenzuordnung
CREATE TABLE role_management
(
    useremail  TEXT REFERENCES users (email),
    project_id INTEGER REFERENCES projects (id),
    role       TEXT CHECK (role IN ('creator', 'admin', 'user')),
    PRIMARY KEY (useremail, project_id)
);

-- Kunden
CREATE TABLE customers
(
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    email      TEXT NOT NULL,
    password   TEXT NOT NULL,
    first_name TEXT NOT NULL,
    name       TEXT NOT NULL,
    dob        TEXT,
    city       TEXT,
    project_id INTEGER REFERENCES projects (id)
);

-- Teile
CREATE TABLE saddles
(
    id   INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT
);

CREATE TABLE frames
(
    id   INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT
);

CREATE TABLE forks
(
    id   INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT
);

-- Fahrradmodelle
CREATE TABLE bike_models
(
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    name      TEXT NOT NULL,
    saddle_id INTEGER REFERENCES saddles (id),
    frame_id  INTEGER REFERENCES frames (id),
    fork_id   INTEGER REFERENCES forks (id)
);

-- Fahrräder
CREATE TABLE bikes
(
    id                 INTEGER PRIMARY KEY AUTOINCREMENT,
    model_id           INTEGER REFERENCES bike_models (id),
    serial_number      TEXT,
    production_date    TEXT,
    quantity           INTEGER NOT NULL,
    warehouse_location TEXT,
    project_id         INTEGER REFERENCES projects (id)
);

-- Lagerbestand
CREATE TABLE warehouse_parts
(
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    part_type        TEXT CHECK (part_type IN ('saddle', 'frame', 'fork')),
    part_id          INTEGER NOT NULL,
    quantity         INTEGER NOT NULL,
    storage_location TEXT,
    project_id       INTEGER REFERENCES projects (id)
);

-- Bestellungen
CREATE TABLE orders
(
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER REFERENCES customers (id),
    order_date  TEXT DEFAULT (DATE('now')),
    project_id  INTEGER REFERENCES projects (id)
);

-- Bestellpositionen
CREATE TABLE order_items
(
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER REFERENCES orders (id),
    bike_id  INTEGER REFERENCES bikes (id),
    number   REAL NOT NULL,
    price    REAL NOT NULL
);

-- Teilekosten
CREATE TABLE part_costs
(
    part_type  TEXT CHECK (part_type IN ('saddle', 'frame', 'fork')),
    part_id    INTEGER,
    cost       REAL,
    project_id INTEGER REFERENCES projects (id)
);