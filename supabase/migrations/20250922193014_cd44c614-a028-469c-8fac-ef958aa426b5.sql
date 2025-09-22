-- Create admin membership for existing Mike@team-01.com user
INSERT INTO public.memberships (
  user_id, 
  org_id, 
  role_bucket, 
  assigned_by,
  created_by
) VALUES (
  '4440b052-1b62-4e4e-8789-ab251d00f9d1', -- mike@team-01.com user_id
  '00000000-0000-4000-8000-000000000001', -- Team1 Arkansas Hub org_id
  'admin',
  '4440b052-1b62-4e4e-8789-ab251d00f9d1', -- self-assigned
  '4440b052-1b62-4e4e-8789-ab251d00f9d1'
)
ON CONFLICT (user_id, org_id) DO UPDATE SET
  role_bucket = 'admin',
  updated_at = now();