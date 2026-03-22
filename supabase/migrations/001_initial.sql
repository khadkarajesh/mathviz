-- ─────────────────────────────────────────────────────────────────────────────
-- MathViz initial schema
-- Run this in Supabase SQL editor or via `supabase db push`
-- ─────────────────────────────────────────────────────────────────────────────

-- Profiles (mirrors auth.users, created via trigger)
CREATE TABLE IF NOT EXISTS profiles (
  id            UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email         TEXT,
  display_name  TEXT,
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- AI-generated problem pool
CREATE TABLE IF NOT EXISTS problems (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id      TEXT NOT NULL,
  lesson_id     TEXT NOT NULL,
  phase         TEXT NOT NULL,          -- concrete | pictorial | abstract
  prompt        TEXT NOT NULL,
  answer        NUMERIC,                -- for numeric checks
  choices       JSONB,                  -- for multiple-choice: string[]
  hints         JSONB NOT NULL DEFAULT '[]',  -- string[]
  solution      TEXT NOT NULL,
  canvas_config JSONB,                  -- { pointA: {x,y}, pointB: {x,y} }
  difficulty    INT NOT NULL DEFAULT 2, -- 1=easy 2=medium 3=hard
  validated     BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS problems_lookup
  ON problems (topic_id, lesson_id, phase, validated);

-- SM-2 skill state per user per phase
CREATE TABLE IF NOT EXISTS skill_states (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  topic_id         TEXT NOT NULL,
  lesson_id        TEXT NOT NULL,
  phase            TEXT NOT NULL,
  repetitions      INT NOT NULL DEFAULT 0,
  ease_factor      NUMERIC NOT NULL DEFAULT 2.5,
  interval_days    INT NOT NULL DEFAULT 1,
  next_review_at   TIMESTAMPTZ,
  last_reviewed_at TIMESTAMPTZ,
  mastered         BOOLEAN NOT NULL DEFAULT false,
  UNIQUE (user_id, topic_id, lesson_id, phase)
);

-- Attempt log
CREATE TABLE IF NOT EXISTS attempts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  problem_id      UUID REFERENCES problems(id) NOT NULL,
  topic_id        TEXT NOT NULL,
  lesson_id       TEXT NOT NULL,
  phase           TEXT NOT NULL,
  correct         BOOLEAN NOT NULL,
  answer_given    NUMERIC,
  hints_used      INT NOT NULL DEFAULT 0,
  time_seconds    INT,
  ai_error_label  TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS attempts_user_phase
  ON attempts (user_id, topic_id, lesson_id, phase, created_at DESC);

-- Daily activity (streak + stats)
CREATE TABLE IF NOT EXISTS daily_activity (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  date                DATE NOT NULL,
  lessons_completed   INT NOT NULL DEFAULT 0,
  problems_attempted  INT NOT NULL DEFAULT 0,
  problems_correct    INT NOT NULL DEFAULT 0,
  streak_day          INT NOT NULL DEFAULT 1,
  UNIQUE (user_id, date)
);

-- ─── Row Level Security ───────────────────────────────────────────────────────

ALTER TABLE profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE problems      ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_states  ENABLE ROW LEVEL SECURITY;
ALTER TABLE attempts      ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_activity ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "Users view own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- problems: anyone authenticated can read validated problems
CREATE POLICY "Authenticated users read problems"
  ON problems FOR SELECT TO authenticated USING (validated = true);

-- skill_states
CREATE POLICY "Users manage own skill states"
  ON skill_states FOR ALL USING (auth.uid() = user_id);

-- attempts
CREATE POLICY "Users manage own attempts"
  ON attempts FOR ALL USING (auth.uid() = user_id);

-- daily_activity
CREATE POLICY "Users manage own activity"
  ON daily_activity FOR ALL USING (auth.uid() = user_id);

-- ─── Trigger: create profile on signup ───────────────────────────────────────

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
