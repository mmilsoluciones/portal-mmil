'use strict';

// Al entrar a la web pública se cierra cualquier sesión demostrativa previa.
try {
  sessionStorage.removeItem('mmil_demo_session');
} catch (_) {
  // Si el navegador bloquea Web Storage, la web pública sigue funcionando.
}
