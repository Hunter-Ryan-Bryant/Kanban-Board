-- Kanban Board: database schema for a new Supabase project.
--
-- Run once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.
-- It's safe to re-run: tables, indexes and policies are only created if they
-- don't already exist.
--
-- Also turn on anonymous sign-ins (Authentication -> Sign In / Providers),
-- because the app signs every visitor in as a guest.
--
-- This was written from what the app reads and writes. If your existing
-- project was set up by hand, compare before applying it there.

-- ---------------------------------------------------------------------------
-- Tables
-- Every row belongs to the user who created it (`user_id`), and row-level
-- security below restricts each user to their own rows.
-- ---------------------------------------------------------------------------

create table if not exists public.team_members (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name         text not null,
  role         text,
  avatar_color text not null default '#3b82f6',
  created_at   timestamptz not null default now()
);

create table if not exists public.labels (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name       text not null,
  color      text not null default '#3b82f6',
  created_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title       text not null check (length(trim(title)) > 0),
  description text,
  status      text not null default 'todo'
              check (status in ('todo', 'in_progress', 'in_review', 'done')),
  priority    text not null default 'normal'
              check (priority in ('low', 'normal', 'high')),
  due_date    date,
  -- Deleting a team member unassigns their tasks.
  assignee_id uuid references public.team_members (id) on delete set null,
  created_at  timestamptz not null default now()
);

create table if not exists public.task_labels (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  task_id    uuid not null references public.tasks (id) on delete cascade,
  label_id   uuid not null references public.labels (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (task_id, label_id)
);

create table if not exists public.task_comments (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  task_id    uuid not null references public.tasks (id) on delete cascade,
  body       text not null check (length(trim(body)) > 0),
  created_at timestamptz not null default now()
);

create table if not exists public.task_activity (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  task_id    uuid not null references public.tasks (id) on delete cascade,
  action     text not null,
  details    text,
  created_at timestamptz not null default now()
);

-- Indexes for the columns the app filters and joins on.
create index if not exists tasks_user_id_idx            on public.tasks (user_id);
create index if not exists tasks_assignee_id_idx        on public.tasks (assignee_id);
create index if not exists team_members_user_id_idx     on public.team_members (user_id);
create index if not exists labels_user_id_idx           on public.labels (user_id);
create index if not exists task_labels_user_id_idx      on public.task_labels (user_id);
create index if not exists task_labels_label_id_idx     on public.task_labels (label_id);
create index if not exists task_comments_task_id_idx    on public.task_comments (task_id);
create index if not exists task_activity_task_id_idx    on public.task_activity (task_id);

-- ---------------------------------------------------------------------------
-- Row-level security: each user can only see and change their own rows.
-- Anonymous (guest) users have the `authenticated` role, so this covers them.
-- ---------------------------------------------------------------------------

do $$
declare
  t text;
begin
  foreach t in array array[
    'team_members', 'labels', 'tasks', 'task_labels', 'task_comments', 'task_activity'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    if not exists (
      select 1 from pg_policies
      where schemaname = 'public' and tablename = t and policyname = 'Users manage their own rows'
    ) then
      execute format(
        'create policy "Users manage their own rows" on public.%I
           for all to authenticated
           using (user_id = (select auth.uid()))
           with check (user_id = (select auth.uid()))',
        t
      );
    end if;
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Realtime: stream changes on these tables to the app.
-- ---------------------------------------------------------------------------

do $$
declare
  t text;
begin
  foreach t in array array[
    'team_members', 'labels', 'tasks', 'task_labels', 'task_comments', 'task_activity'
  ] loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;
