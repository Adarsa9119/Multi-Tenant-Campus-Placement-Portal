const Department = require('../models/Department');
const reports = require('../services/reportService');
const { handle, AppError } = require('../utils/response');
const { paginate } = require('../utils/pagination');

module.exports = {
  dashboard: handle((req) => reports.tpoDashboard(req.user)),
  listDepartments: handle((req) => paginate(Department, { tenantId: req.tenantId }, { limit: 100, ...req.query }, { sort: { code: 1 } })),
  createDepartment: handle((req) => Department.create({ tenantId: req.tenantId, name: req.body.name, code: req.body.code }), 'Department created', 201),
  updateDepartment: handle(async (req) => {
    const d = await Department.findOne({ _id: req.params.id, tenantId: req.tenantId });
    if (!d) throw new AppError(404, 'Department not found');
    ['name', 'code', 'status'].forEach((k) => { if (req.body[k] !== undefined) d[k] = req.body[k]; });
    return d.save();
  }, 'Department updated'),
};
