// Deterministic eligibility. No AI/ML: CGPA, branch, backlogs and graduation year.
function evaluate(student, criteria = {}) {
  const failures = [];
  if (student.cgpa < (criteria.minCgpa || 0)) failures.push(`CGPA ${student.cgpa} is below the required ${criteria.minCgpa}`);
  const branches = (criteria.branches || []).map((b) => String(b).toUpperCase());
  if (branches.length && !branches.includes('ALL') && !branches.includes(String(student.branch).toUpperCase())) failures.push(`Branch ${student.branch} is not eligible (allowed: ${branches.join(', ')})`);
  if ((student.backlogs || 0) > (criteria.maxBacklogs || 0)) failures.push(`Active backlogs ${student.backlogs} exceed the allowed ${criteria.maxBacklogs || 0}`);
  if (criteria.graduationYear && student.graduationYear !== criteria.graduationYear) failures.push(`Graduation year must be ${criteria.graduationYear}`);
  return { eligible: failures.length === 0, failures };
}
const describe = (c = {}) => ({
  cgpa: `CGPA >= ${c.minCgpa || 0}`,
  backlogs: (c.maxBacklogs || 0) === 0 ? 'No backlogs' : `Max ${c.maxBacklogs} backlogs`,
  branches: !c.branches || !c.branches.length || c.branches.includes('ALL') ? 'All branches' : c.branches.join('/'),
  graduationYear: c.graduationYear ? `Batch ${c.graduationYear}` : 'Any batch',
});
module.exports = { evaluate, describe };
