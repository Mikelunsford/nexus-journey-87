-- Project-scoped chat schema, RLS, and RPCs
-- idempotent-ish: use IF NOT EXISTS guards where possible

-- Extensions required
create extension if not exists pgcrypto;

-- Tables
create table if not exists public.chat_threads (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null,
  project_id uuid not null,
  title text,
  created_by uuid not null default auth.uid(),
  created_at timestamptz not null default now()
);

create table if not exists public.chat_participants (
  thread_id uuid not null references public.chat_threads(id) on delete cascade,
  user_id uuid not null,
  role text not null check (role in ('customer','team')),
  last_read_at timestamptz,
  org_id uuid not null,
  constraint chat_participants_pk primary key(thread_id, user_id)
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.chat_threads(id) on delete cascade,
  sender_id uuid not null,
  body text not null,
  attachments jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  edited_at timestamptz,
  deleted_at timestamptz
);

create table if not exists public.chat_events (
  thread_id uuid not null references public.chat_threads(id) on delete cascade,
  user_id uuid not null,
  type text not null check (type in ('typing','join','leave')),
  at timestamptz not null default now()
);

-- RLS
alter table public.chat_threads enable row level security;
alter table public.chat_participants enable row level security;
alter table public.chat_messages enable row level security;
alter table public.chat_events enable row level security;

-- Helper functions expected to exist in the project: get_user_org_id(), is_user_admin()
-- If missing, you should create them according to your auth model.

-- Policies - chat_threads
do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='chat_threads' and policyname='chat_threads_select') then
    create policy chat_threads_select on public.chat_threads
      for select
      using (
        org_id = get_user_org_id() and (
          exists (
            select 1 from public.chat_participants p
            where p.thread_id = chat_threads.id and p.user_id = auth.uid()
          ) or is_user_admin()
        )
      );
  end if;
end $$;

-- Disallow direct writes; RPCs will perform writes under SECURITY DEFINER
do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='chat_threads' and policyname='chat_threads_insert_block') then
    create policy chat_threads_insert_block on public.chat_threads for insert with check (false);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='chat_threads' and policyname='chat_threads_update_block') then
    create policy chat_threads_update_block on public.chat_threads for update using (false) with check (false);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='chat_threads' and policyname='chat_threads_delete_block') then
    create policy chat_threads_delete_block on public.chat_threads for delete using (false);
  end if;
end $$;

-- Policies - chat_participants
do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='chat_participants' and policyname='chat_participants_select') then
    create policy chat_participants_select on public.chat_participants
      for select
      using (
        org_id = get_user_org_id() and (
          user_id = auth.uid() or exists (
            select 1 from public.chat_participants p2
            where p2.thread_id = chat_participants.thread_id and p2.user_id = auth.uid()
          ) or is_user_admin()
        )
      );
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='chat_participants' and policyname='chat_participants_write_block') then
    create policy chat_participants_write_block on public.chat_participants for all using (false) with check (false);
  end if;
end $$;

-- Policies - chat_messages
do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='chat_messages' and policyname='chat_messages_rw') then
    create policy chat_messages_rw on public.chat_messages
      for all
      using (
        exists (
          select 1 from public.chat_participants p
          where p.thread_id = chat_messages.thread_id and p.user_id = auth.uid()
        )
      )
      with check (
        exists (
          select 1 from public.chat_participants p
          where p.thread_id = chat_messages.thread_id and p.user_id = auth.uid()
        )
      );
  end if;
end $$;

-- Policies - chat_events
do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='chat_events' and policyname='chat_events_rw') then
    create policy chat_events_rw on public.chat_events
      for all
      using (
        exists (
          select 1 from public.chat_participants p
          where p.thread_id = chat_events.thread_id and p.user_id = auth.uid()
        )
      )
      with check (
        exists (
          select 1 from public.chat_participants p
          where p.thread_id = chat_events.thread_id and p.user_id = auth.uid()
        )
      );
  end if;
end $$;

