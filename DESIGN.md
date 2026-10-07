# DESIGN.md — Sistema visual Educa (autoridad visual del proyecto)

Herramienta interna escolar, tema oscuro bloqueado. Modo: operar (completar tareas).

## Tokens

| Token | Valor | Uso |
|---|---|---|
| `--bg` `#0b1020` | fondo página | `--card` `#141c3d` superficies, `--card2` `#0e1430` sidebar/buscar |
| `--line` `#ffffff1c` | bordes | `--row-line` `#ffffff0d` divisores de tabla |
| `--ink` `#eef1ff` | texto | `--muted` `#a7b0d6` secundario, `--code-ink` `#cdd6ff` código |
| `--primary` `#5b6cff` | acentos sin texto: focos, bordes, tabs | `--primary-solid` `#3a4bd8` | fondos con texto blanco (contraste AA): botón primario, marca | `--accent` `#ffb020` solo XP (semántica gamificada) |
| `--ok` / `--bad` | solo badges de estado | `--placeholder` `#939bc7` (contraste ≥4.5:1) |

Estados de error: `--danger-dim` fondo, `--danger-line` borde, `--danger-ink` texto.

## Reglas fijas

- **Radios:** acciones 10px, superficies 14px (auth-card 16px por ser única), pills 999px solo badges/XP.
- **Espaciado:** escala 8pt (8/12/16/24). Nada de 7/11/13/22.
- **Tipo:** una familia (sistema). Títulos por peso 700-800 y tamaño, no por familia.
- **Números:** `tabular-nums` en stats.
- **Motion:** un momento authored (drawer 320ms `--ease-drawer`); micro 160ms `--ease-out`; toasts solo feedback; sin entradas en cascada ni re-animación en repintados. `prefers-reduced-motion` apaga todo.
- **Superficies del navegador:** selección teñida, scrollbar delgado en tablas, `:focus-visible` con `--focus` en todo control.
- **Copy:** el botón nombra la acción; el error nombra el problema y la salida.
