# Evidencia 05 — Accesos en la bitácora de mongod

## Comandos ejecutados
Sesión APP (dos intentos fallidos):
```
mongosh "mongodb://app_ventas:<REDACTED>@127.0.0.1:27017/comercial" --quiet --eval "db.clientes.countDocuments()"
mongosh "mongodb://usuario_inexistente:x@127.0.0.1:27017/comercial" --quiet --eval "db.clientes.countDocuments()"
```
Sesión DBA:
```js
bitacora()
  .filter(e => e.c === "ACCESS" && e.msg === "Failed to authenticate")
  .map(e => ({ t: e.t, id: e.id, ctx: e.ctx, user: e.attr.user, client: e.attr.client, error: e.attr.error, result: e.attr.result, app: e.attr.doc.application.name }))

bitacora()
  .filter(e => e.msg === "Successfully authenticated" && e.attr.user === "app_ventas")
  .slice(-1)
  .map(e => ({ t: e.t, id: e.id, ctx: e.ctx, client: e.attr.client, result: e.attr.result, app: e.attr.doc.application.name }))
```

## Salida
```
root@5a78dac89267:/lab# mongosh "mongodb://app_ventas:incorrecta@127.0.0.1:27017/comercial" --quiet --eval "db.clientes.countDocuments()"
MongoServerError: Authentication failed.
root@5a78dac89267:/lab# mongosh "mongodb://usuario_inexistente:x@127.0.0.1:27017/comercial" --quiet --eval "db.clientes.countDocuments()"
MongoServerError: Authentication failed.
root@5a78dac89267:/lab#

comercial> bitacora().filter(e => e.c === "ACCESS" && e.msg === "Failed to authenticate").map(e => ({ t: e.t, id: e.id, ctx: e.ctx, user: e.attr.user, client: e.attr.client, error: e.attr.error, result: e.attr.result, app: e.attr.doc.application.name }))
[
  {
    t: { '$date': '2026-11-24T02:03:09.484+00:00' },
    id: 5286307,
    ctx: 'conn43',
    user: 'app_ventas',
    client: '127.0.0.1:60644',
    error: 'AuthenticationFailed: SCRAM authentication failed, storedKey mismatch',
    result: 18,
    app: 'mongosh 2.14.3'
  },
  {
    t: { '$date': '2026-11-24T02:03:26.318+00:00' },
    id: 5286307,
    ctx: 'conn45',
    user: 'usuario_inexistente',
    client: '127.0.0.1:56116',
    error: 'UserNotFound: Could not find user "usuario_inexistente" for db "comercial"',
    result: 11,
    app: 'mongosh 2.14.3'
  },
  {
    t: { '$date': '2026-11-24T02:03:26.319+00:00' },
    id: 5286307,
    ctx: 'conn45',
    user: 'usuario_inexistente',
    client: '127.0.0.1:56116',
    error: 'UserNotFound: Could not find user "usuario_inexistente" for db "comercial"',
    result: 11,
    app: 'mongosh 2.14.3'
  }
]
comercial> bitacora().filter(e => e.msg === "Successfully authenticated" && e.attr.user === "app_ventas").slice(-1).map(e => ({ t: e.t, id: e.id, ctx: e.ctx, client: e.attr.client, result: e.attr.result, app: e.attr.doc.application.name }))
[
  {
    t: { '$date': '2026-11-24T01:56:03.237+00:00' },
    id: 5286306,
    ctx: 'conn41',
    client: '127.0.0.1:37328',
    result: 0,
    app: 'app-ventas-web'
  }
]

```

Nota: por un mismo intento fallido pueden aparecer varias líneas `Failed to authenticate` (una con `isSpeculative: true` y otra con `false`). Se cuentan intentos, no líneas: se hicieron 2 intentos fallidos.

## Respuestas
1. **Campo que distingue fallido de exitoso:** `msg` (`Failed to authenticate` frente a `Successfully authenticated`); también el `id` del mensaje (5286307 fallido, 5286306 exitoso) y `attr.result` (0 en éxito; distinto de 0 en fallo, por ejemplo 18 u 11).
2. **Diferencia entre los errores:** con contraseña incorrecta, el error es `AuthenticationFailed: SCRAM authentication failed, storedKey mismatch` (result 18): el usuario existe pero la contraseña no coincide. Con usuario inexistente, el error es `UserNotFound` (result 11). **Por qué el cliente recibe el mismo mensaje:** para no revelar si un usuario existe y evitar la enumeración de usuarios; el detalle solo se guarda en la bitácora del servidor.
3. **¿Por qué `mongosh <versión>` y no `app-ventas-web`?** Porque los intentos fallidos se hicieron con cadenas de conexión sin `?appName=app-ventas-web`; en ese caso el nombre de la aplicación que reporta el cliente es el predeterminado del propio `mongosh` con su versión.
