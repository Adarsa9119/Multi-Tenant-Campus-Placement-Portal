# Workflows

**College onboarding:** public registration (OTP-verified official email) → PENDING → Super Admin review → APPROVE (tenant TENxxx created, TPO invited) / REJECT.

**Student onboarding:** TPO adds / bulk imports (tenant from TPO context) → invitation → OTP activation → profile → academic verification by TPO → can apply.

**Company trust:** company registers (admin account, OTP) → Super Admin verifies → recruiters added and individually authorized → each college approves the company and authorizes recruiters → drives can be created. Suspending a company or removing its verification pauses its approved/published drives until the company is active and verified again.

**Drive:** DRAFT → APPROVED → PUBLISHED → CLOSED (SUSPENDED can be re-published). Eligible verified students are notified on publish.

**Application:** APPLIED → UNDER_REVIEW → SHORTLISTED → TEST → INTERVIEW → SELECTED → OFFER → PLACED; REJECTED at any open stage. OFFER/PLACED only through the offer workflow. Application requires active + verified student, eligibility, open deadline, no duplicate.

**Eligibility:** `CGPA >= min AND branch IN list AND backlogs <= max AND graduationYear == year`.
