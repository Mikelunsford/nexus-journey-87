-- Fix RLS policies to prevent infinite recursion and enable proper admin access

-- Drop the problematic recursive policy on profiles
DROP POLICY IF EXISTS "profile_org_access" ON public.profiles;

-- Create a security definer function to get user's org_id from memberships
CREATE OR REPLACE FUNCTION public.get_user_org_id()
RETURNS UUID AS $$
  SELECT m.org_id 
  FROM public.memberships m 
  WHERE m.user_id = auth.uid() 
    AND m.deleted_at IS NULL 
  LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Create a security definer function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_user_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.memberships m 
    WHERE m.user_id = auth.uid() 
      AND m.role_bucket = 'admin' 
      AND m.deleted_at IS NULL
      AND (m.expires_at IS NULL OR m.expires_at > NOW())
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Create new profile access policy using the security definer function
CREATE POLICY "profiles_membership_access" ON public.profiles
FOR SELECT USING (
  -- Admins can see all profiles in their org
  (public.is_user_admin() AND org_id = public.get_user_org_id())
  OR
  -- Users can see profiles in the same org if they have valid membership
  (org_id = public.get_user_org_id())
  OR
  -- Users can always see their own profile
  (id = auth.uid())
);

-- Update audit log policy to use the new function
DROP POLICY IF EXISTS "audit_read_access" ON public.audit_log;
CREATE POLICY "audit_admin_access" ON public.audit_log
FOR SELECT USING (
  public.is_user_admin() AND (
    org_id = public.get_user_org_id() OR org_id IS NULL
  )
);