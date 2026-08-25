-- ============================================================
-- Enterprise Procurement System - Initial Schema (22 tables)
-- Flyway Migration V1
-- Module 1: Master Data (7)  | Module 2: Workflow (5)
-- Module 3: Purchase Orders (5) | Module 4: Analytics (2)
-- Module 5: Security & Governance (3)
-- ============================================================

-- ===================== MODULE 1: MASTER DATA =====================

CREATE TABLE departments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(20) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cost_centers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    department_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cc_department FOREIGN KEY (department_id) REFERENCES departments(id)
);

CREATE TABLE procurement_categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(20) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE suppliers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    supplier_code VARCHAR(30) NOT NULL UNIQUE,
    tax_id VARCHAR(50),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    payment_terms VARCHAR(100),
    rating DECIMAL(2,1) DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_supplier_status CHECK (status IN ('ACTIVE','INACTIVE','BLACKLISTED'))
);

CREATE TABLE supplier_contacts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    supplier_id BIGINT NOT NULL,
    contact_name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(30),
    is_primary BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_contact_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE
);

CREATE TABLE employees (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_code VARCHAR(20) NOT NULL UNIQUE,
    first_name VARCHAR(60) NOT NULL,
    last_name VARCHAR(60) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    department_id BIGINT NOT NULL,
    manager_id BIGINT,
    designation VARCHAR(80),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_emp_department FOREIGN KEY (department_id) REFERENCES departments(id),
    CONSTRAINT fk_emp_manager FOREIGN KEY (manager_id) REFERENCES employees(id)
);

CREATE TABLE approval_hierarchy_rules (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    category_id BIGINT,
    department_id BIGINT,
    min_amount DECIMAL(14,2) NOT NULL,
    max_amount DECIMAL(14,2) NOT NULL,
    approval_levels_required INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_rule_category FOREIGN KEY (category_id) REFERENCES procurement_categories(id),
    CONSTRAINT fk_rule_department FOREIGN KEY (department_id) REFERENCES departments(id)
);

-- ===================== MODULE 5 (roles referenced by approval_levels) =====================

CREATE TABLE roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255)
);

CREATE TABLE approval_levels (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    rule_id BIGINT NOT NULL,
    level_number INT NOT NULL,
    approver_role_id BIGINT NOT NULL,
    CONSTRAINT fk_level_rule FOREIGN KEY (rule_id) REFERENCES approval_hierarchy_rules(id) ON DELETE CASCADE,
    CONSTRAINT fk_level_role FOREIGN KEY (approver_role_id) REFERENCES roles(id),
    CONSTRAINT uq_rule_level UNIQUE (rule_id, level_number)
);

-- ===================== MODULE 5: continued =====================

CREATE TABLE user_roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    CONSTRAINT fk_ur_employee FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    CONSTRAINT fk_ur_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    CONSTRAINT uq_employee_role UNIQUE (employee_id, role_id)
);

CREATE TABLE audit_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    entity_name VARCHAR(60) NOT NULL,
    entity_id BIGINT NOT NULL,
    action VARCHAR(30) NOT NULL,
    performed_by BIGINT,
    performed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    old_value TEXT,
    new_value TEXT,
    ip_address VARCHAR(45),
    CONSTRAINT fk_audit_employee FOREIGN KEY (performed_by) REFERENCES employees(id)
);

-- ===================== MODULE 2: PROCUREMENT WORKFLOW =====================

CREATE TABLE purchase_requisitions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    requisition_number VARCHAR(30) NOT NULL UNIQUE,
    requested_by BIGINT NOT NULL,
    department_id BIGINT NOT NULL,
    cost_center_id BIGINT NOT NULL,
    category_id BIGINT NOT NULL,
    status VARCHAR(25) NOT NULL DEFAULT 'DRAFT',
    total_amount DECIMAL(14,2) NOT NULL DEFAULT 0,
    justification VARCHAR(500),
    applied_rule_id BIGINT,
    current_approval_level INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_req_employee FOREIGN KEY (requested_by) REFERENCES employees(id),
    CONSTRAINT fk_req_department FOREIGN KEY (department_id) REFERENCES departments(id),
    CONSTRAINT fk_req_costcenter FOREIGN KEY (cost_center_id) REFERENCES cost_centers(id),
    CONSTRAINT fk_req_category FOREIGN KEY (category_id) REFERENCES procurement_categories(id),
    CONSTRAINT fk_req_rule FOREIGN KEY (applied_rule_id) REFERENCES approval_hierarchy_rules(id),
    CONSTRAINT chk_req_status CHECK (status IN ('DRAFT','SUBMITTED','IN_APPROVAL','APPROVED','REJECTED','CANCELLED','CONVERTED_TO_PO'))
);

CREATE TABLE requisition_line_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    requisition_id BIGINT NOT NULL,
    item_description VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(14,2) NOT NULL,
    line_total DECIMAL(14,2) NOT NULL,
    category_id BIGINT NOT NULL,
    CONSTRAINT fk_rli_requisition FOREIGN KEY (requisition_id) REFERENCES purchase_requisitions(id) ON DELETE CASCADE,
    CONSTRAINT fk_rli_category FOREIGN KEY (category_id) REFERENCES procurement_categories(id)
);

CREATE TABLE requisition_approvals (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    requisition_id BIGINT NOT NULL,
    level_number INT NOT NULL,
    approver_id BIGINT NOT NULL,
    action VARCHAR(15) NOT NULL DEFAULT 'PENDING',
    comments VARCHAR(500),
    action_date TIMESTAMP,
    CONSTRAINT fk_ra_requisition FOREIGN KEY (requisition_id) REFERENCES purchase_requisitions(id) ON DELETE CASCADE,
    CONSTRAINT fk_ra_approver FOREIGN KEY (approver_id) REFERENCES employees(id),
    CONSTRAINT chk_ra_action CHECK (action IN ('PENDING','APPROVED','REJECTED'))
);

