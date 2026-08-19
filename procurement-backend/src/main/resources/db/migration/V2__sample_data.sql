-- ============================================================
-- Sample data for local dev / demo purposes
-- ============================================================

-- Departments
INSERT INTO departments (name, code) VALUES
('Information Technology', 'IT'),
('Finance', 'FIN'),
('Human Resources', 'HR'),
('Operations', 'OPS');

-- Cost Centers
INSERT INTO cost_centers (department_id, name, code) VALUES
(1, 'IT Infrastructure', 'CC-IT-01'),
(1, 'IT Software Licensing', 'CC-IT-02'),
(2, 'Finance Operations', 'CC-FIN-01'),
(3, 'HR General', 'CC-HR-01'),
(4, 'Plant Operations', 'CC-OPS-01');

-- Procurement Categories
INSERT INTO procurement_categories (name, code, description) VALUES
('IT Hardware', 'CAT-HW', 'Laptops, servers, networking equipment'),
('Software Licenses', 'CAT-SW', 'SaaS subscriptions and perpetual licenses'),
('Office Supplies', 'CAT-OFF', 'Stationery and general office consumables'),
('Professional Services', 'CAT-SVC', 'Consulting, contractor and vendor services');

-- Suppliers
INSERT INTO suppliers (name, supplier_code, tax_id, status, payment_terms, rating) VALUES
('Dell Technologies India', 'SUP-001', 'GSTIN29AAACD1234', 'ACTIVE', 'Net 30', 4.5),
('Microsoft India Pvt Ltd', 'SUP-002', 'GSTIN29AAACM5678', 'ACTIVE', 'Net 45', 4.8),
('OfficeMart Supplies', 'SUP-003', 'GSTIN29AAACO9012', 'ACTIVE', 'Net 15', 4.0),
('Zeal Consulting Services', 'SUP-004', 'GSTIN29AAACZ3456', 'INACTIVE', 'Net 30', 3.5);

-- Supplier Contacts
INSERT INTO supplier_contacts (supplier_id, contact_name, email, phone, is_primary) VALUES
(1, 'Ramesh Iyer', 'ramesh.iyer@dell-sales.com', '9840012345', TRUE),
(2, 'Priya Nair', 'priya.nair@microsoft-partner.com', '9840056789', TRUE),
(3, 'Suresh Kumar', 'suresh@officemart.in', '9840098765', TRUE),
(4, 'Anitha Raj', 'anitha@zealconsult.in', '9840011223', TRUE);

-- Employees (manager_id self-referencing; CEO has no manager)
INSERT INTO employees (employee_code, first_name, last_name, email, department_id, manager_id, designation) VALUES
('EMP-001', 'Arun', 'Krishnan', 'arun.krishnan@company.com', 1, NULL, 'CTO'),
('EMP-002', 'Santhosh', 'Kumar', 'santhosh.kumar@company.com', 1, 1, 'Software Developer'),
('EMP-003', 'Divya', 'Menon', 'divya.menon@company.com', 2, NULL, 'CFO'),
('EMP-004', 'Karthik', 'Rajan', 'karthik.rajan@company.com', 2, 3, 'Finance Manager'),
('EMP-005', 'Lakshmi', 'Prasad', 'lakshmi.prasad@company.com', 3, NULL, 'HR Manager'),
('EMP-006', 'Vignesh', 'Babu', 'vignesh.babu@company.com', 4, NULL, 'Procurement Officer');

-- Roles
INSERT INTO roles (name, description) VALUES
('EMPLOYEE', 'Can raise requisitions'),
('DEPT_APPROVER', 'Approves requisitions for their department'),
('FINANCE_APPROVER', 'Approves requisitions above finance threshold'),
('PROCUREMENT_OFFICER', 'Converts approved requisitions into purchase orders'),
('ADMIN', 'Full system access, manages master data and rules');

-- User Roles
INSERT INTO user_roles (employee_id, role_id) VALUES
(2, 1), -- Santhosh: EMPLOYEE
(1, 2), -- Arun: DEPT_APPROVER
(4, 3), -- Karthik: FINANCE_APPROVER
(3, 3), -- Divya: FINANCE_APPROVER
(6, 4), -- Vignesh: PROCUREMENT_OFFICER
(6, 5); -- Vignesh: ADMIN

-- Approval Hierarchy Rules (amount-based, some category-specific)
-- Rule 1: small purchases (any dept/category) up to 25,000 -> 1 level (dept approver)
INSERT INTO approval_hierarchy_rules (category_id, department_id, min_amount, max_amount, approval_levels_required, is_active) VALUES
(NULL, NULL, 0.00, 25000.00, 1, TRUE),
(NULL, NULL, 25000.01, 200000.00, 2, TRUE),
(NULL, NULL, 200000.01, 99999999.99, 3, TRUE);

-- Approval Levels for each rule
INSERT INTO approval_levels (rule_id, level_number, approver_role_id) VALUES
(1, 1, 2), -- Rule 1: level 1 -> DEPT_APPROVER
(2, 1, 2), -- Rule 2: level 1 -> DEPT_APPROVER
(2, 2, 3), -- Rule 2: level 2 -> FINANCE_APPROVER
(3, 1, 2), -- Rule 3: level 1 -> DEPT_APPROVER
(3, 2, 3), -- Rule 3: level 2 -> FINANCE_APPROVER
(3, 3, 5); -- Rule 3: level 3 -> ADMIN (executive sign-off)

