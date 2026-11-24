# Evidencia 08 — Conservación: exportar antes de perder

## Comandos ejecutados
1. Exportar la bitácora **antes** de reiniciar (dentro del contenedor):
```
mongosh "mongodb://admin:<REDACTED>@127.0.0.1:27017/comercial?authSource=admin" --quiet --eval 'db.adminCommand({ getLog: "global" }).log.join("\n")' > /lab/evidencias/bitacora-mongod.log
```
2. Antes de reiniciar (sesión DBA): `bitacora().length` = <<391>>
3. Reinicio (PowerShell de Windows):
```
docker restart dba-u3-mongo
```
4. Después de reiniciar (sesión DBA nueva):
```js
db.getProfilingStatus()
db.system.profile.countDocuments()
bitacora().length
```
5. Exportar `system.profile`:
```
mongosh "mongodb://admin:<REDACTED>@127.0.0.1:27017/comercial?authSource=admin" --quiet --eval 'EJSON.stringify(db.system.profile.find({}, { op: 1, ns: 1, user: 1, client: 1, appName: 1, ts: 1, "command.q": 1, "command.u": 1 }).toArray(), null, 2)' > /lab/evidencias/system-profile.json
```
6. Hashes:
```
cd /lab/evidencias
sha256sum system-profile.json > hashes.sha256
sha256sum bitacora-mongod.log >> hashes.sha256
cat hashes.sha256
```

## Salida
```
comercial> db.getProfilingStatus()
{ was: 0, slowms: 100, sampleRate: 1, ok: 1 }
comercial> db.system.profile.countDocuments()
2
comercial> bitacora().length
80
root@5a78dac89267:/lab# mv /lab/evidencias/system-profile.json /lab/evidencias/system-profile-actividad3.json
root@5a78dac89267:/lab# mongosh "mongodb://admin:Admin_Practica_2026@127.0.0.1:27017/comercial?authSource=admin" --quiet --eval 'db.adminCommand({ getLog: "global" }).log.join("\n")' > /lab/evidencias/bitacora-mongod.log
root@5a78dac89267:/lab# ls -l /lab/evidencias
total 160
-rw-r--r-- 1 root root 156866 Nov 24 02:25 bitacora-mongod.log
-rw-r--r-- 1 root root   1111 Nov 24 01:51 system-profile-actividad3.json
root@5a78dac89267:/lab#
What's next:
    Try Docker Debug for seamless, persistent debugging tools in any container or image → docker debug dba-u3-mongo
    Learn more at https://docs.docker.com/go/debug-cli/
PS C:\Users\alexd> docker exec -it dba-u3-mongo bash
root@5a78dac89267:/# cd /lab
root@5a78dac89267:/lab# mongosh "mongodb://admin:Admin_Practica_2026@127.0.0.1:27017/comercial?authSource=admin" --quiet --eval 'EJSON.stringify(db.system.profile.find({}, { op: 1, ns: 1, user: 1, client: 1, appName: 1, ts: 1, "command.q": 1, "command.u": 1 }).toArray(), null, 2)' > /lab/evidencias/system-profile.json
root@5a78dac89267:/lab# cd /lab/evidencias
root@5a78dac89267:/lab/evidencias# sha256sum system-profile.json > hashes.sha256
root@5a78dac89267:/lab/evidencias# sha256sum system-profile-actividad3.json >> hashes.sha256
root@5a78dac89267:/lab/evidencias# sha256sum bitacora-mongod.log >> hashes.sha256
root@5a78dac89267:/lab/evidencias# cat hashes.sha256
f845f2e7d8e876377174154a36fc8377aab72170a962984b8fc4944069c01b88  system-profile.json
74af1399842ae2258be31acc0344a498af3334d30e5496416a8a0bd68832da00  system-profile-actividad3.json
f44fbb676fbabb2c1054583c41af86e1ab709bcfffc6de2288c3155e11f30342  bitacora-mongod.log
root@5a78dac89267:/lab/evidencias#
```

Configuración persistente (14.1): no se aplicó en este laboratorio (es opcional); por lo tanto no se modificó ningún archivo de configuración.

## Respuestas
1. **Tres formas de perder evidencia sin borrarla deliberadamente:**
   - `system.profile` es una colección limitada de 1 MB: al llenarse sobrescribe los documentos más antiguos.
   - Al reiniciar el servidor, la memoria de `getLog` se vacía y se pierden los eventos de la bitácora que no estén en un archivo.
   - Al reiniciar, el nivel de perfilado activado con `db.setProfilingLevel()` vuelve a 0, y deja de registrarse sin aviso. (En Docker, además, si se elimina el contenedor se pierde su bitácora.)
2. **Por qué 1 MB es un problema de conservación y no solo de espacio:** con tan poco espacio, sobre todo en nivel 2, la evidencia se sobrescribe en poco tiempo y de forma automática, sin aviso y sin que nadie la borre. No se puede saber cuánto tiempo estará disponible una operación, y no hay respaldo ni inmutabilidad: hay que exportarla antes de que se pierda.
3. **Por qué `getLog` sirve para interpretar pero no para conservar:** solo devuelve los 1024 eventos más recientes que el servidor mantiene en memoria y esa memoria se vacía al reiniciar; no es un archivo persistente ni la historia completa.