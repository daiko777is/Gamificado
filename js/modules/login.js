/* login.js — Lógica del login: valida credenciales vía storage.js */
(function (global) {
  'use strict';
  async function handleLogin(form, errBox) {
    errBox.classList.add('hidden');
    var email = form.email.value.trim().toLowerCase();
    var password = form.password.value;
    if (!email || !password) { errBox.textContent = 'Ingresa email y contraseña.'; errBox.classList.remove('hidden'); return null; }
    try {
      return await global.EducaStorage.login({ email: email, password: password });
    } catch (e) { errBox.textContent = e.message; errBox.classList.remove('hidden'); return null; }
  }
  global.EducaLogin = { handleLogin: handleLogin };
})(window);
