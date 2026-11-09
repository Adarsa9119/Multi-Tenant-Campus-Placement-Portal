# Panel defense

| Question | Answer |
|---|---|
| What is the project? | A secure multi-tenant campus placement and recruitment platform built entirely with MERN. |
| What is multi-tenancy? | Colleges share one app; each college's data and access are isolated by tenant authorization on the server. |
| What is special? | Tenant isolation + controlled onboarding + company verification + separate recruiter authorization + drive-scoped candidate access + protected resumes + audit + rule-based alerts + full lifecycle. |
| Why no AI? | Eligibility, authorization and workflow are deterministic rules; AI is out of scope by design. |
| How is cross-tenant access prevented? | Every request is authenticated, role-checked, tenant-checked and resource-checked in Express; tenantId is never trusted from the client. |
| Can a recruiter see all students? | No. Only applicants of drives assigned to them at colleges that authorized both the company and the recruiter, with minimal fields. |
| How are resumes protected? | Random private storage keys, authorized streaming only, audited, no public URL. |
| Fake companies/recruiters? | Company verification, individual recruiter authorization, college approval, suspension. |
| Why OTP? | A second factor on every login/activation/registration so a leaked password alone is not enough. |
| Contribution? | A security-focused MERN architecture for governed campus recruitment (not a claim that placement portals are new). |
