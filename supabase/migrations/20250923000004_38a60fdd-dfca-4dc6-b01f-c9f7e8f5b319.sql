-- Update customers RLS policy to use get_user_org_id() for clarity and robustness
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'customers' AND policyname = 'customers_org_access'
  ) THEN
    DROP POLICY "customers_org_access" ON public.customers;
  END IF;
END $$;

CREATE POLICY "customers_org_access"
ON public.customers
FOR ALL
USING (org_id = public.get_user_org_id())
WITH CHECK (org_id = public.get_user_org_id());