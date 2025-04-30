CREATE TABLE users
(
    id            SERIAL PRIMARY KEY,
    username      TEXT UNIQUE NOT NULL,
    password_hash TEXT        NOT NULL,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE customers
(
    id       SERIAL PRIMARY KEY,
    name     TEXT NOT NULL,
    email    TEXT UNIQUE,
    location TEXT
);

CREATE TABLE saddles
(
    id   SERIAL PRIMARY KEY,
    name TEXT UNIQUE
);

CREATE TABLE frames
(
    id   SERIAL PRIMARY KEY,
    name TEXT UNIQUE
);

CREATE TABLE forks
(
    id   SERIAL PRIMARY KEY,
    name TEXT UNIQUE
);

CREATE TABLE bike_models
(
    id        SERIAL PRIMARY KEY,
    name      TEXT UNIQUE NOT NULL,
    saddle_id INT REFERENCES saddles (id),
    frame_id  INT REFERENCES frames (id),
    fork_id   INT REFERENCES forks (id)
);

CREATE TABLE bikes
(
    id                 SERIAL PRIMARY KEY,
    model_id           INT REFERENCES bike_models (id),
    serial_number      TEXT UNIQUE,
    production_date    DATE,
    warehouse_location TEXT
);

CREATE TABLE warehouse_parts
(
    id               SERIAL PRIMARY KEY,
    part_type        TEXT CHECK (part_type IN ('saddle', 'frame', 'fork')),
    part_id          INT NOT NULL,
    quantity         INT NOT NULL,
    storage_location TEXT
);

CREATE TABLE orders
(
    id          SERIAL PRIMARY KEY,
    customer_id INT REFERENCES customers (id),
    order_date  DATE DEFAULT CURRENT_DATE,
    total_price NUMERIC
);

CREATE TABLE order_items
(
    id       SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders (id),
    bike_id  INT REFERENCES bikes (id),
    price    NUMERIC NOT NULL
);


CREATE TABLE part_costs
(
    part_type TEXT CHECK (part_type IN ('saddle', 'frame', 'fork')),
    part_id   INT,
    cost      NUMERIC
);
