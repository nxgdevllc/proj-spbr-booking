-- Financial Reports Queries
-- San Pedro Beach Resort Database

-- Get total expenses by month
SELECT 
  DATE_TRUNC('month', TO_DATE(e.date, 'YYYY-MM-DD')) AS month,
  SUM(CAST(e.amount AS NUMERIC(10,2))) AS total_expenses
FROM expenses_2025 e
GROUP BY DATE_TRUNC('month', TO_DATE(e.date, 'YYYY-MM-DD'))
ORDER BY month DESC;

-- Get employee salary total
SELECT 
  DATE_TRUNC('month', TO_DATE(es.date, 'YYYY-MM-DD')) AS month,
  SUM(CAST(es.amount AS NUMERIC(10,2))) AS total_salaries
FROM employee_salaries_2025 es
GROUP BY DATE_TRUNC('month', TO_DATE(es.date, 'YYYY-MM-DD'))
ORDER BY month DESC;
