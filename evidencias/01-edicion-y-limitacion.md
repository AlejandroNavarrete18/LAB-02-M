# Evidencia 01 — Edición de MongoDB y limitación de auditoría

## Comandos ejecutados (sesión DBA)
```js
db.version()
db.adminCommand({ buildInfo: 1 }).modules
db.serverCmdLineOpts().parsed
```

## Salida
```

comercial> db.version()
7.0.48
comercial> db.adminCommand({ buildInfo: 1 }).modules
[]
comercial> db.serverCmdLineOpts().parsed
{ net: { bindIp: '*' }, security: { authorization: 'enabled' } }

PS C:\Users\alexd> docker logs dba-u3-mongo --tail 3
{"t":{"$date":"2026-11-24T01:26:03.166+00:00"},"s":"I",  "c":"WTCHKPT",  "id":22430,   "ctx":"Checkpointer","msg":"WiredTiger message","attr":{"message":{"ts_sec":1795483563,"ts_usec":166650,"thread":"1:0x7a1212b5a640","session_name":"WT_SESSION.checkpoint","category":"WT_VERB_CHECKPOINT_PROGRESS","category_id":6,"verbose_level":"DEBUG_1","verbose_level_id":1,"msg":"saving checkpoint snapshot min: 69, snapshot max: 69 snapshot count: 0, oldest timestamp: (0, 0) , meta checkpoint timestamp: (0, 0) base write gen: 1"}}}
{"t":{"$date":"2026-11-24T01:27:03.199+00:00"},"s":"I",  "c":"WTCHKPT",  "id":22430,   "ctx":"Checkpointer","msg":"WiredTiger message","attr":{"message":{"ts_sec":1795483623,"ts_usec":199290,"thread":"1:0x7a1212b5a640","session_name":"WT_SESSION.checkpoint","category":"WT_VERB_CHECKPOINT_PROGRESS","category_id":6,"verbose_level":"DEBUG_1","verbose_level_id":1,"msg":"saving checkpoint snapshot min: 70, snapshot max: 70 snapshot count: 0, oldest timestamp: (0, 0) , meta checkpoint timestamp: (0, 0) base write gen: 1"}}}
{"t":{"$date":"2026-11-24T01:28:03.223+00:00"},"s":"I",  "c":"WTCHKPT",  "id":22430,   "ctx":"Checkpointer","msg":"WiredTiger message","attr":{"message":{"ts_sec":1795483683,"ts_usec":223883,"thread":"1:0x7a1212b5a640","session_name":"WT_SESSION.checkpoint","category":"WT_VERB_CHECKPOINT_PROGRESS","category_id":6,"verbose_level":"DEBUG_1","verbose_level_id":1,"msg":"saving checkpoint snapshot min: 72, snapshot max: 72 snapshot count: 0, oldest timestamp: (0, 0) , meta checkpoint timestamp: (0, 0) base write gen: 1"}}}
PS C:\Users\alexd>


```

## Respuestas
1. **Edición:** MongoDB 7 Community Edition. **Evidencia:** `db.version()` devuelve 7.0.48 y `buildInfo.modules` devuelve `[]` (vacío). En Enterprise el arreglo incluiría `"enterprise"`.
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
