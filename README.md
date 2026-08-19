<<<<<<< HEAD
# Enterprise Procurement System

Spring Boot backend for the Enterprise Procurement System project — requisitions,
configurable approval routing, purchase orders, goods receipt, analytics, and
audit logging, mapped across the 5 modules from the project brief.

Schema is managed entirely by **Flyway** (no Hibernate auto-DDL) — 22 tables,
created and versioned as SQL migration files.

## 1. Database name

**`procurement_db`**

You do not have to create it manually — `application.properties` uses
`createDatabaseIfNotExist=true`, so MySQL will create it automatically the
first time the app connects. If you'd rather create it yourself:

```sql
CREATE DATABASE procurement_db;
```

## 2. Prerequisites

- Java 17+
- Maven 3.8+
- MySQL 8.x running locally (or update the URL in `application.properties` to point elsewhere)

## 3. Configure DB credentials

Edit `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/procurement_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=root
```

Change `username` / `password` to match your local MySQL setup.

## 4. Run it

```bash
cd enterprise-procurement-system
mvn spring-boot:run
```

On startup, Flyway automatically runs, in order:

- `V1__initial_schema.sql` — creates all 22 tables (FKs, checks, indexes)
- `V2__sample_data.sql` — inserts sample master data + two demo requisitions
  (one mid-approval, one already converted into a partially-fulfilled PO)

App comes up on **http://localhost:8080**.

To build a runnable jar instead:

```bash
mvn clean package
java -jar target/enterprise-procurement-system-1.0.0.jar
```

## 5. Adding a new migration later

Never edit `V1__initial_schema.sql` after it has run against a real database.
Add a new file instead, e.g.:

```
src/main/resources/db/migration/V3__add_supplier_rating_note.sql
```

Flyway tracks applied migrations in a `flyway_schema_history` table it creates
automatically — it only ever runs new, higher-numbered files.

## 6. Project layout

```
src/main/java/com/epsystem/
  entity/        22 JPA entities, one per table
  repository/    Spring Data JPA repositories (one per entity)
  service/       Business logic:
                   RequisitionService     – Module 2 (approval routing engine)
                   PurchaseOrderService   – Module 3 (PO lifecycle, receiving)
  controller/    REST endpoints:
                   MasterDataController   – Module 1 (departments, cost centers,
                                             categories, suppliers)
                   RequisitionController  – Module 2
                   PurchaseOrderController– Module 3
                   ReportingController    – Module 4 (spend summary, budgets)
                   GovernanceController   – Module 5 (roles, audit trail)
  dto/           Request payloads (RequisitionRequest, ApprovalActionRequest)
src/main/resources/
  application.properties
  db/migration/
    V1__initial_schema.sql
    V2__sample_data.sql
```

## 7. The 22 tables

| Module | Tables |
|---|---|
| 1. Master Data | departments, cost_centers, procurement_categories, suppliers, supplier_contacts, approval_hierarchy_rules, approval_levels |
| 2. Workflow | employees, purchase_requisitions, requisition_line_items, requisition_approvals, requisition_status_history |
| 3. Purchase Orders | purchase_orders, purchase_order_line_items, po_status_history, goods_receipts, goods_receipt_line_items |
| 4. Analytics | budget_allocations, spend_summary |
| 5. Security & Governance | roles, user_roles, audit_log |

`employees` and `roles` sit in Module 1/5 conceptually but are created early
in the migration because other tables (approval rules, requisitions) reference
them via foreign keys.

## 8. How the approval engine works (Module 2)

Nothing is hardcoded. `approval_hierarchy_rules` holds amount ranges
(`min_amount`–`max_amount`), optionally scoped to a `category_id` and/or
`department_id`. Each rule has one or more rows in `approval_levels`
(`level_number` → `approver_role_id`).

When a requisition is submitted:
1. `RequisitionService` computes the total and finds the matching rule
   (most specific — category+department — wins over a generic rule).
2. It seeds one `PENDING` row per level in `requisition_approvals`.
3. Approving a level advances `current_approval_level`; approving the last
   level sets the requisition to `APPROVED`. Rejecting at any level sets it
   straight to `REJECTED`.

**If finance changes a threshold next quarter, it's a row update in
`approval_hierarchy_rules` — zero code changes**, exactly per the brief's
Milestone 2 checkpoint.

## 9. Try it (sample curl calls)

```bash
# List departments
curl http://localhost:8080/api/departments

# Raise a requisition
curl -X POST http://localhost:8080/api/requisitions \
  -H "Content-Type: application/json" \
  -d '{
    "requestedBy": 2, "departmentId": 1, "costCenterId": 1, "categoryId": 1,
    "justification": "New monitors for the team",
    "lineItems": [{"itemDescription":"Dell 24in Monitor","quantity":4,"unitPrice":9000,"categoryId":1}]
  }'

# Approve level 1 of requisition 3 (id from the response above)
curl -X POST http://localhost:8080/api/requisitions/3/decision \
  -H "Content-Type: application/json" \
  -d '{"approverId": 1, "action": "APPROVED", "comments": "Go ahead"}'
```
=======
<<<<<<< HEAD
# Procure — Enterprise Procurement System (Frontend)

