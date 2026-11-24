// LAB-02 — Comandos de mongosh usados (contraseñas sustituidas por <REDACTED>)
// Las líneas con "SHELL:" se ejecutan en el bash del contenedor, no dentro de mongosh.

// ===== Actividad 1 (DBA) =====
db.version()
db.adminCommand({ buildInfo: 1 }).modules
db.serverCmdLineOpts().parsed

// ===== Función auxiliar (DBA) =====
function bitacora() { return db.adminCommand({ getLog: "global" }).log.map(l => JSON.parse(l)) }