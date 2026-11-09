const mongoose = require('mongoose');
const env = require('../config/env');
const data = require('./seedData');
const { hashPassword } = require('../utils/password');
const M = (n) => require(`../models/${n}`);

const inDays = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

const models = [
  'User',
  'Tenant',
  'CollegeRegistration',
  'Department',
  'Student',
  'Company',
  'CollegeCompanyApproval',
  'Recruiter',
  'RecruiterAuthorization',
  'PlacementDrive',
  'Application',
  'Interview',
  'Offer',
  'FileAsset',
  'Notification',
  'AuditLog',
  'SecurityAlert',
  'SupportTicket',
  'Otp',
  'PlatformSetting'
];

async function run() {
  await mongoose.connect(env.MONGO_URI);

  for (const m of models) {
    await M(m).deleteMany({});
  }

  const pw = await hashPassword(env.SEED_DEMO_PASSWORD);

  const mk = (extra) => ({
    passwordHash: pw,
    status: 'ACTIVE',
    ...extra
  });

  const admin = await M('User').create(
    mk({
      name: env.SEED_SUPER_ADMIN_NAME,
      email: env.SEED_SUPER_ADMIN_EMAIL,
      role: 'SUPER_ADMIN'
    })
  );

  const tenants = {};

  for (const t of data.tenants) {
    tenants[t.key] = await M('Tenant').create({
      tenantCode: await M('Tenant').nextCode(),
      ...t,
      status: 'ACTIVE',
      approvedBy: admin._id,
      contact: {
        name: 'Registrar',
        email: t.officialEmail
      }
    });
  }

  for (const r of data.pendingRegistrations) {
    await M('CollegeRegistration').create({
      collegeName: r.collegeName,
      affiliation: 'University',
      collegeType: 'Engineering',
      officialEmail: r.officialEmail,
      address: 'Campus Road',
      city: r.city,
      state: r.state,
      pincode: '380001',
      contact: {
        name: 'Registrar',
        email: r.officialEmail,
        phone: '9876543210',
        designation: 'Registrar'
      },
      proposedTpo: {
        name: r.tpo,
        email: r.tpoEmail,
        phone: '9876543211',
        designation: 'TPO'
      },
      emailVerified: true,
      status: r.status
    });
  }

  const tpos = {};

  for (const t of data.tpos) {
    tpos[t.tenant] = await M('User').create(
      mk({
        name: t.name,
        email: t.email,
        role: 'TPO',
        tenantId: tenants[t.tenant]._id
      })
    );
  }

  const depts = {};

  for (const k of Object.keys(tenants)) {
    for (const code of data.departments) {
      depts[`${k}:${code}`] = await M('Department').create({
        tenantId: tenants[k]._id,
        name: code,
        code
      });
    }
  }

  const students = {};

  for (const s of data.students) {
    const u = await M('User').create(
      mk({
        name: s.name,
        email: s.email,
        role: 'STUDENT',
        tenantId: tenants[s.tenant]._id,
        phone: '9000000000'
      })
    );

    students[s.email] = await M('Student').create({
      tenantId: tenants[s.tenant]._id,
      userId: u._id,
      name: s.name,
      email: s.email,
      phone: '9000000000',
      rollNo: s.rollNo,
      departmentId: depts[`${s.tenant}:${s.branch}`]?._id,
      branch: s.branch,
      graduationYear: 2027,
      cgpa: s.cgpa,
      backlogs: s.backlogs,
      tenthPercent: 90,
      twelfthPercent: 88,
      skills: ['React', 'Node.js', 'MongoDB'],
      verificationStatus: s.verified,
      verifiedBy:
        s.verified === 'VERIFIED'
          ? tpos[s.tenant]._id
          : undefined,
      verifiedAt:
        s.verified === 'VERIFIED'
          ? new Date()
          : undefined,
      projects: [
        {
          title: 'Campus Connect',
          description: 'MERN student networking app'
        }
      ],
      certifications: [
        {
          name: 'AWS Cloud Practitioner',
          issuer: 'AWS',
          year: 2025
        }
      ]
    });
  }

  const companies = {};

  for (const c of data.companies) {
    companies[c.key] = await M('Company').create({
      companyCode: await M('Company').nextCode(),
      name: c.name,
      industry: c.industry,
      officialEmail: c.officialEmail,
      website: 'https://example.com',
      description: `${c.name} is a demo company.`,
      address: {
        line: '123 Tech Park',
        city: 'Bengaluru',
        state: 'Karnataka',
        country: 'India'
      },
      verificationStatus: c.verification,
      status: c.status,
      verifiedBy:
        c.verification === 'VERIFIED'
          ? admin._id
          : undefined,
      verifiedAt:
        c.verification === 'VERIFIED'
          ? new Date()
          : undefined,
      reviewNotes:
        c.verification === 'REJECTED'
          ? 'Could not verify registration documents'
          : undefined
    });
  }

  const recruiters = {};

  for (const r of data.recruiters) {
    const u = await M('User').create(
      mk({
        name: r.name,
        email: r.email,
        role: 'RECRUITER',
        status:
          r.status === 'SUSPENDED'
            ? 'SUSPENDED'
            : 'ACTIVE'
      })
    );

    recruiters[r.key] = await M('Recruiter').create({
      companyId: companies[r.company]._id,
      userId: u._id,
      designation: r.admin
        ? 'Company Admin'
        : 'HR Recruiter',
      isCompanyAdmin: r.admin,
      status: r.status,
      authorizationStatus: r.auth,
      authorizedBy:
        r.auth === 'AUTHORIZED'
          ? admin._id
          : undefined,
      authorizedAt: new Date()
    });
  }

  for (const a of data.approvals) {
    await M('CollegeCompanyApproval').create({
      tenantId: tenants[a.tenant]._id,
      companyId: companies[a.company]._id,
      status: a.status,
      decidedBy:
        a.status === 'APPROVED'
          ? tpos[a.tenant]._id
          : undefined,
      decidedAt: new Date()
    });
  }

  for (const a of data.recruiterAuths) {
    await M('RecruiterAuthorization').create({
      recruiterId: recruiters[a.recruiter]._id,
      companyId: recruiters[a.recruiter].companyId,
      tenantId: tenants[a.tenant]._id,
      authorizedBy: tpos[a.tenant]._id
    });
  }

  const drives = {};

  for (const d of data.drives) {
    drives[d.key] = await M('PlacementDrive').create({
      tenantId: tenants[d.tenant]._id,
      companyId: companies[d.company]._id,
      recruiterIds: d.recruiters.map(
        (r) => recruiters[r]._id
      ),
      title: d.title,
      description: `${d.title} role`,
      package: d.package,
      location: d.location,
      criteria: d.criteria,
      deadline: d.deadline,
      status: d.status,
      createdBy: tpos[d.tenant]._id
    });
  }

  const apps = {};

  for (const a of data.applications) {
    const s = students[a.student];
    const d = drives[a.drive];

    apps[`${a.student}:${a.drive}`] =
      await M('Application').create({
        tenantId: s.tenantId,
        studentId: s._id,
        driveId: d._id,
        companyId: d.companyId,
        status: a.status,
        history: [
          {
            from: null,
            to: 'APPLIED',
            role: 'STUDENT'
          },
          {
            from: 'APPLIED',
            to: a.status,
            role: 'RECRUITER'
          }
        ]
      });
  }

  const iv = (key, stage, offset) =>
    M('Interview').create({
      applicationId: apps[key]._id,
      tenantId: apps[key].tenantId,
      driveId: apps[key].driveId,
      stage,
      scheduledAt: inDays(offset),
      mode: 'ONLINE',
      createdBy: admin._id
    });

  await iv(
    'aadhya@abc.edu.in:d1',
    'INTERVIEW',
    3
  );

  await iv(
    'rahul.student@abc.edu.in:d1',
    'TEST',
    2
  );

  const offerApp =
    apps['aadhya@abc.edu.in:d2'];

  await M('Offer').create({
    applicationId: offerApp._id,
    tenantId: offerApp.tenantId,
    studentId: offerApp.studentId,
    companyId: offerApp.companyId,
    driveId: offerApp.driveId,
    role: 'Systems Engineer',
    package: 7,
    joiningDate: inDays(120)
  });

  await M('Notification').create([
    {
      userId:
        students[
          'rahul.student@abc.edu.in'
        ].userId,
      tenantId: tenants.t1._id,
      type: 'NEW_DRIVE',
      message:
        'New placement drive open: Software Engineer'
    },
    {
      userId:
        students[
          'rahul.student@abc.edu.in'
        ].userId,
      tenantId: tenants.t1._id,
      type: 'APPLICATION_STATUS',
      message:
        'Your application status changed to shortlisted'
    },
    {
      userId: admin._id,
      type: 'COLLEGE_REGISTRATION',
      message:
        'New college registration submitted: Rai University'
    },
    {
      userId: tpos.t1._id,
      tenantId: tenants.t1._id,
      type: 'COMPANY_REQUEST',
      message:
        'Globex Systems requested recruitment authorization'
    },
    {
      userId: recruiters.rahulm.userId,
      type: 'DRIVE_APPROVED',
      message:
        'Drive approved: Software Engineer'
    }
  ]);

  await M('AuditLog').create([
    {
      actorId: admin._id,
      role: 'SUPER_ADMIN',
      action: 'APPROVE_COLLEGE',
      resourceType: 'Tenant',
      resourceId: String(tenants.t1._id),
      metadata: {
        college: tenants.t1.collegeName
      }
    },
    {
      actorId: tpos.t1._id,
      role: 'TPO',
      tenantId: tenants.t1._id,
      action: 'CREATE_DRIVE',
      resourceType: 'PlacementDrive',
      resourceId: String(drives.d1._id)
    },
    {
      actorId: recruiters.rahulm.userId,
      role: 'RECRUITER',
      tenantId: tenants.t1._id,
      action: 'VIEW_RESUME',
      resourceType: 'FileAsset',
      metadata: {
        demo: true
      }
    }
  ]);

  await M('SecurityAlert').create([
    {
      eventType: 'MULTIPLE_FAILED_LOGINS',
      severity: 'HIGH',
      status: 'OPEN',
      details: {
        email: 'unknown@example.com',
        occurrences: 7,
        ip: '192.168.1.45'
      }
    },
    {
      eventType: 'CROSS_TENANT_ACCESS',
      severity: 'HIGH',
      status: 'INVESTIGATING',
      tenantId: tenants.t1._id,
      actorId: tpos.t1._id,
      details: {
        demo: true
      }
    },
    {
      eventType: 'REPEATED_UNAUTHORIZED_REQUESTS',
      severity: 'MEDIUM',
      status: 'RESOLVED',
      details: {
        demo: true
      }
    }
  ]);

  await M('SupportTicket').create([
    {
      ticketNo: 'STK-101',
      tenantId: tenants.t1._id,
      createdBy:
        students[
          'rahul.student@abc.edu.in'
        ].userId,
      createdByRole: 'STUDENT',
      scope: 'TENANT',
      subject: 'Student data correction',
      issue:
        'My branch is wrong in the record',
      status: 'OPEN'
    },
    {
      ticketNo: 'STK-102',
      createdBy:
        recruiters.neha.userId,
      createdByRole: 'RECRUITER',
      scope: 'PLATFORM',
      subject: 'Authorization pending',
      issue:
        'Please authorize my account',
      status: 'IN_PROGRESS'
    }
  ]);

  console.log(
    'Seed complete. Demo account passwords are configured by SEED_DEMO_PASSWORD.'
  );

  console.log(
    'Super Admin:',
    admin.email,
    '| TPO:',
    'tpo1@abc.edu.in',
    '| Student:',
    'rahul.student@abc.edu.in',
    '| Recruiter:',
    'rahul.mehta@abctech.com',
    '(company admin), priya@abctech.com'
  );

  console.log(
    'Suspended recruiter: amit@abctech.com | Unauthorized recruiter: neha@abctech.com | TENANT 2 TPO: tpo2@greenfield.edu.in'
  );

  console.log(
    'Login requires email OTP delivery; configure reachable SMTP credentials before signing in.'
  );

  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});