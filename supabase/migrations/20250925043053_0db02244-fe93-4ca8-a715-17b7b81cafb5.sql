-- Create chat rooms/channels table
CREATE TABLE public.chat_rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'channel', -- 'channel', 'direct', 'group'
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  deleted_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb,
  is_private BOOLEAN DEFAULT false
);

-- Create chat messages table
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text', -- 'text', 'file', 'image', 'system'
  reply_to_id UUID REFERENCES public.chat_messages(id),
  attachments JSONB DEFAULT '[]'::jsonb,
  reactions JSONB DEFAULT '{}'::jsonb,
  edited_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  deleted_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create chat room members table  
CREATE TABLE public.chat_room_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member', -- 'owner', 'admin', 'member'
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_muted BOOLEAN DEFAULT false,
  UNIQUE(room_id, user_id)
);

-- Enable RLS on all chat tables
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_room_members ENABLE ROW LEVEL SECURITY;

-- RLS policies for chat_rooms
CREATE POLICY "Users can view rooms in their org"
ON public.chat_rooms FOR SELECT
USING (
  org_id = get_user_org_id() AND
  (NOT is_private OR EXISTS (
    SELECT 1 FROM public.chat_room_members crm 
    WHERE crm.room_id = chat_rooms.id AND crm.user_id = auth.uid()
  ))
);

CREATE POLICY "Users can create rooms in their org"
ON public.chat_rooms FOR INSERT
WITH CHECK (org_id = get_user_org_id() AND created_by = auth.uid());

CREATE POLICY "Room creators and admins can update rooms"
ON public.chat_rooms FOR UPDATE
USING (
  org_id = get_user_org_id() AND
  (created_by = auth.uid() OR EXISTS (
    SELECT 1 FROM public.chat_room_members crm 
    WHERE crm.room_id = chat_rooms.id AND crm.user_id = auth.uid() AND crm.role IN ('owner', 'admin')
  ))
);

-- RLS policies for chat_messages  
CREATE POLICY "Users can view messages in accessible rooms"
ON public.chat_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.chat_rooms cr
    JOIN public.chat_room_members crm ON cr.id = crm.room_id
    WHERE cr.id = chat_messages.room_id 
      AND cr.org_id = get_user_org_id()
      AND crm.user_id = auth.uid()
  )
);

CREATE POLICY "Users can send messages to accessible rooms"
ON public.chat_messages FOR INSERT
WITH CHECK (
  sender_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.chat_rooms cr
    JOIN public.chat_room_members crm ON cr.id = crm.room_id
    WHERE cr.id = chat_messages.room_id 
      AND cr.org_id = get_user_org_id()
      AND crm.user_id = auth.uid()
  )
);

CREATE POLICY "Users can edit their own messages"
ON public.chat_messages FOR UPDATE
USING (sender_id = auth.uid());

-- RLS policies for chat_room_members
CREATE POLICY "Users can view members of accessible rooms"
ON public.chat_room_members FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.chat_rooms cr
    WHERE cr.id = chat_room_members.room_id 
      AND cr.org_id = get_user_org_id()
      AND (NOT cr.is_private OR EXISTS (
        SELECT 1 FROM public.chat_room_members crm2 
        WHERE crm2.room_id = cr.id AND crm2.user_id = auth.uid()
      ))
  )
);

CREATE POLICY "Users can join public rooms"
ON public.chat_room_members FOR INSERT
WITH CHECK (
  user_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.chat_rooms cr
    WHERE cr.id = chat_room_members.room_id 
      AND cr.org_id = get_user_org_id()
      AND NOT cr.is_private
  )
);

CREATE POLICY "Users can update their own membership"
ON public.chat_room_members FOR UPDATE
USING (user_id = auth.uid());

-- Add indexes for performance
CREATE INDEX idx_chat_rooms_org_id ON public.chat_rooms(org_id);
CREATE INDEX idx_chat_messages_room_id ON public.chat_messages(room_id);
CREATE INDEX idx_chat_messages_created_at ON public.chat_messages(created_at);
CREATE INDEX idx_chat_room_members_room_id ON public.chat_room_members(room_id);
CREATE INDEX idx_chat_room_members_user_id ON public.chat_room_members(user_id);

-- Enable realtime for chat messages
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;
ALTER TABLE public.chat_rooms REPLICA IDENTITY FULL;
ALTER TABLE public.chat_room_members REPLICA IDENTITY FULL;

-- Add to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_room_members;