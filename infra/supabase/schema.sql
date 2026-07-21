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
  current_stage text,
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

-- RLS: 認証済みユーザーは自分が所有するprojectに紐づくrun/stage_resultのみ読める。
-- 注意: 認証(Supabase Auth)まわりのUIはまだ実装していない(9フェーズの範囲外)。
-- それまでは行の作成・更新はservice role key(サーバー側)経由のみで行う。
alter table projects enable row level security;
alter table runs enable row level security;
alter table stage_results enable row level security;

create policy "owners can read their projects" on projects
  for select using (auth.uid() = owner_id);

create policy "owners can read their runs" on runs
  for select using (
    exists (
      select 1 from projects
      where projects.id = runs.project_id
      and projects.owner_id = auth.uid()
    )
  );

create policy "owners can read their stage results" on stage_results
  for select using (
    exists (
      select 1 from runs
      join projects on projects.id = runs.project_id
      where runs.id = stage_results.run_id
      and projects.owner_id = auth.uid()
    )
  );
