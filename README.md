# Multi-Tenant Campus Placement & Recruitment Portal

A secure, multi-tenant campus placement platform built **only with the MERN stack** (MongoDB, Express.js, React.js, Node.js). Multiple colleges share one application; every college is a **tenant** with isolated data. Companies are verified, recruiters are separately authorized, resumes are protected, every sensitive action is audited, and every login requires an **email OTP** (SMTP).

> AI/ML is intentionally not used. Eligibility, authorization, and workflow rules are deterministic backend business logic.

## Roles

| Role | Scope |
|---|---|
| Super Admin | Platform: college approval, tenants, TPOs, company verification, recruiter security, audit, alerts, settings |
| TPO | One college tenant: students, verification, company/recruiter approval, drives, eligibility, applications, offers, reports |
| Recruiter | One company: only authorized colleges → drives → candidates. Company admin also manages team and college requests |
| Student | Own profile in one tenant: resume, eligible drives, applications, offers |

## Quick Start

### Prerequisites

- Node.js 18 or later
- npm (installed with Node.js)
- MongoDB running locally or a MongoDB Atlas connection
- A working SMTP account for email OTP delivery

### 1. Install dependencies

From the project root directory, run:

```bash
npm run install:all
```

This installs the dependencies required by the backend and frontend.

### 2. Configure environment variables

Create the backend and frontend environment files by copying the example files:

**Windows PowerShell:**

```powershell
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env
```

**Linux / macOS / Git Bash:**

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Configure the required values in `backend/.env`:

- `MONGO_URI` – MongoDB connection string.
- `JWT_SECRET` – A long, randomly generated secret used for JWT authentication.
- `OTP_PEPPER` – A separate, long, randomly generated secret for OTP security.
- `SMTP_HOST` – SMTP server hostname.
- `SMTP_PORT` – SMTP server port.
- `SMTP_SECURE` – SMTP TLS setting.
- `SMTP_USER` – SMTP username.
- `SMTP_PASS` – SMTP password or app password.
- `SMTP_FROM` – Sender email address.

Configure `VITE_API_URL` in `frontend/.env` if your backend API uses a different address.

**Security:** Never commit actual `.env` files, passwords, JWT secrets, OTP secrets, SMTP credentials, or database credentials to GitHub. The `.env` files are intended to remain local or be configured securely in the deployment platform.

### 3. Prepare demo data

The project provides a seed script for creating demo data:

```bash
npm run seed
```

**IMPORTANT DATABASE WARNING:** The full demo seed script deletes existing application data in the database configured by `MONGO_URI` before creating demo data. Use only a dedicated development or test database. Never run it against a production database or a database containing data you want to preserve.

To create or reset only the Super Admin while preserving other records, use:

```bash
npm --prefix backend run seed:admin
```

Configure the Super Admin details and demo password through the appropriate environment variables in `backend/.env` before running the relevant seed command.

### 4. Start the application

Open two separate terminal windows from the project root directory.

**Terminal 1 – Start the backend:**

```bash
npm run dev:backend
```

Backend development address:

```text
http://localhost:5000
```

**Terminal 2 – Start the frontend:**

```bash
npm run dev:frontend
```

Frontend development address:

```text
http://localhost:5173
```

Open the frontend address in your browser to use the application.

## Demo Accounts

The seed script creates demo accounts using `SEED_DEMO_PASSWORD` configured in `backend/.env`. Set a unique password before running the seed script.

The Super Admin email is configured using `SEED_SUPER_ADMIN_EMAIL` in `backend/.env`.

Select the matching role on the login page when signing in.

| Role | Email |
|---|---|
| Super Admin | Configured using `SEED_SUPER_ADMIN_EMAIL` in `backend/.env` |
| TPO (TEN001) | tpo1@abc.edu.in |
| TPO (TEN002) | tpo2@greenfield.edu.in |
| Student (verified, eligible) | rahul.student@abc.edu.in |
| Student (low CGPA, ineligible) | karan@abc.edu.in |
| Recruiter – company admin (authorized) | rahul.mehta@abctech.com |
| Recruiter (authorized) | priya@abctech.com |
| Recruiter (suspended) | amit@abctech.com |
| Recruiter (not authorized) | neha@abctech.com |

