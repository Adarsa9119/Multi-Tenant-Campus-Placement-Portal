// Maps any status string to a badge tone (see .badge-* in global.css)
export const STATUS_TONE = {
  PENDING: 'amber', UNDER_REVIEW: 'blue', REQUESTED: 'amber', APPLIED: 'blue', INVITED: 'amber', DRAFT: 'gray',
  VERIFIED: 'green', ACTIVE: 'green', APPROVED: 'green', AUTHORIZED: 'green', PUBLISHED: 'green', ACCEPTED: 'green', RESOLVED: 'green', PLACED: 'green', PASSED: 'green', OFFERED: 'green', LOW: 'blue',
  SHORTLISTED: 'amber', TEST: 'purple', INTERVIEW: 'red', SELECTED: 'green', OFFER: 'green', IN_PROGRESS: 'blue', INVESTIGATING: 'blue', MEDIUM: 'amber', CLOSED: 'gray', ONLINE: 'blue',
  REJECTED: 'red', SUSPENDED: 'red', REVOKED: 'red', INACTIVE: 'red', DECLINED: 'red', FAILED: 'red', OPEN: 'red', HIGH: 'red', DOCUMENT_ISSUE: 'red', NONE: 'gray', WITHDRAWN: 'gray',
};
export const APPLICATION_FLOW = ['APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'TEST', 'INTERVIEW', 'SELECTED', 'OFFER', 'PLACED'];
export const BRANCHES = ['CSE', 'IT', 'ECE', 'EEE', 'ME', 'CE', 'AIML', 'MCA', 'ALL'];
export const COLLEGE_TYPES = ['Engineering', 'Polytechnic', 'Arts & Science', 'Management', 'Medical', 'Other'];
export const STATES = ['Andhra Pradesh', 'Assam', 'Bihar', 'Delhi', 'Gujarat', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Odisha', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal'];
