import ProfileListEditor from '../../components/forms/ProfileListEditor.jsx';

export default function Projects() {
  return <ProfileListEditor title="Projects" subtitle="Showcase your best work" field="projects" itemFields={[{ name: 'title', label: 'Project title', required: true }, { name: 'description', label: 'Description', type: 'textarea', full: true }, { name: 'link', label: 'Link (optional)' }]} />;
}
