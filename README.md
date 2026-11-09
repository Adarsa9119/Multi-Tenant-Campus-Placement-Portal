# Multi-Tenant Campus Placement & Recruitment Portal

A secure, multi-tenant campus placement platform built **only with MERN** (MongoDB, Express.js, React.js, Node.js). Multiple colleges share one application; every college is a **tenant** with isolated data. Companies are verified, recruiters are separately authorized, resumes are protected, every sensitive action is audited and every login requires an **email OTP** (SMTP).

> AI/ML is intentionally not used. Eligibility, authorization and workflow rules are deterministic backend business logic.

## Roles
| Role | Scope |
|---|---|
| Super Admin | Platform: college approval, tenants, TPOs, company verification, recruiter security, audit, alerts, settings |
| TPO | One college tenant: students, verification, company/recruiter approval, drives, eligibility, applications, offers, reports |
| Recruiter | One company: only authorized colleges → drives → candidates. Company admin also manages team and college requests |
| Student | Own profile in one tenant: resume, eligible drives, applications, offers |

## Quick start
Prerequisites: Node 18+, MongoDB running locally (or an Atlas URI).

```bash
# 1. install
npm run install:all

# 2. configure
cp backend/.env.example backend/.env        # set MONGO_URI and JWT_SECRET; set SMTP for email OTP
cp frontend/.env.example frontend/.env

# 3. demo data (wipes the configured database!)
npm run seed

# 4. run (two terminals)
npm run dev:backend      # http://localhost:5000
npm run dev:frontend     # http://localhost:5173
```

### Demo accounts

The seed script creates these accounts using `SEED_DEMO_PASSWORD` from `backend/.env` (the example configuration uses `Demo@12345`). Select the matching role on the login page. The full demo seed deletes existing application data; to create or reset only the Super Admin while preserving all other records, run `npm --prefix backend run seed:admin`.

| Role | Email |
|---|---|
| Super Admin | padhuncmrwf@gmail.com |
| TPO (TEN001) | tpo1@abc.edu.in |
| TPO (TEN002) | tpo2@greenfield.edu.in |
| Student (verified, eligible) | rahul.student@abc.edu.in |
| Student (low CGPA, ineligible) | karan@abc.edu.in |
| Recruiter – company admin (authorized) | rahul.mehta@abctech.com |
| Recruiter (authorized) | priya@abctech.com |
| Recruiter (suspended) | amit@abctech.com |
| Recruiter (not authorized) | neha@abctech.com |

**OTP email delivery:** Configure a working SMTP server in `backend/.env` (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`) before requesting OTPs. OTPs are sent to the exact registered email address for each role, including college TPOs, students, recruiters, and Super Admins. If SMTP is missing or delivery fails, the request reports an error; codes are never printed to the local console. Production startup also requires a separate random `OTP_PEPPER`.

## Tests
```bash
npm test      # Jest + Supertest + in-memory MongoDB (downloads a MongoDB binary on first run)
```
Covers authentication/OTP, RBAC, tenant isolation, object-ID manipulation, recruiter least privilege, resume protection, eligibility, application workflow, suspension and security alerts.

## Documentation
See `docs/`: architecture, database schema, API, security model, workflows, deployment, testing, panel defense.

## Project layout
```
backend/   Express API (config, constants, models, controllers, services, middleware, validators, routes, utils, seeds, tests)
frontend/  React (Vite) app (api, auth, routes, layouts, pages per role, components, hooks, utils, styles)
docs/      Project documentation
```
