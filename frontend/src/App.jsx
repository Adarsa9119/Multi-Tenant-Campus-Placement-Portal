import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './routes/ProtectedRoute.jsx';
import RoleRoute from './routes/RoleRoute.jsx';
import TenantRoute from './routes/TenantRoute.jsx';
import PublicLayout from './layouts/PublicLayout.jsx';
import AdminLayout from './layouts/AdminLayout.jsx';
import TpoLayout from './layouts/TpoLayout.jsx';
import RecruiterLayout from './layouts/RecruiterLayout.jsx';
import StudentLayout from './layouts/StudentLayout.jsx';
import useAuth from './hooks/useAuth.js';
import { ROLE_HOME } from './constants/roles.js';

import Landing from './pages/public/Landing.jsx';
import CollegeRegistration from './pages/public/CollegeRegistration.jsx';
import CompanyRegistration from './pages/public/CompanyRegistration.jsx';
import Login from './pages/public/Login.jsx';
import ActivateAccount from './pages/public/ActivateAccount.jsx';
import ForgotPassword from './pages/public/ForgotPassword.jsx';
import ResetPassword from './pages/public/ResetPassword.jsx';
import PublicInfo from './pages/public/PublicInfo.jsx';

import AdminDashboard from './pages/superAdmin/Dashboard.jsx';
import CollegeRequests from './pages/superAdmin/CollegeRequests.jsx';
import CollegeDetails from './pages/superAdmin/CollegeDetails.jsx';
import TenantManagement from './pages/superAdmin/TenantManagement.jsx';
import TpoManagement from './pages/superAdmin/TpoManagement.jsx';
import PlatformAdminManagement from './pages/superAdmin/PlatformAdminManagement.jsx';
import CompanyVerification from './pages/superAdmin/CompanyVerification.jsx';
import RecruiterSecurity from './pages/superAdmin/RecruiterSecurity.jsx';
import StudentsOverview from './pages/superAdmin/StudentsOverview.jsx';
import AuditLogs from './pages/superAdmin/AuditLogs.jsx';
import SecurityAlerts from './pages/superAdmin/SecurityAlerts.jsx';
import SupportTickets from './pages/superAdmin/SupportTickets.jsx';
import PlatformSettings from './pages/superAdmin/PlatformSettings.jsx';

import TpoDashboard from './pages/tpo/Dashboard.jsx';
import Departments from './pages/tpo/Departments.jsx';
import Students from './pages/tpo/Students.jsx';
import AddStudent from './pages/tpo/AddStudent.jsx';
import BulkStudentImport from './pages/tpo/BulkStudentImport.jsx';
import StudentVerification from './pages/tpo/StudentVerification.jsx';
import Companies from './pages/tpo/Companies.jsx';
import CompanyApprovals from './pages/tpo/CompanyApprovals.jsx';
import Recruiters from './pages/tpo/Recruiters.jsx';
import RecruiterApprovals from './pages/tpo/RecruiterApprovals.jsx';
import PlacementDrives from './pages/tpo/PlacementDrives.jsx';
import CreateDrive from './pages/tpo/CreateDrive.jsx';
import TpoEligibility from './pages/tpo/Eligibility.jsx';
import TpoApplications from './pages/tpo/Applications.jsx';
import Shortlists from './pages/tpo/Shortlists.jsx';
import TpoInterviews from './pages/tpo/Interviews.jsx';
import TpoSelections from './pages/tpo/Selections.jsx';
import TpoOffers from './pages/tpo/Offers.jsx';
import Reports from './pages/tpo/Reports.jsx';
import TpoNotifications from './pages/tpo/Notifications.jsx';
import TpoSupport from './pages/tpo/Support.jsx';

import RecruiterDashboard from './pages/recruiter/Dashboard.jsx';
import CompanyProfile from './pages/recruiter/CompanyProfile.jsx';
import CompanyRecruiters from './pages/recruiter/CompanyRecruiters.jsx';
import CollegeAuthorizations from './pages/recruiter/CollegeAuthorizations.jsx';
import AuthorizedDrives from './pages/recruiter/AuthorizedDrives.jsx';
import RecruiterApplications from './pages/recruiter/Applications.jsx';
import CandidateDetails from './pages/recruiter/CandidateDetails.jsx';
import CandidateResume from './pages/recruiter/CandidateResume.jsx';
import Shortlist from './pages/recruiter/Shortlist.jsx';
import Tests from './pages/recruiter/Tests.jsx';
import RecruiterInterviews from './pages/recruiter/Interviews.jsx';
import RecruiterSelections from './pages/recruiter/Selections.jsx';
import RecruiterOffers from './pages/recruiter/Offers.jsx';
import RecruiterNotifications from './pages/recruiter/Notifications.jsx';
import RecruiterSupport from './pages/recruiter/Support.jsx';

import StudentDashboard from './pages/student/Dashboard.jsx';
import Profile from './pages/student/Profile.jsx';
import AcademicDetails from './pages/student/AcademicDetails.jsx';
import Resume from './pages/student/Resume.jsx';
import Skills from './pages/student/Skills.jsx';
import Projects from './pages/student/Projects.jsx';
import Certifications from './pages/student/Certifications.jsx';
import PlacementDrivesStudent from './pages/student/PlacementDrives.jsx';
import DriveDetails from './pages/student/DriveDetails.jsx';
import StudentEligibility from './pages/student/Eligibility.jsx';
import StudentApplications from './pages/student/Applications.jsx';
import ApplicationDetails from './pages/student/ApplicationDetails.jsx';
import StudentInterviews from './pages/student/Interviews.jsx';
import StudentOffers from './pages/student/Offers.jsx';
import PlacementStatus from './pages/student/PlacementStatus.jsx';
import StudentNotifications from './pages/student/Notifications.jsx';
import StudentSupport from './pages/student/Support.jsx';

