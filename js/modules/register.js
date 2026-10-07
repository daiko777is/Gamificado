/* register.js — Lógica de registro: guarda usuarios vía storage.js */
(function (global) {
  'use strict';
  async function handleRegister(form, errBox) {
    errBox.classList.add('hidden');
    var name = form.name.value.trim();
    var email = form.email.value.trim().toLowerCase();
    var password = form.password.value;
    if (name.length < 2) { errBox.textContent = 'Ingresa tu nombre completo.'; errBox.classList.remove('hidden'); return null; }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { errBox.textContent = 'Ingresa un email válido.'; errBox.classList.remove('hidden'); return null; }
    if (password.length < 6) { errBox.textContent = 'La contraseña debe tener mínimo 6 caracteres.'; errBox.classList.remove('hidden'); return null; }
    try {
      return await global.EducaStorage.register({ name: name, email: email, password: password });
    } catch (e) { errBox.textContent = e.message; errBox.classList.remove('hidden'); return null; }
  }
  global.EducaRegister = { handleRegister: handleRegister };
})(window);
