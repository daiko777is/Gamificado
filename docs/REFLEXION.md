# FASE 3 — Reflexión profesional (30 XP)

1. **¿Qué problemas tenía / podrían surgir sin Git?**
   Pérdida de información (sobrescribir archivos), errores constantes sin forma de revertir,
   desorganización ("versión final_FINAL2"), imposibilidad de saber quién cambió qué y
   colisiones al trabajar varios en el mismo archivo. Es lo que tumbó el intento anterior.

2. **¿Cómo ayudó Git y qué ventajas da el control de versiones?**
   Cada cambio queda en commits atómicos con mensaje (base → login → registro → estudiantes),
   se puede volver atrás (`revert`/`reset`), comparar (`diff`), y auditar. Da orden, control y calidad:
   nada se pierde y cada funcionalidad tiene su historia.

3. **¿Ventajas de las ramas y trabajo en equipo?**
   `login` y `registro` se desarrollan aisladas sin romper `main`; se integran con `merge`
   cuando están listas. Permite trabajo paralelo, revisiones por rama y experimentos seguros.
   En este reto cada rama = una funcionalidad = un commit.

4. **¿Por qué importa el historial?**
   Es la memoria del proyecto: documenta decisiones, permite depurar ("¿cuándo se rompió?"),
   revertir errores y demostrar el avance (las capturas de `git log --oneline --graph` son la evidencia).

5. **¿Relación con el trabajo real y por qué Git es distribuido?**
   En equipos reales cada dev tiene el repo completo (commits offline, múltiples remotos,
   PRs y code review). Distribuido = sin punto único de fallo: si cae el servidor o un PC,
   cualquier clon restaura todo. El flujo `clone → branch → commit → push → merge` de este
   reto es el mismo ciclo profesional, solo que a escala escolar.
