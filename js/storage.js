/* storage.js — ÚNICA capa que toca datos.
 *
 * Reglas de sesión (coherentes con el backend):
 * - Si hay backend: él manda. Los errores HTTP (409, 401, 400) se muestran,
 *   NO se esconden con fallback. Solo la caída de red usa localStorage.
 * - El email de CUENTA es libre (cualquiera con @) pero ÚNICO: se verifica
 *   en localStorage (simulado) y en la API (409). Siempre normalizado.
 * - Editar = PATCH con id; crear = POST. El servidor genera los ids.
 */
(function (global) {
  'use strict';

  var API_BASE = 'http://localhost:3001/api';
  var LS_USERS = 'educa_usuarios';
  var LS_STUDENTS = 'educa_estudiantes';
  var LS_SESSION = 'educa_sesion';
  var LS_TOKEN = 'educa_token';
  var DEMO_EMAIL = 'demo@educa.co';
  var DEMO_PASS = 'demo1234';
  var backendOk = false;

  function normEmail(e) { return String(e || '').trim().toLowerCase(); }
  function readLS(key, fb) {
    try { var v = localStorage.getItem(key); return v ? JSON.parse(v) : fb; }
    catch (e) { return fb; }
  }
  function writeLS(key, val) { localStorage.setItem(key, JSON.stringify(val)); }

  function seedIfEmpty() {
    if (!localStorage.getItem(LS_USERS)) {
      writeLS(LS_USERS, [{ id: 'u-demo', name: 'Demo Profe', email: 'demo@educa.co', pass: 'demo1234' }]);
    }
    if (!localStorage.getItem(LS_STUDENTS)) {
      writeLS(LS_STUDENTS, [
        { id: 's1', nombre: 'Grace Hopper', email: 'grace@educa.co', curso: 'Sistemas 10-B', nota: 4.8, activo: true },
        { id: 's2', nombre: 'Ada Lovelace', email: 'ada@educa.co', curso: 'Matemáticas 11-A', nota: 4.5, activo: true },
        { id: 's3', nombre: 'Alan Turing', email: 'alan@educa.co', curso: 'Lógica 10-A', nota: 3.9, activo: false }
      ]);
    }
  }

  function uid(p) { return (p || 'id') + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

  function expired() {
    localStorage.removeItem(LS_SESSION); localStorage.removeItem(LS_TOKEN);
    document.dispatchEvent(new CustomEvent('educa:expired'));
  }

  async function api(path, opts) {
    var token = localStorage.getItem(LS_TOKEN);
    var res;
    try {
      res = await fetch(API_BASE + path, Object.assign({
        headers: Object.assign({ 'Content-Type': 'application/json' }, token ? { Authorization: 'Bearer ' + token } : {})
      }, opts || {}));
    } catch (e) { var n = new Error('Sin conexión con el servidor. Revisa que el backend esté encendido.'); n.network = true; throw n; }
    var body = await res.json().catch(function () { return {}; });
    if (res.status === 401) { expired(); throw new Error('Sesión expirada. Entra de nuevo.'); }
    if (!res.ok) throw new Error((body && body.error) || ('HTTP ' + res.status));
    return body.data !== undefined ? body.data : body;
  }

  // Solo cae a local si NO hay backend o se cayó la red. Nunca ante un error HTTP.
  async function viaBackend(fn, fallbackFn) {
    if (!backendOk) return fallbackFn();
    try { return await fn(); }
    catch (e) { if (e && e.network) { backendOk = false; return fallbackFn(); } throw e; }
  }

  async function ping() {
    try {
      var ctl = new AbortController(); var t = setTimeout(function () { ctl.abort(); }, 1500);
      await fetch(API_BASE.replace('/api', '/health'), { signal: ctl.signal });
      clearTimeout(t); backendOk = true;
    } catch (e) { backendOk = false; }
    document.dispatchEvent(new CustomEvent('educa:backend', { detail: backendOk }));
    return backendOk;
  }

  var Storage = {
    get useBackend() { return backendOk; },
    ping: ping,
    hasToken: function () { return !!localStorage.getItem(LS_TOKEN); },
    // Verifica que el token guardado siga válido (para el arranque).
    async verify() {
      if (!backendOk || !localStorage.getItem(LS_TOKEN)) return null;
      try { return await api('/auth/me'); }
      catch (e) { if (!e.network) return null; return readLS(LS_SESSION, null); }
    },

    // ---- Auth ----
    async register(payload) {
      var email = normEmail(payload.email);
      if (!email.includes('@')) throw new Error('Email inválido: debe contener @.');
      return viaBackend(function () {
        return api('/auth/register', { method: 'POST', body: JSON.stringify({ name: payload.name, email: email, password: payload.password }) })
          .then(function (r) {
            if (r.token) localStorage.setItem(LS_TOKEN, r.token);
            writeLS(LS_SESSION, r.user); return r.user;
          });
      }, function () {
        var users = readLS(LS_USERS, []);
        if (users.some(function (u) { return normEmail(u.email) === email; })) throw new Error('Ese email ya está registrado.');
        var u = { id: uid('u'), name: payload.name, email: email, pass: payload.password };
        users.push(u); writeLS(LS_USERS, users);
        var pub = { id: u.id, name: u.name, email: u.email };
        writeLS(LS_SESSION, pub); return pub;
      });
    },
    async login(payload) {
      var email = normEmail(payload.email);
      var isDemo = email === DEMO_EMAIL && payload.password === DEMO_PASS;
      function loginApi() {
        return api('/auth/login', { method: 'POST', body: JSON.stringify({ email: email, password: payload.password }) })
          .then(function (r) {
            if (r.token) localStorage.setItem(LS_TOKEN, r.token);
            writeLS(LS_SESSION, r.user); return r.user;
          });
      }
      return viaBackend(function () {
        // El demo "se crea sola si no existe": con backend, db.json no trae usuarios,
        // así que si el login del demo es rechazado lo registramos y reintentamos.
        return loginApi().catch(function (e) {
          if (!isDemo || e.network) throw e;
          return api('/auth/register', { method: 'POST', body: JSON.stringify({ name: 'Demo Profe', email: DEMO_EMAIL, password: DEMO_PASS }) })
            .then(loginApi)
            .catch(function () { throw e; }); // si no se pudo crear (p. ej. ya existe con otra clave), mostramos el error original
        });
      }, function () {
        var users = readLS(LS_USERS, []);
        var u = users.find(function (x) { return normEmail(x.email) === email && x.pass === payload.password; });
        if (!u) throw new Error('Credenciales inválidas. Verifica email y contraseña.');
        var pub = { id: u.id, name: u.name, email: u.email };
        writeLS(LS_SESSION, pub); return pub;
      });
    },
    logout() { localStorage.removeItem(LS_SESSION); localStorage.removeItem(LS_TOKEN); },
    session() { return readLS(LS_SESSION, null); },

    // ---- Students ----
    async listStudents() {
      return viaBackend(function () { return api('/students'); },
        function () { return readLS(LS_STUDENTS, []); });
    },
    async saveStudent(s) {
      var clean = Object.assign({}, s);
      if (clean.id) {
        var id = clean.id; delete clean.id;
        return viaBackend(function () { return api('/students/' + id, { method: 'PATCH', body: JSON.stringify(clean) }); },
          function () {
            var all = readLS(LS_STUDENTS, []);
            var i = all.findIndex(function (x) { return String(x.id) === String(id); });
            clean.id = id;
            if (i > -1) {
              if (clean.email && all.some(function (x, xi) { return xi !== i && normEmail(x.email) === normEmail(clean.email); })) {
                throw new Error('Ya existe otro estudiante con ese email.');
              }
              all[i] = Object.assign({}, all[i], clean);
            } else all.push(clean);
            writeLS(LS_STUDENTS, all); return clean;
          });
      }
      return viaBackend(function () { return api('/students', { method: 'POST', body: JSON.stringify(clean) }); },
        function () {
          var all2 = readLS(LS_STUDENTS, []);
          if (clean.email && all2.some(function (x) { return normEmail(x.email) === normEmail(clean.email); })) {
            throw new Error('Ya existe un estudiante con ese email.');
          }
          clean.id = uid('s'); all2.push(clean); writeLS(LS_STUDENTS, all2); return clean;
        });
    },
    async deleteStudent(id) {
      return viaBackend(function () { return api('/students/' + id, { method: 'DELETE' }); },
        function () {
          writeLS(LS_STUDENTS, readLS(LS_STUDENTS, []).filter(function (x) { return String(x.id) !== String(id); }));
        });
    }
  };

  seedIfEmpty();
  global.EducaStorage = Storage;
})(window);
