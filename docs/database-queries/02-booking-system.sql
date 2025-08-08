-- Booking System Queries
-- San Pedro Beach Resort Database

-- Get all active bookings
SELECT 
  b.id,
  b.check_in_date,
  b.check_out_date,
  b.total_amount,
  b.status,
  g.first_name || ' ' || g.last_name AS guest_name,
  g.phone,
  u.unit_number,
  u.unit_type
FROM bookings b
JOIN guests g ON b.guest_id = g.id
JOIN units u ON b.unit_id = u.id
WHERE b.status = 'confirmed'
ORDER BY b.check_in_date;

-- Get booking revenue by month
SELECT 
  DATE_TRUNC('month', b.check_in_date) AS month,
  COUNT(*) AS total_bookings,
  SUM(b.total_amount) AS total_revenue
FROM bookings b
WHERE b.status = 'confirmed'
GROUP BY DATE_TRUNC('month', b.check_in_date)
ORDER BY month DESC;
