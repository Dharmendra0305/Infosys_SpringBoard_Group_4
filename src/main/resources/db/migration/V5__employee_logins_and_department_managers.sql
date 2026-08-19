-- ============================================================
-- V5: Real per-employee login (username + password) instead of an
-- admin picking anyone in a dropdown, and a dedicated Manager +
-- Senior Manager for every department (not one shared pair for
-- the whole company).
--
-- Demo password for every account below is:  Password@123
-- (same bcrypt hash reused on purpose for a demo dataset - change
-- every password before this goes anywhere near production).
-- ============================================================

ALTER TABLE employees
    ADD COLUMN username VARCHAR(50) UNIQUE AFTER designation,
    ADD COLUMN password_hash VARCHAR(255) AFTER username;

-- ---- Give the existing 8 employees (V2 + V3) a login ----
UPDATE employees SET username = 'akrishnan', password_hash = '$2b$10$0Smg4tnTeuIMU/J8ac/mp.5k/8aFE1UdEMw.NzVcUW2SRgm2RteBa' WHERE employee_code = 'EMP-001';
UPDATE employees SET username = 'skumar',    password_hash = '$2b$10$0Smg4tnTeuIMU/J8ac/mp.5k/8aFE1UdEMw.NzVcUW2SRgm2RteBa' WHERE employee_code = 'EMP-002';
UPDATE employees SET username = 'dmenon',    password_hash = '$2b$10$0Smg4tnTeuIMU/J8ac/mp.5k/8aFE1UdEMw.NzVcUW2SRgm2RteBa' WHERE employee_code = 'EMP-003';
UPDATE employees SET username = 'krajan',    password_hash = '$2b$10$0Smg4tnTeuIMU/J8ac/mp.5k/8aFE1UdEMw.NzVcUW2SRgm2RteBa' WHERE employee_code = 'EMP-004';
UPDATE employees SET username = 'lprasad',   password_hash = '$2b$10$0Smg4tnTeuIMU/J8ac/mp.5k/8aFE1UdEMw.NzVcUW2SRgm2RteBa' WHERE employee_code = 'EMP-005';
UPDATE employees SET username = 'vbabu',     password_hash = '$2b$10$0Smg4tnTeuIMU/J8ac/mp.5k/8aFE1UdEMw.NzVcUW2SRgm2RteBa' WHERE employee_code = 'EMP-006';
UPDATE employees SET username = 'msundaram', password_hash = '$2b$10$0Smg4tnTeuIMU/J8ac/mp.5k/8aFE1UdEMw.NzVcUW2SRgm2RteBa' WHERE employee_code = 'EMP-007';
UPDATE employees SET username = 'riyer',     password_hash = '$2b$10$0Smg4tnTeuIMU/J8ac/mp.5k/8aFE1UdEMw.NzVcUW2SRgm2RteBa' WHERE employee_code = 'EMP-008';

-- ---- One Manager + one Senior Manager per department ----
-- IT already has Arun Krishnan as Manager (V3) - just adding IT's Senior Manager here.
INSERT INTO employees (employee_code, first_name, last_name, email, department_id, manager_id, designation, username, password_hash) VALUES
('EMP-009', 'Priya', 'Ramanathan', 'priya.ramanathan@company.com', 1, NULL, 'Senior Manager - IT',
 'pramanathan', '$2b$10$0Smg4tnTeuIMU/J8ac/mp.5k/8aFE1UdEMw.NzVcUW2SRgm2RteBa'),

('EMP-010', 'Suresh', 'Pillai', 'suresh.pillai@company.com', 2, NULL, 'Manager - Finance',
 'spillai', '$2b$10$0Smg4tnTeuIMU/J8ac/mp.5k/8aFE1UdEMw.NzVcUW2SRgm2RteBa'),
('EMP-011', 'Kavya', 'Subramaniam', 'kavya.subramaniam@company.com', 2, NULL, 'Senior Manager - Finance',
 'ksubramaniam', '$2b$10$0Smg4tnTeuIMU/J8ac/mp.5k/8aFE1UdEMw.NzVcUW2SRgm2RteBa'),

('EMP-012', 'Naveen', 'Raj', 'naveen.raj@company.com', 3, NULL, 'Manager - HR',
 'nraj', '$2b$10$0Smg4tnTeuIMU/J8ac/mp.5k/8aFE1UdEMw.NzVcUW2SRgm2RteBa'),
('EMP-013', 'Deepa', 'Chandran', 'deepa.chandran@company.com', 3, NULL, 'Senior Manager - HR',
 'dchandran', '$2b$10$0Smg4tnTeuIMU/J8ac/mp.5k/8aFE1UdEMw.NzVcUW2SRgm2RteBa'),

('EMP-014', 'Mohan', 'Das', 'mohan.das@company.com', 4, NULL, 'Manager - Operations',
 'mdas', '$2b$10$0Smg4tnTeuIMU/J8ac/mp.5k/8aFE1UdEMw.NzVcUW2SRgm2RteBa'),
('EMP-015', 'Anitha', 'Selvam', 'anitha.selvam@company.com', 4, NULL, 'Senior Manager - Operations',
 'aselvam', '$2b$10$0Smg4tnTeuIMU/J8ac/mp.5k/8aFE1UdEMw.NzVcUW2SRgm2RteBa');

-- ---- Assign the MANAGER / SENIOR_MANAGER role to the right employee ----
INSERT INTO user_roles (employee_id, role_id)
SELECT (SELECT id FROM employees WHERE employee_code = 'EMP-009'), (SELECT id FROM roles WHERE name = 'SENIOR_MANAGER');
INSERT INTO user_roles (employee_id, role_id)
SELECT (SELECT id FROM employees WHERE employee_code = 'EMP-010'), (SELECT id FROM roles WHERE name = 'MANAGER');
INSERT INTO user_roles (employee_id, role_id)
SELECT (SELECT id FROM employees WHERE employee_code = 'EMP-011'), (SELECT id FROM roles WHERE name = 'SENIOR_MANAGER');
INSERT INTO user_roles (employee_id, role_id)
SELECT (SELECT id FROM employees WHERE employee_code = 'EMP-012'), (SELECT id FROM roles WHERE name = 'MANAGER');
INSERT INTO user_roles (employee_id, role_id)
SELECT (SELECT id FROM employees WHERE employee_code = 'EMP-013'), (SELECT id FROM roles WHERE name = 'SENIOR_MANAGER');
INSERT INTO user_roles (employee_id, role_id)
SELECT (SELECT id FROM employees WHERE employee_code = 'EMP-014'), (SELECT id FROM roles WHERE name = 'MANAGER');
INSERT INTO user_roles (employee_id, role_id)
SELECT (SELECT id FROM employees WHERE employee_code = 'EMP-015'), (SELECT id FROM roles WHERE name = 'SENIOR_MANAGER');

-- Also give Santhosh Kumar (EMP-002, the usual "raise a requisition" demo user) a plain EMPLOYEE
-- login if it isn't already assigned - already covered by V2, no-op insert guard just in case.
INSERT INTO user_roles (employee_id, role_id)
SELECT (SELECT id FROM employees WHERE employee_code = 'EMP-002'), (SELECT id FROM roles WHERE name = 'EMPLOYEE')
WHERE NOT EXISTS (
  SELECT 1 FROM user_roles
  WHERE employee_id = (SELECT id FROM employees WHERE employee_code = 'EMP-002')
    AND role_id = (SELECT id FROM roles WHERE name = 'EMPLOYEE')
);
