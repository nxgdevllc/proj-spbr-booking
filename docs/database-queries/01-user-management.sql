-- User Management Queries
-- San Pedro Beach Resort Database

-- Get all user profiles with roles
SELECT 
  up.id,
  up.first_name,
  up.last_name,
  up.email,
  up.role,
  up.created_at
FROM user_profiles up
ORDER BY up.created_at DESC;

-- Get employees with user profiles
SELECT 
  e.id,
  e.first_name,
  e.last_name,
  e.position,
  e.hire_date,
  up.email,
  up.role
FROM employees e
LEFT JOIN user_profiles up ON e.user_profile_id = up.id
ORDER BY e.hire_date DESC;
