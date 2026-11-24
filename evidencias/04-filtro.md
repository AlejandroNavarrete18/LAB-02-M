# Evidencia 04 — Reducir el volumen con un filtro

## Exportación previa de system.profile
Antes de borrar `system.profile` se exportó a `evidencias/system-profile.json` (ver evidencia 08).

## Comandos ejecutados
Sesión DBA:
```js
db.setProfilingLevel(0)
db.system.profile.drop()
db.setProfilingLevel(1, { filter: { op: { $in: ["insert", "update", "remove"] } } })
db.getProfilingStatus()
```
Sesión APP:
```
mongosh "mongodb://app_ventas:<REDACTED>@127.0.0.1:27017/comercial?appName=app-ventas-web" --quiet --eval 'db.clientes.find({ _id: 1 }).toArray(); db.clientes.updateOne({ _id: 1 }, { $set: { telefono: "6670000000" } })'
```
Sesión DBA:
```js
db.system.profile.find({}, { op: 1, ns: 1, user: 1, appName: 1, "command.q": 1, "command.u": 1, ts: 1 })
```

## Salida
```
comercial> db.getProfilingStatus()
{
  was: 1,
  slowms: 100,
  sampleRate: 1,
  filter: { op: { '$in': [ 'insert', 'remove', 'update' ] } },
  note: 'When a filter expression is set, slowms and sampleRate are not used for profiling and slow-query log lines.',
  ok: 1
}

comercial> db.system.profile.find({}, { op: 1, ns: 1, user: 1, appName: 1, "command.q": 1, "command.u": 1, ts: 1 })
[
  {
    op: 'update',
    ns: 'comercial.clientes',
    command: { q: { _id: 1 }, u: { '$set': { telefono: '6670000000' } } },
    ts: ISODate('2026-11-24T01:56:03.237Z'),
    appName: 'app-ventas-web',
    user: 'app_ventas@comercial'
  }
]


```

## Respuestas
1. **Qué perdí:** las operaciones de lectura (`query`) y cualquier otra operación que no sea insert, update o remove; ya no queda evidencia de quién consultó datos. **Qué gané:** menor volumen en `system.profile`, menor impacto en el rendimiento, mayor tiempo de retención antes de que la colección limitada sobrescriba los documentos y menor exposición de datos personales registrados.
2. **Filtro solo para la colección `clientes`:**
```js
db.setProfilingLevel(1, { filter: { ns: "comercial.clientes" } })
```
   Si además solo interesaran las modificaciones: `{ filter: { ns: "comercial.clientes", op: { $in: ["insert", "update", "remove"] } } }