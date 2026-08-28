'use strict';

(() => {
  const SESSION_KEY = 'mmil_demo_session';
  const EXPECTED_USER = 'mmil';
  const EXPECTED_PASSWORD = '2026';
  const MAX_USER_LENGTH = 32;
  const MAX_PASSWORD_LENGTH = 64;

  const form = document.getElementById('loginForm');
  const error = document.getElementById('loginError');
  const userInput = document.getElementById('usuario');
  const passInput = document.getElementById('password');
  const toggle = document.getElementById('togglePassword');

  if (!form || !error || !userInput || !passInput || !toggle) return;

  const showError = (message) => {
    // textContent impide que una entrada sea interpretada como HTML/JavaScript.
    error.textContent = message;
  };

  toggle.addEventListener('click', () => {
    const visible = passInput.type === 'text';
    passInput.type = visible ? 'password' : 'text';
    toggle.textContent = visible ? 'Ver' : 'Ocultar';
    toggle.setAttribute('aria-label', visible ? 'Mostrar contraseña' : 'Ocultar contraseña');
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    showError('');

    const user = userInput.value.trim();
    const password = passInput.value;

    if (!user || !password) {
      showError('Completá usuario y contraseña.');
      return;
    }

    if (user.length > MAX_USER_LENGTH || password.length > MAX_PASSWORD_LENGTH) {
      showError('Credenciales inválidas.');
      return;
    }

    // Lista blanca para el identificador de usuario. La contraseña se compara como texto
    // y nunca se inserta en el DOM ni se evalúa como código.
    if (!/^[A-Za-z0-9_-]+$/.test(user)) {
      showError('Usuario o contraseña incorrectos.');
      return;
    }

    if (user === EXPECTED_USER && password === EXPECTED_PASSWORD) {
      try {
        sessionStorage.setItem(SESSION_KEY, '1');
        window.location.replace('./portal/index.html');
      } catch (_) {
        showError('El navegador no permite crear la sesión demostrativa.');
      }
      return;
    }

    passInput.value = '';
    showError('Usuario o contraseña incorrectos.');
  });
})();
