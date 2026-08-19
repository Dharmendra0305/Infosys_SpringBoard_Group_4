-- ============================================================
-- V6: 10 sample employees per department (40 total), each
-- reporting to their own department's Manager, each with a
-- login (EMPLOYEE role) so the whole org chart is real.
-- Demo password for every account: Password@123
-- ============================================================

INSERT INTO employees (employee_code, first_name, last_name, email, department_id, manager_id, designation, username, password_hash) VALUES
('EMP-016', 'Rahul', 'Menon', 'rahul.menon@company.com', 1, (SELECT id FROM (SELECT id FROM employees WHERE employee_code = 'EMP-001') AS mgr_lookup), 'Software Engineer', 'rmenon', '$2b$10$0Smg4tnTeuIMU/J8ac/mp.5k/8aFE1UdEMw.NzVcUW2SRgm2RteBa'),
('EMP-017', 'Sneha', 'Iyer', 'sneha.iyer@company.com', 1, (SELECT id FROM (SELECT id FROM employees WHERE employee_code = 'EMP-001') AS mgr_lookup), 'Software Engineer', 'siyer', '$2b$10$0Smg4tnTeuIMU/J8ac/mp.5k/8aFE1UdEMw.NzVcUW2SRgm2RteBa'),
('EMP-018', 'Vikram', 'Nair', 'vikram.nair@company.com', 1, (SELECT id FROM (SELECT id FROM employees WHERE employee_code = 'EMP-001') AS mgr_lookup), 'QA Engineer', 'vnair', '$2b$10$0Smg4tnTeuIMU/J8ac/mp.5k/8aFE1UdEMw.NzVcUW2SRgm2RteBa'),
('EMP-019', 'Anjali', 'Krishnan', 'anjali.krishnan@company.com', 1, (SELECT id FROM (SELECT id FROM employees WHERE employee_code = 'EMP-001') AS mgr_lookup), 'DevOps Engineer', 'akrishnan2', '$2b$10$0Smg4tnTeuIMU/J8ac/mp.5k/8aFE1UdEMw.NzVcUW2SRgm2RteBa'),
('EMP-020', 'Arjun', 'Pillai', 'arjun.pillai@company.com', 1, (SELECT id FROM (SELECT id FROM employees WHERE employee_code = 'EMP-001') AS mgr_lookup), 'Systems Analyst', 'apillai', '$2b$10$0Smg4tnTeuIMU/J8ac/mp.5k/8aFE1UdEMw.NzVcUW2SRgm2RteBa'),
('EMP-021', 'Divya', 'Rao', 'divya.rao@company.com', 1, (SELECT id FROM (SELECT id FROM employees WHERE employee_code = 'EMP-001') AS mgr_lookup), 'Frontend Developer', 'drao', '$2b$10$0Smg4tnTeuIMU/J8ac/mp.5k/8aFE1UdEMw.NzVcUW2SRgm2RteBa'),
('EMP-022', 'Kiran', 'Varma', 'kiran.varma@company.com', 1, (SELECT id FROM (SELECT id FROM employees WHERE employee_code = 'EMP-001') AS mgr_lookup), 'Backend Developer', 'kvarma', '$2b$10$0Smg4tnTeuIMU/J8ac/mp.5k/8aFE1UdEMw.NzVcUW2SRgm2RteBa'),
('EMP-023', 'Swathi', 'Nambiar', 'swathi.nambiar@company.com', 1, (SELECT id FROM (SELECT id FROM employees WHERE employee_code = 'EMP-001') AS mgr_lookup), 'Database Administrator', 'snambiar', '$2b$10$0Smg4tnTeuIMU/J8ac/mp.5k/8aFE1UdEMw.NzVcUW2SRgm2RteBa'),
('EMP-024', 'Rohit', 'Bhat', 'rohit.bhat@company.com', 1, (SELECT id FROM (SELECT id FROM employees WHERE employee_code = 'EMP-001') AS mgr_lookup), 'IT Support Engineer', 'rbhat', '$2b$10$0Smg4tnTeuIMU/J8ac/mp.5k/8aFE1UdEMw.NzVcUW2SRgm2RteBa'),
('EMP-025', 'Meera', 'Shetty', 'meera.shetty@company.com', 1, (SELECT id FROM (SELECT id FROM employees WHERE employee_code = 'EMP-001') AS mgr_lookup), 'Network Engineer', 'mshetty', '$2b$10$0Smg4tnTeuIMU/J8ac/mp.5k/8aFE1UdEMw.NzVcUW2SRgm2RteBa'),
('EMP-026', 'Ashwin', 'Kumar', 'ashwin.kumar@company.com', 2, (SELECT id FROM (SELECT id FROM employees WHERE employee_code = 'EMP-010') AS mgr_lookup), 'Accounts Executive', 'akumar', '$2b$10$0Smg4tnTeuIMU/J8ac/mp.5k/8aFE1UdEMw.NzVcUW2SRgm2RteBa'),
('EMP-027', 'Pooja', 'Desai', 'pooja.desai@company.com', 2, (SELECT id FROM (SELECT id FROM employees WHERE employee_code = 'EMP-010') AS mgr_lookup), 'Financial Analyst', 'pdesai', '$2b$10$0Smg4tnTeuIMU/J8ac/mp.5k/8aFE1UdEMw.NzVcUW2SRgm2RteBa'),
('EMP-028', 'Sanjay', 'Reddy', 'sanjay.reddy@company.com', 2, (SELECT id FROM (SELECT id FROM employees WHERE employee_code = 'EMP-010') AS mgr_lookup), 'Accounts Payable Specialist', 'sreddy', '$2b$10$0Smg4tnTeuIMU/J8ac/mp.5k/8aFE1UdEMw.NzVcUW2SRgm2RteBa'),
('EMP-029', 'Nithya', 'Balan', 'nithya.balan@company.com', 2, (SELECT id FROM (SELECT id FROM employees WHERE employee_code = 'EMP-010') AS mgr_lookup), 'Payroll Executive', 'nbalan', '$2b$10$0Smg4tnTeuIMU/J8ac/mp.5k/8aFE1UdEMw.NzVcUW2SRgm2RteBa'),
('EMP-030', 'Manoj', 'Suresh', 'manoj.suresh@company.com', 2, (SELECT id FROM (SELECT id FROM employees WHERE employee_code = 'EMP-010') AS mgr_lookup), 'Budget Analyst', 'msuresh', '$2b$10$0Smg4tnTeuIMU/J8ac/mp.5k/8aFE1UdEMw.NzVcUW2SRgm2RteBa'),
('EMP-031', 'Ramya', 'Krishnamurthy', 'ramya.krishnamurthy@company.com', 2, (SELECT id FROM (SELECT id FROM employees WHERE employee_code = 'EMP-010') AS mgr_lookup), 'Tax Associate', 'rkrishnamurthy', '$2b$10$0Smg4tnTeuIMU/J8ac/mp.5k/8aFE1UdEMw.NzVcUW2SRgm2RteBa'),
('EMP-032', 'Vivek', 'Chandran', 'vivek.chandran@company.com', 2, (SELECT id FROM (SELECT id FROM employees WHERE employee_code = 'EMP-010') AS mgr_lookup), 'Accounts Receivable Executive', 'vchandran', '$2b$10$0Smg4tnTeuIMU/J8ac/mp.5k/8aFE1UdEMw.NzVcUW2SRgm2RteBa'),
('EMP-033', 'Harini', 'Gopal', 'harini.gopal@company.com', 2, (SELECT id FROM (SELECT id FROM employees WHERE employee_code = 'EMP-010') AS mgr_lookup), 'Audit Associate', 'hgopal', '$2b$10$0Smg4tnTeuIMU/J8ac/mp.5k/8aFE1UdEMw.NzVcUW2SRgm2RteBa'),
('EMP-034', 'Prakash', 'Sundaram', 'prakash.sundaram@company.com', 2, (SELECT id FROM (SELECT id FROM employees WHERE employee_code = 'EMP-010') AS mgr_lookup), 'Financial Reporting Analyst', 'psundaram', '$2b$10$0Smg4tnTeuIMU/J8ac/mp.5k/8aFE1UdEMw.NzVcUW2SRgm2RteBa'),
('EMP-035', 'Lavanya', 'Mohan', 'lavanya.mohan@company.com', 2, (SELECT id FROM (SELECT id FROM employees WHERE employee_code = 'EMP-010') AS mgr_lookup), 'Treasury Analyst', 'lmohan', '$2b$10$0Smg4tnTeuIMU/J8ac/mp.5k/8aFE1UdEMw.NzVcUW2SRgm2RteBa'),
('EMP-036', 'Aditi', 'Verma', 'aditi.verma@company.com', 3, (SELECT id FROM (SELECT id FROM employees WHERE employee_code = 'EMP-012') AS mgr_lookup), 'HR Executive', 'averma', '$2b$10$0Smg4tnTeuIMU/J8ac/mp.5k/8aFE1UdEMw.NzVcUW2SRgm2RteBa'),
('EMP-037', 'Gokul', 'Ramesh', 'gokul.ramesh@company.com', 3, (SELECT id FROM (SELECT id FROM employees WHERE employee_code = 'EMP-012') AS mgr_lookup), 'Talent Acquisition Specialist', 'gramesh', '$2b$10$0Smg4tnTeuIMU/J8ac/mp.5k/8aFE1UdEMw.NzVcUW2SRgm2RteBa'),
('EMP-038', 'Shalini', 'Pandey', 'shalini.pandey@company.com', 3, (SELECT id FROM (SELECT id FROM employees WHERE employee_code = 'EMP-012') AS mgr_lookup), 'HR Business Partner', 'spandey', '$2b$10$0Smg4tnTeuIMU/J8ac/mp.5k/8aFE1UdEMw.NzVcUW2SRgm2RteBa'),
('EMP-039', 'Faisal', 'Khan', 'faisal.khan@company.com', 3, (SELECT id FROM (SELECT id FROM employees WHERE employee_code = 'EMP-012') AS mgr_lookup), 'Learning & Development Executive', 'fkhan', '$2b$10$0Smg4tnTeuIMU/J8ac/mp.5k/8aFE1UdEMw.NzVcUW2SRgm2RteBa'),
('EMP-040', 'Bhavana', 'Rajan', 'bhavana.rajan@company.com', 3, (SELECT id FROM (SELECT id FROM employees WHERE employee_code = 'EMP-012') AS mgr_lookup), 'Compensation & Benefits Analyst', 'brajan', '$2b$10$0Smg4tnTeuIMU/J8ac/mp.5k/8aFE1UdEMw.NzVcUW2SRgm2RteBa'),
('EMP-041', 'Yogesh', 'Patil', 'yogesh.patil@company.com', 3, (SELECT id FROM (SELECT id FROM employees WHERE employee_code = 'EMP-012') AS mgr_lookup), 'Employee Relations Executive', 'ypatil', '$2b$10$0Smg4tnTeuIMU/J8ac/mp.5k/8aFE1UdEMw.NzVcUW2SRgm2RteBa'),
('EMP-042', 'Nisha', 'Thomas', 'nisha.thomas@company.com', 3, (SELECT id FROM (SELECT id FROM employees WHERE employee_code = 'EMP-012') AS mgr_lookup), 'HR Operations Executive', 'nthomas', '$2b$10$0Smg4tnTeuIMU/J8ac/mp.5k/8aFE1UdEMw.NzVcUW2SRgm2RteBa'),
('EMP-043', 'Deepak', 'Anand', 'deepak.anand@company.com', 3, (SELECT id FROM (SELECT id FROM employees WHERE employee_code = 'EMP-012') AS mgr_lookup), 'Recruitment Coordinator', 'danand', '$2b$10$0Smg4tnTeuIMU/J8ac/mp.5k/8aFE1UdEMw.NzVcUW2SRgm2RteBa'),
('EMP-044', 'Preethi', 'Sekar', 'preethi.sekar@company.com', 3, (SELECT id FROM (SELECT id FROM employees WHERE employee_code = 'EMP-012') AS mgr_lookup), 'HR Generalist', 'psekar', '$2b$10$0Smg4tnTeuIMU/J8ac/mp.5k/8aFE1UdEMw.NzVcUW2SRgm2RteBa'),
('EMP-045', 'Ajay', 'Kapoor', 'ajay.kapoor@company.com', 3, (SELECT id FROM (SELECT id FROM employees WHERE employee_code = 'EMP-012') AS mgr_lookup), 'Onboarding Specialist', 'akapoor', '$2b$10$0Smg4tnTeuIMU/J8ac/mp.5k/8aFE1UdEMw.NzVcUW2SRgm2RteBa'),
('EMP-046', 'Ganesh', 'Murthy', 'ganesh.murthy@company.com', 4, (SELECT id FROM (SELECT id FROM employees WHERE employee_code = 'EMP-014') AS mgr_lookup), 'Operations Executive', 'gmurthy', '$2b$10$0Smg4tnTeuIMU/J8ac/mp.5k/8aFE1UdEMw.NzVcUW2SRgm2RteBa'),
('EMP-047', 'Revathi', 'Iyengar', 'revathi.iyengar@company.com', 4, (SELECT id FROM (SELECT id FROM employees WHERE employee_code = 'EMP-014') AS mgr_lookup), 'Logistics Coordinator', 'riyengar', '$2b$10$0Smg4tnTeuIMU/J8ac/mp.5k/8aFE1UdEMw.NzVcUW2SRgm2RteBa'),
('EMP-048', 'Siddharth', 'Joshi', 'siddharth.joshi@company.com', 4, (SELECT id FROM (SELECT id FROM employees WHERE employee_code = 'EMP-014') AS mgr_lookup), 'Inventory Analyst', 'sjoshi', '$2b$10$0Smg4tnTeuIMU/J8ac/mp.5k/8aFE1UdEMw.NzVcUW2SRgm2RteBa'),
('EMP-049', 'Kavitha', 'Ravindran', 'kavitha.ravindran@company.com', 4, (SELECT id FROM (SELECT id FROM employees WHERE employee_code = 'EMP-014') AS mgr_lookup), 'Warehouse Supervisor', 'kravindran', '$2b$10$0Smg4tnTeuIMU/J8ac/mp.5k/8aFE1UdEMw.NzVcUW2SRgm2RteBa'),
('EMP-050', 'Naresh', 'Pillai', 'naresh.pillai@company.com', 4, (SELECT id FROM (SELECT id FROM employees WHERE employee_code = 'EMP-014') AS mgr_lookup), 'Supply Chain Analyst', 'npillai', '$2b$10$0Smg4tnTeuIMU/J8ac/mp.5k/8aFE1UdEMw.NzVcUW2SRgm2RteBa'),
('EMP-051', 'Anusha', 'Vijay', 'anusha.vijay@company.com', 4, (SELECT id FROM (SELECT id FROM employees WHERE employee_code = 'EMP-014') AS mgr_lookup), 'Procurement Coordinator', 'avijay', '$2b$10$0Smg4tnTeuIMU/J8ac/mp.5k/8aFE1UdEMw.NzVcUW2SRgm2RteBa'),
('EMP-052', 'Ramesh', 'Subbiah', 'ramesh.subbiah@company.com', 4, (SELECT id FROM (SELECT id FROM employees WHERE employee_code = 'EMP-014') AS mgr_lookup), 'Facilities Executive', 'rsubbiah', '$2b$10$0Smg4tnTeuIMU/J8ac/mp.5k/8aFE1UdEMw.NzVcUW2SRgm2RteBa'),
('EMP-053', 'Sowmya', 'Narayan', 'sowmya.narayan@company.com', 4, (SELECT id FROM (SELECT id FROM employees WHERE employee_code = 'EMP-014') AS mgr_lookup), 'Vendor Coordinator', 'snarayan', '$2b$10$0Smg4tnTeuIMU/J8ac/mp.5k/8aFE1UdEMw.NzVcUW2SRgm2RteBa'),
('EMP-054', 'Tarun', 'Malhotra', 'tarun.malhotra@company.com', 4, (SELECT id FROM (SELECT id FROM employees WHERE employee_code = 'EMP-014') AS mgr_lookup), 'Operations Analyst', 'tmalhotra', '$2b$10$0Smg4tnTeuIMU/J8ac/mp.5k/8aFE1UdEMw.NzVcUW2SRgm2RteBa'),
('EMP-055', 'Geetha', 'Ilangovan', 'geetha.ilangovan@company.com', 4, (SELECT id FROM (SELECT id FROM employees WHERE employee_code = 'EMP-014') AS mgr_lookup), 'Quality Control Executive', 'gilangovan', '$2b$10$0Smg4tnTeuIMU/J8ac/mp.5k/8aFE1UdEMw.NzVcUW2SRgm2RteBa');

