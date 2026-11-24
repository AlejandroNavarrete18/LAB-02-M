# Evidencia 10 — Respuesta a Dirección

Respuestas basadas solo en la evidencia de este laboratorio.

1. **¿Quién cambió el RFC de María García?**
   - **Actividad 2:** No hay evidencia con esta edición. El perfilador estaba apagado (`system.profile` con 0 documentos) y la bitácora de mongod no registra operaciones CRUD. Solo se sabe que `app-ventas-web` se conectó y se autenticó como `app_ventas` (evento `Successfully authenticated`, evidencia 02), lo que no prueba quién ejecutó el cambio.
   - **Actividad 3:** `app_ventas@comercial`, según el documento `op: update` de `system.profile` (cambió el RFC de `_id: 3` a `GAMA780912XYZ`).

2. **¿Cuándo y desde qué aplicación?**
   - **Actividad 2:** No hay evidencia con esta edición de cuándo se ejecutó el cambio ni desde qué aplicación; la bitácora solo muestra la conexión y la autenticación de `app-ventas-web`, sin vincularlas a la operación.
   - **Actividad 3:** el `update` ocurrió el 2026-11-24 a las 01:45:26.097 UTC, desde el cliente `127.0.0.1` y la aplicación `app-ventas-web`.

3. **¿Qué valor tenía antes?** No hay evidencia con esta edición: `system.profile` guarda solo el `$set` con el valor nuevo, y la bitácora no registra operaciones. El valor original (`GAMA780912GHI`) solo se conoce por la carga inicial del laboratorio, no por una fuente de trazabilidad.

4. **¿Cambió alguien los privilegios de `app_ventas`?** Sí se detectó que cambiaron: entre las dos instantáneas se agregó el rol `dbAdmin` en `comercial`. **Quién lo hizo y cuándo exactamente:** No hay evidencia con esta edición: el perfilador y la bitácora devolvieron 0 coincidencias para `grantRolesToUser`, porque esos mecanismos no registran cambios de privilegios; la auditoría nativa que sí lo haría no existe en Community.