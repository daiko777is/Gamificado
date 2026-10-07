/* storage.js — ÚNICA capa que toca datos.
 * Estrategia dual (pedida por el reto + backend):
 *  1) Intenta usar Educa API (http://localhost:3001/api) si responde.
 *  2) Si no hay backend, usa localStorage (requisito original del reto).
 * Así la app funciona para las capturas de localStorage Y con backend real.
 */
(function (global) {
  'use strict';

  var API_BASE = 'http://localhost:3001/api';
  var LS_USERS = 'educa_usuarios';
  var LS_STUDENTS = 'educa_estudiantes';
  var LS_SESSION = 'educa_sesion';
  var LS_TOKEN = 'educa_token';
  var backendOk = false;

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

  async function api(path, opts) {
    var token = localStorage.getItem(LS_TOKEN);
    var res = await fetch(API_BASE + path, Object.assign({
      headers: Object.assign({ 'Content-Type': 'application/json' }, token ? { Authorization: 'Bearer ' + token } : {})
    }, opts || {}));
    var body = await res.json().catch(function () { return {}; });
    if (!res.ok) throw new Error((body && body.error) || ('HTTP ' + res.status));
    return body.data !== undefined ? body.data : body;
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

    // ---- Auth ----
    async register(payload) {
      if (backendOk) {
        try {
          var r = await api('/auth/register', { method: 'POST', body: JSON.stringify(payload) });
          if (r.token) localStorage.setItem(LS_TOKEN, r.token);
          writeLS(LS_SESSION, r.user); return r.user;
        } catch (e) { /* cae a local */ }
      }
      var users = readLS(LS_USERS, []);
      if (users.some(function (u) { return u.email === payload.email; })) throw new Error('Ese email ya está registrado.');
      var u = { id: uid('u'), name: payload.name, email: payload.email, pass: payload.password };
      users.push(u); writeLS(LS_USERS, users);
      var pub = { id: u.id, name: u.name, email: u.email };
      writeLS(LS_SESSION, pub); return pub;
    },
    async login(payload) {
      if (backendOk) {
        try {
          var r = await api('/auth/login', { method: 'POST', body: JSON.stringify(payload) });
          if (r.token) localStorage.setItem(LS_TOKEN, r.token);
          writeLS(LS_SESSION, r.user); return r.user;
        } catch (e) { /* cae a local para no bloquear la demo */ }
      }
      var users = readLS(LS_USERS, []);
      var u = users.find(function (x) { return x.email === payload.email && x.pass === payload.password; });
      if (!u) throw new Error('Credenciales inválidas. Verifica email y contraseña.');
      var pub = { id: u.id, name: u.name, email: u.email };
      writeLS(LS_SESSION, pub); return pub;
    },
    logout() { localStorage.removeItem(LS_SESSION); localStorage.removeItem(LS_TOKEN); },
    session() { return readLS(LS_SESSION, null); },

    // ---- Students ----
    async listStudents() {
      if (backendOk) { try { return await api('/students'); } catch (e) { /* fallback */ } }
      return readLS(LS_STUDENTS, []);
    },
    async saveStudent(s) {
      if (backendOk) { try { return await api('/students', { method: 'POST', body: JSON.stringify(s) }); } catch (e) {} }
      var all = readLS(LS_STUDENTS, []);
      if (s.id) {
        var i = all.findIndex(function (x) { return String(x.id) === String(s.id); });
        if (i > -1) all[i] = Object.assign({}, all[i], s); else all.push(s);
      } else { s.id = uid('s'); all.push(s); }
      writeLS(LS_STUDENTS, all); return s;
    },
    async deleteStudent(id) {
      if (backendOk) { try { await api('/students/' + id, { method: 'DELETE' }); } catch (e) {} }
      writeLS(LS_STUDENTS, readLS(LS_STUDENTS, []).filter(function (x) { return String(x.id) !== String(id); }));
    }
  };

  seedIfEmpty();
  global.EducaStorage = Storage;
})(window);
