-- Create missing membership records for users who don't have them
INSERT INTO memberships (user_id, org_id, role_bucket, assigned_by)
SELECT 
  p.id as user_id,
  p.org_id,
  'external'::role_bucket_enum as role_bucket,
  p.id as assigned_by  -- Self-assigned for now
FROM profiles p
LEFT JOIN memberships m ON p.id = m.user_id AND m.deleted_at IS NULL
WHERE m.id IS NULL;