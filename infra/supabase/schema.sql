-- AI Web Studio: 初期スキーマ(Phase4時点の最小構成)
-- Phase2の設計を反映: projects / runs / stage_results / messages / deployments

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id),
  title text,
  created_at timestamptz not null default now()
);

create table if not exists runs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects (id) on delete cascade,
  status text not null default 'interviewing',
  final_score int,
  deploy_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references runs (id) on delete cascade,
  role text not null check (role in ('user', 'interviewer')),
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists stage_results (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references runs (id) on delete cascade,
  stage text not null,
  status text not null,
  attempt int not null default 1,
  score int,
  output jsonb,
  created_at timestamptz not null default now()
);

create table if not exists deployments (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references runs (id) on delete cascade,
  url text not null,
  created_at timestamptz not null default now()
);

-- チャットUI(Phase5)がリアルタイムに進捗を受け取れるようにする
alter publication supabase_realtime add table runs;
alter publication supabase_realtime add table stage_results;
