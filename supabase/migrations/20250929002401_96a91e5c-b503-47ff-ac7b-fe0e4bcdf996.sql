-- Break recursive RLS between chat_rooms and chat_room_members
-- 1) Helper functions (SECURITY DEFINER) to safely evaluate access without triggering RLS recursion

create or replace function public.user_is_member_of_room(_room_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.chat_room_members m
    where m.room_id = _room_id
      and m.user_id = auth.uid()
  );
$$;

create or replace function public.user_has_room_role(_room_id uuid, _roles text[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.chat_room_members m
    where m.room_id = _room_id
      and m.user_id = auth.uid()
      and m.role = any(_roles)
  );
$$;

create or replace function public.room_belongs_to_user_org(_room_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.chat_rooms r
    where r.id = _room_id
      and r.org_id = public.get_user_org_id()
  );
$$;

create or replace function public.room_is_private(_room_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select is_private from public.chat_rooms r where r.id = _room_id), true);
$$;

-- 2) Recreate chat_rooms policies without self-references
DROP POLICY IF EXISTS "Users can view rooms in their org" ON public.chat_rooms;
CREATE POLICY "Users can view rooms in their org"
ON public.chat_rooms
FOR SELECT
USING (
  org_id = public.get_user_org_id()
  AND (
    NOT is_private OR public.user_is_member_of_room(id)
  )
);

DROP POLICY IF EXISTS "Room creators and admins can update rooms" ON public.chat_rooms;
CREATE POLICY "Room creators and admins can update rooms"
ON public.chat_rooms
FOR UPDATE
USING (
  org_id = public.get_user_org_id()
  AND (
    created_by = auth.uid()
    OR public.user_has_room_role(id, ARRAY['owner','admin'])
    OR public.is_user_admin()
  )
);

-- Keep existing INSERT policy as-is, it is not recursive

-- 3) Recreate chat_room_members policies using helper functions (no direct subqueries)
DROP POLICY IF EXISTS "chat_room_members_select" ON public.chat_room_members;
CREATE POLICY "chat_room_members_select"
ON public.chat_room_members
FOR SELECT
USING (
  public.room_belongs_to_user_org(room_id)
  AND (
    NOT public.room_is_private(room_id) OR user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "chat_room_members_insert" ON public.chat_room_members;
CREATE POLICY "chat_room_members_insert"
ON public.chat_room_members
FOR INSERT
WITH CHECK (
  user_id = auth.uid()
  AND public.room_belongs_to_user_org(room_id)
  AND NOT public.room_is_private(room_id)
);

DROP POLICY IF EXISTS "chat_room_members_update" ON public.chat_room_members;
CREATE POLICY "chat_room_members_update"
ON public.chat_room_members
FOR UPDATE
USING (user_id = auth.uid());