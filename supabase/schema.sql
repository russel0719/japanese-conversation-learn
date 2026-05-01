-- 앱 전용 스키마 생성
CREATE SCHEMA IF NOT EXISTS app_japanese_learn;

-- anon / authenticated 역할에 접근 권한 부여
GRANT USAGE ON SCHEMA app_japanese_learn TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA app_japanese_learn TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA app_japanese_learn
  GRANT ALL ON TABLES TO anon, authenticated;

-- 학습 진도
CREATE TABLE IF NOT EXISTS app_japanese_learn.user_progress (
  user_id uuid REFERENCES auth.users NOT NULL,
  unit_id integer NOT NULL,
  learn_completed boolean DEFAULT false,
  quiz_completed boolean DEFAULT false,
  last_visited timestamptz,
  PRIMARY KEY (user_id, unit_id)
);

ALTER TABLE app_japanese_learn.user_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own progress" ON app_japanese_learn.user_progress
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 즐겨찾기
CREATE TABLE IF NOT EXISTS app_japanese_learn.user_favorites (
  user_id uuid REFERENCES auth.users NOT NULL,
  japanese text NOT NULL,
  PRIMARY KEY (user_id, japanese)
);

ALTER TABLE app_japanese_learn.user_favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own favorites" ON app_japanese_learn.user_favorites
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 오답 노트
CREATE TABLE IF NOT EXISTS app_japanese_learn.user_wrong_answers (
  user_id uuid REFERENCES auth.users NOT NULL,
  japanese text NOT NULL,
  phrase jsonb NOT NULL,
  unit_id integer NOT NULL,
  count integer DEFAULT 1,
  last_wrong timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, japanese)
);

ALTER TABLE app_japanese_learn.user_wrong_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own wrong answers" ON app_japanese_learn.user_wrong_answers
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
