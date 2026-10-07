/* Service — lógica de negocio de autenticación (bcrypt + JWT).
 * El controller solo traduce HTTP; todo lo importante vive aquí. */
const bcrypt = require('bcryptjs');
const repo = require('../repositories/jsonRepo');
const { ApiError } = require('../middleware/errorHandler');
const { sign } = require('../middleware/auth');

const publicUser = (u) => ({ id: u.id, name: u.name, email: u.email, role: u.role || 'user' });

async function register({ name, email, password }) {
  const users = repo.users();
  if (users.find((u) => u.email === email)) throw new ApiError(409, 'Ese email ya está registrado');
  const user = {
    id: 'u-' + Date.now().toString(36),
    name, email, role: 'user',
    passHash: await bcrypt.hash(password, 10),
    createdAt: new Date().toISOString()
  };
  users.insert(user);
  const pub = publicUser(user);
  return { user: pub, token: sign(pub) };
}

async function login({ email, password }) {
  const u = repo.users().find((x) => x.email === email);
  // Demo seed: si no existe y es la cuenta demo, crearla al vuelo
  if (!u && email === 'demo@educa.co' && password === 'demo1234') {
    return register({ name: 'Demo Profe', email, password });
  }
  if (!u) throw new ApiError(401, 'Credenciales inválidas');
  const ok = await bcrypt.compare(password, u.passHash || '');
  if (!ok) throw new ApiError(401, 'Credenciales inválidas');
  const pub = publicUser(u);
  return { user: pub, token: sign(pub) };
}

module.exports = { register, login };
