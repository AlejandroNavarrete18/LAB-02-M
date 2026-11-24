# Evidencia 07 — Cambios de privilegios y control compensatorio

## Comandos ejecutados (sesión DBA, en este orden)
1. Primera instantánea:
```js
db.getSiblingDB("auditoria").instantaneas_privilegios.insertOne({
  momento: new Date(),
  tomada_por: db.runCommand({ connectionStatus: 1 }).authInfo.authenticatedUsers,
  usuarios: db.getUsers().users.map(u => ({ user: u.user, db: u.db, roles: u.roles }))
})
```
2. Nivel 2 y cambio de privilegios:
```js
db.setProfilingLevel(2)
db.grantRolesToUser("app_ventas", [{ role: "dbAdmin", db: "comercial" }])
```
3. Búsqueda de evidencia:
```js
db.system.profile.countDocuments({ "command.grantRolesToUser": { $exists: true } })
bitacora().filter(e => JSON.stringify(e).includes("grantRoles")).length
```
4. Segunda instantánea (repetir el `insertOne` del punto 1) y comparación:
```js
db.getSiblingDB("auditoria").instantaneas_privilegios.find({}, { _id: 0 }).sort({ momento: 1 })
```
5. Reversión:
```js
db.revokeRolesFromUser("app_ventas", [{ role: "dbAdmin", db: "comercial" }])
db.setProfilingLevel(1, { filter: { op: { $in: ["insert", "update", "remove"] } } })
```

## Salida
```
comercial> db.system.profile.countDocuments({ "command.grantRolesToUser": { $exists: true } })
0
comercial> bitacora().filter(e => JSON.stringify(e).includes("grantRoles")).length
0
comercial> db.getSiblingDB("auditoria").instantaneas_privilegios.insertOne({ momento: new Date(), tomada_por: db.runCommand({ connectionStatus: 1 }).authInfo.authenticatedUsers, usuarios: db.getUsers().users.map(u => ({ user: u.user, db: u.db, roles: u.roles })) })
{
  acknowledged: true,
  insertedId: ObjectId('6b04f43651a961740909526b')
}
comercial> db.getSiblingDB("auditoria").instantaneas_privilegios.find({}, { _id: 0 }).sort({ momento: 1 })
[
  {
    momento: ISODate('2026-11-24T02:18:57.338Z'),
    tomada_por: [ { user: 'admin', db: 'admin' } ],
    usuarios: [
      {
        user: 'app_ventas',
        db: 'comercial',
        roles: [ { role: 'readWrite', db: 'comercial' } ]
      }
    ]
  },
  {
    momento: ISODate('2026-11-24T02:19:34.021Z'),
    tomada_por: [ { user: 'admin', db: 'admin' } ],
    usuarios: [
      {
        user: 'app_ventas',
        db: 'comercial',
        roles: [
          { role: 'readWrite', db: 'comercial' },
          { role: 'dbAdmin', db: 'comercial' }
        ]
      }
    ]
  }
]
comercial> db.revokeRolesFromUser("app_ventas", [{ role: "dbAdmin", db: "comercial" }])
{ ok: 1 }
comercial> db.setProfilingLevel(1, { filter: { op: { $in: ["insert", "update", "remove"] } } })
{
  was: 2,
  slowms: 100,
  sampleRate: 1,
  filter: { op: { '$in': [ 'insert', 'remove', 'update' ] } },
  note: 'When a filter expression is set, slowms and sampleRate are not used for profiling and slow-query log lines.',
  ok: 1
}

```

## ¿La instantánea responde?
| Pregunta | ¿Responde? |
|----------|------------|
| ¿Cambiaron los privilegios de app_ventas? | Sí |
| ¿Qué rol se agregó? | Sí (`dbAdmin` en `comercial`) |
| ¿Quién lo agregó? | No |
| ¿Cuándo exactamente? | No, solo que ocurrió entre las dos instantáneas |

Perfilador y bitácora: **No hay evidencia con esta edición** (0 y 0). El perfilador no registró `grantRolesToUser` y la bitácora de mongod no incluye el texto `grantRoles`.

## Respuestas
1. **Por qué es de los eventos más importantes:** los privilegios definen quién puede leer, modificar o administrar los datos. Un cambio de privilegios (escalamiento) permite acceso no autorizado y puede ser el paso previo a un fraude o a una fuga de datos; detectarlo y atribuirlo es esencial para la seguridad y el cumplimiento.
2. **Frecuencia de las instantáneas:** depende de la criticidad de los datos, de la frecuencia con que cambian los privilegios, del tiempo máximo de detección que tolere la organización, de los requisitos normativos, del costo de almacenamiento y de la carga que genere. Por ejemplo, cada hora o una vez al día mediante una tarea programada; en sistemas críticos, más frecuente.
3. **Quién debe escribir en `auditoria.instantaneas_privilegios`:** una cuenta dedicada de auditoría o seguridad con permiso solo de inserción, distinta de quienes administran privilegios (separación de funciones), y sin permiso de modificar ni borrar; el resto, como máximo lectura. En este laboratorio la escribe `admin` (root), lo cual es una limitación.
4. **Mensaje a Dirección (tres líneas):**
   - Con MongoDB Community no podemos saber quién cambió los privilegios de la aplicación ni cuándo exactamente: la auditoría nativa solo existe en Enterprise y Atlas.
   - Solo podemos detectar que cambiaron y qué cambió, comparando instantáneas periódicas; es un control compensatorio, no una auditoría.
   - Recomendamos evaluar Enterprise o Atlas, o aceptar formalmente este riesgo con controles de acceso estrictos y separación de funciones.
