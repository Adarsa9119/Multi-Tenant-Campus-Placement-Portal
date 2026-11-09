# Database schema (MongoDB / Mongoose)

| Collection | Key fields | Notes |
|---|---|---|
| users | name, email (unique), passwordHash, role, tenantId, status | status: INVITED/ACTIVE/SUSPENDED/INACTIVE |
| tenants | tenantCode (TEN001…), collegeName, status, contact | created only on approval |
| collegeregistrations | college details, contact, proposedTpo, status, reviewedBy | PENDING→UNDER_REVIEW→APPROVED/REJECTED |
| departments | tenantId, name, code | unique (tenantId, code) |
| students | tenantId, userId, rollNo, branch, graduationYear, cgpa, backlogs, verificationStatus, resumeFileId, skills/projects/certifications | unique (tenantId, rollNo) |
| companies | companyCode, name, verificationStatus, status, verifiedBy | platform-level trust |
| collegecompanyapprovals | tenantId, companyId, status | college-level trust; unique pair |
| recruiters | companyId, userId, isCompanyAdmin, status, authorizationStatus | person, not company |
| recruiterauthorizations | recruiterId, companyId, tenantId, status | per-college authorization |
| placementdrives | tenantId, companyId, recruiterIds[], criteria{minCgpa,branches,maxBacklogs,graduationYear}, deadline, status | |
| applications | tenantId, studentId, driveId, status, history[] | unique (studentId, driveId) |
| interviews | applicationId, tenantId, driveId, stage TEST/INTERVIEW, scheduledAt, result | |
| offers | applicationId (unique), studentId, companyId, role, package, status | |
| fileassets | tenantId, studentId, storageKey (random), mimeType, size, active | metadata only; bytes on protected disk |
| notifications | userId, tenantId, type, message, read | |
| auditlogs | actorId, role, tenantId, action, resourceType, resourceId, ip, metadata, timestamp | |
| securityalerts | eventType, severity, status, actorId, tenantId, details | |
| supporttickets | ticketNo, tenantId, createdBy, scope TENANT/PLATFORM, status | |
| otps | email, purpose, codeHash (HMAC), expiresAt, attempts, status | TTL index; single use |
| platformsettings | key, value | |

Every tenant-owned collection carries `tenantId` and is indexed on it.
