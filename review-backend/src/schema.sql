-- Standalone QC Core identity and sessions; no employee-project tables or joins.
CREATE SCHEMA IF NOT EXISTS review_auth;
CREATE TABLE IF NOT EXISTS review_auth.accounts (
 id uuid PRIMARY KEY,
 employee_id text NOT NULL UNIQUE CHECK(employee_id ~ '^[0-9]{1,12}$'),
 name text NOT NULL CHECK(length(trim(name))>0),
 role text NOT NULL CHECK(role IN ('ghost','director')),
 status text NOT NULL DEFAULT 'blocked' CHECK(status IN ('allowed','blocked')),
 created_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
CREATE TABLE IF NOT EXISTS review_auth.sessions (
 id uuid PRIMARY KEY,
 account_id uuid NOT NULL REFERENCES review_auth.accounts(id),
 token_hash text NOT NULL UNIQUE,
 recovery_hash text NOT NULL UNIQUE,
 created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 renewed_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 expires_at timestamptz NOT NULL,
 revoked_at timestamptz
);
CREATE INDEX IF NOT EXISTS review_session_account ON review_auth.sessions(account_id);
-- Retain security history; expiry/revocation is not deletion.
CREATE TABLE IF NOT EXISTS review_auth.audit (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 account_id uuid NOT NULL REFERENCES review_auth.accounts(id),
 session_id uuid NOT NULL REFERENCES review_auth.sessions(id),
 action text NOT NULL CHECK(action IN ('login','logout')),
 created_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
-- Refuse silently retaining a legacy roster foreign key in a reused database.
DO $$ BEGIN
 IF EXISTS (
  SELECT 1 FROM pg_constraint
  WHERE contype='f' AND conrelid IN ('review_auth.sessions'::regclass,'review_auth.audit'::regclass)
  AND confrelid NOT IN ('review_auth.accounts'::regclass,'review_auth.sessions'::regclass)
 ) THEN
  RAISE EXCEPTION 'Legacy identity dependency detected. Provision a fresh standalone QC Core database.';
 END IF;
END $$;
