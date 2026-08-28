# MMIL Soluciones - Web pública + Sector empresa

## Estructura
- `index.html`: landing pública.
- `login.html`: acceso demostrativo al sector empresa.
- `portal/`: portal interno aprobado previamente (sin modificaciones funcionales).
- `Recursos/`: imágenes de la landing.

## Imágenes
Colocar las imágenes del carrusel con estos nombres:
- `Recursos/1.webp`
- `Recursos/2.webp`
- `Recursos/3.webp`
- `Recursos/4.webp`
- `Recursos/5.webp`

Mientras no existan, la web muestra placeholders automáticos.

## Login demostrativo
- Usuario: `mmil`
- Contraseña: `2026`

Este login es exclusivamente visual/demostrativo. No implementa autenticación de servidor.

## Instagram
El botón se deja apuntando a Instagram general como placeholder. Cuando se confirme la URL empresarial, reemplazar el `href` correspondiente en `index.html`.

## Ejecución
Usar Live Server, XAMPP, GitHub Pages o cualquier servidor HTTP estático. El portal interno carga su JSON mediante `fetch()`.


## Acceso interno demostrativo
El acceso al portal usa `sessionStorage` como sesión ficticia, sin backend ni base de datos. El login crea `mmil_demo_session`; el portal valida esa marca y redirige al login si no existe. Volver a la web pública elimina la sesión. Esto es solo una barrera de navegación para la demostración y no debe considerarse autenticación segura para producción.

## Endurecimiento V4
- CSP aplicada en landing, login y portal (sin JavaScript inline).
- Formularios tratados únicamente como texto; no se usa `innerHTML`, `eval` ni ejecución dinámica.
- Validación básica de longitud y formato del usuario.
- URLs provenientes del JSON del portal se validan para aceptar únicamente HTTP/HTTPS.
- El acceso al portal sigue siendo una sesión demostrativa basada en `sessionStorage`; no reemplaza autenticación real con backend.