CREATE TABLE requisition_status_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    requisition_id BIGINT NOT NULL,
    old_status VARCHAR(25),
    new_status VARCHAR(25) NOT NULL,
    changed_by BIGINT,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    remarks VARCHAR(255),
    CONSTRAINT fk_rsh_requisition FOREIGN KEY (requisition_id) REFERENCES purchase_requisitions(id) ON DELETE CASCADE,
    CONSTRAINT fk_rsh_employee FOREIGN KEY (changed_by) REFERENCES employees(id)
);

-- ===================== MODULE 3: PURCHASE ORDER MANAGEMENT =====================

CREATE TABLE purchase_orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    po_number VARCHAR(30) NOT NULL UNIQUE,
    requisition_id BIGINT NOT NULL,
    supplier_id BIGINT NOT NULL,
    status VARCHAR(25) NOT NULL DEFAULT 'CREATED',
    total_amount DECIMAL(14,2) NOT NULL DEFAULT 0,
    expected_delivery_date DATE,
    created_by BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_po_requisition FOREIGN KEY (requisition_id) REFERENCES purchase_requisitions(id),
    CONSTRAINT fk_po_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
    CONSTRAINT fk_po_employee FOREIGN KEY (created_by) REFERENCES employees(id),
    CONSTRAINT chk_po_status CHECK (status IN ('CREATED','SENT','ACKNOWLEDGED','PARTIALLY_FULFILLED','FULFILLED','CLOSED','DISPUTED','CANCELLED'))
);

CREATE TABLE purchase_order_line_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    po_id BIGINT NOT NULL,
    requisition_line_item_id BIGINT,
    item_description VARCHAR(255) NOT NULL,
    quantity_ordered INT NOT NULL,
    quantity_received INT NOT NULL DEFAULT 0,
    unit_price DECIMAL(14,2) NOT NULL,
    line_total DECIMAL(14,2) NOT NULL,
    CONSTRAINT fk_poli_po FOREIGN KEY (po_id) REFERENCES purchase_orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_poli_rli FOREIGN KEY (requisition_line_item_id) REFERENCES requisition_line_items(id)
);

CREATE TABLE po_status_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    po_id BIGINT NOT NULL,
    old_status VARCHAR(25),
    new_status VARCHAR(25) NOT NULL,
    changed_by BIGINT,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    remarks VARCHAR(255),
    CONSTRAINT fk_posh_po FOREIGN KEY (po_id) REFERENCES purchase_orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_posh_employee FOREIGN KEY (changed_by) REFERENCES employees(id)
);

CREATE TABLE goods_receipts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    po_id BIGINT NOT NULL,
    receipt_number VARCHAR(30) NOT NULL UNIQUE,
    received_by BIGINT NOT NULL,
    received_date DATE NOT NULL,
    remarks VARCHAR(255),
    CONSTRAINT fk_gr_po FOREIGN KEY (po_id) REFERENCES purchase_orders(id),
    CONSTRAINT fk_gr_employee FOREIGN KEY (received_by) REFERENCES employees(id)
);

CREATE TABLE goods_receipt_line_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    goods_receipt_id BIGINT NOT NULL,
    po_line_item_id BIGINT NOT NULL,
    quantity_received INT NOT NULL,
    condition_notes VARCHAR(255),
    CONSTRAINT fk_grli_receipt FOREIGN KEY (goods_receipt_id) REFERENCES goods_receipts(id) ON DELETE CASCADE,
    CONSTRAINT fk_grli_poline FOREIGN KEY (po_line_item_id) REFERENCES purchase_order_line_items(id)
);

-- ===================== MODULE 4: ANALYTICS & REPORTING =====================

CREATE TABLE budget_allocations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    department_id BIGINT NOT NULL,
    cost_center_id BIGINT NOT NULL,
    fiscal_year INT NOT NULL,
    category_id BIGINT,
    allocated_amount DECIMAL(14,2) NOT NULL,
    consumed_amount DECIMAL(14,2) NOT NULL DEFAULT 0,
    CONSTRAINT fk_budget_department FOREIGN KEY (department_id) REFERENCES departments(id),
    CONSTRAINT fk_budget_costcenter FOREIGN KEY (cost_center_id) REFERENCES cost_centers(id),
    CONSTRAINT fk_budget_category FOREIGN KEY (category_id) REFERENCES procurement_categories(id)
);

CREATE TABLE spend_summary (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    department_id BIGINT NOT NULL,
    category_id BIGINT NOT NULL,
    fiscal_year INT NOT NULL,
    fiscal_month INT NOT NULL,
    total_spend DECIMAL(14,2) NOT NULL DEFAULT 0,
    po_count INT NOT NULL DEFAULT 0,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_spend_department FOREIGN KEY (department_id) REFERENCES departments(id),
    CONSTRAINT fk_spend_category FOREIGN KEY (category_id) REFERENCES procurement_categories(id),
    CONSTRAINT uq_spend_period UNIQUE (department_id, category_id, fiscal_year, fiscal_month)
);

-- ===================== INDEXES =====================
CREATE INDEX idx_req_status ON purchase_requisitions(status);
CREATE INDEX idx_req_requested_by ON purchase_requisitions(requested_by);
CREATE INDEX idx_po_status ON purchase_orders(status);
CREATE INDEX idx_po_supplier ON purchase_orders(supplier_id);
CREATE INDEX idx_audit_entity ON audit_log(entity_name, entity_id);
