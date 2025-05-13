-- Neue Basistabelle für Projekte
CREATE TABLE projects
(
    id   SERIAL PRIMARY KEY,
    name TEXT NOT NULL
);

-- Users
CREATE TABLE users
(
    email    TEXT PRIMARY KEY,
    password TEXT NOT NULL,
    username TEXT NOT NULL,
    dob      TIMESTAMP
);

-- Rollenzuordnung
CREATE TABLE role_management
(
    useremail TEXT REFERENCES users (email),
    projectid INT REFERENCES projects (id),
    role      TEXT CHECK (role IN ('creator', 'admin', 'user')),
    PRIMARY KEY (useremail, projectid)
);

-- Kunden
CREATE TABLE customers
(
    id         SERIAL PRIMARY KEY,
    email      TEXT NOT NULL,
    password   TEXT NOT NULL,
    first_name TEXT NOT NULL,
    name       TEXT NOT NULL,
    dob        TIMESTAMP,
    city   TEXT,
    project_id INT REFERENCES projects (id)
);

-- Teile
CREATE TABLE saddles
(
    id   SERIAL PRIMARY KEY,
    name TEXT
);

CREATE TABLE frames
(
    id   SERIAL PRIMARY KEY,
    name TEXT
);

CREATE TABLE forks
(
    id   SERIAL PRIMARY KEY,
    name TEXT
);

-- Fahrradmodelle
CREATE TABLE bike_models
(
    id        SERIAL PRIMARY KEY,
    name      TEXT NOT NULL,
    saddle_id INT REFERENCES saddles (id),
    frame_id  INT REFERENCES frames (id),
    fork_id   INT REFERENCES forks (id)
);

-- Fahrräder
CREATE TABLE bikes
(
    id                 SERIAL PRIMARY KEY,
    model_id           INT REFERENCES bike_models (id),
    serial_number      TEXT,
    production_date    DATE,
    quantity           INT NOT NULL,
    warehouse_location TEXT,
    project_id         INT REFERENCES projects (id)
);

-- Lagerbestand
CREATE TABLE warehouse_parts
(
    id               SERIAL PRIMARY KEY,
    part_type        TEXT CHECK (part_type IN ('saddle', 'frame', 'fork')),
    part_id          INT NOT NULL,
    quantity         INT NOT NULL,
    storage_location TEXT,
    project_id       INT REFERENCES projects (id)
);

-- Bestellungen
CREATE TABLE orders
(
    id          SERIAL PRIMARY KEY,
    customer_id INT REFERENCES customers (id),
    order_date  DATE DEFAULT CURRENT_DATE,
    project_id  INT REFERENCES projects (id)
);

-- Bestellpositionen
CREATE TABLE order_items
(
    id       SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders (id),
    bike_id  INT REFERENCES bikes (id),
    number   NUMERIC NOT NULL,
    price    NUMERIC NOT NULL
);

-- Teilekosten
CREATE TABLE part_costs
(
    part_type  TEXT CHECK (part_type IN ('saddle', 'frame', 'fork')),
    part_id    INT,
    cost       NUMERIC,
    project_id INT REFERENCES projects (id)
);
