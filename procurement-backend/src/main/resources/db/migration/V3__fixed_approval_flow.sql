-- ============================================================
-- V3: Move from amount-tiered approval rules to a single, fixed
-- 4-level chain that every requisition goes through:
--   Manager -> Senior Manager -> Finance -> CEO
-- After CEO approval the requisition is APPROVED and ready to be
-- converted into a Purchase Order (unchanged, Module 3 logic).
-- ============================================================

-- New "Executive Office" department to hold senior/exec approvers
INSERT INTO departments (name, code)
SELECT 'Executive Office', 'EXEC'
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE code = 'EXEC');

-- New roles for the fixed chain (FINANCE_APPROVER from V2 is reused as the Finance step)
INSERT INTO roles (name, description)
SELECT 'MANAGER', 'First-line manager approval for their team''s requisitions'
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'MANAGER');

INSERT INTO roles (name, description)
SELECT 'SENIOR_MANAGER', 'Second-line senior management approval'
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'SENIOR_MANAGER');

INSERT INTO roles (name, description)
SELECT 'CEO', 'Final executive sign-off before a requisition is approved'
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'CEO');

-- Two new employees to fill the Senior Manager and CEO seats
INSERT INTO employees (employee_code, first_name, last_name, email, department_id, manager_id, designation)
SELECT 'EMP-007', 'Meena', 'Sundaram', 'meena.sundaram@company.com',
       (SELECT id FROM departments WHERE code = 'EXEC'), NULL, 'Senior Manager'
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_code = 'EMP-007');

INSERT INTO employees (employee_code, first_name, last_name, email, department_id, manager_id, designation)
SELECT 'EMP-008', 'Rajesh', 'Iyer', 'rajesh.iyer@company.com',
       (SELECT id FROM departments WHERE code = 'EXEC'), NULL, 'Chief Executive Officer'
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_code = 'EMP-008');

-- Role assignments: Arun (existing CTO, id via employee_code EMP-001) becomes the MANAGER approver
INSERT INTO user_roles (employee_id, role_id)
SELECT (SELECT id FROM employees WHERE employee_code = 'EMP-001'), (SELECT id FROM roles WHERE name = 'MANAGER')
WHERE NOT EXISTS (
  SELECT 1 FROM user_roles
  WHERE employee_id = (SELECT id FROM employees WHERE employee_code = 'EMP-001')
    AND role_id = (SELECT id FROM roles WHERE name = 'MANAGER')
);

INSERT INTO user_roles (employee_id, role_id)
SELECT (SELECT id FROM employees WHERE employee_code = 'EMP-007'), (SELECT id FROM roles WHERE name = 'SENIOR_MANAGER')
WHERE NOT EXISTS (
  SELECT 1 FROM user_roles
  WHERE employee_id = (SELECT id FROM employees WHERE employee_code = 'EMP-007')
    AND role_id = (SELECT id FROM roles WHERE name = 'SENIOR_MANAGER')
);

INSERT INTO user_roles (employee_id, role_id)
SELECT (SELECT id FROM employees WHERE employee_code = 'EMP-008'), (SELECT id FROM roles WHERE name = 'CEO')
WHERE NOT EXISTS (
  SELECT 1 FROM user_roles
  WHERE employee_id = (SELECT id FROM employees WHERE employee_code = 'EMP-008')
    AND role_id = (SELECT id FROM roles WHERE name = 'CEO')
);

-- Retire the old amount-tiered rules from V2 - the chain is now fixed, not amount-based
UPDATE approval_hierarchy_rules SET is_active = FALSE WHERE is_active = TRUE;

-- One rule to cover every requisition, any amount, any department, any category
INSERT INTO approval_hierarchy_rules (category_id, department_id, min_amount, max_amount, approval_levels_required, is_active)
VALUES (NULL, NULL, 0.00, 99999999.99, 4, TRUE);

-- The 4 fixed levels, in order, on the rule we just inserted
INSERT INTO approval_levels (rule_id, level_number, approver_role_id)
SELECT r.id, 1, (SELECT id FROM roles WHERE name = 'MANAGER')
FROM approval_hierarchy_rules r
WHERE r.approval_levels_required = 4 AND r.is_active = TRUE
ORDER BY r.id DESC LIMIT 1;

INSERT INTO approval_levels (rule_id, level_number, approver_role_id)
SELECT r.id, 2, (SELECT id FROM roles WHERE name = 'SENIOR_MANAGER')
FROM approval_hierarchy_rules r
WHERE r.approval_levels_required = 4 AND r.is_active = TRUE
ORDER BY r.id DESC LIMIT 1;

INSERT INTO approval_levels (rule_id, level_number, approver_role_id)
SELECT r.id, 3, (SELECT id FROM roles WHERE name = 'FINANCE_APPROVER')
FROM approval_hierarchy_rules r
WHERE r.approval_levels_required = 4 AND r.is_active = TRUE
ORDER BY r.id DESC LIMIT 1;

INSERT INTO approval_levels (rule_id, level_number, approver_role_id)
SELECT r.id, 4, (SELECT id FROM roles WHERE name = 'CEO')
FROM approval_hierarchy_rules r
WHERE r.approval_levels_required = 4 AND r.is_active = TRUE
ORDER BY r.id DESC LIMIT 1;
