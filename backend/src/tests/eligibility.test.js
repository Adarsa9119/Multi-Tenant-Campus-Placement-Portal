process.env.NODE_ENV = 'test';
const { evaluate, describe: describeCriteria } = require('../services/eligibilityService');

const crit = { minCgpa: 7.5, branches: ['CSE', 'AIML'], maxBacklogs: 0, graduationYear: 2027 };
const stu = (o = {}) => ({ cgpa: 8, branch: 'CSE', backlogs: 0, graduationYear: 2027, ...o });

describe('deterministic eligibility', () => {
  test('eligible when every rule passes', () => expect(evaluate(stu(), crit).eligible).toBe(true));
  test('CGPA boundary is inclusive', () => {
    expect(evaluate(stu({ cgpa: 7.5 }), crit).eligible).toBe(true);
    expect(evaluate(stu({ cgpa: 7.49 }), crit).eligible).toBe(false);
  });
  test('branch must be listed (case-insensitive); ALL matches everything', () => {
    expect(evaluate(stu({ branch: 'aiml' }), crit).eligible).toBe(true);
    expect(evaluate(stu({ branch: 'ME' }), crit).eligible).toBe(false);
    expect(evaluate(stu({ branch: 'ME' }), { ...crit, branches: ['ALL'] }).eligible).toBe(true);
  });
  test('backlogs and graduation year are enforced', () => {
    expect(evaluate(stu({ backlogs: 1 }), crit).eligible).toBe(false);
    expect(evaluate(stu({ backlogs: 1 }), { ...crit, maxBacklogs: 1 }).eligible).toBe(true);
    expect(evaluate(stu({ graduationYear: 2026 }), crit).eligible).toBe(false);
  });
  test('failure reasons are explained', () => {
    const r = evaluate(stu({ cgpa: 5, backlogs: 3, branch: 'ME' }), crit);
    expect(r.failures).toHaveLength(3);
  });
  test('criteria description is human readable', () => expect(describeCriteria(crit).cgpa).toBe('CGPA >= 7.5'));
});
