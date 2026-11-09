const files = require('../services/fileService');
const ctx = require('../utils/auditContext');
const { asyncHandler, ok } = require('../utils/response');

module.exports = {
  upload: asyncHandler(async (req, res) => ok(res, await files.saveResume(req.user, req.file, ctx(req)), 'Resume uploaded', 201)),
  meta: asyncHandler(async (req, res) => ok(res, await files.resumeMeta(req.user))),
  mine: asyncHandler(async (req, res) => files.sendOwn(req.user, res, ctx(req))),
  forApplication: asyncHandler(async (req, res) => files.sendForApplication(req.user, req.params.applicationId, res, ctx(req), ['1', 'true'].includes(req.query.download))),
};
