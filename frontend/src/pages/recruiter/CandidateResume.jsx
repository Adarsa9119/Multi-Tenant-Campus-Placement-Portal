import { Link, useParams } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader.jsx';
import Alert from '../../components/common/Alert.jsx';
import ResumeViewer from '../../components/files/ResumeViewer.jsx';
import { recruiterApi } from '../../api/recruiterApi.js';

export default function CandidateResume() {
  const { applicationId } = useParams();
  return (
    <div>
      <PageHeader title="Candidate Resume" subtitle="Protected access: authorized per recruiter, college, drive and application. Every view is audited."><Link className="btn btn-light" to={`/recruiter/candidates/${applicationId}`}>← Back to candidate</Link></PageHeader>
      <Alert type="info">This resume is streamed through an authenticated request and is never available at a public URL.</Alert>
      <ResumeViewer fetchBlob={() => recruiterApi.resumeBlob(applicationId)} fetchDownload={() => recruiterApi.resumeBlob(applicationId, true)} filename="candidate-resume.pdf" />
    </div>
  );
}
