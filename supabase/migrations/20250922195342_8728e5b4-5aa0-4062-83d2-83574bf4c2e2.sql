-- Fix security issues: Set search_path for functions to prevent mutable search path warnings
CREATE OR REPLACE FUNCTION public.is_user_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 
    FROM public.memberships m 
    WHERE m.user_id = auth.uid() 
      AND m.role_bucket = 'admin' 
      AND m.deleted_at IS NULL
      AND (m.expires_at IS NULL OR m.expires_at > NOW())
  );
$function$;

CREATE OR REPLACE FUNCTION public.get_user_org_id()
 RETURNS uuid
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT m.org_id 
  FROM public.memberships m 
  WHERE m.user_id = auth.uid() 
    AND m.deleted_at IS NULL 
  LIMIT 1;
$function$;