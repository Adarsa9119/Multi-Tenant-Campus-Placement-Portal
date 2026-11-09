const students = require('../services/studentService');
const drives = require('../services/driveService');
const ctx = require('../utils/auditContext');
const { handle, AppError } = require('../utils/response');

// Minimal CSV parser (header row required): handles quoted fields.
function parseCsv(text) {
  const rows = [];
  let cur = ''; let row = []; let q = false;
  for (let i = 0; i < text.length; i += 1) {
    const c = text[i];
    if (q) { if (c === '"' && text[i + 1] === '"') { cur += '"'; i += 1; } else if (c === '"') q = false; else cur += c; }
    else if (c === '"') q = true;
    else if (c === ',') { row.push(cur); cur = ''; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i += 1; row.push(cur); rows.push(row); row = []; cur = ''; }
    else cur += c;
  }
  if (cur || row.length) { row.push(cur); rows.push(row); }
  const clean = rows.filter((r) => r.some((x) => x.trim()));
  if (clean.length < 2) return [];
  const head = clean[0].map((h) => h.trim());
  return clean.slice(1).map((r) => Object.fromEntries(head.map((h, i) => [h, (r[i] || '').trim()])));
}

module.exports = {
  // TPO operations (tenant is always the TPO's own)
  create: handle((req) => students.createStudent(ctx(req), req.body), 'Student created and invited', 201),
  bulk: handle((req) => {
    let rows = req.body.rows;
    if (req.file) rows = parseCsv(req.file.buffer.toString('utf8'));
    if (!rows || !rows.length) throw new AppError(400, 'Provide a CSV file or rows');
    return students.bulkImport(ctx(req), rows);
  }, 'Import finished'),
  list: handle((req) => students.list(ctx(req), req.query)),
  get: handle((req) => students.get(ctx(req), req.params.id)),
  update: handle((req) => students.update(ctx(req), req.params.id, req.body), 'Student updated'),
  verify: handle((req) => students.verify(ctx(req), req.params.id, req.body), 'Verification updated'),
  // Student self-service
  dashboard: handle((req) => students.dashboard(req.user)),
  profile: handle((req) => students.getProfile(req.user)),
  updateProfile: handle((req) => students.updateProfile(req.user, req.body), 'Profile updated'),
  placementStatus: handle((req) => students.placementStatus(req.user)),
  eligibleDrives: handle(async (req) => ({ items: (await students.listEligibleDrives(req.user)).map((d) => ({ ...d, company: d.companyId?.name })), meta: { page: 1, limit: 100, total: 0, pages: 1 } })),
  driveDetails: handle((req) => drives.getForStudent(req.user, req.params.id)),
};
