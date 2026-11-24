# Evidencia 06 — Correlacionar un cambio de configuración con su autor

## Comandos ejecutados (sesión DBA)
```js
bitacora()
  .filter(e => e.msg === "Profiler settings changed")
  .map(e => ({ t: e.t, ctx: e.ctx, msg: e.msg, attr: e.attr }))
```

```js
bitacora()
  .filter(e => e.ctx === "conn19" && e.msg === "Successfully authenticated")
  .map(e => ({ t: e.t, ctx: e.ctx, user: e.attr.user, db: e.attr.db, client: e.attr.client }))
```

## Salida

```
comercial> bitacora().filter(e => e.msg === "Profiler settings changed").map(e => ({ t: e.t, ctx: e.ctx, msg: e.msg, attr: e.attr }))
[
  {
    t: { '$date': '2026-11-24T01:44:41.379+00:00' },
    ctx: 'conn19',
    msg: 'Profiler settings changed',
    attr: {
      from: { level: 0, slowms: 100, sampleRate: 1 },
      to: { level: 2, slowms: 100, sampleRate: 1 },
      db: 'comercial'
    }
  },
  {
    t: { '$date': '2026-11-24T01:55:09.872+00:00' },
    ctx: 'conn19',
    msg: 'Profiler settings changed',
    attr: {
      from: { level: 2, slowms: 100, sampleRate: 1 },
      to: { level: 0, slowms: 100, sampleRate: 1 },
      db: 'comercial'
    }
  },
  {
    t: { '$date': '2026-11-24T01:55:21.887+00:00' },
    ctx: 'conn19',
    msg: 'Profiler settings changed',
    attr: {
      from: { level: 0, slowms: 100, sampleRate: 1 },
      to: { level: 0, slowms: 100, sampleRate: 1 },
      db: 'comercial'
    }
  },
  {
    t: { '$date': '2026-11-24T01:55:31.413+00:00' },
    ctx: 'conn19',
    msg: 'Profiler settings changed',
    attr: {
      from: { level: 0, slowms: 100, sampleRate: 1 },
      to: {
        level: 1,
        slowms: 100,
        sampleRate: 1,
        filter: { op: { '$in': [ 'insert', 'remove', 'update' ] } }
      },
      db: 'comercial'
    }
  }
]
comercial> bitacora().filter(e => e.ctx === "conn19" && e.msg === "Successfully authenticated").map(e => ({ t: e.t, ctx: e.ctx, user: e.attr.user, db: e.attr.db, client: e.attr.client }))
[
  {
    t: { '$date': '2026-11-24T01:20:29.949+00:00' },
    ctx: 'conn19',
    user: 'admin',
    db: 'admin',
    client: '127.0.0.1:42824'
  }
]

```

## Respuestas
1. **Usuario que cambió la configuración del perfilador:** `admin` (base `admin`). **Eventos que lo demuestran:** (a) `Profiler settings changed` en la conexión `conn19`, y (b) `Successfully authenticated` en esa misma conexión `conn19` con `user: admin`. La línea del cambio no trae el usuario; se obtiene uniendo ambos eventos por `ctx`.
2. **Condición de validez:** ambos eventos deben pertenecer al mismo arranque del servidor, porque los números de conexión (`ctx`) vuelven a empezar al reiniciar; si hubo un reinicio entre los dos eventos, el mismo `conn19` puede ser otra conexión distinta. Además, la autenticación debe ocurrir antes del cambio y los dos eventos deben seguir disponibles (`getLog` solo guarda los 1024 más recientes).
3. **Relevancia de registrar un cambio de configuración del propio registro:** quien apaga, filtra o cambia el perfilador puede dejar de registrar actividad y ocultarla. Que el cambio quede registrado y se pueda atribuir permite detectar ventanas sin evidencia y posibles manipulaciones del mecanismo de trazabilidad.
