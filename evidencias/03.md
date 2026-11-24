# Evidencia 03 — Perfilador nivel 2

## Comandos ejecutados
Sesión DBA:
```js
db.setProfilingLevel(2)
db.getProfilingStatus()
```
Sesión APP:
```
mongosh "mongodb://app_ventas:<REDACTED>@127.0.0.1:27017/comercial?appName=app-ventas-web" --quiet --eval 'db.clientes.find({ ciudad: "Culiacán" }, { nombre: 1, ciudad: 1 }).toArray(); db.clientes.updateOne({ _id: 3 }, { $set: { rfc: "GAMA780912XYZ" } }); db.clientes.deleteOne({ _id: 2 });'
```
Sesión DBA:
```js
db.system.profile.find(
  { ns: "comercial.clientes" },
  { op: 1, ns: 1, command: 1, user: 1, client: 1, appName: 1, ts: 1, millis: 1, nreturned: 1, docsExamined: 1, nModified: 1, ndeleted: 1 }
).sort({ ts: 1 })
```

## Salida
```
comercial> db.system.profile.find({ ns: "comercial.clientes" },{ op: 1, ns: 1, command: 1, user: 1, client: 1, appName: 1, ts: 1, millmillis: 1, nreturned: 1, docsExamined: 1, nModified: 1, ndeleted: 1 }).sort({ ts: 1 })
[
  {
    op: 'query',
    ns: 'comercial.clientes',
    command: {
      find: 'clientes',
      filter: { ciudad: 'Culiacán' },
      projection: { nombre: 1, ciudad: 1 },
      lsid: { id: UUID('91049c46-d24f-40e5-b678-98b882d49c11') },
      '$db': 'comercial'
    },
    docsExamined: 5,
    nreturned: 3,
    millis: 1,
    ts: ISODate('2026-11-24T01:45:26.093Z'),
    client: '127.0.0.1',
    appName: 'app-ventas-web',
    user: 'app_ventas@comercial'
  },
  {
    op: 'update',
    ns: 'comercial.clientes',
    command: {
      q: { _id: 3 },
      u: { '$set': { rfc: 'GAMA780912XYZ' } },
      multi: false,
      upsert: false
    },
    docsExamined: 1,
    nModified: 1,
    millis: 0,
    ts: ISODate('2026-11-24T01:45:26.097Z'),
    client: '127.0.0.1',
    appName: 'app-ventas-web',
    user: 'app_ventas@comercial'
  },
  {
    op: 'remove',
    ns: 'comercial.clientes',
    command: { q: { _id: 2 }, limit: 1 },
    docsExamined: 1,
    ndeleted: 1,
    millis: 0,
    ts: ISODate('2026-11-24T01:45:26.102Z'),
    client: '127.0.0.1',
    appName: 'app-ventas-web',
    user: 'app_ventas@comercial'
  }
]
```

## 9.1 Interpretación de los documentos
(Sustituye los momentos `ts` por los de tu salida.)

| # | op | Usuario | Cliente | Aplicación | Momento | Qué hizo | Documentos afectados |
|---|----|---------|---------|------------|---------|----------|----------------------|
| 1 | query | app_ventas@comercial | 127.0.0.1 | app-ventas-web | 2026-11-24T01:45:26.093Z | Consultó `clientes` con ciudad "Culiacán", proyectando nombre y ciudad | docsExamined 5, nreturned 3 |
| 2 | update | app_ventas@comercial | 127.0.0.1 | app-ventas-web | 2026-11-24T01:45:26.097Z | Cambió el rfc del `_id: 3` a `GAMA780912XYZ` | docsExamined 1, nModified 1 |
| 3 | remove | app_ventas@comercial | 127.0.0.1 | app-ventas-web | 2026-11-24T01:45:26.102Z | Eliminó el documento con `_id: 2` | docsExamined 1, ndeleted 1 |

## Respuestas
1. **¿RFC antes del cambio?** No. El documento del perfilador solo contiene el filtro `q: { _id: 3 }` y el `$set` con el valor nuevo; no guarda el valor anterior.
2. **¿Datos del documento eliminado?** No. Solo se registra `q: { _id: 2 }` y `ndeleted: 1`; el contenido del documento borrado no queda en `system.profile`.
3. **Ventaja de que el nivel 2 registre también la consulta:** deja trazabilidad de lecturas (por ejemplo, quién consultó datos sensibles, con qué filtro, desde qué aplicación y cuándo), algo que `log_statement = 'mod'` en PostgreSQL no registra. **Riesgo:** registra todo, por lo que degrada el rendimiento, consume disco, sobrescribe rápido la colección limitada (1 MB) y guarda en claro filtros y valores con datos personales (RFC, teléfono, ciudad).
4. **¿Por qué `user` incluye `@comercial`?** El campo se guarda como `usuario@base`, donde la base es aquella en la que está definido el usuario (la de autenticación). Identifica de forma única al usuario, porque el mismo nombre puede existir en bases distintas.
