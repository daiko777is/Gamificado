const svc = require('../services/studentService');
function list(req, res, next) {
  try { res.json({ success: true, data: svc.list({ q: req.query.q }) }); }
  catch (e) { next(e); }
}
function create(req, res, next) {
  try { res.status(201).json({ success: true, data: svc.create(req.body) }); }
  catch (e) { next(e); }
}
function update(req, res, next) {
  try { res.json({ success: true, data: svc.update(req.params.id, req.body) }); }
  catch (e) { next(e); }
}
function remove(req, res, next) {
  try { res.json({ success: true, data: svc.remove(req.params.id) }); }
  catch (e) { next(e); }
}
module.exports = { list, create, update, remove };
