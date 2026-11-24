// LAB-02 — Comandos de mongosh usados (contraseñas sustituidas por <REDACTED>)
// Las líneas con "SHELL:" se ejecutan en el bash del contenedor, no dentro de mongosh.

// ===== Actividad 1 (DBA) =====
db.version()
db.adminCommand({ buildInfo: 1 }).modules
db.serverCmdLineOpts().parsed

// ===== Función auxiliar (DBA) =====
function bitacora() { return db.adminCommand({ getLog: "global" }).log.map(l => JSON.parse(l)) }

// ===== Actividad 2 =====
db.getProfilingStatus()
// SHELL: mongosh "mongodb://app_ventas:<REDACTED>@127.0.0.1:27017/comercial?appName=app-ventas-web" --quiet --eval 'db.clientes.updateOne({ _id: 3 }, { $set: { rfc: "GAMA780912XXX" } })'
db.system.profile.countDocuments()
bitacora().filter(e => JSON.stringify(e).includes("GAMA780912XXX")).length
bitacora().filter(e => JSON.stringify(e).includes("app-ventas-web")).map(e => ({ t: e.t, c: e.c, ctx: e.ctx, msg: e.msg }))
