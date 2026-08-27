-- User setup (CREATE DATABASE cannot run inside DO blocks)
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'veloire') THEN
    CREATE USER veloire WITH PASSWORD 'veloire_secret';
  ELSE
    ALTER USER veloire WITH PASSWORD 'veloire_secret';
  END IF;
END
$$;

ALTER USER veloire CREATEDB;
