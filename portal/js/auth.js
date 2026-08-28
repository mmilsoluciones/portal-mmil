'use strict';

(() => {
  const SESSION_KEY = 'mmil_demo_session';

  let authenticated = false;
  try {
    authenticated = sessionStorage.getItem(SESSION_KEY) === '1';
  } catch (_) {
    authenticated = false;
  }

  if (!authenticated) {
    window.location.replace('../login.html');
    return;
  }

  window.addEventListener('DOMContentLoaded', () => {
    const logoutLink = document.getElementById('volverInicio');
    if (!logoutLink) return;

    logoutLink.addEventListener('click', () => {
      try {
        sessionStorage.removeItem(SESSION_KEY);
      } catch (_) {
        // La navegación al inicio continúa aunque Web Storage no esté disponible.
      }
    });
  });
})();
