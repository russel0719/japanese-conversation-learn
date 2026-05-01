-- 학습 진도
create table if not exists user_progress (
  user_id uuid references auth.users not null,
  unit_id integer not null,
  learn_completed boolean default false,
  quiz_completed boolean default false,
  last_visited timestamptz,
  primary key (user_id, unit_id)
);

alter table user_progress enable row level security;
create policy "Users own progress" on user_progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 즐겨찾기
create table if not exists user_favorites (
  user_id uuid references auth.users not null,
  japanese text not null,
  primary key (user_id, japanese)
);

alter table user_favorites enable row level security;
create policy "Users own favorites" on user_favorites
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 오답 노트
create table if not exists user_wrong_answers (
  user_id uuid references auth.users not null,
  japanese text not null,
  phrase jsonb not null,
  unit_id integer not null,
  count integer default 1,
  last_wrong timestamptz default now(),
  primary key (user_id, japanese)
);

alter table user_wrong_answers enable row level security;
create policy "Users own wrong answers" on user_wrong_answers
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
