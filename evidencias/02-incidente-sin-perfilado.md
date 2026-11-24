# Evidencia 02 — Incidente sin perfilado

## Comandos ejecutados
Sesión DBA:
```js
db.getProfilingStatus()
```
Sesión APP:
```
mongosh "mongodb://app_ventas:<REDACTED>@127.0.0.1:27017/comercial?appName=app-ventas-web" --quiet --eval 'db.clientes.updateOne({ _id: 3 }, { $set: { rfc: "GAMA780912XXX" } })'
```
Sesión DBA (búsqueda de evidencia):
```js
db.system.profile.countDocuments()
bitacora().filter(e => JSON.stringify(e).includes("GAMA780912XXX")).length
bitacora().filter(e => JSON.stringify(e).includes("app-ventas-web")).map(e => ({ t: e.t, c: e.c, ctx: e.ctx, msg: e.msg }))
```

## Salida
```
comercial> db.getProfilingStatus()
{ was: 0, slowms: 100, sampleRate: 1, ok: 1 }

root@5a78dac89267:/lab# mongosh "mongodb://app_ventas:Ventas_Practica_2026@127.0.0.1:27017/comercial?appName=app-ventas-web" --quiet --eval 'db.clientes.updateOne({ _id: 3 }, { $set: { rfc: "GAMA780912XXX" } })'
{
  acknowledged: true,
  insertedId: null,
  matchedCount: 1,
  modifiedCount: 1,
  upsertedCount: 0
}

comercial> db.system.profile.countDocuments()
0
comercial> bitacora().filter(e => JSON.stringify(e).includes("GAMA780912XXX")).length
0
comercial> bitacora().filter(e => JSON.stringify(e).includes("app-ventas-web")).map(e => ({ t: e.t, c: e.c, ctx: e.ctx, msg: e.msg }))
[
  {
    t: { '$date': '2026-11-24T01:38:20.239+00:00' },
    c: 'NETWORK',
    ctx: 'conn26',
    msg: 'client metadata'
  },
  {
    t: { '$date': '2026-11-24T01:38:20.239+00:00' },
    c: 'ACCESS',
    ctx: 'conn26',
    msg: 'Connection not authenticating'
  },
  {
    t: { '$date': '2026-11-24T01:38:20.243+00:00' },
    c: 'NETWORK',
    ctx: 'conn27',
    msg: 'client metadata'
  },
  {
    t: { '$date': '2026-11-24T01:38:20.250+00:00' },
    c: 'ACCESS',
    ctx: 'conn27',
    msg: 'Successfully authenticated'
  },
  {
    t: { '$date': '2026-11-24T01:38:20.360+00:00' },
    c: 'NETWORK',
    ctx: 'conn28',
    msg: 'client metadata'
  },
  {
    t: { '$date': '2026-11-24T01:38:20.360+00:00' },
    c: 'NETWORK',
    ctx: 'conn29',
    msg: 'client metadata'
  },
  {
    t: { '$date': '2026-11-24T01:38:20.370+00:00' },
    c: 'ACCESS',
    ctx: 'conn28',
    msg: 'Successfully authenticated'
  },
  {
    t: { '$date': '2026-11-24T01:38:20.370+00:00' },
    c: 'ACCESS',
    ctx: 'conn29',
    msg: 'Successfully authenticated'
  }
]

```

## Respuestas
1. **¿Puedo demostrar qué cambió?** No. El perfilador estaba apagado (`was: 0`), `system.profile` tiene 0 documentos y la bitácora no contiene el valor `GAMA780912XXX` (0 coincidencias): la bitácora de mongod no registra operaciones CRUD. **¿Quién se conectó a esa hora?** Sí se ve que `app-ventas-web` se conectó y se autenticó (eventos `client metadata` y `Successfully authenticated`, con hora y número de conexión). Pero eso solo prueba la conexión, no vincula esa conexión con el cambio del RFC.
2. **¿Por qué varias conexiones?** `mongosh` abre una conexión de monitoreo/descubrimiento del servidor (handshake con `client metadata`, `Connection not authenticating`) y otra conexión para ejecutar la instrucción. **La que se autentica** es la que ejecuta la operación (en el ejemplo, `conn9` con `Successfully authenticated`); la otra (`conn8`) no se autentica.
