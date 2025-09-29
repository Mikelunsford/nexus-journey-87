-- Create a default general chat room for each organization
INSERT INTO public.chat_rooms (name, description, org_id, type, is_private, created_by)
SELECT 
    'General' as name,
    'General discussion for the team' as description,
    o.id as org_id,
    'channel' as type,
    false as is_private,
    o.created_by as created_by
FROM public.organizations o
WHERE NOT EXISTS (
    SELECT 1 FROM public.chat_rooms cr 
    WHERE cr.org_id = o.id AND cr.name = 'General'
)
AND o.deleted_at IS NULL;

-- Add all organization members to the general room
WITH general_rooms AS (
    SELECT cr.id as room_id, cr.org_id
    FROM public.chat_rooms cr
    WHERE cr.name = 'General' AND cr.deleted_at IS NULL
),
org_members AS (
    SELECT p.id as user_id, p.org_id
    FROM public.profiles p
    WHERE p.deleted_at IS NULL
)
INSERT INTO public.chat_room_members (room_id, user_id, role)
SELECT gr.room_id, om.user_id, 'member' as role
FROM general_rooms gr
JOIN org_members om ON gr.org_id = om.org_id
WHERE NOT EXISTS (
    SELECT 1 FROM public.chat_room_members crm
    WHERE crm.room_id = gr.room_id AND crm.user_id = om.user_id
);