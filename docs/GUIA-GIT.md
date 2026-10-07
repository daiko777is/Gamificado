# Guía GIT del reto — comandos para tus capturas

## Nivel 1 · Configuración
```bash
git --version
git config --global user.name "Tu Nombre"
git config --global user.email "tu@correo.com"
git config --list   # captura 1: configuración
```

## Nivel 2 · Inicio (Commit 1)
```bash
git init
git add index.html css/ js/ README.md docs/
git commit -m "feat: estructura base del sistema Educa"
git log --oneline   # captura 2: commits
```

## Nivel 3 · Funcionalidades (Commits 2–4)
```bash
git add js/modules/login.js && git commit -m "feat: implementar login (validacion contra storage)"
git add js/modules/register.js && git commit -m "feat: implementar registro de usuarios"
git add js/modules/students.js css/forms.css index.html && git commit -m "feat: listado de estudiantes y estilos de formularios"
```

## Nivel 4 · Ramas + merge
```bash
git branch login
git branch registro
git checkout login        # (o: git switch -c login)
# ... cambios de login ... git commit -m "feat(login): ajustes de validacion"
git checkout main
git merge login
git merge registro
git log --oneline --graph --all   # captura 3: ramas
git branch                        # ramas existentes
```

## Vincular remoto y subir
```bash
git remote add origin https://github.com/daiko777is/Gamificado.git
git remote -v
git push -u origin main
```

## Captura 4 · App en navegador
1. `index.html` → regístrate → entra con `demo@educa.co / demo1234`.
2. Agrega un estudiante. 3. F12 → Application → Local Storage → fotografía `educa_usuarios`, `educa_estudiantes`, `educa_sesion`.
