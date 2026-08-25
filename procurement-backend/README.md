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
