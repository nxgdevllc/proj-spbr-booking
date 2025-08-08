-- Convert Data Types from TEXT to Proper Types
-- This script converts financial amounts and dates to proper data types

-- Convert financial amounts from TEXT to NUMERIC
ALTER TABLE expenses_2025 
ALTER COLUMN amount TYPE NUMERIC(10,2) 
USING CASE 
  WHEN amount ~ '^[0-9]+\.?[0-9]*$' THEN amount::NUMERIC(10,2)
  ELSE 0
END;

ALTER TABLE employee_salaries_2025 
ALTER COLUMN amount TYPE NUMERIC(10,2) 
USING CASE 
  WHEN amount ~ '^[0-9]+\.?[0-9]*$' THEN amount::NUMERIC(10,2)
  ELSE 0
END;

ALTER TABLE stakeholder_withdrawals_2025 
ALTER COLUMN amount TYPE NUMERIC(10,2) 
USING CASE 
  WHEN amount ~ '^[0-9]+\.?[0-9]*$' THEN amount::NUMERIC(10,2)
  ELSE 0
END;

-- Convert dates from TEXT to DATE
ALTER TABLE expenses_2025 
ALTER COLUMN date TYPE DATE 
USING CASE 
  WHEN date ~ '^\d{4}-\d{2}-\d{2}$' THEN date::DATE
  ELSE NULL
END;

ALTER TABLE employee_salaries_2025 
ALTER COLUMN date TYPE DATE 
USING CASE 
  WHEN date ~ '^\d{4}-\d{2}-\d{2}$' THEN date::DATE
  ELSE NULL
END;

ALTER TABLE stakeholder_withdrawals_2025 
ALTER COLUMN date TYPE DATE 
USING CASE 
  WHEN date ~ '^\d{4}-\d{2}-\d{2}$' THEN date::DATE
  ELSE NULL
END;

-- Add constraints for data validation
ALTER TABLE expenses_2025 
ADD CONSTRAINT check_expense_amount_positive CHECK (amount >= 0);

ALTER TABLE employee_salaries_2025 
ADD CONSTRAINT check_salary_amount_positive CHECK (amount >= 0);

ALTER TABLE stakeholder_withdrawals_2025 
ADD CONSTRAINT check_withdrawal_amount_positive CHECK (amount >= 0);

-- Add comments for documentation
COMMENT ON COLUMN expenses_2025.amount IS 'Expense amount in currency (NUMERIC)';
COMMENT ON COLUMN expenses_2025.date IS 'Expense date (DATE)';
COMMENT ON COLUMN employee_salaries_2025.amount IS 'Salary amount in currency (NUMERIC)';
COMMENT ON COLUMN employee_salaries_2025.date IS 'Salary date (DATE)';
COMMENT ON COLUMN stakeholder_withdrawals_2025.amount IS 'Withdrawal amount in currency (NUMERIC)';
COMMENT ON COLUMN stakeholder_withdrawals_2025.date IS 'Withdrawal date (DATE)';
