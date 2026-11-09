# Security model

1. **Authentication** – bcrypt (12 rounds) password check, then a 6-digit email OTP (HMAC-hashed, 5 min TTL, 5 attempts, single use, resend cooldown). JWT is issued only after OTP.
2. **Live account validation** – every request reloads the user and tenant; suspended users/colleges lose access immediately even with a valid token.
3. **RBAC** – `authorizeRole` on every router; denials are audited.
4. **Tenant isolation** – tenant derived from the authenticated user. `authorizeTenant` loads the addressed object and denies mismatches (403) while logging `CROSS_TENANT_ACCESS_ATTEMPT`. Service queries also filter by `tenantId`.
5. **Resource-level authorization (recruiters)** – recruiter active → platform-authorized → company VERIFIED and ACTIVE → college approved the company → recruiter authorized for the college → drive belongs to company and lists the recruiter → application belongs to that drive.
6. **Least privilege** – recruiters never receive email, phone, roll number or marks; Super Admin sees only student aggregates.
7. **Protected resumes** – type/extension/size/magic-byte validation, random storage key, no static route, authorized streaming only, `no-store`, every access audited.
8. **Audit & alerts** – deterministic rules: ≥5 failed logins/15 min, ≥5 OTP failures, ≥20 resume downloads/10 min, ≥50 student views/10 min, ≥5 unauthorized requests/10 min, any cross-tenant attempt.
9. **Suspension and company trust** – company suspension blocks recruiter sessions and access; suspension or loss of company verification pauses approved/published drives and hides them from student eligibility/details. Restoring an active, verified company restores paused drives and preserves application history.
10. **Hardening** – helmet, strict CORS, mongo-sanitize, rate limits, validation, secrets only in env, no OTP/password logging.
