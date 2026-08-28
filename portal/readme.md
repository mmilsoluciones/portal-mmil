# Portal MMIL Soluciones — SGRSI

Portal estático de seguimiento del proyecto final 2026.

## Actualización rápida

Toda la información editable está en `data/proyecto.json`.

- `proyecto.avanceGeneral`: porcentaje general que puede actualizarse semana a semana.
- `proyecto.fechaEntrega`: fecha final usada para el contador de días.
- `jornadas`: fechas seleccionables y sus tarjetas de tareas.
- `equipo`: integrantes y roles.
- `enlaces`: accesos rápidos.

Las tarjetas muestran: ID, ticket/tarea, responsable, ayudante, fecha límite y criterio de cierre. No se utiliza prioridad ni checklist.

Para probarlo localmente, abrir con Live Server/XAMPP u otro servidor HTTP; `fetch()` no funciona correctamente al abrir `index.html` directamente con `file://`.
