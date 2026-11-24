# LAB-02 — Trazabilidad en MongoDB Community

Materia: Gestión de Seguridad y Desempeño de Bases de Datos
Unidad III — Auditoría, trazabilidad y gobierno práctico de datos
Práctica individual

## Despliegue del servidor
- **Motor:** MongoDB 7 Community Edition, versión **7.0.48**.
- **Forma de despliegue:** contenedor Docker con la imagen oficial `mongo:7`, ejecutado en Docker Desktop sobre Windows.
- **Control de acceso:** habilitado con la opción `--auth`.
- **Cliente:** `mongosh` 2.14.3, ejecutado dentro del contenedor con `docker exec -it dba-u3-mongo bash`.
- **Comando de creación:**
  ```
  docker run --name dba-u3-mongo -p 27017:27017 -d mongo:7 --auth
  ```
- **Bitácora de mongod:** al no haber sección `systemLog`, se escribe en la salida estándar del contenedor (`docker logs dba-u3-mongo`).
- **Configuración persistente (Actividad 8, 14.1):** no se aplicó, por ser opcional.

## Usuarios y datos de práctica
| Usuario | Base | Rol |
|---|---|---|
| admin | admin | root |
| app_ventas | comercial | readWrite en comercial |

Base `comercial`, colección `clientes` con 5 documentos. Las contraseñas de práctica fueron sustituidas por `<REDACTED>` en las evidencias.

## Estructura del repositorio
```
LAB-02/
├── README.md
├── evidencias/
│   ├── 01-edicion-y-limitacion.md
│   ├── 02-incidente-sin-perfilado.md
│   ├── 03-perfilador.md
│   ├── 04-filtro.md
│   ├── 05-accesos-mongod.md
│   ├── 06-correlacion.md
│   ├── 07-privilegios-control-compensatorio.md
│   ├── 08-conservacion.md
│   ├── 09-comparacion.md
│   ├── 10-respuesta-direccion.md
│   ├── system-profile.json
│   ├── system-profile-actividad3.json
│   ├── bitacora-mongod.log
│   └── hashes.sha256
├── scripts/
│   └── comandos-mongosh.js
└── informe.md
```

## Resumen
En MongoDB Community no existe auditoría nativa (solo en Enterprise y Atlas). Este laboratorio usa el perfilador (`system.profile`) y la bitácora de mongod, documenta qué eventos permiten rastrear y cuáles no, y aplica un control compensatorio (instantáneas de privilegios) que no equivale a una auditoría.

## Notas
- `system-profile-actividad3.json` es la exportación hecha antes de la Actividad 4, que borra `system.profile`.
- Los hashes SHA-256 de los archivos exportados están en `evidencias/hashes.sha256`.
- Las marcas de tiempo están en UTC.