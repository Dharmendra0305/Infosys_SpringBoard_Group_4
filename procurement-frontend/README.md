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
