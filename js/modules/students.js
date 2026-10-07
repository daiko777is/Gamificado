/* students.js — Listado y gestión de estudiantes (lee/muestra vía storage.js) */
(function (global) {
  'use strict';
  var cache = [];
  async function refresh() { cache = await global.EducaStorage.listStudents(); return cache; }
  function filter(q) {
    q = (q || '').toLowerCase();
    if (!q) return cache;
    return cache.filter(function (s) {
      return (s.nombre + ' ' + s.email + ' ' + (s.curso || '')).toLowerCase().includes(q);
    });
  }
  function stats() {
    var total = cache.length;
    var active = cache.filter(function (s) { return s.activo !== false; }).length;
    var notas = cache.map(function (s) { return Number(s.nota); }).filter(function (n) { return !isNaN(n); });
    var avg = notas.length ? (notas.reduce(function (a, b) { return a + b; }, 0) / notas.length).toFixed(1) : '-';
    return { total: total, active: active, avg: avg };
  }
  global.EducaStudents = { refresh: refresh, filter: filter, stats: stats, get cache() { return cache; } };
})(window);
