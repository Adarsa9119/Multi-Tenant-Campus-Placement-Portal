const parse = (q = {}) => {
  const page = Math.max(1, parseInt(q.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(q.limit, 10) || 20));
  return { page, limit, skip: (page - 1) * limit };
};
const paginate = async (Model, filter, q = {}, { sort = { createdAt: -1 }, populate, select } = {}) => {
  const p = parse(q);
  let qry = Model.find(filter).sort(sort).skip(p.skip).limit(p.limit);
  if (select) qry = qry.select(select);
  if (populate) qry = qry.populate(populate);
  const [items, total] = await Promise.all([qry.lean(), Model.countDocuments(filter)]);
  return { items, meta: { page: p.page, limit: p.limit, total, pages: Math.ceil(total / p.limit) || 1 } };
};
const escapeRegex = (s = '') => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
module.exports = { parse, paginate, escapeRegex };
