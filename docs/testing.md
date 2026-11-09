# Testing

`npm test` runs Jest with Supertest against an in-memory MongoDB (mongodb-memory-server).

| File | Validates |
|---|---|
| auth.test.js | login, OTP (single use, never in response), invalid/suspended/invited accounts, activation, token required |
| tenantIsolation.test.js | TEN001 vs TEN002, object-ID manipulation, ignored client tenantId, audit + alert |
| recruiterAuthorization.test.js | drive/company/college scoping, minimal data, unauthorized recruiters, revocations |
| studentAccess.test.js | own-data only, role/tenant tamper, re-verification, eligible drives only |
| resumeAccess.test.js | type/size/content checks, authorized vs unauthorized access, no public URL, audit |
| eligibility.test.js | CGPA/branch/backlog/year rules |
| applicationWorkflow.test.js | duplicate/ineligible/expired/unverified blocks, valid and invalid transitions, offer → placed |
| suspension.test.js | company and recruiter suspension, reinstatement, history preserved |
| securityAlerts.test.js | failed-login, OTP, unauthorized-request and cross-tenant alerts |
