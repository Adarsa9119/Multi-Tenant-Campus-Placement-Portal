import { Link } from 'react-router-dom';

const CONTENT = {
  privacy: {
    title: 'Privacy Policy',
    intro: 'This portal supports campus placement activities for colleges, students, and recruiting companies.',
    sections: [
      ['Information used by the portal', 'The portal uses account and contact details, college and company registration information, student profiles, resumes, applications, and placement activity to provide its services.'],
      ['Access to placement information', 'Information is available only to the users and organizations that need it for placement activities. Student resumes and application details are shared with authorized recruiters for relevant drives.'],
      ['Account and email verification', 'Verification codes are sent to the email address registered to the account. Never share your password or verification code with anyone.'],
      ['Questions or data concerns', 'Contact your college TPO for college and student records. For company or portal account issues, use the support guidance below or raise a ticket after signing in.'],
    ],
  },
  terms: {
    title: 'Terms of Service',
    intro: 'Use the portal only for legitimate college placement, student career, and recruitment activities.',
    sections: [
      ['Account responsibilities', 'Keep your registered email and contact details current, protect your sign-in credentials, and use only the account and role assigned to you.'],
      ['Placement information', 'Colleges, students, and companies are responsible for providing accurate registration and placement information.'],
      ['Approvals and access', 'College and company access may require platform review. Recruiter access to candidate information is limited to authorized placement activities.'],
      ['Getting help', 'If you cannot access your account or believe information is incorrect, contact the responsible college TPO, company account administrator, or platform administrator as appropriate.'],
    ],
  },
  support: {
    title: 'Support & Help',
    intro: 'Contact the person responsible for your account or placement activity. Signed-in users can also raise and track a support ticket from their portal.',
    sections: [
      ['Platform administrator', 'For college registration, approval, or platform-wide issues, contact the Super Admin through the administrator contact details in your portal registration or approval correspondence. TPOs can raise a ticket and escalate platform issues from the college portal.'],
      ['College contact', 'For college account and institutional details, use the official college email address and phone number supplied during college registration, or contact the college office.'],
      ['College TPO', 'Students should contact the Training & Placement Officer (TPO) at their own college for profile, eligibility, placement drive, and application questions. Use the official TPO email or phone details provided by your college. Students can also raise a ticket from Support in their portal.'],
      ['Company and recruiter', 'Recruiters should first contact their company account administrator for company or recruiter access. For company verification or portal-wide issues, contact the platform administrator.'],
      ['Raise a support ticket', 'After signing in, open Support or Support & Help in your dashboard and include your role, registered email, college or company, and a short description. Do not include your password or OTP.'],
    ],
  },
};

export default function PublicInfo({ page }) {
  const content = CONTENT[page];

  return (
    <main className="public-info">
      <h1>{content.title}</h1>
      <p className="public-info-intro">{content.intro}</p>
      <div className="public-info-sections">
        {content.sections.map(([title, description]) => (
          <section className="card card-pad" key={title}>
            <h2>{title}</h2>
            <p>{description}</p>
          </section>
        ))}
      </div>
      <p className="public-info-action">
        <Link className="btn" to="/login">Sign in to the portal</Link>
        {page !== 'support' && <Link to="/support">Contact support</Link>}
      </p>
    </main>
  );
}
