-- Create user invitations table
CREATE TABLE public.user_invitations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  name text,
  role_bucket role_bucket_enum NOT NULL DEFAULT 'external',
  org_id uuid NOT NULL,
  department_id uuid,
  token text NOT NULL UNIQUE,
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '7 days'),
  invited_by uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  version integer NOT NULL DEFAULT 1,
  CONSTRAINT unique_email_org UNIQUE (email, org_id)
);

-- Enable RLS
ALTER TABLE public.user_invitations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "invitations_org_access" 
ON public.user_invitations 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles p 
  WHERE p.id = auth.uid() AND p.org_id = user_invitations.org_id
));

-- Add trigger for timestamps
CREATE TRIGGER update_user_invitations_updated_at
BEFORE UPDATE ON public.user_invitations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable real-time for profiles table
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.profiles;

-- Enable real-time for memberships table  
ALTER TABLE public.memberships REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.memberships;

-- Enable real-time for user_invitations table
ALTER TABLE public.user_invitations REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.user_invitations;