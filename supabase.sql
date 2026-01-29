CREATE TABLE appointments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    status TEXT NOT NULL DEFAULT 'WAITING',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

