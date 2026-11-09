import ProfileListEditor from '../../components/forms/ProfileListEditor.jsx';

export default function Certifications() {
  return <ProfileListEditor title="Certifications" subtitle="Certifications and internships help recruiters evaluate you" field="certifications" itemFields={[{ name: 'name', label: 'Certification', required: true }, { name: 'issuer', label: 'Issuer' }, { name: 'year', label: 'Year', type: 'number' }]} />;
}
