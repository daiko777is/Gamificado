# EDUCA · Misión GIT — Proyecto Web Educa

Aplicación web sencilla para gestionar estudiantes + **backend Educa API**.
Reto gamificado integrador (100 XP): análisis, Git por ramas y reflexión profesional.

Repo remoto: **https://github.com/daiko777is/Gamificado**

## Stack Usado

| Capa | Tecnología |
|---|---|
| Estructura | HTML5 (`index.html`) |
| Estilos | CSS3 (`css/styles.css`, `css/forms.css`) |
| Lógica | JavaScript (`js/app.js`, `js/storage.js`, `js/modules/`) |
| Persistencia sin backend | `localStorage` vía `js/storage.js` |
| Backend | Node + Express (`backend/`) — Repository + Service + JWT + validación |
| Persistencia con backend | JSON en `backend/src/data/db.json` (cambiable a Postgres sin tocar services) |

## Arquitectura

```
index.html              → estructura (sin lógica)
css/                    → solo presentación
js/storage.js           → ÚNICA capa de datos (API si hay, localStorage si no)
js/modules/login.js     → valida credenciales vía storage.js
js/modules/register.js  → registra usuarios vía storage.js
js/modules/students.js  → listado/gestión vía storage.js
js/app.js               → orquestador DOM
backend/src/
  server.js             → Express, CORS, rate-limit, rutas, error central
  routes/               → auth.routes, students.routes (URLs recurso)
  controllers/          → traducen HTTP ↔ services
  services/             → negocio (bcrypt+JWT, CRUD con reglas)
  repositories/         → jsonRepo (único que toca disco)
  middleware/           → auth(JWT+RBAC), validate, errorHandler, logger
docs/
  ANALISIS.md · REFLEXION.md · GUIA-GIT.md
```

## Cómo correrlo

### Solo frontend (para capturas de `localStorage`)
Abre `index.html` en el navegador. Funciona con `file://`.
Demo: regístrate, o usa `demo@educa.co / demo1234`.

### Con backend
```bash
cd backend
npm install
cp .env.example .env   # en Windows: copy .env.example .env
npm run dev            # → http://localhost:3001/health
```
Luego abre `index.html`: el punto superior dirá **● API conectada** y la fuente pasará de `local` a `API`.
El frontend reintenta la API y **cae a `localStorage`** si el backend está apagado (así nunca se bloquea la demo).

### Endpoints
```
GET  /health
POST /api/auth/register  {name,email,password}
POST /api/auth/login     {email,password} → {user, token}
GET  /api/students?q=
POST /api/students       {nombre,email,curso?,nota?,activo?}
PATCH /api/students/:id
DELETE /api/students/:id
```

## Git del reto (resumen)
```bash
git init && git add . && git commit -m "feat: estructura base del sistema Educa"
git checkout -b login && git checkout -b registro
git checkout main && git merge login && git merge registro
git remote add origin https://github.com/daiko777is/Gamificado.git
git push -u origin main
```
Detalle paso a paso: `docs/GUIA-GIT.md`.

## Entrega
- Documento: `docs/ANALISIS.md` (Fase 1) + `docs/REFLEXION.md` (Fase 3).
- Capturas: config de Git, commits, ramas y app en navegador (login, registro, `localStorage`).
