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