function Home() {
  const { user } = useAuth();
  return user ? <Navigate to={ROLE_HOME[user.role]} replace /> : <Landing />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/register-college" element={<CollegeRegistration />} />
        <Route path="/register-company" element={<CompanyRegistration />} />
        <Route path="/activate" element={<ActivateAccount />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/privacy" element={<PublicInfo page="privacy" />} />
        <Route path="/terms" element={<PublicInfo page="terms" />} />
        <Route path="/support" element={<PublicInfo page="support" />} />
      </Route>
      <Route element={<PublicLayout dark />}><Route path="/login" element={<Login />} /></Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<RoleRoute roles={['SUPER_ADMIN']} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="college-requests" element={<CollegeRequests />} />
            <Route path="college-requests/:id" element={<CollegeDetails />} />
            <Route path="tenants" element={<TenantManagement />} />
            <Route path="tpos" element={<TpoManagement />} />
            <Route path="admins" element={<PlatformAdminManagement />} />
            <Route path="companies" element={<CompanyVerification />} />
            <Route path="recruiters" element={<RecruiterSecurity />} />
            <Route path="students" element={<StudentsOverview />} />
            <Route path="audit-logs" element={<AuditLogs />} />
            <Route path="security-alerts" element={<SecurityAlerts />} />
            <Route path="support" element={<SupportTickets />} />
            <Route path="settings" element={<PlatformSettings />} />
          </Route>
        </Route>

        <Route element={<RoleRoute roles={['TPO']} />}>
          <Route element={<TenantRoute />}>
            <Route path="/tpo" element={<TpoLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<TpoDashboard />} />
              <Route path="departments" element={<Departments />} />
              <Route path="students" element={<Students />} />
              <Route path="students/add" element={<AddStudent />} />
              <Route path="students/bulk" element={<BulkStudentImport />} />
              <Route path="verification" element={<StudentVerification />} />
              <Route path="companies" element={<Companies />} />
              <Route path="company-approvals" element={<CompanyApprovals />} />
              <Route path="recruiters" element={<Recruiters />} />
              <Route path="recruiter-approvals" element={<RecruiterApprovals />} />
              <Route path="drives" element={<PlacementDrives />} />
              <Route path="drives/create" element={<CreateDrive />} />
              <Route path="eligibility" element={<TpoEligibility />} />
              <Route path="applications" element={<TpoApplications />} />
              <Route path="shortlists" element={<Shortlists />} />
              <Route path="interviews" element={<TpoInterviews />} />
              <Route path="selections" element={<TpoSelections />} />
              <Route path="offers" element={<TpoOffers />} />
              <Route path="reports" element={<Reports />} />
              <Route path="audit" element={<AuditLogs title="College Audit Log" />} />
              <Route path="notifications" element={<TpoNotifications />} />
              <Route path="support" element={<TpoSupport />} />
            </Route>
          </Route>
        </Route>

        <Route element={<RoleRoute roles={['RECRUITER']} />}>
          <Route path="/recruiter" element={<RecruiterLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<RecruiterDashboard />} />
            <Route path="company" element={<CompanyProfile />} />
            <Route path="team" element={<CompanyRecruiters />} />
            <Route path="colleges" element={<CollegeAuthorizations />} />
            <Route path="drives" element={<AuthorizedDrives />} />
            <Route path="applications" element={<RecruiterApplications />} />
            <Route path="candidates/:applicationId" element={<CandidateDetails />} />
            <Route path="candidates/:applicationId/resume" element={<CandidateResume />} />
            <Route path="shortlist" element={<Shortlist />} />
            <Route path="tests" element={<Tests />} />
            <Route path="interviews" element={<RecruiterInterviews />} />
            <Route path="selections" element={<RecruiterSelections />} />
            <Route path="offers" element={<RecruiterOffers />} />
            <Route path="notifications" element={<RecruiterNotifications />} />
            <Route path="support" element={<RecruiterSupport />} />
          </Route>
        </Route>

        <Route element={<RoleRoute roles={['STUDENT']} />}>
          <Route element={<TenantRoute />}>
            <Route path="/student" element={<StudentLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="profile" element={<Profile />} />
              <Route path="academics" element={<AcademicDetails />} />
              <Route path="resume" element={<Resume />} />
              <Route path="skills" element={<Skills />} />
              <Route path="projects" element={<Projects />} />
              <Route path="certifications" element={<Certifications />} />
              <Route path="drives" element={<PlacementDrivesStudent />} />
              <Route path="drives/:id" element={<DriveDetails />} />
              <Route path="eligibility" element={<StudentEligibility />} />
              <Route path="applications" element={<StudentApplications />} />
              <Route path="applications/:id" element={<ApplicationDetails />} />
              <Route path="interviews" element={<StudentInterviews />} />
              <Route path="offers" element={<StudentOffers />} />
              <Route path="placement-status" element={<PlacementStatus />} />
              <Route path="notifications" element={<StudentNotifications />} />
              <Route path="support" element={<StudentSupport />} />
            </Route>
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
