# Architecture

Modular monolith: one React SPA, one Node.js/Express API, one MongoDB database. No microservices.

```
Browser → React (Vite) → HTTPS/REST → Express
  Express pipeline: helmet · CORS · JSON · mongo-sanitize · rate limit
    → authenticate (JWT + live account/tenant status check)
    → authorizeRole (RBAC)
    → tenantContext / authorizeTenant (tenant isolation)
    → authorizeResource / authorizeRecruiter (resource-level authorization)
    → validators → controllers → services (business rules) → Mongoose models → MongoDB
  Side services: audit log, security alerts, notifications, OTP mail (SMTP), protected file storage
```

## Layers
- **routes** declare the middleware chain per endpoint; **controllers** are one-line adapters (`handle()`); **services** hold all business rules.
- Tenant identity is derived from the authenticated user (`req.user.tenantId`); body/query `tenantId`, `role`, `userId`, `companyId` are stripped on tenant-bound routes.
- Recruiter access is evaluated in `recruiterAuthorizationService` (single source of truth).
- Dashboards return a normalized JSON shape rendered by one React `DashboardView`; list pages use one config-driven `ResourcePage`.

## Frontend
Role layouts (`AdminLayout`, `TpoLayout`, `RecruiterLayout`, `StudentLayout`) share a `Shell` (sidebar + top bar). Route guards (`ProtectedRoute`, `RoleRoute`, `TenantRoute`) are UX only; the API enforces everything.

## Protected files
Resumes are stored under `UPLOAD_DIR/<tenantId>/<random>.<ext>` (mode 0600), outside any static path, and streamed only through authorized endpoints with `Cache-Control: private, no-store`.
