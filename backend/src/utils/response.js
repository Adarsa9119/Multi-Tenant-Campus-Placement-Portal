class AppError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
    this.isAppError = true;
  }
}
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const ok = (res, data = {}, message = 'OK', status = 200) => res.status(status).json({ success: true, message, data });
const created = (res, data, message = 'Created') => ok(res, data, message, 201);
// handle(fn) wraps a controller: fn(req,res) returns data, or {items,meta} for paginated lists
const handle = (fn, message = 'OK', status = 200) =>
  asyncHandler(async (req, res) => {
    const out = await fn(req, res);
    if (res.headersSent) return undefined;
    if (out && out.items && out.meta) return res.status(status).json({ success: true, message, data: out.items, meta: out.meta });
    return ok(res, out === undefined ? {} : out, message, status);
  });
module.exports = { AppError, asyncHandler, ok, created, handle };
