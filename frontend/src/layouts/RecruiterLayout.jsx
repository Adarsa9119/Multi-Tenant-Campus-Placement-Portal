import Shell from '../components/common/Shell.jsx';
import useAuth from '../hooks/useAuth.js';
import { RECRUITER_NAV } from '../constants/routes.js';

export default function RecruiterLayout() {
  const { user } = useAuth();
  const c = user?.company;
  return <Shell dark brand="CampusHire" subtitle="Placement & Recruitment Portal" nav={RECRUITER_NAV} topTitle={`${c?.name || 'Company'} ${c?.verificationStatus === 'VERIFIED' ? '✔' : ''}`} footLabel="Company" footValue={c?.companyCode} footNote={c?.name} />;
}
