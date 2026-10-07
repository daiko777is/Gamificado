/* app.js — Orquestador del SISTEMA: auth, vistas, drawer, tabla */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var TITLES = { dashboard: 'Panel', students: 'Estudiantes', guide: 'Guía GIT' };

  function setXP(v, label) {
    $('xpPill').textContent = v + ' XP'; $('xpFill').style.width = Math.min(100, v) + '%';
    if (label) $('xpLabel').textContent = label;
  }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function rowActions(s) {
    return '<div class="row-actions"><button class="mini" data-edit="' + esc(s.id) + '" type="button">Editar</button>' +
      '<button class="mini danger" data-del="' + esc(s.id) + '" type="button">Borrar</button></div>';
  }
  function rowHTML(s, actions) {
    return '<tr><td><strong>' + esc(s.nombre) + '</strong><br><span class="muted small">' + esc(s.email) + '</span></td>' +
      '<td>' + esc(s.curso || '—') + '</td><td>' + esc(s.nota != null && s.nota !== '' ? s.nota : '—') + '</td>' +
      '<td><span class="badge ' + (s.activo !== false ? 'ok' : 'off') + '">' + (s.activo !== false ? 'Activo' : 'Inactivo') + '</span></td>' +
      (actions ? '<td>' + rowActions(s) + '</td>' : '') + '</tr>';
  }

  async function paint() {
    var all = await window.EducaStudents.refresh();
    var q = $('searchInput').value;
    var list = window.EducaStudents.filter(q);
    $('studentsBody').innerHTML = list.map(function (s) { return rowHTML(s, true); }).join('');
    $('emptyMsg').classList.toggle('hidden', list.length > 0);
    $('recentBody').innerHTML = all.slice(-5).reverse().map(function (s) { return rowHTML(s, false); }).join('');
    var st = window.EducaStudents.stats();
    $('statTotal').textContent = st.total; $('statActive').textContent = st.active;
    $('statAvg').textContent = st.avg;
    $('statSource').textContent = window.EducaStorage.useBackend ? 'API' : 'local';
  }

  function showView(name) {
    ['dashboard', 'students', 'guide'].forEach(function (v) {
      $('view-' + v).classList.toggle('hidden', v !== name);
    });
    document.querySelectorAll('.side-link').forEach(function (b) {
      b.classList.toggle('is-on', b.getAttribute('data-view') === name);
    });
    $('viewTitle').textContent = TITLES[name];
    $('searchInput').classList.toggle('hidden', name !== 'students');
  }

  function openDrawer(edit) {
    var f = $('studentForm'); f.reset();
    $('drawerTitle').textContent = edit ? 'Editar estudiante' : 'Nuevo estudiante';
    if (edit) {
      f.id.value = edit.id; f.nombre.value = edit.nombre; f.email.value = edit.email;
      f.curso.value = edit.curso || ''; f.nota.value = edit.nota != null ? edit.nota : '';
      f.activo.checked = edit.activo !== false;
    } else { f.id.value = ''; }
    $('studentError').classList.add('hidden');
    $('scrim').classList.remove('hidden');
    var d = $('drawer'); d.classList.remove('hidden'); d.classList.add('pre-enter');
    requestAnimationFrame(function () { requestAnimationFrame(function () { d.classList.remove('pre-enter'); }); });
    setTimeout(function () { f.nombre.focus(); }, 340);
  }
  function closeDrawer() {
    var d = $('drawer');
    d.classList.add('pre-enter'); $('scrim').style.opacity = '0';
    setTimeout(function () { d.classList.add('hidden'); $('scrim').classList.add('hidden'); $('scrim').style.opacity = ''; }, 320);
  }

  function showApp(user) {
    $('authView').classList.add('hidden'); $('appView').classList.remove('hidden');
    $('welcomeMsg').textContent = user.name + ' · ' + user.email;
    setXP(100, 'Sesión activa');
    showView('dashboard'); paint();
  }
  function showAuth() { $('authView').classList.remove('hidden'); $('appView').classList.add('hidden'); }

  document.addEventListener('DOMContentLoaded', async function () {
    await window.EducaStorage.ping();
    document.addEventListener('educa:backend', function (e) {
      $('backendDot').textContent = e.detail ? '● API conectada' : '● local';
      if (!$('appView').classList.contains('hidden')) paint();
    });

    $('tabLogin').addEventListener('click', function () {
      $('tabLogin').classList.add('is-on'); $('tabRegister').classList.remove('is-on');
      $('loginForm').classList.remove('hidden'); $('registerForm').classList.add('hidden');
    });
    $('tabRegister').addEventListener('click', function () {
      $('tabRegister').classList.add('is-on'); $('tabLogin').classList.remove('is-on');
      $('registerForm').classList.remove('hidden'); $('loginForm').classList.add('hidden');
    });

    var sess = window.EducaStorage.session();
    if (sess) showApp(sess); else setXP(20, 'Análisis en docs/ANALISIS.md');

    $('loginForm').addEventListener('submit', async function (e) {
      e.preventDefault();
      var u = await window.EducaLogin.handleLogin(e.target, $('loginError'));
      if (u) { e.target.reset(); setXP(60, 'Login funcional'); showApp(u); }
    });
    $('registerForm').addEventListener('submit', async function (e) {
      e.preventDefault();
      var u = await window.EducaRegister.handleRegister(e.target, $('registerError'));
      if (u) { e.target.reset(); setXP(75, 'Registro funcional'); showApp(u); }
    });
    $('logoutBtn').addEventListener('click', function () { window.EducaStorage.logout(); showAuth(); });

    document.querySelectorAll('[data-view]').forEach(function (b) {
      b.addEventListener('click', function () { showView(b.getAttribute('data-view')); });
    });
    document.querySelectorAll('[data-goto-view]').forEach(function (b) {
      b.addEventListener('click', function () { showView(b.getAttribute('data-goto-view')); });
    });

    $('newStudentBtn').addEventListener('click', function () { openDrawer(null); });
    $('cancelStudentBtn').addEventListener('click', closeDrawer);
    $('scrim').addEventListener('click', closeDrawer);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !$('drawer').classList.contains('hidden')) closeDrawer();
    });
    $('searchInput').addEventListener('input', async function () {
      var list = window.EducaStudents.filter($('searchInput').value);
      $('studentsBody').innerHTML = list.map(function (s) { return rowHTML(s, true); }).join('');
      $('emptyMsg').classList.toggle('hidden', list.length > 0);
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
      closeDrawer(); setXP(90, 'CRUD + ramas + merge'); paint();
    });

    $('studentsBody').addEventListener('click', async function (e) {
      var ed = e.target.getAttribute('data-edit'), del = e.target.getAttribute('data-del');
      if (ed) {
        var s = window.EducaStudents.cache.find(function (x) { return String(x.id) === String(ed); });
        if (s) { showView('students'); openDrawer(s); }
      }
      if (del && confirm('¿Borrar este estudiante?')) { await window.EducaStorage.deleteStudent(del); paint(); }
    });
  });
})();
