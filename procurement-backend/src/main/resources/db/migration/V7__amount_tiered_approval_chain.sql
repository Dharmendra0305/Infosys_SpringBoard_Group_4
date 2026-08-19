-- ============================================================
-- V7: Replace the fixed 4-level chain (V3) with the amount-tiered
-- chain from the project spec:
--
--   Amount range         Approval chain
--   -------------------  ---------------------------------------------
--   0        - 25,000    Manager
--   25,000   - 1,00,000  Manager -> Senior Manager
--   1,00,000 - 5,00,000  Manager -> Senior Manager -> Department Head
--   above 5,00,000       Manager -> Senior Manager -> Department Head
--                         -> Finance -> CEO
--
-- Ranges are non-overlapping: each tier's floor is the previous tier's
-- ceiling + 0.01, so a requisition matches exactly one rule.
--
-- Adds the DEPARTMENT_HEAD role (new - didn't exist before) and one
-- Department Head per department, the same department-scoped pattern
-- as Manager/Senior Manager from V5.
-- ============================================================

INSERT INTO roles (name, description)
SELECT 'DEPARTMENT_HEAD', 'Verifies department budget and strategic necessity for larger purchases'
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'DEPARTMENT_HEAD');

-- One Department Head per department (manager_id left NULL, same as the
-- other department-head-level hires in V3/V5 - they don't report within
-- the approval chain, they sit above it).
INSERT INTO employees (employee_code, first_name, last_name, email, department_id, manager_id, designation, username, password_hash) VALUES
('EMP-056', 'Ravi', 'Shankar', 'ravi.shankar@company.com', 1, NULL, 'Department Head - IT',
 'rshankar', '$2b$10$0Smg4tnTeuIMU/J8ac/mp.5k/8aFE1UdEMw.NzVcUW2SRgm2RteBa'),
('EMP-057', 'Meenakshi', 'Iyer', 'meenakshi.iyer@company.com', 2, NULL, 'Department Head - Finance',
 'miyer', '$2b$10$0Smg4tnTeuIMU/J8ac/mp.5k/8aFE1UdEMw.NzVcUW2SRgm2RteBa'),
('EMP-058', 'Suresh', 'Babu', 'suresh.babu@company.com', 3, NULL, 'Department Head - HR',
 'sbabu', '$2b$10$0Smg4tnTeuIMU/J8ac/mp.5k/8aFE1UdEMw.NzVcUW2SRgm2RteBa'),
('EMP-059', 'Latha', 'Krishnan', 'latha.krishnan@company.com', 4, NULL, 'Department Head - Operations',
 'lkrishnan', '$2b$10$0Smg4tnTeuIMU/J8ac/mp.5k/8aFE1UdEMw.NzVcUW2SRgm2RteBa');

INSERT INTO user_roles (employee_id, role_id)
SELECT (SELECT id FROM employees WHERE employee_code = 'EMP-056'), (SELECT id FROM roles WHERE name = 'DEPARTMENT_HEAD');
INSERT INTO user_roles (employee_id, role_id)
SELECT (SELECT id FROM employees WHERE employee_code = 'EMP-057'), (SELECT id FROM roles WHERE name = 'DEPARTMENT_HEAD');
INSERT INTO user_roles (employee_id, role_id)
SELECT (SELECT id FROM employees WHERE employee_code = 'EMP-058'), (SELECT id FROM roles WHERE name = 'DEPARTMENT_HEAD');
INSERT INTO user_roles (employee_id, role_id)
SELECT (SELECT id FROM employees WHERE employee_code = 'EMP-059'), (SELECT id FROM roles WHERE name = 'DEPARTMENT_HEAD');

-- Retire V3's single fixed 4-level rule - the chain is amount-tiered now
UPDATE approval_hierarchy_rules SET is_active = FALSE WHERE is_active = TRUE;

-- Tier 1: 0 - 25,000 -> Manager only
INSERT INTO approval_hierarchy_rules (category_id, department_id, min_amount, max_amount, approval_levels_required, is_active)
VALUES (NULL, NULL, 0.00, 25000.00, 1, TRUE);

-- Tier 2: 25,000.01 - 1,00,000 -> Manager -> Senior Manager
INSERT INTO approval_hierarchy_rules (category_id, department_id, min_amount, max_amount, approval_levels_required, is_active)
VALUES (NULL, NULL, 25000.01, 100000.00, 2, TRUE);

