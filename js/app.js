/* app.js — Orquestador: conecta módulos con el DOM */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var XP = 10;

  function setXP(v, label) {
    XP = v; $('xpPill').textContent = v + ' XP'; $('xpFill').style.width = Math.min(100, v) + '%';
    if (label) $('xpLabel').textContent = label;
  }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  function renderRows(list) {
    var body = $('studentsBody');
    body.innerHTML = list.map(function (s) {
      return '<tr><td><strong>' + esc(s.nombre) + '</strong><br><span class="muted small">' + esc(s.email) + '</span></td>' +
        '<td>' + esc(s.curso || '—') + '</td><td>' + esc(s.nota != null && s.nota !== '' ? s.nota : '—') + '</td>' +
        '<td><span class="badge ' + (s.activo !== false ? 'ok' : 'off') + '">' + (s.activo !== false ? 'Activo' : 'Inactivo') + '</span></td>' +
        '<td><div class="row-actions"><button class="mini" data-edit="' + esc(s.id) + '">Editar</button>' +
        '<button class="mini danger" data-del="' + esc(s.id) + '">Borrar</button></div></td></tr>';
    }).join('');
    $('emptyMsg').classList.toggle('hidden', list.length > 0);
  }

  async function paintDashboard() {
    var all = await window.EducaStudents.refresh();
    var q = $('searchInput').value;
    renderRows(window.EducaStudents.filter(q));
    var st = window.EducaStudents.stats();
    $('statTotal').textContent = st.total; $('statActive').textContent = st.active; $('statAvg').textContent = st.avg;
    $('statSource').textContent = window.EducaStorage.useBackend ? 'API' : 'local';
  }

  function showSession(user) {
    $('authSection').classList.add('hidden'); $('heroSection').classList.add('hidden');
    $('dashboard').classList.remove('hidden'); $('logoutBtn').classList.remove('hidden');
    $('welcomeMsg').textContent = 'Hola, ' + user.name + ' (' + user.email + '). Gestiona tus estudiantes abajo.';
    setXP(100, 'Fase 3 · Sesión activa — reto completado');
    paintDashboard();
  }
  function showPublic() {
    $('authSection').classList.remove('hidden'); $('heroSection').classList.remove('hidden');
    $('dashboard').classList.add('hidden'); $('logoutBtn').classList.add('hidden');
  }

  document.addEventListener('DOMContentLoaded', async function () {
    await window.EducaStorage.ping();
    document.addEventListener('educa:backend', function (e) {
      var dot = $('backendDot');
      dot.textContent = e.detail ? '● API conectada' : '● local';
      dot.classList.toggle('on', !!e.detail);
      if (!$('dashboard').classList.contains('hidden')) paintDashboard();
    });

    document.querySelectorAll('[data-goto]').forEach(function (b) {
      b.addEventListener('click', function () {
        var t = b.getAttribute('data-goto') === 'login' ? $('loginCard') : $('registerCard');
        t.scrollIntoView({ behavior: 'smooth', block: 'center' });
        t.querySelector('input').focus();
      });
    });
    $('navDocsBtn').addEventListener('click', function () { $('gitGuide').scrollIntoView({ behavior: 'smooth' }); });

    var sess = window.EducaStorage.session();
    if (sess) showSession(sess); else setXP(20, 'Fase 1 · Análisis en docs/ANALISIS.md — regístrate para continuar');

    $('loginForm').addEventListener('submit', async function (e) {
      e.preventDefault();
      var u = await window.EducaLogin.handleLogin(e.target, $('loginError'));
      if (u) { e.target.reset(); setXP(60, 'Fase 2 · Nivel 3 — login funcional'); showSession(u); }
    });
    $('registerForm').addEventListener('submit', async function (e) {
      e.preventDefault();
      var u = await window.EducaRegister.handleRegister(e.target, $('registerError'));
      if (u) { e.target.reset(); setXP(75, 'Fase 2 · Nivel 3 — registro funcional'); showSession(u); }
    });
    $('logoutBtn').addEventListener('click', function () { window.EducaStorage.logout(); showPublic(); });

    $('newStudentBtn').addEventListener('click', function () {
      var f = $('studentForm'); f.reset(); f.id.value = ''; f.classList.remove('hidden'); f.nombre.focus();
    });
    $('cancelStudentBtn').addEventListener('click', function () { $('studentForm').classList.add('hidden'); });
    $('searchInput').addEventListener('input', async function () {
      renderRows(window.EducaStudents.filter($('searchInput').value));
    });

    $('studentForm').addEventListener('submit', async function (e) {
      e.preventDefault();
      var f = e.target, err = $('studentError'); err.classList.add('hidden');
      var data = {
        id: f.id.value || undefined,
        nombre: f.nombre.value.trim(), email: f.email.value.trim().toLowerCase(),
        curso: f.curso.value.trim(), nota: f.nota.value === '' ? null : Number(f.nota.value),
        activo: f.activo.checked
      };
      if (data.nombre.length < 2) { err.textContent = 'El nombre es obligatorio.'; err.classList.remove('hidden'); return; }
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.email)) { err.textContent = 'Email inválido.'; err.classList.remove('hidden'); return; }
      await window.EducaStorage.saveStudent(data);
      f.reset(); f.classList.add('hidden');
      setXP(90, 'Fase 2 · Nivel 4 — CRUD de estudiantes + ramas + merge');
      paintDashboard();
    });

    $('studentsBody').addEventListener('click', async function (e) {
      var ed = e.target.getAttribute('data-edit'), del = e.target.getAttribute('data-del');
      if (ed) {
        var s = window.EducaStudents.cache.find(function (x) { return String(x.id) === String(ed); });
        if (!s) return;
        var f = $('studentForm');
        f.id.value = s.id; f.nombre.value = s.nombre; f.email.value = s.email;
        f.curso.value = s.curso || ''; f.nota.value = s.nota != null ? s.nota : ''; f.activo.checked = s.activo !== false;
        f.classList.remove('hidden'); f.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      if (del && confirm('¿Borrar este estudiante?')) { await window.EducaStorage.deleteStudent(del); paintDashboard(); }
    });
  });
})();
