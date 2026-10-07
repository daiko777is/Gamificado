# FASE 1 — Análisis del sistema (20 XP)

## ANEXO 1 · Determinación de necesidades
- **Nombre del sistema:** EDUCA — Gestión básica de estudiantes (Misión GIT).
- **Problema que resuelve:** la institución pierde información de estudiantes (listas en papeles/archivos sueltos, sin control de cambios). El intento anterior fracasó por no usar control de versiones: pérdida de datos, errores constantes y desorganización.
- **Usuarios del sistema:** (1) Docente/administrativo — registra, consulta y actualiza estudiantes; (2) Estudiante — consulta su registro (alcance futuro).

## ANEXO 2 · Alcance del sistema
**Incluido (mínimo 3):**
1. Registro de usuarios + login (validación de credenciales).
2. CRUD y búsqueda de estudiantes (nombre, email, curso, nota, estado).
3. Persistencia dual: `localStorage` (offline/demo) y backend Educa API (JWT + JSON).
4. Documentación Git: commits por funcionalidad, ramas `login`/`registro` y merge a `main`.

**NO incluido:**
1. Base de datos real (Postgres/MySQL), roles avanzados, recuperación de contraseña, despliegue productivo, app móvil.

## ANEXO 3 · Diagrama de procesos (login)
```
Usuario → Ingresa email+contraseña → login.js → storage.js → ¿API disponible?
   → SÍ: POST /api/auth/login (bcrypt+JWT) → token+sessión → Acceso permitido (dashboard)
   → NO: valida contra localStorage → Acceso permitido (dashboard)
   → FALLO: mensaje "Credenciales inválidas" → reintentar
```
Flujo estudiantes: `students.js → storage.js → GET/POST/PATCH/DELETE /api/students (o localStorage) → tabla + stats`.

## ANEXO 4 · Modelo Entidad-Relación (básico)
```
Usuario (id, name, email, passHash, role)
   │ 1
   │ registra/gestiona
   │ N
Estudiante (id, nombre, email, curso, nota, activo)
```
Nota: sin BD real, cada entidad es un objeto JS; en frontend vive en `localStorage`
(`educa_usuarios`, `educa_estudiantes`) y en backend en `backend/src/data/db.json`
vía `jsonRepo.js`. Relación: un usuario gestiona muchos estudiantes.
