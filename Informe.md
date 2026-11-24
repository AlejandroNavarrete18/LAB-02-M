# Informe LAB-02 — Trazabilidad en MongoDB Community
# Alumno: Luis Alejandro Navarrete Diaz 
# Materia: Gestión de Seguridad y Desempeño de Bases de Datos
## 1. Despliegue, edición y limitación
El servidor se desplegó como contenedor Docker con la imagen oficial `mongo:7` (MongoDB 7.0.48) y control de acceso habilitado con `--auth`. La edición es **MongoDB Community**: `db.adminCommand({ buildInfo: 1 }).modules` devolvió un arreglo vacío (en Enterprise incluiría `"enterprise"`).

La auditoría nativa de MongoDB (REF-U3-04) solo está disponible en MongoDB Enterprise y en Atlas (clústeres M10 o superiores), por lo que **no existe en Community**. Registraría cambios de esquema, eventos de réplicas y clústeres fragmentados, autenticación y autorización, y operaciones CRUD (con `auditAuthorizationSuccess: true`). Se verificó con `db.version()`, `buildInfo.modules` y `db.serverCmdLineOpts().parsed`.

## 2. Perfilador
Se activó con `db.setProfilingLevel()` en la base `comercial`.

- **Nivel 2:** registró `query`, `update` y `remove` de `app_ventas@comercial`, con cliente `127.0.0.1`, aplicación `app-ventas-web` y momento (por ejemplo, el `update` del RFC ocurrió el 2026-11-24T01:45:26.097Z). No guarda el valor anterior ni el contenido del documento eliminado.
- **Nivel 1 con filtro** (`op` en `insert`, `update`, `remove`): redujo el volumen y la exposición de datos personales, pero dejó de registrar las lecturas.
- **Costo:** degrada el rendimiento (sobre todo en nivel 2), consume disco, y `system.profile` es una colección limitada de 1 MB que se sobrescribe sola.

El perfilador fue diseñado para analizar desempeño, no para auditar seguridad.

## 3. Bitácora de mongod
En Docker, la bitácora se escribe en la salida estándar (no hay sección `systemLog`). Desde `mongosh` se consulta con `getLog`, que solo conserva los 1024 eventos más recientes en memoria.

- **Accesos:** se observaron accesos exitosos (`Successfully authenticated`) y fallidos: `AuthenticationFailed` (contraseña incorrecta) y `UserNotFound` (usuario inexistente). El cliente recibe el mismo mensaje en ambos casos para no revelar si el usuario existe.
- **Cambios de configuración:** el evento `Profiler settings changed` no incluye el usuario. Se atribuyó a `admin` correlacionando su `ctx` con el evento `Successfully authenticated` de la misma conexión. Esa correlación solo es válida dentro del mismo arranque del servidor, porque los números de conexión se reinician.

## 4. Privilegios
Tras otorgar el rol `dbAdmin` a `app_ventas`, ni el perfilador ni la bitácora registraron el cambio (0 y 0): **No hay evidencia con esta edición**.

Como control compensatorio se tomaron instantáneas de privilegios en la colección `auditoria.instantaneas_privilegios`. Permiten saber que los privilegios cambiaron y qué rol se agregó (`dbAdmin`), pero **no quién lo hizo ni cuándo exactamente** (solo que ocurrió entre dos instantáneas). Es un control compensatorio y **no equivale a la auditoría nativa**.

## 5. Conservación
Riesgos observados:
- `system.profile` es una colección limitada de 1 MB: al llenarse sobrescribe la evidencia más antigua sin avisar.
- Al reiniciar el servidor, la memoria de `getLog` se vació (`bitacora().length` bajó).
- Tras el reinicio, el nivel de perfilado volvió a 0, aunque los documentos ya registrados se conservaron.

Se exportaron `system.profile` (`system-profile.json` y `system-profile-actividad3.json`) y la bitácora (`bitacora-mongod.log`) antes de que se perdieran, y se calcularon sus hashes SHA-256 en `hashes.sha256`. No se aplicó la configuración persistente (es opcional).

## 6. Comparación
Resumen de la Actividad 9:
- **Cubierto en MongoDB Community:** accesos exitosos y fallidos (bitácora); modificación y lectura de datos solo si el perfilador está activo, y de forma efímera.
- **No cubierto en Community:** el valor anterior del dato y los cambios de privilegios. El cambio de configuración del perfilador queda registrado, pero sin el usuario.
- **PostgreSQL** con bitácora y disparador cubre más eventos, incluido el valor anterior del dato, pero no las lecturas con `log_statement = 'mod'`.
- **MongoDB Enterprise/Atlas:** la auditoría nativa está documentada, no practicada.

## 7. Recomendación
Para una organización que necesite auditar cambios de privilegios en MongoDB, recomiendo evaluar **MongoDB Enterprise o Atlas (M10 o superior)** para usar la auditoría nativa, que cubre autenticación, autorización y cambios de esquema (REF-U3-04).

- **Hechos verificados en el laboratorio:** en Community, ni el perfilador ni la bitácora registraron el cambio de privilegios; las instantáneas solo detectaron el cambio, sin autor ni hora exacta.
- **Hechos documentados, no practicados:** la auditoría nativa existe en Enterprise y Atlas y cubre esos eventos.
- **Supuestos:** que el costo de la licencia o del clúster y el impacto en el desempeño sean aceptables, y que el requisito de auditoría justifique el cambio de edición.

Si no es viable cambiar de edición: tomar instantáneas con frecuencia, usar una cuenta de auditoría con permiso solo de inserción, separar las funciones de quien administra privilegios y de quien audita, exportar evidencias periódicamente y documentar la limitación como riesgo aceptado.

## Preguntas de reflexión
1. **¿Por qué el perfilador no debe presentarse como auditoría de seguridad?** Fue diseñado para analizar desempeño: es una colección limitada de 1 MB que se sobrescribe, el nivel activado con `setProfilingLevel` se pierde al reiniciar, no registra cambios de privilegios y un administrador puede apagarlo o borrarlo.
2. **¿Por qué aporta trazabilidad aunque no sea auditoría?** Registra usuario, cliente, aplicación, momento y comando de operaciones como `update` y `remove`, lo que permite reconstruir qué hizo quién mientras esté activo y la evidencia no se haya sobrescrito.
3. **¿Qué riesgo introduce el nivel 2 al registrar filtros con datos personales?** Guarda en claro filtros y valores (RFC, teléfono, ciudad) en `system.profile`, expuestos a quien pueda leer esa colección. Además aumenta la carga y la sobrescritura de la evidencia.
4. **¿Diferencia entre detectar y atribuir?** Detectar es saber que algo cambió (las instantáneas lo permiten); atribuir es saber quién, cuándo y desde dónde, y requiere registros con identidad.
5. **¿Por qué reconocer una limitación técnica es parte del trabajo profesional del DBA?** Afirmar un control que no existe da una falsa sensación de seguridad. Reconocerla permite decidir, mitigar o aceptar el riesgo de forma informada, y es la base del riesgo aceptado que aparecerá en el LAB-03.