**Note:** Demo accounts are available only after successfully running the appropriate seed process. Their availability depends on the configured database and successful seed execution.

## OTP Email Delivery

Configure a working SMTP server in `backend/.env` before requesting OTPs.

Required SMTP settings:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`

SMTP configuration is required for OTP and other email delivery in every environment.

OTPs are sent to the exact registered email address for each role, including college TPOs, students, recruiters, and Super Admins.

If SMTP is missing or email delivery fails, the request reports an error. OTP codes are never printed to the local console.

Production startup also requires a separate random `OTP_PEPPER`.

Use credentials and a sender address accepted by your SMTP provider.

The following SMTP aliases are also accepted:

- `SMTP_USERNAME` as an alias for `SMTP_USER`
- `SMTP_PASSWORD` as an alias for `SMTP_PASS`

For SMTP connections:

- Use port `465` with `SMTP_SECURE=true` for implicit TLS.
- Use port `587` with `SMTP_SECURE=false` for STARTTLS.

## Tests

Run the test suite from the project root directory:

```bash
npm test
```

The project uses:

- Jest
- Supertest
- In-memory MongoDB

The in-memory MongoDB setup may download a MongoDB binary during the first test run.

The tests are intended to cover:

- Authentication and email OTP
- Role-based access control (RBAC)
- Tenant isolation
- Object-ID manipulation
- Recruiter least privilege
- Resume protection
- Eligibility checks
- Application workflow
- Account suspension
- Security alerts

Test results should be verified in the actual development environment. A listed test coverage area does not by itself mean that every test has passed.

## Documentation

The `docs/` directory contains project documentation covering:

- Architecture
- Database schema
- API
- Security model
- Workflows
- Deployment
- Testing
- Panel defense

Refer to the relevant documentation files for additional details about the application.

## Project Layout

```text
Multi-Tenant-Campus-Placement-Portal/
│
├── backend/
│   ├── config/
│   ├── constants/
│   ├── models/
│   ├── controllers/
│   ├── services/
│   ├── middleware/
│   ├── validators/
│   ├── routes/
│   ├── utils/
│   ├── seeds/
│   └── tests/
│
├── frontend/
│   ├── api/
│   ├── auth/
│   ├── routes/
│   ├── layouts/
│   ├── pages/
│   ├── components/
│   ├── hooks/
│   ├── utils/
│   └── styles/
│
├── docs/
│
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

### Backend

The backend is an Express.js API built with Node.js and MongoDB. It contains configuration, constants, database models, controllers, services, middleware, validators, routes, utilities, seed scripts, and tests.

### Frontend

The frontend is a React application built with Vite. It contains API integration, authentication, routing, layouts, role-specific pages, reusable components, hooks, utilities, and styles.

### Documentation

The `docs/` directory contains supporting technical and project documentation.

## Security Notes

- Keep all actual environment files private.
- Never publish database passwords, SMTP credentials, JWT secrets, OTP secrets, or other sensitive configuration.
- Use unique, strong secrets for JWT and OTP security.
- Do not use demo credentials as production credentials.
- Run the full demo seed only against a dedicated development or test database.
- Configure production environment variables securely through the hosting platform.
- Verify authentication, role permissions, tenant isolation, email delivery, and file protection before production use.

## Deployment

The application requires a configured backend, frontend, MongoDB database, and SMTP service.

Before deployment:

1. Configure a production MongoDB connection.
2. Set secure production environment variables.
3. Configure SMTP email delivery.
4. Configure the frontend API URL to point to the deployed backend.
5. Configure the backend's allowed frontend origin.
6. Verify resume upload and storage behavior in the hosting environment.
7. Run the relevant tests.
8. Verify all user roles and tenant-isolation behavior.
9. Confirm that no secrets or local environment files are included in the public repository.

Refer to the `docs/` directory for the project's deployment documentation.
