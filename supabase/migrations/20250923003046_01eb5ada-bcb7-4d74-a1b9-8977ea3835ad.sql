-- Customer-aware security functions
CREATE OR REPLACE FUNCTION public.get_user_customer_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.id 
  FROM public.customers c
  JOIN public.profiles p ON p.id = c.owner_id
  WHERE p.id = auth.uid() 
    AND c.deleted_at IS NULL
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_customer_owner(customer_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.customers c
    WHERE c.id = customer_id 
      AND c.owner_id = auth.uid()
      AND c.deleted_at IS NULL
  );
$$;

CREATE OR REPLACE FUNCTION public.get_user_role_bucket()
RETURNS role_bucket_enum
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT m.role_bucket 
  FROM public.memberships m 
  WHERE m.user_id = auth.uid() 
    AND m.deleted_at IS NULL 
    AND (m.expires_at IS NULL OR m.expires_at > NOW())
  ORDER BY 
    CASE m.role_bucket
      WHEN 'admin' THEN 4
      WHEN 'management' THEN 3  
      WHEN 'operational' THEN 2
      WHEN 'external' THEN 1
    END DESC
  LIMIT 1;
$$;

-- Enhanced RLS policies for customer data isolation

-- Update projects policy for customer isolation
DROP POLICY IF EXISTS "projects_org_access" ON public.projects;
CREATE POLICY "projects_customer_access" ON public.projects
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.org_id = projects.org_id
  ) AND (
    get_user_role_bucket() != 'external' OR 
    is_customer_owner(projects.customer_id)
  )
);

-- Update quotes policy for customer isolation  
DROP POLICY IF EXISTS "quotes_org_access" ON public.quotes;
CREATE POLICY "quotes_customer_access" ON public.quotes
FOR ALL  
USING (
  EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.org_id = quotes.org_id
  ) AND (
    get_user_role_bucket() != 'external' OR 
    is_customer_owner(quotes.customer_id)
  )
);

-- Update messages policy for customer isolation
DROP POLICY IF EXISTS "messages_org_access" ON public.messages;
CREATE POLICY "messages_customer_access" ON public.messages
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.org_id = messages.org_id
  ) AND (
    get_user_role_bucket() != 'external' OR 
    (messages.customer_id IS NOT NULL AND is_customer_owner(messages.customer_id))
  )
);

-- Update shipments policy for customer isolation
DROP POLICY IF EXISTS "shipments_org_access" ON public.shipments;
CREATE POLICY "shipments_customer_access" ON public.shipments
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.org_id = shipments.org_id
  ) AND (
    get_user_role_bucket() != 'external' OR 
    EXISTS (
      SELECT 1 FROM projects pr 
      WHERE pr.id = shipments.project_id 
        AND is_customer_owner(pr.customer_id)
    )
  )
);

-- Update work_orders policy for customer isolation
DROP POLICY IF EXISTS "work_orders_org_access" ON public.work_orders;  
CREATE POLICY "work_orders_customer_access" ON public.work_orders
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.org_id = work_orders.org_id
  ) AND (
    get_user_role_bucket() != 'external' OR 
    EXISTS (
      SELECT 1 FROM projects pr 
      WHERE pr.id = work_orders.project_id 
        AND is_customer_owner(pr.customer_id)
    )
  )
);

-- Add missing RLS policies
ALTER TABLE public.carrier_appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "carrier_appointments_org_access" ON public.carrier_appointments
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.org_id = carrier_appointments.org_id
  ) AND get_user_role_bucket() != 'external'
);

ALTER TABLE public.labels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "labels_org_access" ON public.labels  
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.org_id = labels.org_id
  )
);

ALTER TABLE public.event_outbox ENABLE ROW LEVEL SECURITY;
CREATE POLICY "event_outbox_admin_access" ON public.event_outbox
FOR ALL
USING (is_user_admin());

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_customers_owner_id ON public.customers(owner_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_projects_customer_id ON public.projects(customer_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_quotes_customer_id ON public.quotes(customer_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_shipments_project_id ON public.shipments(project_id) WHERE deleted_at IS NULL;