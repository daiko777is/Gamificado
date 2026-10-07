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
function create(data) {
  const students = repo.students();
  if (students.find((s) => s.email === data.email)) throw new ApiError(409, 'Ya existe un estudiante con ese email');
  return students.insert(Object.assign({
    id: 's-' + Date.now().toString(36), activo: true, createdAt: new Date().toISOString()
  }, data));
}
function update(id, patch) {
  const row = repo.students().update(id, patch);
  if (!row) throw new ApiError(404, 'Estudiante no encontrado');
  return row;
}
function remove(id) {
  if (!repo.students().remove(id)) throw new ApiError(404, 'Estudiante no encontrado');
  return { ok: true };
}
module.exports = { list, create, update, remove };
