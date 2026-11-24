# Evidencia 01 — Edición de MongoDB y limitación de auditoría

## Comandos ejecutados (sesión DBA)
```js
db.version()
db.adminCommand({ buildInfo: 1 }).modules
db.serverCmdLineOpts().parsed
```

## Salida
```
<<PEGA AQUÍ LA SALIDA DE TU TERMINAL>>
```

## Respuestas
1. **Edición:** MongoDB 7 Community Edition. **Evidencia:** `db.version()` devuelve 7.0.x y `buildInfo.modules` devuelve `[]` (vacío). En Enterprise el arreglo incluiría `"enterprise"`.
2. **Destino de la bitácora:** la salida estándar del contenedor (Docker). **Cómo lo sé:** `serverCmdLineOpts().parsed` no muestra la sección `systemLog` (no hay `systemLog.destination` ni `systemLog.path`), por lo que mongod escribe en la salida estándar del proceso; se puede ver con `docker logs dba-u3-mongo`.
3. **Cuatro categorías de eventos de la auditoría nativa (REF-U3-04):**
   - Cambios de esquema (DDL).
   - Eventos de conjuntos de réplicas y clústeres fragmentados.
   - Autenticación y autorización.
   - Operaciones CRUD (requiere `auditAuthorizationSuccess: true`).
4. **Qué evaluar antes de licenciar Enterprise o migrar a Atlas solo para obtener auditoría:**
   - Costo de la licencia de Enterprise o de un clúster Atlas M10 o superior.
   - Esfuerzo y riesgo de migración o cambio de edición.
   - Si existe un requisito normativo o de auditoría que realmente lo exija.
   - Impacto en desempeño y almacenamiento del registro de auditoría (sobre todo con CRUD).
   - Qué eventos hay que auditar, con qué filtros, destino y retención.
   - Si un control compensatorio documentado y un riesgo aceptado son suficientes.
