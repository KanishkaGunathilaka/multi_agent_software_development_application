CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS todos (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id varchar(36) NOT NULL,
    title varchar(255) NOT NULL,
    description text,
    due_date timestamptz,
    status varchar(20) NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz,
    version bigint NOT NULL DEFAULT 0
);

CREATE INDEX idx_todos_userid ON todos(user_id);
