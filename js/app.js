/* app.js — Orquestador del SISTEMA: auth, vistas, drawer, tabla, toasts */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var TITLES = { dashboard: 'Panel', students: 'Estudiantes', guide: 'Guía GIT' };
  var currentView = 'dashboard';
  var statusFilter = 'all';
  var firstPaint = true;
  var deleteArmed = null, deleteTimer = null;

  function toast(msg) {
    var box = $('toasts');
    var el = document.createElement('div');
    el.className = 'toast pre'; el.textContent = msg;
    box.appendChild(el);
    requestAnimationFrame(function () { requestAnimationFrame(function () { el.classList.remove('pre'); }); });
    setTimeout(function () {
      el.classList.add('pre');
      setTimeout(function () { el.remove(); }, 220);
    }, 2600);
  }

  function setXP(v, label) {
    $('xpPill').textContent = v + ' XP'; $('xpMini').textContent = v + ' XP';
    // La barra siempre ocupa el 100% del track y se escala desde la izquierda:
    // así el ancho inline/CSS ya no limita el progreso (antes quedaba atascada en ~10%).
    var fill = $('xpFill');
    fill.style.width = '100%';
    fill.style.transformOrigin = 'left center';
    fill.style.transform = 'scaleX(' + Math.max(0, Math.min(100, v)) / 100 + ')';
    if (label) $('xpLabel').textContent = label;
  }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function notaCell(s) {
    if (s.nota == null || s.nota === '') return '<td>-</td>';
    var n = Number(s.nota);
    var c = n >= 4 ? 'n-ok' : (n >= 3 ? 'n-mid' : 'n-low');
    return '<td><span class="nota ' + c + '">' + esc(s.nota) + '</span></td>';
  }
  function rowHTML(s, actions) {
    return '<tr><td><strong>' + esc(s.nombre) + '</strong><br><span class="muted small">' + esc(s.email) + '</span></td>' +
      '<td>' + esc(s.curso || '-') + '</td>' + notaCell(s) +
      '<td><span class="badge ' + (s.activo !== false ? 'ok' : 'off') + '">' + (s.activo !== false ? 'Activo' : 'Inactivo') + '</span></td>' +
      (actions ? '<td><div class="row-actions"><button class="mini" data-edit="' + esc(s.id) + '" type="button">Editar</button>' +
      '<button class="mini danger" data-del="' + esc(s.id) + '" type="button">' + (deleteArmed === String(s.id) ? 'Confirmar' : 'Borrar') + '</button></div></td>' : '') + '</tr>';
  }

  function applyFilters() {
    var list = window.EducaStudents.filter($('searchInput').value);
    if (statusFilter !== 'all') {
      list = list.filter(function (s) {
        return statusFilter === 'active' ? s.activo !== false : s.activo === false;
      });
    }
    return list;
  }
  function skeleton(rows, cols) {
    var h = '';
    for (var i = 0; i < rows; i++) { h += '<tr class="loading"><td colspan="' + cols + '"><span class="skel"></span></td></tr>'; }
    return h;
  }

  async function paint() {
    $('studentsBody').innerHTML = skeleton(3, 5);
    var all = await window.EducaStudents.refresh();
    var list = applyFilters();
    $('studentsBody').innerHTML = list.map(function (s) { return rowHTML(s, true); }).join('');
    $('emptyMsg').classList.toggle('hidden', list.length > 0);
    $('recentBody').innerHTML = all.slice(-5).reverse().map(function (s) { return rowHTML(s, false); }).join('');
    $('recentEmpty').classList.toggle('hidden', all.length > 0);
    var st = window.EducaStudents.stats();
    $('statTotal').textContent = st.total; $('statActive').textContent = st.active; $('statAvg').textContent = st.avg;
    if (firstPaint) {
      firstPaint = false;
      document.querySelector('.stats').classList.add('first');
    }
  }

  function showView(name) {
    currentView = name;
    ['dashboard', 'students', 'guide'].forEach(function (v) {
      var el = $('view-' + v);
      el.classList.toggle('hidden', v !== name);
      if (v === name) {
        el.classList.remove('view-enter'); void el.offsetWidth; el.classList.add('view-enter');
      }
    });
    document.querySelectorAll('.side-link').forEach(function (b) {
      b.classList.toggle('is-on', b.getAttribute('data-view') === name);
    });
    $('viewTitle').textContent = TITLES[name];
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
    if (d.classList.contains('hidden')) return;
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

  function withLoading(form, label, fn) {
    var btn = form.querySelector('button[type=submit]');
    var original = btn.textContent;
    btn.disabled = true; btn.textContent = label;
    return Promise.resolve(fn()).then(function (r) { btn.disabled = false; btn.textContent = original; return r; },
      function (e) { btn.disabled = false; btn.textContent = original; throw e; });
  }

  document.addEventListener('DOMContentLoaded', async function () {
    await window.EducaStorage.ping();
    document.addEventListener('educa:backend', function (e) {
      $('backendDot').textContent = e.detail ? '● API conectada' : '● local';
      if (!$('appView').classList.contains('hidden')) paint();
    });

    $('tabLogin').addEventListener('click', function () {
      $('tabLogin').classList.add('is-on'); $('tabLogin').setAttribute('aria-selected', 'true');
      $('tabRegister').classList.remove('is-on'); $('tabRegister').setAttribute('aria-selected', 'false');
      $('loginForm').classList.remove('hidden'); $('registerForm').classList.add('hidden');
    });
    $('tabRegister').addEventListener('click', function () {
      $('tabRegister').classList.add('is-on'); $('tabRegister').setAttribute('aria-selected', 'true');
      $('tabLogin').classList.remove('is-on'); $('tabLogin').setAttribute('aria-selected', 'false');
      $('registerForm').classList.remove('hidden'); $('loginForm').classList.add('hidden');
    });

    var sess = window.EducaStorage.session();
    document.addEventListener('educa:expired', function () {
      showAuth(); setXP(20, 'Sesión expirada'); toast('Sesión expirada. Entra de nuevo.');
    });
    if (sess && window.EducaStorage.useBackend && window.EducaStorage.hasToken()) {
      window.EducaStorage.verify().then(function (me) {
        if (me) showApp({ name: me.email.split('@')[0], email: me.email, id: me.id });
        else showAuth();
      });
    } else if (sess && window.EducaStorage.useBackend) {
      showAuth(); toast('Vuelve a entrar para conectar con el servidor');
    } else if (sess) showApp(sess); else setXP(20, 'Análisis en docs/ANALISIS.md');

    $('loginForm').addEventListener('submit', function (e) {
      e.preventDefault();
      withLoading(e.target, 'Entrando…', function () {
        return window.EducaLogin.handleLogin(e.target, $('loginError'));
      }).then(function (u) {
        if (u) { e.target.reset(); setXP(60, 'Login funcional'); showApp(u); toast('Sesión iniciada'); }
      });
    });
    $('registerForm').addEventListener('submit', function (e) {
      e.preventDefault();
      withLoading(e.target, 'Creando…', function () {
        return window.EducaRegister.handleRegister(e.target, $('registerError'));
      }).then(function (u) {
        if (u) { e.target.reset(); setXP(75, 'Registro funcional'); showApp(u); toast('Cuenta creada'); }
      });
    });
    $('logoutBtn').addEventListener('click', function () { window.EducaStorage.logout(); showAuth(); });

    document.querySelectorAll('[data-view]').forEach(function (b) {
      b.addEventListener('click', function () { showView(b.getAttribute('data-view')); });
    });
    document.querySelectorAll('[data-goto-view]').forEach(function (b) {
      b.addEventListener('click', function () { showView(b.getAttribute('data-goto-view')); });
    });

    document.querySelectorAll('.chip').forEach(function (c) {
      c.addEventListener('click', function () {
        statusFilter = c.getAttribute('data-filter');
        document.querySelectorAll('.chip').forEach(function (x) {
          var on = x === c;
          x.classList.toggle('is-on', on); x.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        var list = applyFilters();
        $('studentsBody').innerHTML = list.map(function (s) { return rowHTML(s, true); }).join('');
        $('emptyMsg').classList.toggle('hidden', list.length > 0);
      });
    });

    $('newStudentBtn').addEventListener('click', function () { openDrawer(null); });
    $('cancelStudentBtn').addEventListener('click', closeDrawer);
    $('scrim').addEventListener('click', closeDrawer);
    document.addEventListener('keydown', function (e) {
      var d = $('drawer');
      if (d.classList.contains('hidden')) return;
      if (e.key === 'Escape') { closeDrawer(); return; }
      if (e.key === 'Tab') { // trampa de foco mínima del diálogo
        var f = Array.prototype.filter.call(d.querySelectorAll('input,button'), function (el) { return !el.disabled; });
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    $('searchInput').addEventListener('input', async function () {
      if (currentView !== 'students') showView('students');
      var list = applyFilters();
      $('studentsBody').innerHTML = list.map(function (s) { return rowHTML(s, true); }).join('');
      $('emptyMsg').classList.toggle('hidden', list.length > 0);
    });

    $('studentForm').addEventListener('submit', function (e) {
      e.preventDefault();
      var f = e.target, err = $('studentError'); err.classList.add('hidden');
      var data = {
        id: f.id.value || undefined,
        nombre: f.nombre.value.trim(), email: f.email.value.trim().toLowerCase(),
        curso: f.curso.value.trim(), nota: f.nota.value === '' ? null : Number(f.nota.value),
        activo: f.activo.checked
      };
      if (data.nombre.length < 2) { err.textContent = 'El nombre es obligatorio. Escríbelo para guardar.'; err.classList.remove('hidden'); return; }
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.email)) { err.textContent = 'Email inválido. Revisa el formato (ej: nombre@educa.co).'; err.classList.remove('hidden'); return; }
      withLoading(f, 'Guardando…', function () { return window.EducaStorage.saveStudent(data); }).then(function () {
        closeDrawer(); setXP(90, 'CRUD + ramas + merge'); paint(); toast('Estudiante guardado');
      }).catch(function (e) {
        // Email duplicado (409 / local), validación (400), sesión, red caída…
        err.textContent = (e && e.message) || 'No se pudo guardar el estudiante. Intenta de nuevo.';
        err.classList.remove('hidden');
      });
    });

    $('studentsBody').addEventListener('click', async function (e) {
      var ed = e.target.getAttribute('data-edit'), del = e.target.getAttribute('data-del');
      if (ed) {
        var s = window.EducaStudents.cache.find(function (x) { return String(x.id) === String(ed); });
        if (s) openDrawer(s);
      }
      if (del) {
        if (deleteArmed === del) {
          clearTimeout(deleteTimer); deleteArmed = null;
          try {
            await window.EducaStorage.deleteStudent(del);
            paint(); toast('Estudiante eliminado');
          } catch (e) {
            paint(); toast((e && e.message) || 'No se pudo eliminar el estudiante.');
          }
        } else {
          deleteArmed = del; paint();
          toast('Toca Borrar otra vez para confirmar');
          deleteTimer = setTimeout(function () { deleteArmed = null; paint(); }, 3000);
        }
      }
    });
  });
})();
