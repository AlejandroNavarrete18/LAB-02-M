# Evidencia 09 — Comparación de los tres escenarios

Leyenda: Sí (observado) · Parcial (explica) · No · Documentado, no practicado.

| Evento auditable | PostgreSQL (bitácora + disparador) | MongoDB Community (perfilador + bitácora) | MongoDB Enterprise/Atlas (auditoría nativa) |
|---|---|---|---|
| Acceso exitoso | Sí (observado) | Sí (observado): `Successfully authenticated` en la bitácora, con usuario, cliente, aplicación y hora | Documentado, no practicado |
| Acceso fallido | Sí (observado) | Sí (observado): `Failed to authenticate` con el motivo (`AuthenticationFailed` / `UserNotFound`) | Documentado, no practicado |
| Cambio de privilegios | Sí (observado): `GRANT` y `REVOKE` son sentencias DDL y quedan en la bitácora con `log_statement = 'mod'` | No: perfilador y bitácora devolvieron 0; solo las instantáneas detectan que cambió, sin decir quién ni cuándo (no equivale a auditoría) | Documentado, no practicado |
| Cambio de estructura | Sí (observado): `CREATE`, `ALTER` y `DROP` quedan en la bitácora con `log_statement = 'mod'` | Parcial (explica): el perfilador en nivel 2 registra comandos, pero no es una auditoría de DDL y no se practicó en este laboratorio | Documentado, no practicado |
| Modificación de datos | Sí (observado) | Parcial (explica): el perfilador registró update y remove con usuario, cliente, aplicación y momento, pero la evidencia es efímera (1 MB) y solo existe si el perfilado está activado | Documentado, no practicado |
| Valor anterior del dato | Sí (observado), con el disparador | No: `system.profile` solo guarda el valor nuevo | Documentado, no practicado |
| Lectura de datos sensibles | No (con `log_statement = 'mod'` los `SELECT` no se registran) | Sí (observado, nivel 2): registró el `find`, con el costo de rendimiento y de datos personales en claro | Documentado, no practicado |
| Cambio de configuración del registro | Parcial (explica): PostgreSQL registra en su bitácora el cambio de un parámetro tras recargar la configuración, pero no hay un registro de autoría equivalente | Parcial (explica): `Profiler settings changed` queda en la bitácora, pero sin usuario; se atribuye correlacionando `ctx` con la autenticación | Documentado, no practicado |