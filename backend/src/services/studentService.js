/* Service — CRUD de estudiantes con validación de negocio.
 * Evita N+1 y selects innecesarios: aquí solo se exponen columnas necesarias. */
const repo = require('../repositories/jsonRepo');
const { ApiError } = require('../middleware/errorHandler');

function list({ q } = {}) {
  let all = repo.students().all();
  if (q) {
    const needle = q.toLowerCase();
    all = all.filter((s) => `${s.nombre} ${s.email} ${s.curso || ''}`.toLowerCase().includes(needle));
  }
  return all;
}
function normEmail(e) { return String(e || '').trim().toLowerCase(); }
function create(data) {
  const students = repo.students();
  const clean = Object.assign({}, data);
  delete clean.id; // F1: el id siempre lo genera el servidor, nunca el cliente
  clean.email = normEmail(clean.email);
  if (students.find((s) => normEmail(s.email) === clean.email)) throw new ApiError(409, 'Ya existe un estudiante con ese email');
  return students.insert(Object.assign({
    id: 's-' + Date.now().toString(36), activo: true, createdAt: new Date().toISOString()
  }, clean));
}
const ALLOWED = ['nombre', 'email', 'curso', 'nota', 'activo'];
function update(id, patch) {
  const students = repo.students();
  const clean = {};
  ALLOWED.forEach((k) => { if (patch[k] !== undefined) clean[k] = patch[k]; }); // F6: whitelist
  if (clean.email !== undefined) {
    clean.email = normEmail(clean.email);
    const clash = students.all().find((s) => String(s.id) !== String(id) && normEmail(s.email) === clean.email);
    if (clash) throw new ApiError(409, 'Ya existe otro estudiante con ese email'); // F4
  }
  const row = students.update(id, clean);
  if (!row) throw new ApiError(404, 'Estudiante no encontrado');
  return row;
}
function remove(id) {
  if (!repo.students().remove(id)) throw new ApiError(404, 'Estudiante no encontrado');
  return { ok: true };
}
module.exports = { list, create, update, remove };