A React SPA for the `enterprise-procurement-system` Spring Boot backend. Covers all 5 backend modules:

- **Workflow** — create requisitions, watch them move through the data-driven approval chain, approve/reject level by level
- **Purchase orders** — convert an APPROVED requisition into a PO, move it through its status lifecycle, record goods receipts
- **Master data** — departments, cost centers, categories, suppliers (view + add)
- **Reports** — spend summary and budget allocation vs. consumption
- **Governance** — roles, employees, and an audit-trail lookup by entity + record id

## Stack

Vite + React 19 + React Router. No UI kit — styling is a small custom CSS design system (`src/styles/app.css`) with tokens in `src/index.css`.

## Setup

```bash
npm install
cp .env.example .env    # adjust VITE_API_BASE_URL if your backend isn't on localhost:8080
npm run dev
```

Opens on `http://localhost:5173`.

## Connecting to the backend

The backend didn't have CORS enabled for a separate frontend origin, so a
`WebConfig` class (`src/main/java/com/epsystem/config/WebConfig.java`) was
added to the **backend** project allowing `http://localhost:5173`. Make sure
that file is present and the backend is running (`mvn spring-boot:run`) with
MySQL up before starting the frontend.

If you deploy the frontend somewhere else, update `allowedOrigins` in that
config to match your frontend's origin, and set `VITE_API_BASE_URL` in `.env`
to the deployed backend URL.

## Notes / known gaps

- There's no login/auth screen because the backend doesn't have Spring
  Security wired in yet — every screen assumes a single trusted internal
  user picking "acting as" from a dropdown of employees.
- `PurchaseRequisition` doesn't expose `createdAt` from the API (the column
  exists in the DB but isn't mapped on the entity), so the "Created" column
  shows `—` until that's added to the backend entity.
- Receiving goods asks for a raw PO line item ID since the backend doesn't
  expose PO line items as their own endpoint — worth adding
  `GET /api/purchase-orders/{id}/line-items` if this becomes a real pain
  point.
- A few backend endpoints (audit trail, employee roles) filter with
  `findAll()` in memory rather than a proper query — not a frontend issue,
  just something to watch as data grows.

## Build

```bash
npm run build
```

Outputs to `dist/`.
=======
# Enterprise Procurement Management System (EPMS)

## Overview

The Enterprise Procurement Management System (EPMS) is a full-stack web application designed to automate an organization's procurement process. The system manages purchase requisitions, configurable approval workflows, supplier management, purchase orders, and procurement reporting.

This project was developed as part of the Infosys Springboard Internship.

---

## Features

### Authentication
- Secure Login
- JWT Authentication
- Role-Based Access Control (RBAC)

### Employee
- Create Purchase Requisition
- Save Draft
- Submit Requisition
- Track Request Status
- View Approval History

### Manager
- View Pending Requests
- Approve Requests
- Reject Requests
- Return Requests for Modification

### Finance
- Budget Verification
- Financial Approval
- Spend Monitoring

### Procurement Team
- Supplier Management
- Purchase Order Creation
- Purchase Order Tracking
- Delivery Management

### Admin
- User Management
- Department Management
- Category Management
- Approval Rule Configuration
- Reports Dashboard

---

## Workflow

Employee

↓

Create Purchase Requisition

↓

Manager Approval

↓

Finance Approval

↓

Procurement Approval

↓

Purchase Order Creation

↓

Supplier Delivery

↓

Procurement Completed

---

## Tech Stack

### Frontend

- React.js
- Axios

### Backend

- Java
- Spring Boot
- Spring Security
- Spring Data JPA
- Hibernate

### Database

- MySQL

### Tools

- Maven
- Git
- GitHub
- Postman

---

## Modules

- Authentication
- User Management
- Department Management
- Supplier Management
- Category Management
- Purchase Requisition
- Approval Workflow
- Purchase Order
- Dashboard
- Reports
- Audit Logs

---

## Database

Main Tables

- Users
- Roles
- Departments
- Cost Centers
- Categories
- Suppliers
- Approval Rules
- Purchase Requisitions
- Requisition Items
- Approvals
- Purchase Orders
- Purchase Order Items
- Goods Receipts
- Audit Logs

---

## Future Enhancements

- Email Notifications
- ERP Integration
- AI-Based Supplier Recommendation
- Invoice Management
- Mobile Application
- Analytics Dashboard

---

## Author


>>>>>>> 1c24ddb6f51e68ecd3fb2c71f01ef7bc8608884b
>>>>>>> 84c3c7152daa07aa8c12e45f62446ff4759542e3