-- Every new employee gets the plain EMPLOYEE role
INSERT INTO user_roles (employee_id, role_id)
SELECT (SELECT id FROM employees WHERE employee_code = 'EMP-016'), (SELECT id FROM roles WHERE name = 'EMPLOYEE');
INSERT INTO user_roles (employee_id, role_id)
SELECT (SELECT id FROM employees WHERE employee_code = 'EMP-017'), (SELECT id FROM roles WHERE name = 'EMPLOYEE');
INSERT INTO user_roles (employee_id, role_id)
SELECT (SELECT id FROM employees WHERE employee_code = 'EMP-018'), (SELECT id FROM roles WHERE name = 'EMPLOYEE');
INSERT INTO user_roles (employee_id, role_id)
SELECT (SELECT id FROM employees WHERE employee_code = 'EMP-019'), (SELECT id FROM roles WHERE name = 'EMPLOYEE');
INSERT INTO user_roles (employee_id, role_id)
SELECT (SELECT id FROM employees WHERE employee_code = 'EMP-020'), (SELECT id FROM roles WHERE name = 'EMPLOYEE');
INSERT INTO user_roles (employee_id, role_id)
SELECT (SELECT id FROM employees WHERE employee_code = 'EMP-021'), (SELECT id FROM roles WHERE name = 'EMPLOYEE');
INSERT INTO user_roles (employee_id, role_id)
SELECT (SELECT id FROM employees WHERE employee_code = 'EMP-022'), (SELECT id FROM roles WHERE name = 'EMPLOYEE');
INSERT INTO user_roles (employee_id, role_id)
SELECT (SELECT id FROM employees WHERE employee_code = 'EMP-023'), (SELECT id FROM roles WHERE name = 'EMPLOYEE');
INSERT INTO user_roles (employee_id, role_id)
SELECT (SELECT id FROM employees WHERE employee_code = 'EMP-024'), (SELECT id FROM roles WHERE name = 'EMPLOYEE');
INSERT INTO user_roles (employee_id, role_id)
SELECT (SELECT id FROM employees WHERE employee_code = 'EMP-025'), (SELECT id FROM roles WHERE name = 'EMPLOYEE');
INSERT INTO user_roles (employee_id, role_id)
SELECT (SELECT id FROM employees WHERE employee_code = 'EMP-026'), (SELECT id FROM roles WHERE name = 'EMPLOYEE');
INSERT INTO user_roles (employee_id, role_id)
SELECT (SELECT id FROM employees WHERE employee_code = 'EMP-027'), (SELECT id FROM roles WHERE name = 'EMPLOYEE');
INSERT INTO user_roles (employee_id, role_id)
SELECT (SELECT id FROM employees WHERE employee_code = 'EMP-028'), (SELECT id FROM roles WHERE name = 'EMPLOYEE');
INSERT INTO user_roles (employee_id, role_id)
SELECT (SELECT id FROM employees WHERE employee_code = 'EMP-029'), (SELECT id FROM roles WHERE name = 'EMPLOYEE');
INSERT INTO user_roles (employee_id, role_id)
SELECT (SELECT id FROM employees WHERE employee_code = 'EMP-030'), (SELECT id FROM roles WHERE name = 'EMPLOYEE');
INSERT INTO user_roles (employee_id, role_id)
SELECT (SELECT id FROM employees WHERE employee_code = 'EMP-031'), (SELECT id FROM roles WHERE name = 'EMPLOYEE');
INSERT INTO user_roles (employee_id, role_id)
SELECT (SELECT id FROM employees WHERE employee_code = 'EMP-032'), (SELECT id FROM roles WHERE name = 'EMPLOYEE');
INSERT INTO user_roles (employee_id, role_id)
SELECT (SELECT id FROM employees WHERE employee_code = 'EMP-033'), (SELECT id FROM roles WHERE name = 'EMPLOYEE');
INSERT INTO user_roles (employee_id, role_id)
SELECT (SELECT id FROM employees WHERE employee_code = 'EMP-034'), (SELECT id FROM roles WHERE name = 'EMPLOYEE');
INSERT INTO user_roles (employee_id, role_id)
SELECT (SELECT id FROM employees WHERE employee_code = 'EMP-035'), (SELECT id FROM roles WHERE name = 'EMPLOYEE');
INSERT INTO user_roles (employee_id, role_id)
SELECT (SELECT id FROM employees WHERE employee_code = 'EMP-036'), (SELECT id FROM roles WHERE name = 'EMPLOYEE');
INSERT INTO user_roles (employee_id, role_id)
SELECT (SELECT id FROM employees WHERE employee_code = 'EMP-037'), (SELECT id FROM roles WHERE name = 'EMPLOYEE');
INSERT INTO user_roles (employee_id, role_id)
SELECT (SELECT id FROM employees WHERE employee_code = 'EMP-038'), (SELECT id FROM roles WHERE name = 'EMPLOYEE');
INSERT INTO user_roles (employee_id, role_id)
SELECT (SELECT id FROM employees WHERE employee_code = 'EMP-039'), (SELECT id FROM roles WHERE name = 'EMPLOYEE');
INSERT INTO user_roles (employee_id, role_id)
SELECT (SELECT id FROM employees WHERE employee_code = 'EMP-040'), (SELECT id FROM roles WHERE name = 'EMPLOYEE');
INSERT INTO user_roles (employee_id, role_id)
SELECT (SELECT id FROM employees WHERE employee_code = 'EMP-041'), (SELECT id FROM roles WHERE name = 'EMPLOYEE');
INSERT INTO user_roles (employee_id, role_id)
SELECT (SELECT id FROM employees WHERE employee_code = 'EMP-042'), (SELECT id FROM roles WHERE name = 'EMPLOYEE');
INSERT INTO user_roles (employee_id, role_id)
SELECT (SELECT id FROM employees WHERE employee_code = 'EMP-043'), (SELECT id FROM roles WHERE name = 'EMPLOYEE');
INSERT INTO user_roles (employee_id, role_id)
SELECT (SELECT id FROM employees WHERE employee_code = 'EMP-044'), (SELECT id FROM roles WHERE name = 'EMPLOYEE');
INSERT INTO user_roles (employee_id, role_id)
SELECT (SELECT id FROM employees WHERE employee_code = 'EMP-045'), (SELECT id FROM roles WHERE name = 'EMPLOYEE');
INSERT INTO user_roles (employee_id, role_id)
SELECT (SELECT id FROM employees WHERE employee_code = 'EMP-046'), (SELECT id FROM roles WHERE name = 'EMPLOYEE');
INSERT INTO user_roles (employee_id, role_id)
SELECT (SELECT id FROM employees WHERE employee_code = 'EMP-047'), (SELECT id FROM roles WHERE name = 'EMPLOYEE');
INSERT INTO user_roles (employee_id, role_id)
SELECT (SELECT id FROM employees WHERE employee_code = 'EMP-048'), (SELECT id FROM roles WHERE name = 'EMPLOYEE');
INSERT INTO user_roles (employee_id, role_id)
SELECT (SELECT id FROM employees WHERE employee_code = 'EMP-049'), (SELECT id FROM roles WHERE name = 'EMPLOYEE');
INSERT INTO user_roles (employee_id, role_id)
SELECT (SELECT id FROM employees WHERE employee_code = 'EMP-050'), (SELECT id FROM roles WHERE name = 'EMPLOYEE');
INSERT INTO user_roles (employee_id, role_id)
SELECT (SELECT id FROM employees WHERE employee_code = 'EMP-051'), (SELECT id FROM roles WHERE name = 'EMPLOYEE');
INSERT INTO user_roles (employee_id, role_id)
SELECT (SELECT id FROM employees WHERE employee_code = 'EMP-052'), (SELECT id FROM roles WHERE name = 'EMPLOYEE');
INSERT INTO user_roles (employee_id, role_id)
SELECT (SELECT id FROM employees WHERE employee_code = 'EMP-053'), (SELECT id FROM roles WHERE name = 'EMPLOYEE');
INSERT INTO user_roles (employee_id, role_id)
SELECT (SELECT id FROM employees WHERE employee_code = 'EMP-054'), (SELECT id FROM roles WHERE name = 'EMPLOYEE');
INSERT INTO user_roles (employee_id, role_id)
SELECT (SELECT id FROM employees WHERE employee_code = 'EMP-055'), (SELECT id FROM roles WHERE name = 'EMPLOYEE');
