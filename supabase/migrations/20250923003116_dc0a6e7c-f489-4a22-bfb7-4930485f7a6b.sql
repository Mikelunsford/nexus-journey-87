-- Fix search path security warnings for existing functions
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, name, org_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email),
    -- For now, assign to a default org - this should be handled differently in production
    (SELECT id FROM organizations LIMIT 1)
  );
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.audit_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  org_id_val UUID;
  old_json JSONB;
  new_json JSONB;
BEGIN
  -- Convert records to JSONB first to check if org_id exists
  old_json := CASE WHEN TG_OP != 'INSERT' THEN to_jsonb(OLD) ELSE NULL END;
  new_json := CASE WHEN TG_OP != 'DELETE' THEN to_jsonb(NEW) ELSE NULL END;
  
  -- Extract org_id - handle organizations table specially (uses id instead of org_id)
  IF TG_TABLE_NAME = 'organizations' THEN
    org_id_val := COALESCE((new_json->>'id')::UUID, (old_json->>'id')::UUID);
  ELSE
    org_id_val := COALESCE((new_json->>'org_id')::UUID, (old_json->>'org_id')::UUID);
  END IF;
  
  INSERT INTO audit_log (
    org_id, 
    table_name, 
    row_id, 
    action, 
    old_values, 
    new_values, 
    actor_id,
    request_id,
    ip_address
  ) VALUES (
    org_id_val,
    TG_TABLE_NAME,
    COALESCE((new_json->>'id')::UUID, (old_json->>'id')::UUID),
    TG_OP,
    old_json,
    new_json,
    auth.uid(),
    current_setting('request.id', true)::UUID,
    inet_client_addr()
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;