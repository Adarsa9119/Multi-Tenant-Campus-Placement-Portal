# API documentation

Base URL `/api`. JSON responses: `{ success, message, data, meta? }`. Auth: `Authorization: Bearer <JWT>` (issued only after OTP verification). Errors: `{ success:false, message, details? }` with 400/401/403/404/409/422/429.

## Auth (public)
| Method | Path | Purpose |
|---|---|---|
| POST | /auth/login `{email,password,role}` | validate credentials, send login OTP |
| POST | /auth/verify-otp `{email,otp}` | verify OTP → `{token,user}` |
| POST | /auth/resend-otp `{email,purpose}` | resend with cooldown |
| POST | /auth/request-activation `{email}` · /auth/activate `{email,otp,password}` | invited account activation |
| POST | /auth/forgot-password · /auth/reset-password | OTP password reset |
| GET | /auth/me | current session |

## Registration (public)
POST /college-registrations/send-otp · POST /college-registrations · GET /college-registrations/settings · POST /companies/register/send-otp · POST /companies/register

## Super Admin (`/admin`, role SUPER_ADMIN)
GET /dashboard · GET /college-registrations[/:id] · POST /college-registrations/:id/(review|approve|reject) · GET /tenants · POST /tenants/:id/(activate|deactivate) · GET|POST /tpos · POST /tpos/:id/status · GET|POST /platform-admins · POST /platform-admins/:id/status · GET /students-overview · GET|PUT /settings

## Companies & recruiters
- GET /companies (admin all, TPO verified+approval state) · POST /companies/:id/(verify|reject|review|suspend|reinstate) (admin) · GET|PUT /companies/me (recruiter)
- GET /recruiters (admin / TPO / company admin) · POST /recruiters · POST /recruiters/:id/(authorize|suspend|reinstate) (admin)
- GET /college-companies · POST /college-companies/request (company admin) · POST /college-companies/:companyId/(approve|reject|revoke) (TPO)
- GET|POST /recruiter-authorizations · POST /recruiter-authorizations/:id/revoke (TPO)
- Recruiter portal: GET /recruiters/portal/(dashboard|company-overview|drives|candidates) · GET /recruiters/portal/drives/:driveId[/candidates] · GET /recruiters/portal/candidates/:applicationId

## TPO (`/tpo`)
GET /dashboard · GET|POST /departments · PUT /departments/:id · GET|POST /students · POST /students/bulk (CSV) · GET|PUT /students/:id · POST /students/:id/verify

## Drives & eligibility
POST /drives · GET /drives · GET /drives/:id · PUT /drives/:id · POST /drives/:id/(approve|publish|close|suspend) · GET /drives/:driveId/eligibility (TPO) · Student: GET /student/drives · GET /student/drives/:id · GET /student/eligibility[/:driveId]

## Student (`/student`)
GET /dashboard · GET|PUT /profile · GET /placement-status

## Applications, interviews, offers
POST /applications · GET /applications · GET /applications/:id · POST /applications/:id/status · GET|POST /interviews · PUT /interviews/:id · POST /interviews/:id/result · GET|POST /offers · POST /offers/:id/respond

## Files
POST /files/resume (multipart `resume`) · GET /files/resume/meta · GET /files/resume/me · GET /files/applications/:applicationId/resume[?download=1]

## Other
GET /notifications · GET /notifications/unread-count · POST /notifications/read-all · POST /notifications/:id/read · GET /reports/(placement-summary|drive-wise|company-participation|department-summary|security-summary) · GET /audit-logs · GET /security-alerts · POST /security-alerts/:id/status · POST|GET /support · PUT /support/:id
