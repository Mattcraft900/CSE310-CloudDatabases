-- Deathless Cloud Database schema
-- Run against your Supabase/Neon PostgreSQL instance.

CREATE TABLE IF NOT EXISTS profiles (
    id              SERIAL PRIMARY KEY,
    name            TEXT NOT NULL,
    full_name       TEXT,
    gender          TEXT,
    species         TEXT,
    age             TEXT,
    birthday        TEXT,
    height          TEXT,
    weight          TEXT,
    category        TEXT NOT NULL CHECK (category IN ('party', 'opc', 'npc')),
    snippet         TEXT,
    image_filename  TEXT,
    player_name     TEXT,
    level           INT,
    location_home   TEXT,
    location_last   TEXT,
    description     JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS profile_classes (
    id          SERIAL PRIMARY KEY,
    profile_id  INT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    class_name  TEXT NOT NULL,
    subclass    TEXT,
    level       INT NOT NULL,
    sort_order  INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS travelogue_sessions (
    id                  SERIAL PRIMARY KEY,
    real_session_date   DATE,
    session_title       TEXT NOT NULL,
    sort_order          INT NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS travelogue_sections (
    id              SERIAL PRIMARY KEY,
    session_id      INT NOT NULL REFERENCES travelogue_sessions(id) ON DELETE CASCADE,
    in_game_date    TEXT,
    paragraphs      JSONB NOT NULL DEFAULT '[]'::jsonb,
    sort_order      INT NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profile_classes_profile_id ON profile_classes(profile_id);
CREATE INDEX IF NOT EXISTS idx_travelogue_sections_session_id ON travelogue_sections(session_id);
