const User = require('../models/User');
const Tenant = require('../models/Tenant');
const Recruiter = require('../models/Recruiter');
const Company = require('../models/Company');
const { verifyToken } = require('../utils/jwt');
const { AppError, asyncHandler } = require('../utils/response');

// A valid JWT is not enough: the account (and its college) must still be active on every request.
module.exports = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) throw new AppError(401, 'Authentication required');
  let decoded;
  try { decoded = verifyToken(token); } catch (e) { throw new AppError(401, 'Invalid or expired token'); }
  const user = await User.findById(decoded.sub).lean();
  if (!user || user.status !== 'ACTIVE') throw new AppError(401, 'Account is not active');
  if (user.role === 'TPO' || user.role === 'STUDENT') {
    const tenant = await Tenant.findById(user.tenantId).select('status').lean();
    if (!tenant || tenant.status !== 'ACTIVE') throw new AppError(403, 'Your college is not active');
  }
  if (user.role === 'RECRUITER') {
    const recruiter = await Recruiter.findOne({ userId: user._id }).select('status companyId').lean();
    if (!recruiter || recruiter.status !== 'ACTIVE') throw new AppError(401, 'Recruiter account is not active');
    const company = await Company.findById(recruiter.companyId).select('status').lean();
    if (!company || company.status !== 'ACTIVE') throw new AppError(403, 'Company account is not active');
  }
  req.user = { id: String(user._id), role: user.role, tenantId: user.tenantId ? String(user.tenantId) : null, name: user.name, email: user.email };
  next();
});