-- Sample Purchase Requisition (mid-range amount -> triggers Rule 2, 2 levels)
INSERT INTO purchase_requisitions
(requisition_number, requested_by, department_id, cost_center_id, category_id, status, total_amount, justification, applied_rule_id, current_approval_level)
VALUES
('REQ-2026-0001', 2, 1, 1, 1, 'IN_APPROVAL', 85000.00, 'New laptops for onboarding batch', 2, 1);

INSERT INTO requisition_line_items (requisition_id, item_description, quantity, unit_price, line_total, category_id) VALUES
(1, 'Dell Latitude 5440 Laptop', 5, 17000.00, 85000.00, 1);

INSERT INTO requisition_approvals (requisition_id, level_number, approver_id, action, comments, action_date) VALUES
(1, 1, 1, 'APPROVED', 'Looks good, within budget', NOW()),
(1, 2, 4, 'PENDING', NULL, NULL);

INSERT INTO requisition_status_history (requisition_id, old_status, new_status, changed_by, remarks) VALUES
(1, 'DRAFT', 'SUBMITTED', 2, 'Submitted for approval'),
(1, 'SUBMITTED', 'IN_APPROVAL', 1, 'Dept approver approved, routed to finance');

-- A fully approved + converted requisition, with a live PO
INSERT INTO purchase_requisitions
(requisition_number, requested_by, department_id, cost_center_id, category_id, status, total_amount, justification, applied_rule_id, current_approval_level)
VALUES
('REQ-2026-0002', 2, 1, 2, 2, 'CONVERTED_TO_PO', 18000.00, 'Annual O365 license renewal', 1, 1);

INSERT INTO requisition_line_items (requisition_id, item_description, quantity, unit_price, line_total, category_id) VALUES
(2, 'Microsoft 365 E3 License (annual)', 10, 1800.00, 18000.00, 2);

INSERT INTO requisition_approvals (requisition_id, level_number, approver_id, action, comments, action_date) VALUES
(2, 1, 1, 'APPROVED', 'Renewal, approved', NOW());

INSERT INTO requisition_status_history (requisition_id, old_status, new_status, changed_by, remarks) VALUES
(2, 'DRAFT', 'SUBMITTED', 2, 'Submitted'),
(2, 'SUBMITTED', 'APPROVED', 1, 'Approved by dept head'),
(2, 'APPROVED', 'CONVERTED_TO_PO', 6, 'PO raised against Microsoft');

INSERT INTO purchase_orders (po_number, requisition_id, supplier_id, status, total_amount, expected_delivery_date, created_by) VALUES
('PO-2026-0001', 2, 2, 'PARTIALLY_FULFILLED', 18000.00, '2026-08-15', 6);

INSERT INTO purchase_order_line_items (po_id, requisition_line_item_id, item_description, quantity_ordered, quantity_received, unit_price, line_total) VALUES
(1, 2, 'Microsoft 365 E3 License (annual)', 10, 6, 1800.00, 18000.00);

INSERT INTO po_status_history (po_id, old_status, new_status, changed_by, remarks) VALUES
(1, 'CREATED', 'SENT', 6, 'Sent to Microsoft partner portal'),
(1, 'SENT', 'ACKNOWLEDGED', 6, 'Supplier acknowledged'),
(1, 'ACKNOWLEDGED', 'PARTIALLY_FULFILLED', 6, '6 of 10 licenses provisioned');

INSERT INTO goods_receipts (po_id, receipt_number, received_by, received_date, remarks) VALUES
(1, 'GRN-2026-0001', 6, '2026-07-20', 'First batch of licenses provisioned');

INSERT INTO goods_receipt_line_items (goods_receipt_id, po_line_item_id, quantity_received, condition_notes) VALUES
(1, 1, 6, 'Provisioned and verified in admin console');

-- Budget Allocations
INSERT INTO budget_allocations (department_id, cost_center_id, fiscal_year, category_id, allocated_amount, consumed_amount) VALUES
(1, 1, 2026, 1, 1000000.00, 85000.00),
(1, 2, 2026, 2, 500000.00, 18000.00),
(2, 3, 2026, NULL, 300000.00, 0.00);

-- Spend Summary (pre-aggregated snapshot for reporting)
INSERT INTO spend_summary (department_id, category_id, fiscal_year, fiscal_month, total_spend, po_count) VALUES
(1, 2, 2026, 7, 18000.00, 1);

-- Audit Log samples
INSERT INTO audit_log (entity_name, entity_id, action, performed_by, old_value, new_value, ip_address) VALUES
('purchase_requisitions', 1, 'CREATE', 2, NULL, 'status=DRAFT', '10.0.0.12'),
('purchase_requisitions', 1, 'APPROVE', 1, 'status=SUBMITTED', 'status=IN_APPROVAL', '10.0.0.15'),
('purchase_orders', 1, 'CREATE', 6, NULL, 'status=CREATED', '10.0.0.20');
