// Display-only mirror of the backend rule engine (the server is the source of truth and re-checks everything).
export function evaluate(student, c = {}) {
  const failures = [];
  if (student.cgpa < (c.minCgpa || 0)) failures.push(`CGPA below ${c.minCgpa}`);
  const b = (c.branches || []).map((x) => x.toUpperCase());
  if (b.length && !b.includes('ALL') && !b.includes(String(student.branch).toUpperCase())) failures.push('Branch not eligible');
  if ((student.backlogs || 0) > (c.maxBacklogs || 0)) failures.push('Too many backlogs');
  if (c.graduationYear && student.graduationYear !== c.graduationYear) failures.push('Graduation year mismatch');
  return { eligible: !failures.length, failures };
}
export const criteriaChips = (c = {}) => [
  `CGPA ≥ ${c.minCgpa || 0}`,
  (c.maxBacklogs || 0) === 0 ? 'No backlogs' : `≤ ${c.maxBacklogs} backlogs`,
  !c.branches?.length || c.branches.includes('ALL') ? 'All branches' : c.branches.join('/'),
  ...(c.graduationYear ? [`Batch ${c.graduationYear}`] : []),
];