-- Tier 3: 1,00,000.01 - 5,00,000 -> Manager -> Senior Manager -> Department Head
INSERT INTO approval_hierarchy_rules (category_id, department_id, min_amount, max_amount, approval_levels_required, is_active)
VALUES (NULL, NULL, 100000.01, 500000.00, 3, TRUE);

-- Tier 4: above 5,00,000 -> Manager -> Senior Manager -> Department Head -> Finance -> CEO
INSERT INTO approval_hierarchy_rules (category_id, department_id, min_amount, max_amount, approval_levels_required, is_active)
VALUES (NULL, NULL, 500000.01, 99999999.99, 5, TRUE);

-- Levels for Tier 1 (the most-recently-inserted rule with 1 level)
INSERT INTO approval_levels (rule_id, level_number, approver_role_id)
SELECT r.id, 1, (SELECT id FROM roles WHERE name = 'MANAGER')
FROM approval_hierarchy_rules r
WHERE r.approval_levels_required = 1 AND r.is_active = TRUE
ORDER BY r.id DESC LIMIT 1;

-- Levels for Tier 2
INSERT INTO approval_levels (rule_id, level_number, approver_role_id)
SELECT r.id, 1, (SELECT id FROM roles WHERE name = 'MANAGER')
FROM approval_hierarchy_rules r
WHERE r.approval_levels_required = 2 AND r.is_active = TRUE
ORDER BY r.id DESC LIMIT 1;
INSERT INTO approval_levels (rule_id, level_number, approver_role_id)
SELECT r.id, 2, (SELECT id FROM roles WHERE name = 'SENIOR_MANAGER')
FROM approval_hierarchy_rules r
WHERE r.approval_levels_required = 2 AND r.is_active = TRUE
ORDER BY r.id DESC LIMIT 1;

-- Levels for Tier 3
INSERT INTO approval_levels (rule_id, level_number, approver_role_id)
SELECT r.id, 1, (SELECT id FROM roles WHERE name = 'MANAGER')
FROM approval_hierarchy_rules r
WHERE r.approval_levels_required = 3 AND r.is_active = TRUE
ORDER BY r.id DESC LIMIT 1;
INSERT INTO approval_levels (rule_id, level_number, approver_role_id)
SELECT r.id, 2, (SELECT id FROM roles WHERE name = 'SENIOR_MANAGER')
FROM approval_hierarchy_rules r
WHERE r.approval_levels_required = 3 AND r.is_active = TRUE
ORDER BY r.id DESC LIMIT 1;
INSERT INTO approval_levels (rule_id, level_number, approver_role_id)
SELECT r.id, 3, (SELECT id FROM roles WHERE name = 'DEPARTMENT_HEAD')
FROM approval_hierarchy_rules r
WHERE r.approval_levels_required = 3 AND r.is_active = TRUE
ORDER BY r.id DESC LIMIT 1;

-- Levels for Tier 4
INSERT INTO approval_levels (rule_id, level_number, approver_role_id)
SELECT r.id, 1, (SELECT id FROM roles WHERE name = 'MANAGER')
FROM approval_hierarchy_rules r
WHERE r.approval_levels_required = 5 AND r.is_active = TRUE
ORDER BY r.id DESC LIMIT 1;
INSERT INTO approval_levels (rule_id, level_number, approver_role_id)
SELECT r.id, 2, (SELECT id FROM roles WHERE name = 'SENIOR_MANAGER')
FROM approval_hierarchy_rules r
WHERE r.approval_levels_required = 5 AND r.is_active = TRUE
ORDER BY r.id DESC LIMIT 1;
INSERT INTO approval_levels (rule_id, level_number, approver_role_id)
SELECT r.id, 3, (SELECT id FROM roles WHERE name = 'DEPARTMENT_HEAD')
FROM approval_hierarchy_rules r
WHERE r.approval_levels_required = 5 AND r.is_active = TRUE
ORDER BY r.id DESC LIMIT 1;
INSERT INTO approval_levels (rule_id, level_number, approver_role_id)
SELECT r.id, 4, (SELECT id FROM roles WHERE name = 'FINANCE_APPROVER')
FROM approval_hierarchy_rules r
WHERE r.approval_levels_required = 5 AND r.is_active = TRUE
ORDER BY r.id DESC LIMIT 1;
INSERT INTO approval_levels (rule_id, level_number, approver_role_id)
SELECT r.id, 5, (SELECT id FROM roles WHERE name = 'CEO')
FROM approval_hierarchy_rules r
WHERE r.approval_levels_required = 5 AND r.is_active = TRUE
ORDER BY r.id DESC LIMIT 1;
