-- =============================================================
-- LEXON AI — Supabase schema upgrade (#21) + automatic
-- popularity / Top Demanded ranking (#7, #8, #22)
-- =============================================================
-- Run this once in Supabase → SQL Editor. Safe to re-run (uses
-- IF NOT EXISTS / CREATE OR REPLACE everywhere).
--
-- Adds view/click/save counters + an auto-computed popularity
-- score to every resource table, so "Top Demanded" and "Top
-- Demanded Videos" can rank automatically instead of needing
-- anyone to hand-pick what shows up.
-- =============================================================

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['videos','guides','tools','prompts','courses']
  LOOP
    EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS views integer NOT NULL DEFAULT 0', t);
    EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS clicks integer NOT NULL DEFAULT 0', t);
    EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS saves integer NOT NULL DEFAULT 0', t);
    EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS search_hits integer NOT NULL DEFAULT 0', t);
    EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS popularity_score numeric NOT NULL DEFAULT 0', t);
    EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now()', t);

    -- Remaining metadata fields from the LEXON AI spec (#21). Safe to
    -- run even if a table already has some of these under a different
    -- name — this only adds what's missing, it never renames or drops.
    EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now()', t);
    EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS tags text', t);
    EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS keywords text', t);
    EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS pricing text', t); -- ''Free'' or ''Paid''
    EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS url text', t);
    EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS thumbnail_url text', t);
  END LOOP;
END $$;

-- Keeps updated_at current automatically on every row change.
CREATE OR REPLACE FUNCTION lexon_set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['videos','guides','tools','prompts','courses']
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_lexon_updated_at ON %I', t);
    EXECUTE format(
      'CREATE TRIGGER trg_lexon_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION lexon_set_updated_at()',
      t
    );
  END LOOP;
END $$;

-- Recency-weighted score: engagement matters most, but resources
-- from the last 30 days get a boost so new content isn't buried
-- under old high-view items forever.
CREATE OR REPLACE FUNCTION lexon_calculate_popularity(
  p_views integer,
  p_clicks integer,
  p_saves integer,
  p_search_hits integer,
  p_created_at timestamptz
) RETURNS numeric AS $$
DECLARE
  recency_days numeric := GREATEST(EXTRACT(EPOCH FROM (now() - p_created_at)) / 86400.0, 0);
  recency_boost numeric := GREATEST(30 - recency_days, 0) * 2;
BEGIN
  RETURN (p_views * 1.0)
       + (p_clicks * 2.5)
       + (p_saves * 4.0)
       + (p_search_hits * 1.5)
       + recency_boost;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger function: recompute popularity_score whenever the
-- counters change, so it's always up to date automatically.
CREATE OR REPLACE FUNCTION lexon_update_popularity_score() RETURNS trigger AS $$
BEGIN
  NEW.popularity_score := lexon_calculate_popularity(
    NEW.views, NEW.clicks, NEW.saves, NEW.search_hits, NEW.created_at
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['videos','guides','tools','prompts','courses']
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_lexon_popularity ON %I', t);
    EXECUTE format(
      'CREATE TRIGGER trg_lexon_popularity BEFORE INSERT OR UPDATE OF views, clicks, saves, search_hits ON %I FOR EACH ROW EXECUTE FUNCTION lexon_update_popularity_score()',
      t
    );
  END LOOP;
END $$;

-- RPC the frontend calls to safely increment a counter by 1
-- (avoids read-then-write race conditions from the client).
CREATE OR REPLACE FUNCTION lexon_increment_metric(
  p_table text,
  p_id uuid,
  p_metric text
) RETURNS void AS $$
BEGIN
  IF p_table NOT IN ('videos','guides','tools','prompts','courses') THEN
    RAISE EXCEPTION 'Invalid table: %', p_table;
  END IF;
  IF p_metric NOT IN ('views','clicks','saves','search_hits') THEN
    RAISE EXCEPTION 'Invalid metric: %', p_metric;
  END IF;

  EXECUTE format(
    'UPDATE %I SET %I = %I + 1 WHERE id = $1', p_table, p_metric, p_metric
  ) USING p_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION lexon_increment_metric(text, uuid, text) TO anon, authenticated;

-- =============================================================
-- AI Updates feed table (used by pages/updates.html)
-- =============================================================
CREATE TABLE IF NOT EXISTS ai_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text,
  url text,
  status text NOT NULL DEFAULT 'published',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE ai_updates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read published updates" ON ai_updates;
CREATE POLICY "Public can read published updates"
  ON ai_updates FOR SELECT
  USING (status = 'published');

-- =============================================================
-- AI Question Library table (used by pages/learn.html — merges
-- with the built-in starter set in js/learn-questions.js)
-- =============================================================
CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  level text NOT NULL DEFAULT 'beginner', -- beginner | intermediate | advanced
  status text NOT NULL DEFAULT 'published',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read published questions" ON questions;
CREATE POLICY "Public can read published questions"
  ON questions FOR SELECT
  USING (status = 'published');

-- =============================================================
-- Business plan checkout (business/checkout.html)
-- =============================================================

-- Business contact details, collected once per business account and
-- updated on repeat checkouts.
CREATE TABLE IF NOT EXISTS business_profiles (
  business_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE business_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Business can manage their own profile" ON business_profiles;
CREATE POLICY "Business can manage their own profile"
  ON business_profiles FOR ALL
  USING (auth.uid() = business_id)
  WITH CHECK (auth.uid() = business_id);

-- Track payment status separately from subscription status, so a
-- failed/cancelled payment never counts as an active, listing-enabling
-- subscription.
ALTER TABLE business_subscriptions ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'paid';

ALTER TABLE business_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Business can manage their own subscriptions" ON business_subscriptions;
CREATE POLICY "Business can manage their own subscriptions"
  ON business_subscriptions FOR ALL
  USING (auth.uid() = business_id)
  WITH CHECK (auth.uid() = business_id);

-- =============================================================
-- Business-created listings (Tools & Courses) — business/dashboard.html
-- =============================================================

ALTER TABLE tools ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id);
ALTER TABLE courses ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id);

ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read published tools" ON tools;
CREATE POLICY "Public can read published tools"
  ON tools FOR SELECT
  USING (status = 'published');

DROP POLICY IF EXISTS "Business can manage their own tools" ON tools;
CREATE POLICY "Business can manage their own tools"
  ON tools FOR ALL
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Public can read published courses" ON courses;
CREATE POLICY "Public can read published courses"
  ON courses FOR SELECT
  USING (status = 'published');

DROP POLICY IF EXISTS "Business can manage their own courses" ON courses;
CREATE POLICY "Business can manage their own courses"
  ON courses FOR ALL
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Enforce plan limits server-side too (not just in the UI), so the
-- limit can't be bypassed by calling the API directly.
CREATE OR REPLACE FUNCTION lexon_check_listing_limit() RETURNS trigger AS $$
DECLARE
  plan_name text;
  tool_limit integer;
  course_limit integer;
  current_count integer;
BEGIN
  SELECT plan INTO plan_name
  FROM business_subscriptions
  WHERE business_id = NEW.created_by AND status = 'active'
  ORDER BY started_at DESC
  LIMIT 1;

  IF plan_name IS NULL THEN
    RAISE EXCEPTION 'No active business plan found for this account.';
  END IF;

  tool_limit := CASE plan_name WHEN 'starter' THEN 1 WHEN 'growth' THEN 1 WHEN 'scale' THEN 2 ELSE 0 END;
  course_limit := CASE plan_name WHEN 'starter' THEN 0 WHEN 'growth' THEN 1 WHEN 'scale' THEN 2 ELSE 0 END;

  IF TG_TABLE_NAME = 'tools' THEN
    SELECT count(*) INTO current_count FROM tools WHERE created_by = NEW.created_by;
    IF current_count >= tool_limit THEN
      RAISE EXCEPTION 'Tool listing limit reached for the % plan.', plan_name;
    END IF;
  ELSIF TG_TABLE_NAME = 'courses' THEN
    SELECT count(*) INTO current_count FROM courses WHERE created_by = NEW.created_by;
    IF current_count >= course_limit THEN
      RAISE EXCEPTION 'Course listing limit reached for the % plan.', plan_name;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_lexon_tool_limit ON tools;
CREATE TRIGGER trg_lexon_tool_limit
  BEFORE INSERT ON tools
  FOR EACH ROW
  WHEN (NEW.created_by IS NOT NULL)
  EXECUTE FUNCTION lexon_check_listing_limit();

DROP TRIGGER IF EXISTS trg_lexon_course_limit ON courses;
CREATE TRIGGER trg_lexon_course_limit
  BEFORE INSERT ON courses
  FOR EACH ROW
  WHEN (NEW.created_by IS NOT NULL)
  EXECUTE FUNCTION lexon_check_listing_limit();
