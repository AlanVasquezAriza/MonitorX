# STATUS.md — Estado actual

> La IA actualiza este archivo al terminar CADA sesión. Máximo ~40 líneas; borra lo viejo del log.

## Resumen
- **Fase activa:** 1 — E-Commerce backend (MVP 1)
- **Última tarea completada:** T1.5
- **Siguiente tarea:** T1.6
- **MVP actual:** MVP 1 (en progreso)

## Qué funciona hoy
- Setup completo del repositorio (Fase 0).
- Django + DRF + settings por entorno, `python manage.py check` pasa (T1.1).
- `GET /api/health` con verificación de BD (T1.2).
- Modelo `User` custom con roles `CUSTOMER`/`ADMIN`, email como identificador (T1.3).
- Auth JWT completa + recuperación de contraseña con token (19/19 tests pasando). Endpoints: `register`, `login`, `refresh`, `logout`, `profile`, `password-reset`, `password-reset/confirm`.

## Cómo correrlo
```text
(pendiente — se llena cuando exista `make up` con servicios)
```

## Bloqueos / dudas abiertas
- Ninguno.

## Decisiones recientes
- ADR-001: Adopción de Monorepo.
- ADR-002: Modelo Push para recolección de métricas.

## Log de sesiones (más reciente arriba; conservar solo las últimas 5)
| Fecha | Tareas | Notas |
|---|---|---|
| 2026-10-01 | T0.1 - T0.5 | Setup inicial del monorepo completo (Fase 0). Estructura, env, Makefile, pre-commit y ADRs creados. |
| 2026-09-30 | — | Proyecto planificado. Documentos creados. |


