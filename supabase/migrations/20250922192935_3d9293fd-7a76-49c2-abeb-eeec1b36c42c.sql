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
  '4440b052-1b62-4e4e-8789-ab251d00f9d1', -- self-assigned for now
  '4440b052-1b62-4e4e-8789-ab251d00f9d1'
);

-- Create test user profiles for different roles
INSERT INTO public.profiles (id, email, name, org_id, created_by) VALUES 
  (gen_random_uuid(), 'manager@team-01.com', 'Test Manager', '00000000-0000-4000-8000-000000000001', '4440b052-1b62-4e4e-8789-ab251d00f9d1'),
  (gen_random_uuid(), 'operator@team-01.com', 'Test Operator', '00000000-0000-4000-8000-000000000001', '4440b052-1b62-4e4e-8789-ab251d00f9d1'),
  (gen_random_uuid(), 'external@team-01.com', 'Test External User', '00000000-0000-4000-8000-000000000001', '4440b052-1b62-4e4e-8789-ab251d00f9d1');

-- Create memberships for test users
INSERT INTO public.memberships (user_id, org_id, role_bucket, assigned_by, created_by)
SELECT 
  p.id,
  '00000000-0000-4000-8000-000000000001',
  CASE 
    WHEN p.email = 'manager@team-01.com' THEN 'management'::role_bucket_enum
    WHEN p.email = 'operator@team-01.com' THEN 'operational'::role_bucket_enum
    WHEN p.email = 'external@team-01.com' THEN 'external'::role_bucket_enum
  END,
  '4440b052-1b62-4e4e-8789-ab251d00f9d1',
  '4440b052-1b62-4e4e-8789-ab251d00f9d1'
FROM profiles p 
WHERE p.email IN ('manager@team-01.com', 'operator@team-01.com', 'external@team-01.com');