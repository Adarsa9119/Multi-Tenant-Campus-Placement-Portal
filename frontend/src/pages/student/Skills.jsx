import ProfileListEditor from '../../components/forms/ProfileListEditor.jsx';

export default function Skills() {
  return <ProfileListEditor title="Skills" subtitle="Skills are shown to recruiters of drives you apply to" field="skills" simple itemFields={[{ name: 'skill', label: 'Skill', required: true, placeholder: 'e.g. React' }]} />;
}
