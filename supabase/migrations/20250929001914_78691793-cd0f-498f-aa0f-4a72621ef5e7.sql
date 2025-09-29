-- Fix RLS policy recursion issue by simplifying chat_room_members policies
DROP POLICY IF EXISTS "Users can view members of accessible rooms" ON public.chat_room_members;
DROP POLICY IF EXISTS "Users can join public rooms" ON public.chat_room_members;
DROP POLICY IF EXISTS "Users can update their own membership" ON public.chat_room_members;

-- Create simplified, non-recursive policies for chat_room_members
CREATE POLICY "chat_room_members_select" ON public.chat_room_members
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.chat_rooms cr
    WHERE cr.id = chat_room_members.room_id 
    AND cr.org_id = get_user_org_id()
    AND (
      NOT cr.is_private 
      OR chat_room_members.user_id = auth.uid()
    )
  )
);

CREATE POLICY "chat_room_members_insert" ON public.chat_room_members
FOR INSERT WITH CHECK (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.chat_rooms cr
    WHERE cr.id = chat_room_members.room_id 
    AND cr.org_id = get_user_org_id()
    AND NOT cr.is_private
  )
);

CREATE POLICY "chat_room_members_update" ON public.chat_room_members
FOR UPDATE USING (user_id = auth.uid());

-- Fix missing is_test column in customers table
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS is_test boolean DEFAULT false;