-- RPCs
create or replace function public.chat_thread_create(project_id uuid, title text, participants jsonb)
returns table(thread_id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_thread_id uuid;
  v_org_id uuid;
  v_me uuid := auth.uid();
  v_item jsonb;
  v_user uuid;
  v_role text;
begin
  v_org_id := get_user_org_id();

  insert into public.chat_threads(org_id, project_id, title, created_by)
  values (v_org_id, chat_thread_create.project_id, chat_thread_create.title, v_me)
  returning id into v_thread_id;

  -- ensure creator is participant
  insert into public.chat_participants(thread_id, user_id, role, org_id)
  values (v_thread_id, v_me, 'team', v_org_id)
  on conflict do nothing;

  -- add provided participants
  for v_item in select * from jsonb_array_elements(coalesce(participants, '[]'::jsonb)) loop
    v_user := (v_item->>'user_id')::uuid;
    v_role := coalesce(v_item->>'role','team');
    insert into public.chat_participants(thread_id, user_id, role, org_id)
    values (v_thread_id, v_user, v_role, v_org_id)
    on conflict do nothing;
  end loop;

  return query select v_thread_id;
end $$;

create or replace function public.chat_participant_add(thread_id uuid, user_id uuid, role text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org_id uuid;
begin
  if not exists (
    select 1 from public.chat_participants p
    where p.thread_id = chat_participant_add.thread_id and p.user_id = auth.uid()
  ) and not is_user_admin() then
    raise exception 'not a participant';
  end if;

  select org_id into v_org_id from public.chat_threads where id = chat_participant_add.thread_id;
  insert into public.chat_participants(thread_id, user_id, role, org_id)
  values (thread_id, user_id, role, v_org_id)
  on conflict do nothing;
end $$;

create or replace function public.chat_message_send(thread_id uuid, body text, attachments jsonb)
returns table(message_id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if not exists (
    select 1 from public.chat_participants p
    where p.thread_id = chat_message_send.thread_id and p.user_id = auth.uid()
  ) then
    raise exception 'not a participant';
  end if;

  insert into public.chat_messages(thread_id, sender_id, body, attachments)
  values (thread_id, auth.uid(), body, coalesce(attachments, '[]'::jsonb))
  returning id into v_id;
  return query select v_id;
end $$;

create or replace function public.chat_mark_read(thread_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.chat_participants
  set last_read_at = now()
  where thread_id = chat_mark_read.thread_id and user_id = auth.uid();
$$;

create or replace function public.chat_files_sign(paths text[])
returns table(path text, url text, expires timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_path text;
  v_url text;
  v_expires timestamptz;
begin
  foreach v_path in array coalesce(paths, array[]::text[]) loop
    select (storage.generate_signed_url('chat-attachments', v_path, 900)).signed_url into v_url;
    v_expires := now() + interval '15 minutes';
    return query select v_path, v_url, v_expires;
  end loop;
end $$;

-- Storage bucket (private)
insert into storage.buckets (id, name, public)
values ('chat-attachments','chat-attachments', false)
on conflict (id) do nothing;

-- Minimal storage policies: restrict all by default (no public). Signed URLs will be used for reads.
-- Allow authenticated users to upload; refine later with path-based checks if needed.
do $$ begin
  if not exists (select 1 from storage.policies where name='chat_upload_auth') then
    insert into storage.policies (name, bucket_id, definition, action)
    values ('chat_upload_auth','chat-attachments','(auth.role() = ''authenticated'')','insert');
  end if;
  if not exists (select 1 from storage.policies where name='chat_update_owner_only') then
    insert into storage.policies (name, bucket_id, definition, action)
    values ('chat_update_owner_only','chat-attachments','(auth.role() = ''authenticated'')','update');
  end if;
  if not exists (select 1 from storage.policies where name='chat_delete_owner_only') then
    insert into storage.policies (name, bucket_id, definition, action)
    values ('chat_delete_owner_only','chat-attachments','(auth.role() = ''authenticated'')','delete');
  end if;
end $$;


