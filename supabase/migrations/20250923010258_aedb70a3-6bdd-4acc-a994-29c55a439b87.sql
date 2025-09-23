-- Add is_test column to core tables for test data management
ALTER TABLE public.projects ADD COLUMN is_test boolean DEFAULT false;
ALTER TABLE public.quotes ADD COLUMN is_test boolean DEFAULT false;
ALTER TABLE public.shipments ADD COLUMN is_test boolean DEFAULT false;
ALTER TABLE public.messages ADD COLUMN is_test boolean DEFAULT false;
ALTER TABLE public.documents ADD COLUMN is_test boolean DEFAULT false;
ALTER TABLE public.work_orders ADD COLUMN is_test boolean DEFAULT false;

-- Add indexes for efficient test data queries
CREATE INDEX idx_projects_is_test ON public.projects(is_test) WHERE is_test = true;
CREATE INDEX idx_quotes_is_test ON public.quotes(is_test) WHERE is_test = true;
CREATE INDEX idx_shipments_is_test ON public.shipments(is_test) WHERE is_test = true;
CREATE INDEX idx_messages_is_test ON public.messages(is_test) WHERE is_test = true;
CREATE INDEX idx_documents_is_test ON public.documents(is_test) WHERE is_test = true;
CREATE INDEX idx_work_orders_is_test ON public.work_orders(is_test) WHERE is_test = true;